var WebSocketServer = require("ws").Server,
	http = require("http"),
	express = require("express"),
	mongoose = require("mongoose"),
	app = express(),
	port = process.env.PORT || 5000;


var uristring =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/heroku_xsk8kvgn';

app.use(express.static(__dirname + "/"));

var server = http.createServer(app);
	server.listen(port);

var wss = new WebSocketServer({server: server});

var sniffedSchema = new mongoose.Schema({
		hours: Number,
		lines: Number,
		sniffedEvents: Number,
		totalEvents: Number
	});

var SSniffed = mongoose.model('ScriptSniffed', sniffedSchema);


wss.on("connection", function(ws) {
	console.log("websocket connection open");
	ws.on('message', function incoming(message) {
		mongoose.connect(uristring, function (err, res) {
			if (err) {
				console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			} else {
				console.log('connection to DB established');
				var data = JSON.parse(message);

				if(data.command === "post"){
					SSniffed.findById(data.id, function(err,p){
						if(p){
							console.log("entry found");
							p.update({hours: data.hours, lines : data.lines, sniffedEvents: data.sniffedEvents, totalEvents: data.totalEvents});
							ws.close();
						} else {
							console.log("entry NOT found");
							var newData = new SSniffed({
								hours: data.hours,
								lines: data.lines,
								sniffedEvents: data.sniffedEvents,
								totalEvents: data.totalEvents
							});
							newData.save(function (err) {
								if (err){
									 console.log ('Error on save!', err);
								} else {
									ws.send(newData.id);
									ws.close();
								}
							});
						}
					});
				}
				/*	
				var newData = new SSniffed({
					id: data.id,
					hours: data.hours,
					lines: data.lines,
					skippedEvents: data.skippedEvents,
					totalEvents: data.totalEvents
				});*/
				
			}
		});
	});

	ws.on("close", function() {
		mongoose.connection.close();
		console.log("websocket connection close");
	});
});

