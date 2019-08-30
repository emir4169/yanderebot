var WebSocketClient = require('websocket').client;
var chalk = require('chalk');
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

    ws.on('connectFailed', function(error) {
        console.log(chalk.red('Failed to connect) { ' + error.toString()));
        connectToServer();
    });

    ws.on('connect', function(conx) {
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

        function mouse(px, pxx, position) {
            conx.sendUTF(encodeCommand(['mouse', px, pxx, position]));
        }

        function getTurn() {
            conx.sendUTF(encodeCommand(['turn', '1']));
        }

        function connect(name) {
            conx.sendUTF(encodeCommand(['connect', name]));
        }

        conx.on('error', function(error) {
            console.log(chalk.red.bgYellow.bold('Error while connecting) { ' + error.toString()));
            setTimeout(function() {
                connectToServer();
            }, config.conxTimeouut);
        });

        conx.on('close', function() {
            console.log(chalk.red.bgYellow.bold('Connection was closed.'));
            setTimeout(function() {
                connectToServer();
            }, config.conxTimeout);
        });

        conx.on('message', function(message) {
            var cmd = decodeCommand(message.utf8Data);
            var username = cmd[1];
            var command = cmd[2];
            var prefix = 'y!';
			var args = command.slice(prefix.length).split(' ');

            if (cmd[0] == 'chat') {
                if (command == prefix + "help") {
                    chat('y!help y!kit y!google y!youtube y!info');
                    chat('y!test y!minecraft');
                }
                if (command == prefix + "kit") {
                    if (!username == "yandere chan") {
                        send('Fuck off forkie.');
                    } else {
                        var kitt = 'off';
                        if (args[1] == 'on') {
                            if (kitt == 'on') {
                                send('Kit is already on!');
                            } else {
                                setInterval(() => {
                                    if (!kitt == 'off') return;
                                    let direction = [1, 2, 4, 8, 16];
                                    mouse(Math.ceil(Math.random() * 100500), Math.ceil(Math.random() * 100500), direction[Math.floor(Math.random() * direction.length)]);
                                    sendKey(Math.ceil(Math.random() * 70000));
                                    getTurn();
                                }, 1);
                            }
                        } else {
                            if (kitt == 'off') {
                                send('Kit is already off!');
                            } else {
                                kitt = 'off';
                            }
                        }
                    }
                }
                if (command == prefix + "google") {
                    chat(`https://google.com/search?q=${args.slice(1).join('+')}`);
                    chat('If you didnt get a URL, message probably too big.');
                }
                if (command == prefix + "e621") {
                    chat(`https://e621.net/post?tags=${args.slice(1).join('+')}`);
                    chat('If you didnt get a URL, message probably too big.');
                }
                if (command == prefix + "youtube") {
                    chat(`https://www.youtube.com/results?search_query=${args.slice(1).join('+')}`);
                    chat('If you didnt get a URL, message probably too big.');
                }
                if (command == prefix + "info") {
                    chat('https://github.com/CollabVM-Unofficial/yanderebot/blob/master/README.md');
                }
                if (command == prefix + "test") {
                    chat('Bot up and working!');
                }
                if (command == prefix + "minecraft") {
                    chat('https://discord.gg/minecraft') // haha minecraft discord server advertisement epic
                }
            }
        });

        var user = config.name;
        conx.sendUTF('6.rename,' + user.length + '.' + user + ';');

        setInterval(function() {
            if (conx.connected) {
                conx.sendUTF('3.nop;');
            }
        }, 2500);
        if (conx.connected) {
            chat('YandereBot v1.1 by Yandere Chan.');
        }

    });
    ws.connect('ws://' + config.ip, 'guacamole');
}
connectToServer();

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
