const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'static/index.html'));
// });

// app.get('/CanvasController.js', (req, res) => {
//     res.sendFile(path.join(__dirname, 'static/CanvasController.js'));
// });

// app.get('/main.css', (req, res) => {
//     res.sendFile(path.join(__dirname, 'static/main.css'));
// });

app.get('/room/create', (req, res) => {
    console.log('GET create');
    createRoom('', req, res);
});

app.post('/room/create', (req, res) => {
    console.log('POST create');
    let pass = req.body.pass;
    if (pass === undefined) pass = '';
    createRoom(pass, req, res);
});

app.get('/room/:id([0-9]+)', (req, res) => {
    console.log('GET join');
    // let room = parseInt(req.params.id);
    res.sendFile(path.join(__dirname, 'static/room.html'));
});

app.post('/room/:id([0-9]+)', (req, res) => {
    console.log('POST join');
    // let pass = req.body.pass;
    // if (pass === undefined) pass = '';
    // let room = parseInt(req.params.id);
    res.sendFile(path.join(__dirname, 'static/room.html'));
});

app.use('/room/', express.static('static/', {index:'index.html'}));
app.use('/', express.static('static/', {index:'index.html'}));

function createRoom(pass, req, res) {
    let roomNo = app.onCreateRoom(pass);
    if (roomNo !== undefined && roomNo >= 0) res.send(JSON.stringify({roomNo:roomNo}));
    res.end();
}

app.onCreateRoom = pass => { return -1; };
module.exports = app;
