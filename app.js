const express = require('express');
const path = require('path');
let app = express();

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
    console.log(req.params);
    let pass = req.params.pass;
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
    console.log(req.params);
    let pass = req.params.pass;
    if (pass === undefined) pass = '';
    let room = parseInt(req.params.id);
    joinRoom(room, pass, req, res);
});

function createRoom(pass, req, res) {
    let roomNo = app.onCreateRoom(pass);
    if (roomNo === undefined || roomNo >= 0) res.redirect('/room/' + roomNo);
    else res.redirect('/');
    res.end();
}

function joinRoom(room, pass, req, res) {
    res.send('ROOM: ' + room + ' (pass: ' + pass + ')');
    //TODO: send back static/room.html
    res.end();
}

app.onCreateRoom = pass => { return -1; };
module.exports = app;
