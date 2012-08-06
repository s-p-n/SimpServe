var	port = 8000,
	fs = require('fs'),
	express = require('express'),
	app = express(),
	io = require('socket.io').listen(app.listen(port)),
	router = require('./private/router')(express, app, require('./private/wa.json'));
var dir = fs.readdirSync('./private/channels');
var index;
var channels = [];
for (index in dir) {
	channels.push(require('./private/channels/' + dir[index]));
}

io.sockets.on('connection', function (socket) {
	console.log("Someone connected");
	for (var i in channels) {
		channels[i](socket);
	}
});
console.log("Server started.");
