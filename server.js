const ports = require('./ports.js');
const app = require('./app.js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const ws = require('ws');
const Room = require('./room.js');

let options = {
    key: fs.readFileSync(path.join(__dirname, '/certs/server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs/server.cert'))
};

let httpsServer = https.createServer(options, app);
let wssServer = https.createServer(options, app);

let rooms = [];

let wss = new ws.Server({server:wssServer});
wss.on('connection', (ws, req) => {
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
                console.log(rooms[ws.room]);
                console.log(ws.room);
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
            console.log(rooms);
        }
    });
    console.log('New WebSocket connection from: ' + addr);
});

httpsServer.listen(ports.https);
wssServer.listen(ports.wss);
