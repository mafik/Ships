
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

var players = {};

io.sockets.on('connection', function (socket) {
    var player = undefined;
	var address = socket.handshake.address;

	console.log('connected ' + address);

	socket.on('hello', function(data) {
		if( data in pirates ) {
			socket.disconnect();
			return;
		}

		player = data;

		pirates[player] = {
			id: player,
			x: 50,
			y: 50,
			alpha: 0
		};

		
		for( var key in pirates ) {
			players[key].socket.emit('add_pirate', pirates[player] );
		}

		players[player] = {
			address: address,
			socket: socket
		};
	});

	socket.on('message', function(data) {
		var str = JSON.stringify(data);
		console.log(str);
	});

	socket.on('disconnect', function(data) {
		if( data in pirates ) {
			delete pirates[player];
		}

		for( var key in pirates ) {
			players[key].socket.emit('remove_pirate', player );
		}
	} );

	

});
