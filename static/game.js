
var uid = function() {
	return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, function() {
		return (Math.random() * 16).toString(16)[0];
	});
};

var socket = io.connect();

socket.on('connect', function () {
	localStorage.player_id = localStorage.player_id || uid();
	socket.emit('message', { player_id: localStorage.player_id });
});

socket.on('fail', function(msg) {
	console.error(msg);
});

var canvas = document.getElementById('canvas');
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

var tick = function(time) {
	animate(tick); // schedule next frame

	time = time / 1000; // animation time
	var now = (new Date).getTime() / 1000; // calendar time

	current_time = time;
};
animate(tick);

canvas.addEventListener('mousedown', function(e) {
	// TODO...
}, false);

onresize = function(e) {
	var dw = window.innerWidth - canvas.width;
	var dh = window.innerHeight - canvas.height;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};
onresize();
