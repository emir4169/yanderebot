var chalk = require("chalk");
var fs = require("fs");
var prompt = require("./prompt.node.js");
var watch = require("node-watch");
var WebSocketClient = require("websocket").client;
var isConnected = false;
// Config
class Config {
	constructor() {
		this.conxTimeout = 600; //Reconnect timeout on disconnect (ms), keep this from being too low to reduce stress on the server
		this.ip = "170.75.163.216:6004"; //IP of websocket (found by typing serverAddress in JavaScript console while connected to a VM)
		this.name = "C3PO"; //Bot's join username
		this.logFile = "log.txt"; //Path to log file, tail -f is useful for this
		this.init = "!";
	}
}
var config = new Config();

function connectToServer() {
	var ws = new WebSocketClient();

	console.log(chalk.blue("Connecting..."));

	ws.on("connectFailed", function(error) {
		console.log(chalk.red.bold("Connect Error: " + error.toString()));
//		isConnected = false;
		setTimeout(function() {
			connectToServer();
		}, config.conxTimeout);
	});

	ws.on("connect", function(conx) {
			
			var d = new Date();
			console.log(chalk.green(d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + ": " + "WebSocket Connect Success"));
			console.log(chalk.cyan("<" + getDatee() + ">") + " [Connection to WebSocket established]");
			console.log(chalk.yellow.bold("For a list of commands, type !help"));
			conx.on("error", function(error) {
				console.log(chalk.red.bold("Connection Error: " + error.toString()));
//				isConnected = false;
				setTimeout(function() {
					connectToServer();
				}, config.conxTimeout);
			});

			conx.on("close", function() {
				console.log(d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + ": " + chalk.red("[Websocket Disconnect]"));
				fs.appendFile(config.logFile, "\r\n" + "<" + getDatee() + "> " + "[Disconnected from Websocket]", function(error) {});
//				isConnected = false;
				setTimeout(function() {
					connectToServer();
				}, config.conxTimeout);
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
						if(isConnected) {
						}
						text = null;
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
					console.log(chalk.cyan("<" + getDatee() + "> ") + text);
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
		prompt(function(testString) {
			if(testString[0] === config.init) {
				var text = testString.substring(1);
				try {
					var suffixIndex = text.indexOf(" ");
					if(suffixIndex == -1) {
						suffixIndex = text.length;
					}
					var cmd = text.slice(0, suffixIndex);
					
				} catch (e) {
					console.log(chalk.red("Command Error: ") + e);
				}
				var suffix = text.substring(suffixIndex + 1);
//				console.log("text:\t" + text + "\ncmd:\t" + cmd + "\nsuffix:\t" + suffix + "\nsuffixIndex:\t" + suffixIndex);

				switch(cmd) {
					case "rename":
						conx.sendUTF(encodeCommand(['rename', suffix])); break;
						
					case "connect": 
						console.log(chalk.red.bold("The bot has issues staying connected whenever you send the connect command."));
						conx.sendUTF(encodeCommand(['connect', suffix])); break;
						//isConnected = true;

					case "vote": break;
						var t;
						if(suffix == "yes") {
							t = 1;
						} else if(suffix === "no") {
							t = 0;
						}
						conx.sendUTF(encodeCommand(['vote', t])); break;

					case "disconnect": break;
					case "getusers": break;
					case "turn": break;
					case "sendkey": break;
					case "getqueue": break;
					case "help": 
						console.log(chalk.green("-------Supported Commands-------\n") + 
						chalk.blue("rename:\t\t") + chalk.bold("<name>\n") + 
						chalk.blue("connect:\t") + chalk.bold("<vmname>\n") + 
						chalk.blue("vote:\t\t") + chalk.dim("yes ") + chalk.bold("or") + chalk.dim(" no\n") + 
						chalk.blue("disconnect:\t") + "No parameters\n" +
						chalk.blue("getusers:\t") + "No parameters\n" +
						chalk.blue("turn:\t\t") + "No parameters\n" + 
						chalk.blue("sendkey:\t") + chalk.bold("[keys]\n") +
						chalk.blue("getqueue:\t") + "No parameters"); break;
		
					default:
						console.log(chalk.red("Not a valid command, see " + config.init + "help")); break;
				}

			} else {
				conx.sendUTF(encodeCommand(['chat', testString]));
			}
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
