const ports = require('./ports.js');
const app = require('./app.js');
const room = require('./room.js');
const options = require('./cert.js');

const path = require('path');
const https = require('https');
const ws = require('ws');

let httpsServer = https.createServer(options, app);
let wssServer = https.createServer(options, undefined);
let wss = new ws.Server({server:httpsServer});

app.onCreateRoom = pass => {
    return 5;
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
});

// wss.listen(ports.wss);
