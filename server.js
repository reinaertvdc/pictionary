const ports = require('./ports.js');
const app = require('./app.js');
const room = require('./room.js');
const options = require('./cert.js');

// const path = require('path');
const https = require('https');
const ws = require('ws');

let httpsServer = https.createServer(options, app);
let wssServer = https.createServer(options);
let wss = new ws.Server({server: wssServer});

let rooms = new room.RoomList();

app.onCreateRoom = pass => {
    return rooms.addRoom(pass).index;
};

httpsServer.listen(ports.https);
wssServer.listen(ports.wss);

wss.on('connection', (ws, req) => {
    let addr = req.connection.remoteAddress;
    console.log('New WebSocket connection from: ' + addr);
    ws.on('message', message => {
        if (typeof message === 'string') {
            try {
                let m = JSON.parse(message);
                // console.log('json');
                // console.log(m);
                if (m.join !== undefined && typeof m.join.room === 'number' && typeof m.join.pass === 'string') {
                    if (rooms.rooms[m.join.room] !== undefined) {
                        if (rooms.rooms[m.join.room].pass === m.join.pass) {
                            ws.roomNo = m.join.room;
                            ws.peerNo = rooms.rooms[m.join.room].sockets.length;
                            rooms.rooms[m.join.room].sockets.push(ws);
                            ws.send(JSON.stringify({join: {room: m.join.room, success: true}}));
                            for (let i = 0; i < rooms.rooms[m.join.room].sockets.length - 1; i++) {
                                if (rooms.rooms[m.join.room].sockets[i] !== undefined && rooms.rooms[m.join.room].sockets[i].readyState === 1) {
                                    rooms.rooms[m.join.room].sockets[i].send(JSON.stringify({peers: rooms.rooms[m.join.room].sockets.length - 1}));
                                    rooms.rooms[m.join.room].sockets[i].send(JSON.stringify({init:rooms.rooms[m.join.room].sockets.length - 2}));
                                }
                            }
                        }
                        else if (m.join.pass === '') {
                            ws.send(JSON.stringify({join: {room: m.join.room, success: false, needPass: true}}));
                        }
                        else {
                            ws.send(JSON.stringify({join: {room: m.join.room, success: false}}));
                        }
                    }
                    else {
                        ws.send(JSON.stringify({join: {room: m.join.room, success: false}}));
                    }
                }
                if (typeof ws.roomNo === 'number' && rooms.rooms[ws.roomNo] !== undefined) {
                    if (typeof m.peers === 'number') {
                        ws.send(JSON.stringify({peers:rooms.rooms[ws.roomNo].sockets.length-1}));
                    }
                    if (m.signal !== undefined && typeof m.signal.peer === 'number' && m.signal.signal !== undefined) {
                        let peer = m.signal.peer;
                        if (peer >= ws.peerNo) peer++;
                        let sock = rooms.rooms[ws.roomNo].sockets[peer];
                        let from = ws.peerNo;
                        if (from !== peer) {
                            if (from >= peer) from--;
                            if (sock !== undefined) {
                                sock.send(JSON.stringify({signal: {peer: from, signal: m.signal.signal}}));
                            }
                        }
                    }
                }
                else {

                }
                //TODO: json data
            }
            catch (err) {
                // console.log(err);
                let m = message;
                console.log('string');
                console.log(m);
                //TODO: non json data
            }
        }
        else {
            console.log('binary');
            //TODO: binary data
        }
    });
    ws.on('close', event => {
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
    });
});

// wss.listen(ports.wss);
