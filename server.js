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

/*wss.on('connection', (ws, req) => {
    let addr = req.connection.remoteAddress;
    ws.on('message', (message) => {
        if (typeof message === 'string') {
            if (message.startsWith('create ')) {
                let roomPass = message.substr(7);
                let i = 0;
                for (; i < rooms.length; i++) if (rooms[i] === undefined) break;
                rooms[i] = new Room();
                rooms[i].sock1 = ws;
                rooms[i].pass = roomPass;
                ws.room = i;
                ws.send('join ' + i);
            }
            else if (message.startsWith('join ')) {
                let roomNo = message.substr(5).split(' ', 1);
                let roomPass = message.substr(5 + 1 + roomNo.length);
                roomNo = parseInt(roomNo);
                if (roomNo < 0 || roomNo >= rooms.length || rooms[roomNo] === undefined || rooms[roomNo].sock1 === undefined || rooms[roomNo].sock2 !== undefined || roomPass !== rooms[roomNo].pass) {
                    ws.send('fail');
                }
                else {
                    rooms[roomNo].sock2 = ws;
                    ws.room = roomNo;
                    ws.send('join ' + roomNo);
                    ws.send('init');
                    // rooms[roomNo].sock1.send('init');
                }
            }
            else if (message.startsWith('s ')) {
                if (ws.room !== undefined && rooms[ws.room] !== undefined && rooms[ws.room].sock1 !== undefined && rooms[ws.room].sock2 !== undefined) {
                    let sock = rooms[ws.room].sock1;
                    if (sock === ws) sock = rooms[ws.room].sock2;
                    sock.send(message);
                }
            }
            console.log('WebSocket message received from <' + addr + '>: ' + message);
        }
        else {
            console.log('WebSocket binary data received from <' + addr + '>');
            //TODO: binary data
        }
    });
    ws.on('close', event => {
        if (ws.room !== undefined) {
            rooms[ws.room] = undefined;
        }
    });
    console.log('New WebSocket connection from: ' + addr);
});*/

httpsServer.listen(ports.https);
wssServer.listen(ports.wss);

wss.on('connection', (ws, req) => {
    let addr = req.connection.remoteAddress;
    console.log('New WebSocket connection from: ' + addr);
    ws.on('message', message => {
        if (typeof message === 'string') {
            try {
                let m = JSON.parse(message);
                console.log('json');
                console.log(m);
                if (m.join !== undefined && typeof m.join.room === 'number' && typeof m.join.pass === 'string') {
                    if (rooms.rooms[m.join.room] !== undefined) {
                        if (rooms.rooms[m.join.room].pass === m.join.pass) {
                            ws.send(JSON.stringify({join: {room: m.join.room, success: true}}));
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
                //TODO: json data
            }
            catch (err) {
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
        console.log('WebSocket disconnected from: ' + addr);
    });
});

// wss.listen(ports.wss);
