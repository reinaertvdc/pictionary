const express = require('express');
const path = require('path');
let app = express();
module.exports = app;

// LOG REQUESTED URL
app.all('/', (req, res, next) => {
    console.log(req.method + ': ' + req.url);
    next();
});

// INDEX PAGE
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/index.html'));
});
