
var uid = function() {
	return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, function() {
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
});

socket.on('add_pirate', function(pirate)) {
	pirates[pirate.id] = pirate;
};

socket.on('remove_pirate', function(pirate)) {
	delete pirates[pirate.id];
};

var treasures = {}, pirates = {}, corsairs = {};

var addRandom = function(arr) {
	for(var i = 0; i < 5; ++i) {
		arr[uid()] = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, alpha: Math.random() * 2 * Math.PI };
	}
};

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

var tick = function(time) {
	animate(tick); // schedule next frame

	time = time / 1000; // animation time
	var now = (new Date).getTime() / 1000; // calendar time

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.save();
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate(Math.sin(time) / 20);
	ctx.translate(-canvas.width / 2, -canvas.height / 2);


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

	addRandom(treasures);
	addRandom(pirates);
	addRandom(corsairs);

};
onresize();
