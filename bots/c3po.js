/* Chat using echo 'message' > message while in
   the bot's working directory */

var chalk = require("chalk");
var fs = require("fs");
var prompt = require("../prompt.node.js");
var watch = require("node-watch");
var WebSocketClient = require("websocket").client;

// Config
class Config {
	constructor() {
		this.conxTimeout = 600; //Reconnect timeout on disconnect (ms)
		this.ip = "170.75.163.216:6004"; //IP of websocket (found by typing serverAddress in JavaScript console while connected to a VM)
		this.name = "C3PO"; //Bot's join username
		this.logFile = "log.txt"; //Path to log file
	}
}
var config = new Config();

function connectToServer() {
	var ws = new WebSocketClient();

	console.log(chalk.blue("Connecting..."));

	ws.on("connectFailed", function(error) {
		console.log(chalk.red.bold("Connect Error: " + error.toString()));
		setTimeout(function() {
			connectToServer();
		}, config.conxTimeout);
	});

	ws.on("connect", function(conx) {
			var d = new Date();
			console.log(chalk.green(d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + ": " + "WebSocket Connect Success"));

			conx.on("error", function(error) {
				console.log(chalk.red.bold("Connection Error: " + error.toString()));
				setTimeout(function() {
					connectToServer();
				}, config.conxTimeout);
			});

			conx.on("close", function() {
				console.log(d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + ": " + chalk.white.bgRed.bold("Logger Disconnected"));
				connectToServer();
			});

			conx.on("message", function(message) {
					var cmd = decodeCommand(message.utf8Data);
					var text = "";
					var textc = "";
					var replace = "";
					var array = [];
//				}
				switch (cmd[0]) {
					case "nop":
						text = null;
						break;
					case "remuser":
						text = null;
						break;
					case "rename":
						text = "[Connection to websocket established";
						break;
					case "chat":
						holder = "" + cmd[1] + ": " + cmd[2];
						text = holder.replace(/(\\x[\da-f]{2}|\\u[\da-f]{4}|\\u{1[\da-f]{4}})+/g, function qqqq(x) {
							return eval("'" + x + "'")
						});
						break;
					default:
						text = cmd.join("; ");
						break;
				}
				var time = Date.now();

				if (text !== null) {
					fs.appendFile(config.logFile, "\r\n" + "<" + getDatee() + "> " + text, function(error) {});
				}

			});

		if (conx.connected) {
			var user = config.name;
			conx.sendUTF("6.rename," + user.length + "." + user + ";");
		}

		setInterval(function() {
			if (conx.connected) {
				conx.sendUTF("3.nop;");
			}
		}, 2500);

		watch('message', function(filename) {
			read(filename);
		});

		function read(filename) {
			fs.readFile(filename, 'utf8',
				function(err, data) {
					if (err) throw err;
					data = data.replace(/[\r\n]/g, "");
					if (data == ".ctrl") {
						conx.sendUTF(encodeCommand(['rename', 'Ctrl']));
						data = "";
					} else if (data == ".c3po") {
						conx.sendUTF(encodeCommand(['rename', 'C3PO']));
						data = "";
					}
					conx.sendUTF(encodeCommand(['chat', data]));
				});
		}
		prompt(function(txt) {
			conx.sendUTF(encodeCommand(txt.split(":")));
		});

	});

ws.connect("ws://" + config.ip, "guacamole");
}

function decodeCommand(string) {
	var pos = -1
	var sections = []
	for (;;) {
		var len = string.indexOf('.', pos + 1)
		if (len == -1) {
			break
		}
		pos = parseInt(string.slice(pos + 1, len)) + len + 1
		sections.push(string.slice(len + 1, pos)
			.replace(/&#x27;/g, "'")
			.replace(/&quot;/g, '"')
			.replace(/&#x2F;/g, '/')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&amp;/g, '&')
		)
		if (string.slice(pos, pos + 1) == ';') {
			break
		}
	}
	return sections
}

function encodeCommand(cypher) {
	var command = "";
	for (var i = 0; i < cypher.length; i++) {
		var current = cypher[i];
		command += current.length + "." + current;
		command += (i < cypher.length - 1 ? "," : ";");
	}
	return command;
}

function getDatee() {
	var date = new Date();
	var a = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
	return a;
}

connectToServer();
