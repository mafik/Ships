
var world_size = 2048;

var uid = function() {
	return 'xxxxxx'.replace(/x/g, function() {
		return (Math.random() * 16).toString(16)[0];
	});
};

var socket = io.connect();

socket.on('connect', function () {
	localStorage.player_id = localStorage.player_id || uid();
	socket.emit('hello', localStorage.player_id);
});

var update = function(msg) {
	game = msg;
	game.updatedAt = (new Date).getTime();
	if(localStorage.player_id in game.pirates) {
		me = game.pirates[localStorage.player_id];
		var str = "" + me.points;
		str = str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
		document.getElementById('points').textContent = str;
	}
};

socket.on('delta', function(delta) {
	var fixed = apply_diff(game, delta);
	update(fixed);
});

socket.on('update', update);

socket.on('success', function() {
	new Audio('collectcoin.ogg').play();
});

socket.on('death', function() {
	new Audio('bubbles.ogg').play();
});

socket.on('wind', function() {
	new Audio('wind.ogg').play();
});

socket.on('wind_fail', function() {
	new Audio('wind_fail.ogg').play();
});

var game = { treasures: {}, pirates: {}, corsairs: {}, updatedAt: 0, now: 0 };
var me;

var canvas = document.getElementById('canvas');
canvas.style.background = '#8ad';
var ctx = canvas.getContext('2d');

var animate = window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function(f) { setTimeout(f, 1000 / 30); };

var image_cache = {};
var get_image = function(url) {
	if(!(url in image_cache)) {
		image_cache[url] = new Image;
		image_cache[url].src = url;
	}
	return image_cache[url];
};

var circle = function(obj) {
	ctx.save();
	var move = (game.now - game.updatedAt)/16;
	ctx.translate(obj.x + move*obj.vx, obj.y + move*obj.vy);
	ctx.beginPath();
	ctx.rotate(obj.alpha || 0);
	ctx.lineTo(0, 0);
	ctx.arc(0, 0, 10, Math.PI * 2 * 0.1, Math.PI * 2 * 0.9, false);
	ctx.fill();
	ctx.restore();
}

var draw_world = function() {

	ctx.fillStyle = 'rgb(255, 255, 0)';
	for(var key in game.treasures) {
		circle(game.treasures[key]);
	}

	ctx.fillStyle = 'rgb(255, 0, 0)';
	for(var key in game.corsairs) {
		circle(game.corsairs[key]);
	}

	ctx.fillStyle = 'rgb(0, 155, 0)';
	for(var key in game.pirates) {
		circle(game.pirates[key]);
	}

};

var camera = {x: 0, y: 0};
camera.update = function(dt) {
	if(me) {
		if(me.x < camera.x - world_size / 2) {
			camera.x -= world_size;
		}
		if(me.x > camera.x + world_size / 2) {
			camera.x += world_size;
		}
		if(me.y < camera.y - world_size / 2) {
			camera.y -= world_size;
		}
		if(me.y > camera.y + world_size / 2) {
			camera.y += world_size;
		}
		var alpha = Math.pow(.2, dt);
		camera.x = (1 - alpha) * me.x + alpha * camera.x;
		camera.y = (1 - alpha) * me.y + alpha * camera.y;
	}
};

var bg = new Image();
bg.src = 'bg.jpg';
var bg_pattern = 'transparent';
bg.onload = function() {
	bg_pattern = ctx.createPattern(bg, 'repeat');
}
var showBackground = true;

var current_time = 0;
var tick = function(time) {
	var function_start = (new Date).getTime();
	animate(tick); // schedule next frame

	time = time / 1000; // animation time
	game.now = (new Date).getTime();

	camera.update(time - current_time);

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.save();
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate(Math.sin(time) / 20);

	ctx.fillStyle = 'black';
	ctx.fillRect(-5, -5, 10, 10);

	ctx.translate(-camera.x, -camera.y);

	if( showBackground ) {
		ctx.fillStyle = bg_pattern;
		ctx.fillRect(-1000, -1000, 5000, 5000);
	}

	ctx.translate(-world_size, -world_size);
	draw_world();
	ctx.translate(world_size, 0);
	draw_world();
	ctx.translate(world_size, 0);
	draw_world();
	ctx.translate(-world_size * 2, world_size);
	draw_world();
	ctx.translate(world_size, 0);
	draw_world();
	ctx.translate(world_size, 0);
	draw_world();
	ctx.translate(-world_size * 2, world_size);
	draw_world();
	ctx.translate(world_size, 0);
	draw_world();
	ctx.translate(world_size, 0);
	draw_world();
	
	ctx.restore();

	if(left_key || right_key || up_key || down_key) {

		mvx = 0;
		if(left_key) mvx -= 1;
		if(right_key) mvx += 1;
		mvy = 0;
		if(up_key) mvy -= 1;
		if(down_key) mvy += 1;
		socket.emit('move', { 
			vx: mvx,
			vy: mvy
		});

	} else if(me && navigator.webkitGetGamepads) {
		var pad = navigator.webkitGetGamepads()[0];
		if(pad) {
			if(typeof last_pad !== 'undefined') {
				for(var i = 0; i < pad.buttons.length; ++i) {
					if(pad.buttons[i] > 0.5 && last_pad.buttons[i] < 0.5 ) {
						powerup(i);
					}
				}
			}
			last_pad = clone(pad);

			socket.emit('move', { 
				vx: pad.axes[0],
				vy: pad.axes[1]
			});
		}
	}


	current_time = time;

	var function_end = (new Date).getTime();
	document.getElementById('fps-meter').innerText = (function_end - function_start) + ' ms';
};
animate(tick);
var last_pad;

var up_key = false, left_key = false, right_key = false, down_key = false;

var powerup_wind = function() {
	socket.emit('speed');
};

var powerup = function(number) {
	if(number == 0) {
		powerup_wind();
	}
	// TODO: reszta powerupów
};

onkeydown = function(e) {
	if( e.which >= 37 && e.which < 41) {
		var code = e.which - 37;
		if(code == 0) {
			left_key = true;
		} else if(code == 1) {
			up_key = true;
		} else if(code == 2) {
			right_key = true;
		} else if(code == 3) {
			down_key = true;
		}
		mvx = 0;
		if(left_key) mvx -= 1;
		if(right_key) mvx += 1;
		mvy = 0;
		if(up_key) mvy -= 1;
		if(down_key) mvy += 1;
		socket.emit('move', { 
			vx: mvx,
			vy: mvy
		});
		return;
	}

	if( e.which >= 49 && e.which < 54) {
		var code = e.which - 49;
		powerup(code);
	}
	
	if( e.which == 84 && e.shiftKey ) {
		showBackground = !showBackground;
	}
};

onkeyup = function(e) {
	var code = e.which - 37;
	if(code >= 0 && code < 4) {
		if(code == 0) {
			left_key = false;
		} else if(code == 1) {
			up_key = false;
		} else if(code == 2) {
			right_key = false;
		} else if(code == 3) {
			down_key = false;
		}
		mvx = 0;
		if(left_key) mvx -= 1;
		if(right_key) mvx += 1;
		mvy = 0;
		if(up_key) mvy -= 1;
		if(down_key) mvy += 1;
		socket.emit('move', { 
			vx: mvx,
			vy: mvy
		});
	}
};

onresize = function(e) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

onresize();
