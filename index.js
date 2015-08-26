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

var wss = new WebSocketServer({server: server});

var sniffedSchema = new mongoose.Schema({
	id: String,
	hours: Number,
	lines: Number,
	skippedEvents: Number,
	totalEvents: Number
},{ _id : false });

var SSniffed = mongoose.model('ScriptSniffed', sniffedSchema);

wss.on("connection", function(ws) {
	console.log("websocket connection open");
	mongoose.connect(uristring, function (err, res) {
		if (err) {
			console.log ('ERROR connecting to: ' + uristring + '. ' + err);
		} else {
			
		}
	});

	ws.on('message', function incoming(message) {
		var data = JSON.parse(message);		
		SSniffed.findOne({'id': data.id}, function(err,p){
			if(p){
				p.update({hours: data.hours, lines : data.lines, skippedEvents: data.skippedEvents, totalEvents: data.totalEvents});
			} else {
				console.log("got here");
				var newData = new SSniffed({
					id: data.id,
					hours: data.hours,
					lines: data.lines,
					skippedEvents: data.skippedEvents,
					totalEvents: data.totalEvents
				});
				newdata.save();
			}
		});
	});

	ws.on("close", function() {
		mongoose.connection.close();
		console.log("websocket connection close");
	});
});

