
var file = new (require('node-static').Server)('./static');
var port = 1337;
var app = require('http').createServer(function (req, res) {
	file.serve(req, res);
});

var diff = require('./static/diff.js');

var world_size = 2048;

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

for(var i = 0; i < 50; ++i) {
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
		var vx = Number(pirate.vx);
		var vy = Number(pirate.vy);
		var l = Math.max(1, Math.sqrt(vx*vx + vy*vy));
		if(l) {
			pirate.x += vx / l;
			pirate.y += vy / l;
		}

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
					target: key,
					tangent: (Math.random() - 0.5) * Math.PI,
					speed: Math.random()/2 + 0.4
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

		if(typeof pirate === 'undefined') {
			delete corsairs[key];
			continue;
		}

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
		
		var alpha = Math.atan2(dy, dx) + corsair.tangent;
		dx = Math.cos(alpha) * corsair.speed;
		dy = Math.sin(alpha) * corsair.speed;

		corsair.x += dx;
		corsair.y += dy;


		corsair.x = ( corsair.x + world_size ) % world_size;
		corsair.y = ( corsair.y + world_size ) % world_size;

		for(key2 in pirates) {

			pirate = pirates[key2];
			var dx = pirate.x - corsair.x;
			var dy = pirate.y - corsair.y;
			if(Math.sqrt(dx*dx + dy*dy) < 20) {

				delete pirates[key2];

				for(key3 in corsairs) {
					if(corsairs[key3].target == key2) {
						delete corsairs[key3];
					}
				}

				pirates[key2] = {
					x: Math.random() * world_size,
					y: Math.random() * world_size
				};

				for(key3 in players) {
					player = players[key3];
					if(key3 == key2) {
						player.socket.emit('death');
					} else {
						player.socket.emit('other_death');
					}
				}
			}

		}
	}

	var message = diff.clone({
		pirates: pirates,
		corsairs: corsairs,
		treasures: treasures
	});

	var delta = diff.do_diff(last_message, message);
	if(delta) {
		console.log(JSON.stringify(message).length + ' vs ' + JSON.stringify(delta).length)
	} else {
		console.log(JSON.stringify(message).length + ' skipped')
	}

	last_message = message;

	for( key in players ) {
		if(players[key].full_update) {
			players[key].socket.emit('update', message);
			delete players[key].full_update;
		} else if(delta) {
			players[key].socket.emit('delta', delta);
		}
	}
}, 16);

var last_message = {};

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
			socket: socket,
			full_update: true
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
