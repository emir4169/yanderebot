var WebSocketClient = require("websocket").client;
var chalk = require("chalk");

//Config
class Config {
	constructor() {
		this.conxTimeout = 600;
		this.ip = "170.75.163.216:6004";
		this.name = guest(); 
	}
}
var config = new Config();

function connectToServer() {
	var ws = new WebSocketClient();

	console.log(chalk.blue("Connecting..."));

	ws.on("connectFailed", function(error) {
		console.log(chalk.red("Connect Error: " + error.toString()));
		connectToServer();
	});

	ws.on("connect", function(conx) {

		console.log(chalk.green("WebSocket Client Connected!"));

		function voteYes() { //*
			conx.sendUTF(encodeCommand(['vote', '1']));
		}

		function voteNo() { //*
			conx.sendUTF(encodeCommand(['vote', '0']));
		}

		function chat(message) {
			conx.sendUTF(encodeCommand(['chat', message]));
		}
		// Get key ID on your own by looking at websocket traffic in chrome(Dev Tools > Network > Click WS > Click 170.whatever > Refresh > take turn > type some letters, the 65xxx in the data with key in it is the key's ID)
		function sendKey(keyID) { //*
			conx.sendUTF(encodeCommand(['key', keyID, '1']));
			conx.sendUTF(encodeCommand(['key', keyID, '0']));
		}

		function getTurn() { //*
			conx.sendUTF(encodeCommand(['turn', '1']));
		}
		// Commands marked by a * require that you connect to a vm before using. VM names are in the url, and if they are not, look at the websocket traffic for the 'connect' message sent when clicking a VM on /collab-vm/
		function connect(name) {
			conx.sendUTF(encodeCommand(['connect', name]));
		}
		conx.on("error", function(error) {
			console.log(chalk.red.bgYellow.bold("Connection Error: " + error.toString()));
			setTimeout(function() {
				connectToServer();
			}, config.conxTimeouut);
		});

		conx.on("close", function() {
			console.log(chalk.red.bgYellow.bold("Connection Closed!"));
			setTimeout(function() {
				connectToServer();
			}, config.conxTimeout);
		});

		conx.on("message", function(message) {
			// If you want to make the bot do things whenever someone sends a message, put stuff here. The parameter that gets passed to the callback function contains the message someone sends.
		});

		var user = config.name;
		conx.sendUTF("6.rename," + user.length + "." + user + ";");

		setInterval(function() {
			if (conx.connected) {
				conx.sendUTF("3.nop;");
			}
		}, 2500);
		if (conx.connected) {
			//connect('win7');
			//If you want the bot to do anything upon connection, put it all here
		}

	});
	ws.connect("ws://" + config.ip, "guacamole");
}
connectToServer();

function guest() {
	function num() {
		var text = "";
		var pool = "0123456789";

		for (var i = 0; i < 5; i++)
			text += pool.charAt(Math.floor(Math.random() * pool.length));

		return text;
	}
	var a = "guest" + num();
	return a;
}

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
