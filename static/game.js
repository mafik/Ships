
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

socket.on('update', function(msg) {
	treasures = msg.treasures;
	pirates = msg.pirates;
	corsairs = msg.corsairs;
	if(localStorage.player_id in pirates) {
		me = pirates[localStorage.player_id];
	}
});

socket.on('success', function() {
	new Audio('collectcoin.ogg').play();
});

socket.on('death', function() {
	new Audio('bubbles.ogg').play();
});

var treasures = {}, pirates = {}, corsairs = {};
var me;
var treshold_rotate=0.1;

var mrot = 0.000;
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



var corsairIcon = function(obj){
	
	var lineWidth = 2;
	var canvasWidth = 50;
	var canvasHeight = 1.15*canvasWidth;
	
    //var canvas = document.getElementById('corsair');

	//	canvas.width = canvasWidth;
	//	canvas.height = canvasHeight;
	  
	ctx.lineWidth = lineWidth;
	ctx.translate(obj.x, obj.y);
	
	ctx.rotate(mrot || 0);
	ctx.rotate(Math.PI);
	ctx.translate(-canvasWidth/2,-canvasHeight/2);
	//LODKA
    ctx.beginPath();
	
    ctx.moveTo(0.35*canvasWidth, lineWidth);
	ctx.lineTo(0.65*canvasWidth, lineWidth);
    ctx.quadraticCurveTo(0.85*canvasWidth, 0.4*canvasHeight , 0.5*canvasWidth, canvasHeight);
	ctx.moveTo(0.35*canvasWidth, lineWidth);
	ctx.quadraticCurveTo(0.15*canvasWidth, 0.4*canvasHeight , 0.5*canvasWidth, canvasHeight);
	
	ctx.closePath();
	
	var grd=ctx.createRadialGradient(0.45*canvasWidth, 0.5*canvasHeight,0.1*canvasWidth,0.45*canvasWidth, 0.5*canvasHeight,0.7*canvasWidth);
	grd.addColorStop(0,'#2E0F00');
	grd.addColorStop(1,'#CC6600');
	
    ctx.strokeStyle = 'black';
	ctx.fillStyle = grd;	
	ctx.stroke();
    ctx.fill();
	
	//WIOSLA
	ctx.beginPath();
	
	ctx.moveTo(0.45*canvasWidth, 0.3*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.45*canvasHeight);
	
	ctx.moveTo(0.45*canvasWidth, 0.4*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.55*canvasHeight);
	
	ctx.moveTo(0.45*canvasWidth, 0.5*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.65*canvasHeight);
	
	ctx.moveTo(0.45*canvasWidth, 0.6*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.75*canvasHeight);
	
	ctx.moveTo(0.55*canvasWidth, 0.3*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.45*canvasHeight);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.4*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.55*canvasHeight);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.5*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.65*canvasHeight);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.6*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.75*canvasHeight);
	
	ctx.closePath();

	ctx.stroke();
	
	//ZAGIEL
	ctx.beginPath();
	
	ctx.moveTo(0, 0.2*canvasHeight);
	ctx.quadraticCurveTo(0.5*canvasWidth, 0.3*canvasHeight, canvasWidth, 0.2*canvasHeight);
	ctx.quadraticCurveTo(0.5*canvasWidth, 0.8*canvasHeight, 0, 0.2*canvasHeight);
	
	ctx.closePath();
	
	ctx.fillStyle = 'white';
	ctx.stroke();
    ctx.fill();
	}



var draw_pirate = function(obj) {
	ctx.save();
	corsairIcon(obj);
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

	ctx.fillStyle = 'rgb(12, 155, 0)';
	if(me){
		draw_pirate(me);
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

	for(var x = -1; x <= 2; ++x) {
		for(var y = -1; y <= 2; ++y) {
			ctx.drawImage(bg, x * 1024, y * 1024);
		}
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

		if(left_key) mrot -= treshold_rotate;
		if(right_key) mrot += treshold_rotate;
		mvy = 0;	
		mvx = 0;
		if(up_key){ 
			mvy -= Math.cos(mrot);
			mvx -=-1*Math.sin(mrot);
		}
		if(down_key){ 
			mvy += Math.cos(mrot);
			mvx +=-1*Math.sin(mrot);
		}
		socket.emit('move', { 
			vx: mvx,
			vy: mvy,
			alpha:mrot
		});

	} else if(me && navigator.webkitGetGamepads) {
		var pad = navigator.webkitGetGamepads()[0];
		if(pad) {
			socket.emit('move', { 
				vx: pad.axes[0],
				vy: pad.axes[1],
				alpha:mrot
			});
		}
	}


	current_time = time;
};
animate(tick);

var up_key = false, left_key = false, right_key = false, down_key = false;

onkeydown = function(e) {
	var code = e.which - 37;
	if(code >= 0 && code < 4) {
		if(code == 0) {
			left_key = true;
		} else if(code == 1) {
			up_key = true;
		} else if(code == 2) {
			right_key = true;
		} else if(code == 3) {
			down_key = true;
		}
		if(left_key) mrot -= treshold_rotate;
		if(right_key) mrot += treshold_rotate;
		if(mrot > Math.PI * 2 || mrot < -1 * Math.PI * 2)
			mrot = 0.0;
		mvy = 0;	
		mvx = 0;
		console.log(treshold_rotate);
		if(up_key){ 
			mvy -= Math.cos(mrot);
			mvx -= -1*Math.sin(mrot);
		}
		if(down_key){ 
			mvy += Math.cos(mrot);
			mvx += -1*Math.sin(mrot);
		}
		socket.emit('move', { 
			vx: mvx,
			vy: mvy,
			alpha:mrot
		});
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
		mvy = 0;
		mvx = 0;
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
