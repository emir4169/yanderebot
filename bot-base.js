var WebSocketClient = require("websocket").client;
var chalk = require("chalk");

class Config {
	constructor() {
		this.conxTimeout = 600;
		this.ip = "104.219.234.138:6004";
		this.name = 'YandereBot';
	}
}
var config = new Config();

function connectToServer() {
	var ws = new WebSocketClient();

	console.log(chalk.blue('Connecting to VM1...'));

	ws.on("connectFailed", function(error) {
		console.log(chalk.red('Failed to connect: ' + error.toString()));
		connectToServer();
	});

	ws.on("connect", function(conx) {

		console.log(chalk.green('Connected to VM1 as YandereBot!'));

		function voteYes() {
			conx.sendUTF(encodeCommand(['vote', '1']));
		}

		function voteNo() {
			conx.sendUTF(encodeCommand(['vote', '0']));
		}

		function chat(message) {
			conx.sendUTF(encodeCommand(['chat', message]));
		}
		
		function sendKey(keyID) {
			conx.sendUTF(encodeCommand(['key', keyID, '1']));
			conx.sendUTF(encodeCommand(['key', keyID, '0']));
		}

		function getTurn() {
			conx.sendUTF(encodeCommand(['turn', '1']));
		}
		 
		function connect(name) {
			conx.sendUTF(encodeCommand(['connect', name]));
		}
		conx.on("error", function(error) {
			console.log(chalk.red.bgYellow.bold('Error while connecting: ' + error.toString()));
			setTimeout(function() {
				connectToServer();
			}, config.conxTimeouut);
		});

		conx.on("close", function() {
			console.log(chalk.red.bgYellow.bold('Connection was closed.'));
			setTimeout(function() {
				connectToServer();
			}, config.conxTimeout);
		});

		conx.on("message", function(message) {
		});

		var user = config.name;
		conx.sendUTF("6.rename," + user.length + "." + user + ";");

		setInterval(function() {
			if (conx.connected) {
				conx.sendUTF("3.nop;");
			}
		}, 2500);
		if (conx.connected) {
			chat('YandereBot v1.1 by Yandere Chan.');
		}

	});
	ws.connect("ws://" + config.ip, "guacamole");
}
connectToServer();

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function decodeCommand(cypher) {
	var sections = [];
	var bump = 0;
	while (sections.length <= 50 && cypher.length >= bump) {
		var current = cypher.substring(bump);
		var length = parseInt(current.substring(current.search(/\./) - 2));
		var paramater = current.substring(length.toString().length + 1, Math.floor(length / 10) + 2 + length);
		sections[sections.length] = paramater;
		bump += Math.floor(length / 10) + 3 + length;
	}
	sections[sections.length - 1] = sections[sections.length - 1].substring(0, sections[sections.length - 1].length - 1);
	return sections;
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
