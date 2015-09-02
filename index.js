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
		mongoose.connect(uristring, function (err, db) {
			if (err) {
				console.log ('ERROR connecting to: ' + uristring + '. ' + err);
			} else {
				console.log('connection to DB established');
				var data = JSON.parse(message);

				if(data.command === "post"){
					SSniffed.findById(data.id, function(err,target){
						if(target){
							console.log("entry found");
							target.hours = data.hours;
							target.lines = data.lines;
							target.sniffedEvents = data.sniffedEvents; 
							target.totalEvents = data.totalEvents;
							target.save(function (err) {
								if (err){
									 console.log ('Error on save!', err);
								} else {
									ws.close();
								}
							});
							ws.send("updated");
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
				} else if (data.command ==="sumTotal"){
					SSniffed.aggregate(
						[
							{
								$group : {
									_id : null,
									totalHours: {$sum: "$hours" },
									totalLines: {$sum: "$lines" },
									totalSniffed: {$sum: "$sniffedEvents" }
								}
							}
						], function (err, result) {
							if (err) {
								console.log(err);
								return;
							}
							console.log(result);
							ws.send(JSON.stringify(result));
							ws.close();
						}
					);
				}
			}
		});
	});

	ws.on("close", function() {
		mongoose.connection.close();
		console.log("websocket connection close");
	});
});

