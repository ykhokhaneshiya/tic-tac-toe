const path = require('path');

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Bot = require('./utils/Bot');

console.log(__dirname);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/game', function(req, res) {
	res.sendFile(__dirname + '/public/game.html');
});

io.on('connection', function(socket) {
	socket.on('newUserEntered', function(data) {
		new Bot(data.name, socket, data.matrixSize, data.winCount);
	});
});

http.listen(5000, function() {
	console.log('listening on *:5000');
});
