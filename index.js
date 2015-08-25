var server = require('http').createServer(),
	url = require('url'), 
	WebSocketServer = require('ws').Server,
		wss = new WebSocketServer({ server: server }),
		express = require('express'), 
		app = express(), 
		port = 4080;

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
});

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });