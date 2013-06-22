
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

socket.on('update', function(msg) {
	treasures = msg.treasures;
	pirates = msg.pirates;
	corsairs = msg.corsairs;
	if(localStorage.player_id in pirates) {
		me = pirates[localStorage.player_id];
	}
});

socket.on('add_pirate', function(pirate) {
	pirates[pirate.id] = pirate;
});

socket.on('remove_pirate', function(pirate) {
	delete pirates[pirate.id];
});

var treasures = {}, pirates = {}, corsairs = {};
var me;

var canvas = document.getElementById('canvas');
canvas.style.background = '#106';
var ctx = canvas.getContext('2d');

var animate = window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function(f) { setTimeout(f, 1000 / 60); };

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
		if(me.x < camera.x - 500) {
			camera.x -= 1000;
		}
		if(me.x > camera.x + 500) {
			camera.x += 1000;
		}
		if(me.y < camera.y - 500) {
			camera.y -= 1000;
		}
		if(me.y > camera.y + 500) {
			camera.y += 1000;
		}
		var alpha = Math.pow(.5, dt);
		camera.x = (1 - alpha) * me.x + alpha * camera.x;
		camera.y = (1 - alpha) * me.y + alpha * camera.y;
	}
};

var current_time = 0;
var tick = function(time) {
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

	ctx.translate(-1000, -1000);
	draw_world();
	ctx.translate(1000, 0);
	draw_world();
	ctx.translate(1000, 0);
	draw_world();
	ctx.translate(-2000, 1000);
	draw_world();
	ctx.translate(1000, 0);
	draw_world();
	ctx.translate(1000, 0);
	draw_world();
	ctx.translate(-2000, 1000);
	draw_world();
	ctx.translate(1000, 0);
	draw_world();
	ctx.translate(1000, 0);
	draw_world();
	
	ctx.restore();
	current_time = time;
};
animate(tick);

canvas.addEventListener('mousedown', function(e) {
	// TODO...
}, false);

onresize = function(e) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

};
onresize();
