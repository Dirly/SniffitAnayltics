var WebSocketServer = require("ws").Server,
	http = require("http"),
	express = require("express"),
	mongoose = require("mongoose"),
	app = express(),
	port = process.env.PORT || 5000;


var uristring =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/HelloMongoose';

app.use(express.static(__dirname + "/"));

var server = http.createServer(app);
	server.listen(port);

console.log("http server listening on %d", port);

var wss = new WebSocketServer({server: server});
console.log("websocket server created");

wss.on("connection", function(ws) {
	console.log("websocket connection open");

	mongoose.connect(uristring, function (err, res) {
		if (err) {
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
		} else {
			console.log ('Succeeded connected to: ' + uristring);
		}
	});

	ws.on('message', function incoming(message) {
		console.log('received:', message);
	});

	ws.on("close", function() {
		console.log("websocket connection close");
	});
});

