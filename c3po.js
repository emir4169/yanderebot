var chalk = require("chalk");
var fs = require("fs");
var prompt = require("./prompt.node.js");
var watch = require("node-watch");
var WebSocketClient = require("websocket").client;
var isConnected = false;
var vm = false;
var reconnect = false;
var turn = 0;
var users = [];

// Config
class Config {
	constructor() {
		this.conxTimeout = 600; //Reconnect timeout on disconnect (ms), keep this from being too low to reduce stress on the server
		this.ip = "170.75.163.216:6004"; //IP of websocket (found by typing serverAddress in JavaScript console while connected to a VM)
		// 170.75.163.216:6004 - collab;win7
		// 170.75.163.216:6005 - farm;node2
		this.name = "C3PO"; //Bot's join username
		this.logFile = "log.txt"; //Path to log file, tail -f is useful for this
		this.init = "!";
	}
}
var config = new Config();

function connectToServer() {
	var wsConf = {
	maxReceivedMessageSize: 64*1024*1024, //64 Mibibytes
	maxReceivedFrameSize: 64*1024*1024    //64 Mibibytes
	};
	var ws = new WebSocketClient(wsConf);
	isConnected = true;
	vm = false;
	console.log(chalk.blue("Connecting..."));

	function conxDisconnect() {
	}
	ws.on("connectFailed", function(error) {
		console.log(chalk.red.bold("Connect Error: " + error.toString()));
		isConnected = false;
		vm = false;
		setImmediate(() => {
			connectToServer();
		});
	});

	ws.on("connect", function(conx) {
			var d = new Date();
			console.log(chalk.green(d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + ": " + "WebSocket Connect Success"));
			console.log(chalk.cyan("<" + getDatee() + ">") + " [Connection to WebSocket established]");
			console.log(chalk.yellow.bold("For a list of commands, type !help"));
			conx.on("error", function(error) {
				console.log(chalk.red.bold("Connection Error: " + error.toString()));
				isConnected = false;
				setImmediate(() => {
//					connectToServer();
				});
			});

			conx.on("close", function() {
				console.log(d.getHours() + ":" + d.getMinutes() + "." + d.getSeconds() + ": " + chalk.red("[Websocket Disconnect]"));
				fs.appendFile(config.logFile, "\r\n" + "<" + getDatee() + "> " + "[Disconnected from Websocket]", function(error) {});
				isConnected = false;
				vm = false;
					setImmediate(() => {
						connectToServer();
					});
			});

			conx.on("message", function(message) {
					var a = String(message);
					if((a.indexOf("png") == 2)) { //Don't even know if this works, but if it does it saves some memory and cpu usage
						message = "3.nop;"
					}
					var cmd = decodeCommand(message.utf8Data);
					var text = "";
					var replace = "";
					var array = [];
				switch (cmd[0]) {
					case "nop":
						text = null;
						break;
					case "remuser":
						if(vm) {
							var ind = users.indexOf(cmd[2]);
							console.log(ind);
							console.log(cmd[2]);
							users.splice(ind, 1);
							users.sort();
							text = "<" + cmd[2] + " has left>";
							console.log(chalk.yellow("[" + cmd[2] + " has left]"));
							break;
						}
						text = null;
//						console.log(cmd);
						break;
					case "adduser":
						if(vm) {
							var i;
							if(cmd[1] == 1) { //Check if adding just a single user, if so, add to array and break
								users.push(cmd[2]);
								users.sort();
								text = "<" + cmd[2] + " has joined>";
								console.log(chalk.yellow("[" + cmd[2] + " has joined]"));
								break;
							}
							for(i = 2;i < cmd.length; i+=2) { //Add initial user list to user array
								users.push(cmd[i]); 
							}
							users.sort();
						}
						text = null;
						break;

					case "list":
						text = null;
						break;
 
					case "rename":
						if(vm) {
							if(!(cmd[2] === "0")) {
								var e = users.indexOf(cmd[2]); //Get index of old name in user array
								console.log(e);
								console.log(cmd[2]);
								console.log(cmd[3]);
								users.splice(e, 1, cmd[3]); //Replace it with the new name
								users.sort();
								console.log(chalk.yellow("[" + cmd[2] + " is now known as " + cmd[3] + "]"));
								text = "<" + cmd[2] + " is now known as " + cmd[3] + ">";
							}
						break;
						}
						text = null;
						break;
					case "chat":
						holder = "" + cmd[1] + ": " + cmd[2];
						text = holder.replace(/(\\x[\da-f]{2}|\\u[\da-f]{4}|\\u{1[\da-f]{4}})+/g, function a(x) {
							return eval("'" + x + "'")
						});
						console.log(chalk.cyan("<" + getDatee() + "> ") + text);
						break;
					case "png":
						text = null;
						break;
					case "sync": 
						text = null;
						break;
					case "mouse":
						text = null;
						break;
					case "move":
						text = null;
						break;
					case "turn" :
//						turn = cmd[1];
//						console.log(turn);
//						if(vm) {
//						}
						text = null;
//						console.log(cmd[0] + " " + cmd[1] + " " + cmd[2] + " " + cmd[3] + " " + cmd[4]);
						break;
					case "size":
						text = null;
						break;
					case "connect":
						text = null;
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
						conx.sendUTF(encodeCommand(['rename', suffix]));
						break;
						
					case "connect": 
						if(suffix) {
							if(!vm) {
								vm = true;
								console.log(chalk.red.bold("The client has issues staying connected whenever you send the connect message to the websocket. Sometimes it works."));
								conx.sendUTF("7.connect;");
								conx.sendUTF("4.list;");
//								setTimeout(function() {conx.sendUTF(encodeCommand(['connect', suffix]))},1000);
								conx.sendUTF("7.connect," + suffix.length + "." + suffix + ";");
								setTimeout(function() {console.log(chalk.magenta("There are " + users.length + " users online"))},2000);
							} else if(vm) {
								console.log(chalk.red("You are already connected to a VM"));
							}
						} else {
							console.log(chalk.red("This command requires parameters"));
						}
						break;

					case "vote": break;
						if(suffix) {
							if(vm) {
								conx.sendUTF(encodeCommand(['vote', suffix.toString()]));

							} else {
								console.log(chalk.red("You must be connected to a VM to use this"));
							}

						} else {
							console.log(chalk.red("This command requires parameters"));
						}
						break;

					case "disconnect": 
						break;

					case "getusers":
						if(vm) {
							users.sort();
							console.log(chalk.cyan("There are " + users.length + " online:"));
							for(v in users) {
								console.log("\t" + chalk.yellow(users[v]));
							}
						} else {
							console.log(chalk.red("You must be connected to a VM to use this command"));
						}
						break;
					case "turn": 
						if(vm) {
							conx.sendUTF(encodeCommand(['turn', '1']));
						} else if(!vm) {
							console.log(chalk.red("You must be connected to a VM to use this command"));
						}
						break;

					case "sendkey":
						if(suffix) {
							if(vm) {
								conx.sendUTF(encodeCommand(['key', suffix, '1']));
								conx.sendUTF(encodeCommand(['key', suffix, '0']));
							} else if(!vm) {
								console.log(chalk.red("You must be connected to a VM to use this command"));
							}
						} else {
							console.log(chalk.red("This command requires parameters"));
						}
						break;

					case "getqueue":
						break;

					case "help": 
						console.log(chalk.green("-------Supported Commands-------\n") + 
						chalk.blue("rename:\t\t") + chalk.bold("<name>\n") + 
						chalk.blue("connect:\t") + chalk.bold("<vmname>\n") + 
						chalk.blue("vote:\t\t") + chalk.dim("yes ") + chalk.bold("or") + chalk.dim(" no\n") + 
						chalk.blue("disconnect:\t") + "No parameters\n" +
						chalk.blue("getusers:\t") + "No parameters\n" +
						chalk.blue("turn:\t\t") + "No parameters\n" + 
						chalk.blue("sendkey:\t") + chalk.bold("[keys]\n") +
						chalk.blue("getqueue:\t") + "No parameters");
						break;
		
					default:
						console.log(chalk.red("Not a valid command, see " + config.init + "help"));
						break;
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
