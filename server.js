
var file = new (require('node-static').Server)('./static');
var port = 1337;
var app = require('http').createServer(function (req, res) {
	file.serve(req, res);
});

var speed_length = 200;
var speed_cost = 100;

var scary = {
	cost: 7500,
	time: 3500,
	pirates: {}
};

var diff = require('./static/diff.js');

var world_size = 2048;

var uid = function() {
	return 'xxxxxx'.replace(/x/g, function() {
		return (Math.random() * 16).toString(16)[0];
	});
};

function distance(a, b) {
		var dx = a.x - b.x;
		if(Math.abs(dx + world_size) < Math.abs(dx)) {
			dx += world_size;
		} else if(Math.abs(dx - world_size) < Math.abs(dx)) {
			dx -= world_size;
		}
		var dy = a.y - b.y;
		if(Math.abs(dy + world_size) < Math.abs(dy)) {
			dy += world_size;
		} else if(Math.abs(dy - world_size) < Math.abs(dy)) {
			dy -= world_size;
		}

		var l = Math.sqrt(dx*dx + dy*dy);
		return { length: l, dx: dx, dy: dy };
}

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
		vx: 0,
		vy: 0,
		alpha: Math.random() * 2 * Math.PI 
	};
}

var players = {};

setInterval(function() {
	var key, key2, key3, pirate, treasure, player, corsair;

	var now = (new Date).getTime();
	for( var run_from in scary.pirates ) {
		if( scary.pirates[run_from] < now )
			delete scary.pirates[run_from];
	}

	for(key in pirates) {
		pirate = pirates[key];
		var vx = Number(pirate.vx);
		var vy = Number(pirate.vy);

		if(pirate.speed_buff) {
			pirate.speed_buff -= 1;
			var alpha = 1 + Math.sin(pirate.speed_buff / speed_length * Math.PI);
			vx *= alpha;
			vy *= alpha;

			if(pirate.speed_buff == 0) {
				delete pirate.speed_buff;
			}
		}
		pirate.x += vx;
		pirate.y += vy;
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
					vx: 0,
					vy: 0,
					alpha: Math.random() * 2 * Math.PI
				};

				pirate.points += 1000;

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

		var run = [];
		for( var run_from in scary.pirates ) {
			var Z = distance( corsair, pirates[run_from] );
			if( Z.length < 100 ) {
				var p = 125 / Z.length / Z.length;
				run.push( [ p * Z.dx, p * Z.dy ] );
			}
		}

		var dx, dy;

		if( run.length == 0 ) {
			dx = pirate.x - corsair.x;
			if(Math.abs(dx + world_size) < Math.abs(dx)) {
				dx += world_size;
			} else if(Math.abs(dx - world_size) < Math.abs(dx)) {
				dx -= world_size;
			}
			dy = pirate.y - corsair.y;
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
		} else {
			dx = 0;
			dy = 0;
			for( var i in run ) {
				dx += run[i][0];
				dy += run[i][1];
			}
		}

		corsair.x += dx;
		corsair.y += dy;
		corsair.vx = dx;
		corsair.vy = dy;


		corsair.x = ( corsair.x + world_size ) % world_size;
		corsair.y = ( corsair.y + world_size ) % world_size;

		for(key2 in pirates) {

			pirate = pirates[key2];
			var dx = pirate.x - corsair.x;
			var dy = pirate.y - corsair.y;
			if(Math.sqrt(dx*dx + dy*dy) < 20) {
				pirate.x = Math.random() * world_size;
				pirate.y = Math.random() * world_size;
				pirate.points = 0;
				
				if(corsair.target != key2) {
					corsair.target.points += pirate.points;
				}

				for(key3 in corsairs) {
					if(corsairs[key3].target == key2) {
						delete corsairs[key3];
					}
				}

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
			vx: 0,
			vy: 0,
			alpha: 0,
			points: 0
		};

		players[player] = {
			address: address,
			socket: socket,
			full_update: true
		};
		
	});

	socket.on('move', function(dir) {
		if(pirates[player]) {
			var p = pirates[player];
			p.vx = Math.min(1, Math.max(-1, Number(dir.vx)));
			p.vy = Math.min(1, Math.max(-1, Number(dir.vy)));
			var l = Math.max(1, Math.sqrt(p.vx*p.vx + p.vy*p.vy));
			p.vx /= l;
			p.vy /= l;
		}
	});

	socket.on('disconnect', function(data) {
		console.log('' + player + ': disconnected');

		if( player in players ) {
			delete pirates[player];
			delete players[player];
		}
	} );

	socket.on('speed', function() {
		if(pirates[player].points < speed_cost) {
			players[player].socket.emit('wind_fail');
			return;
		}
		pirates[player].points -= speed_cost;
		pirates[player].speed_buff = speed_length;
		players[player].socket.emit('wind');
	});

	socket.on('scary', function() {
		if(pirates[player].points < scary.cost) {
			players[player].socket.emit('scary_fail');
			return;
		}
		pirates[player].points -= scary.cost;
		scary.pirates[player] = (new Date).getTime() + scary.time;
		players[player].socket.emit('scary');
	});

});
