
var file = new (require('node-static').Server)('./static');
var port = 1337;
var app = require('http').createServer(function (req, res) {
	file.serve(req, res);
});

var io = require('socket.io').listen(app);

app.listen(port);

console.log('Listening on port ' + port);

var treasures = {};
var pirates = {};
var corsairs = {};

treasures[5] = { x: Math.random() * 1000, y: Math.random() * 1000, alpha: Math.random() * 2 * Math.PI };

var players = {};

function update_player(id) {
		players[id].socket.emit('update', {
			pirates: pirates,
			corsairs: corsairs,
			treasures: treasures
		});
}

io.sockets.on('connection', function (socket) {
    var player = undefined;
	var address = socket.handshake.address;

	console.log('connected ' + address);

	socket.on('hello', function(data) {

		if( data in players ) {
			console.log('' + data + ': hello invalid');
			socket.disconnect();
			return;
		}

		player = data;

		console.log('' + player + ': hello');

		pirates[player] = {
			id: player,
			x: 1000*Math.random(),
			y: 1000*Math.random(),
			alpha: 0
		};

		players[player] = {
			address: address,
			socket: socket
		};
		
		for( var key in players ) {
			update_player(key);
		}

	});

	socket.on('message', function(data) {
		var str = JSON.stringify(data);
		console.log(str);
	});

	socket.on('disconnect', function(data) {
		console.log('' + player + ': disconnected');

		if( player in players ) {
			delete pirates[player];
			delete players[player];
		}

		for( var key in players ) {
			update_player(key);
		}
	} );

	

});
