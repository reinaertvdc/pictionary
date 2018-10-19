const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/index.html'));
});

app.get('/room/create', (req, res) => {
    createRoom('', req, res);
});

app.post('/room/create', (req, res) => {
    let pass = req.body.pass;
    if (pass === undefined) pass = '';
    createRoom(pass, req, res);
});

app.get('/room/:id', (req, res) => {
    // let room = parseInt(req.params.id);
    res.sendFile(path.join(__dirname, 'static/room.html'));
});

app.post('/room/:id', (req, res) => {
    // let pass = req.body.pass;
    // if (pass === undefined) pass = '';
    // let room = parseInt(req.params.id);
    res.sendFile(path.join(__dirname, 'static/room.html'));
});

function createRoom(pass, req, res) {
    let roomNo = app.onCreateRoom(pass);
    if (roomNo !== undefined && roomNo >= 0) res.send(JSON.stringify({roomNo:roomNo}));
    res.end();
}

app.onCreateRoom = pass => { return -1; };
module.exports = app;
