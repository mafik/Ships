
var file = new (require('node-static').Server)('./static');
var port = 1337;
var app = require('http').createServer(function (req, res) {
	file.serve(req, res);
});

var world_size = 2000;

var uid = function() {
	return 'xxxxxx'.replace(/x/g, function() {
		return (Math.random() * 16).toString(16)[0];
	});
};

var io = require('socket.io').listen(app);
io.set('log level', 1);

app.listen(port);

console.log('Listening on port ' + port);

var treasures = {};
var pirates = {};
var corsairs = {};

for(var i = 0; i < 5; ++i) {
	treasures[i] = { 
		x: Math.random() * world_size, 
		y: Math.random() * world_size, 
		alpha: Math.random() * 2 * Math.PI 
	};
}

var players = {};

setInterval(function() {
	var key, key2, key3, pirate, treasure, player, corsair;
	for(key in pirates) {
		pirate = pirates[key];
		if(pirate.vx)
			pirate.x += pirate.vx;
		if(pirate.vy)
			pirate.y += pirate.vy;

		pirate.x = ( pirate.x + world_size ) % world_size;
		pirate.y = ( pirate.y + world_size ) % world_size;

		for(key2 in treasures) {
			treasure = treasures[key2];
			var dx = treasure.x - pirate.x;
			var dy = treasure.y - pirate.y;
			if(Math.sqrt(dx*dx + dy*dy) < 20) {
				delete treasures[key2];
				treasures[key2] = {
					x: Math.random() * world_size,
					y: Math.random() * world_size,
					alpha: Math.random() * 2 * Math.PI
				};

				corsairs[uid()] = {
					x: Math.random() * world_size,
					y: Math.random() * world_size,
					alpha: Math.random() * 2 * Math.PI,
					target: key
				};

				for(key3 in players) {
					player = players[key3];
					if(key3 == key) {
						player.socket.emit('success');
					} else {
						player.socket.emit('other_success');
					}
				}
			}
		}
	}

	for( var key in corsairs ) {
		corsair = corsairs[key];
		pirate = pirates[corsair.target];

		var dx = pirate.x - corsair.x;
		if(Math.abs(dx + world_size) < Math.abs(dx)) {
			dx += world_size;
		} else if(Math.abs(dx - world_size) < Math.abs(dx)) {
			dx -= world_size;
		}
		var dy = pirate.y - corsair.y;
		if(Math.abs(dy + world_size) < Math.abs(dy)) {
			dy += world_size;
		} else if(Math.abs(dy - world_size) < Math.abs(dy)) {
			dy -= world_size;
		}

		var l = Math.sqrt(dx*dx + dy*dy);
		dx /= l;
		dy /= l;
		
		corsair.x += dx;
		corsair.y += dy;
	}

	for( key in players ) {
		players[key].socket.emit('update', {
			pirates: pirates,
			corsairs: corsairs,
			treasures: treasures
		});
	}
}, 10);

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
			x: world_size*Math.random(),
			y: world_size*Math.random(),
			alpha: 0
		};

		players[player] = {
			address: address,
			socket: socket
		};
		
	});

	socket.on('move', function(dir) {
		if(pirates[player]) {
			pirates[player].vx = Math.min(1, Math.max(-1, Number(dir.vx)));
			pirates[player].vy = Math.min(1, Math.max(-1, Number(dir.vy)));
		}
	});

	socket.on('disconnect', function(data) {
		console.log('' + player + ': disconnected');

		if( player in players ) {
			delete pirates[player];
			delete players[player];
		}
	} );

	

});
