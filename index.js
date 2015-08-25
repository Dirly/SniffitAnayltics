/*var server = require('http').createServer(), 
	WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({ server: server }),
	express = require('express'),
	app = express(),
	port = 4080;

wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});

	ws.send('something');
});

server.on('request', app);
server.listen(port, function () {

});*/


var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});