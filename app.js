const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.json());

// LOG REQUESTED URL
// app.all('/', (req, res, next) => {
//     console.log(req.method + ': ' + req.url);
//     next();
// });

// INDEX PAGE
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/index.html'));
});

app.get('/room/create', (req, res) => {
    console.log('GET /room/create');
    console.log(req.params);
    createRoom('', req, res);
});

app.post('/room/create', (req, res) => {
    console.log('POST /room/create');
    let pass = req.body.pass;
    console.log(pass);
    if (pass === undefined) pass = '';
    createRoom(pass, req, res);
});

app.get('/room/:id', (req, res) => {
    console.log('GET /room/:id');
    console.log(req.params);
    let room = parseInt(req.params.id);
    joinRoom(room, '', req, res);
});

app.post('/room/:id', (req, res) => {
    console.log('POST /room/:id');
    let pass = req.body.pass;
    if (pass === undefined) pass = '';
    let room = parseInt(req.params.id);
    joinRoom(room, pass, req, res);
});

function createRoom(pass, req, res) {
    let roomNo = app.onCreateRoom(pass);
    if (roomNo !== undefined && roomNo >= 0) res.send(JSON.stringify({roomNo:roomNo}));
    res.end();
}

function joinRoom(room, pass, req, res) {
    res.sendFile(path.join(__dirname, 'static/room.html'));
}

app.onCreateRoom = pass => { return -1; };
module.exports = app;
