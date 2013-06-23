
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
	treasures = msg.treasures;
	pirates = msg.pirates;
	corsairs = msg.corsairs;
	if(localStorage.player_id in pirates) {
		me = pirates[localStorage.player_id];
	}
};

socket.on('delta', function(delta) {
	var last = {
		pirates: pirates,
		corsairs: corsairs,
		treasures: treasures
	}
	var fixed = apply_diff(last, delta);
	update(fixed);
});

socket.on('update', update);

socket.on('success', function() {
	new Audio('collectcoin.ogg').play();
});

socket.on('death', function() {
	new Audio('bubbles.ogg').play();
});

var treasures = {}, pirates = {}, corsairs = {};
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
	ctx.translate(obj.x, obj.y);
	ctx.beginPath();
	ctx.rotate(obj.alpha || 0);
	ctx.lineTo(0, 0);
	ctx.arc(0, 0, 10, Math.PI * 2 * 0.1, Math.PI * 2 * 0.9, false);
	ctx.fill();
	ctx.restore();
}

var draw_world = function() {

	ctx.fillStyle = 'rgb(255, 255, 0)';
	for(var key in treasures) {
		circle(treasures[key]);
	}

	ctx.fillStyle = 'rgb(255, 0, 0)';
	for(var key in corsairs) {
		circle(corsairs[key]);
	}

	ctx.fillStyle = 'rgb(0, 155, 0)';
	for(var key in pirates) {
		circle(pirates[key]);
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
	var now = (new Date).getTime() / 1000; // calendar time

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

var up_key = false, left_key = false, right_key = false, down_key = false;

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
