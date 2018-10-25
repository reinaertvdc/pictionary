const ports = require('./ports.js');
const room = require('./room.js');
const options = require('./cert.js');

const path = require('path');
const https = require('https');
const ws = require('ws');
const express = require('express');

let rooms = new room.RoomList();

let app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
function createRoom(pass, res) {
    let r = rooms.addRoom(pass);
    if (r !== undefined && typeof r.index === 'number' && r.index >= 0)
        res.redirect(302, '/room/'+r.index);
    else
        res.redirect(302, '/');
}
app.get('/room/create', (req, res) => {
    createRoom('', res);
});
app.post('/room/create', (req, res) => {
    let pass = req.body.pass;
    if (pass === undefined) pass = '';
    createRoom(pass, res);
});
app.get('/room/:id([0-9]+)', (req, res) => {
    res.sendFile(path.join(__dirname, 'room.html'));
});
app.post('/room/:id([0-9]+)', (req, res) => {
    res.sendFile(path.join(__dirname, 'room.html'));
});
app.use('/room/', express.static('static/'));
app.use('/', express.static('static/', {index:'index.html'}));

let httpsServer = https.createServer(options, app);
let wssServer = https.createServer(options);
let wss = new ws.Server({server: wssServer});

wss.on('connection', newWebsocketConnection);

function newWebsocketConnection(ws, req) {
    let addr = req.connection.remoteAddress;
    console.log('New WebSocket connection from: ' + addr);
    ws.on('message', msg => {
        onMessage(ws, msg);
    });
    ws.on('close', event => {
        onWebsocketClose(ws, addr);
    });
}

//TODO: rework
function onWebsocketClose(ws, addr) {
    if (typeof ws.roomNo === 'number' && rooms.rooms[ws.roomNo] !== undefined) {
        if (typeof ws.peerNo === 'number' && rooms.rooms[ws.roomNo].sockets[ws.peerNo] !== undefined) {
            if (rooms.rooms[ws.roomNo].sockets[ws.peerNo].readyState <= 1)
                rooms.rooms[ws.roomNo].sockets[ws.peerNo].close();
            rooms.rooms[ws.roomNo].sockets[ws.peerNo] = undefined;
        }
        let remove = true;
        for (let i = 0; i < rooms.rooms[ws.roomNo].sockets.length; i++) {
            if (rooms.rooms[ws.roomNo].sockets[i] !== undefined && rooms.rooms[ws.roomNo].sockets[i].readyState <= 1) {
                remove = false;
                break;
            }
        }
        if (remove) {
            rooms.removeRoom(ws.roomNo);
        }
    }
    console.log('WebSocket disconnected from: ' + addr);
}

function onMessage(ws, msg) {
    if (typeof msg === 'string') {
        try {
            let m = JSON.parse(msg);
            // console.log('json');
            // console.log(m);
            onMessageJson(ws, m);
        }
        catch (err) {
            console.log('string');
            console.log(msg);
            onMessageString(ws, msg);
        }
    }
    else {
        console.log('binary');
        onMessageBinary(ws, msg);
    }
}

function onMessageJson(ws, msg) {
    if (msg.join !== undefined && typeof msg.join.room === 'number') {
        let pass = undefined;
        if (typeof msg.join.pass === 'string') pass = msg.join.pass;
        onMessageJoin(ws, msg.join.room, pass);
    }
    if (typeof ws.roomNo === 'number' && rooms.rooms[ws.roomNo] !== undefined) {
        if (typeof msg.peers === 'number') {
            onMessagePeers(ws, msg.peers);
        }
        //TODO: rework to function onMessageSignal
        if (msg.signal !== undefined && typeof msg.signal.peer === 'number' && msg.signal.signal !== undefined) {
            onMessageSignal(ws, msg.signal.peer, msg.signal.signal);
            let peer = msg.signal.peer;
            if (peer >= ws.peerNo) peer++;
            let sock = rooms.rooms[ws.roomNo].sockets[peer];
            let from = ws.peerNo;
            if (from !== peer) {
                if (from >= peer) from--;
                if (sock !== undefined) {
                    sock.send(JSON.stringify({signal: {peer: from, signal: msg.signal.signal}}));
                }
            }
        }
    }
    else {

    }
    //TODO: json data
}

function onMessageString(ws, msg) {
    //TODO: non json string data
}

function onMessageBinary(ws, msg) {
    //TODO: binary data
}

function onMessageJoin(ws, roomNo, pass) {
    if (rooms.rooms[roomNo] === undefined) {
        ws.send(JSON.stringify({join: {room:roomNo, success:false}}));
    }
    else {
        let room = rooms.rooms[roomNo];
        if (room.pass === pass || (room.pass === '' && pass === undefined)) {
            ws.roomNo = roomNo;
            ws.peerNo = room.sockets.length;
            room.sockets.push(ws);
            ws.send(JSON.stringify({join: {room: roomNo, success: true}}));
            for (let i = 0; i < room.sockets.length - 1; i++) {
                if (room.sockets[i] !== undefined && room.sockets[i].readyState === 1) {
                    room.sockets[i].send(JSON.stringify({peers: room.sockets.length - 1}));
                    room.sockets[i].send(JSON.stringify({init: room.sockets.length - 2}));
                }
            }
        }
        else if (pass === undefined) {
            ws.send(JSON.stringify({join: {room:roomNo, success:false, needPass:true}}));
        }
        else {
            ws.send(JSON.stringify({join: {room:roomNo, success:false}}));
        }
    }
}

function onMessagePeers(ws, peersCount) {
    ws.send(JSON.stringify({peers:rooms.rooms[ws.roomNo].sockets.length-1}));
}

function onMessageSignal(ws, peer, signal) {
    if (peer >= ws.peerNo) peer++;
    let sock = rooms.rooms[ws.roomNo].sockets[peer];
    let from = ws.peerNo;
    if (from !== peer) {
        if (from >= peer) from--;
        if (sock !== undefined) {
            sock.send(JSON.stringify({signal: {peer: from, signal: signal}}));
        }
    }
}

httpsServer.listen(ports.https);
wssServer.listen(ports.wss);
