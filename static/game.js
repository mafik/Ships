
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

var wind_particles = [];
var wind_count = 0;

var add_wind_particle = function() {
	wind_particles.push({
		start: current_time,
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
	});
	if(--wind_count)
		setTimeout(add_wind_particle, 30);
};

var draw_wind_particles = function() {
	for(var i = 0; i < wind_particles.length; ++i) {
		var particle = wind_particles[i];
		var age = current_time - particle.start;
		if(age > 1) {
			wind_particles.splice(i, 1);
			--i;
			continue;
		}
		particle.x += me.vx * 2;
		particle.y += me.vy * 2;
		var alpha = Math.sin(age / 1 * Math.PI);
		ctx.strokeStyle = 'rgba(255, 255, 255, '+alpha+')';
		ctx.beginPath();
		ctx.moveTo(particle.x, particle.y);
		ctx.lineWidth = alpha * 2;
		ctx.lineTo(particle.x + me.vx * 30 * alpha, particle.y + me.vy * 30 * alpha);
		//ctx.arc(particle.x, particle.y, alpha * 5, 0, 2*Math.PI, false);
		ctx.stroke();
	}
};

socket.on('wind', function() {
	new Audio('wind.ogg').play();
	wind_count = 50;
	add_wind_particle();
});

socket.on('wind_fail', function() {
	new Audio('wind_fail.ogg').play();
});

socket.on('scary', function() {
	new Audio('gong.ogg').play();
});

socket.on('scary_fail', function() {
	new Audio('tong.ogg').play();
});

var game = { treasures: {}, pirates: {}, corsairs: {}, updatedAt: 0, now: 0 };
var me;
var treshold_rotate=0.1;

var mrot = 0.000;
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

var another_pirate_Icon = function(obj){
	ctx.save();	
	var move = (game.now - game.updatedAt)/16;
	ctx.translate(obj.x + move*obj.vx, obj.y + move*obj.vy);
	//ctx.rotate(Math.atan2(me.x,me.y));
	var lineWidth = 2;
	var canvasWidth = 30;
	var canvasHeight = 1.15*canvasWidth;
    //var canvas = document.getElementById('corsair');

	//	canvas.width = canvasWidth;
	//	canvas.height = canvasHeight;
	  
//	ctx.rotate(Math.PI);
	ctx.translate(-canvasWidth/2,-canvasHeight/2);
	//LODKA
    ctx.beginPath();
	
    ctx.moveTo(0.35*canvasWidth, lineWidth);
	ctx.lineTo(0.65*canvasWidth, lineWidth);
    ctx.quadraticCurveTo(0.85*canvasWidth, 0.4*canvasHeight , 0.5*canvasWidth, canvasHeight);
	ctx.quadraticCurveTo(0.15*canvasWidth, 0.4*canvasHeight , 0.35*canvasWidth, lineWidth);
	
	ctx.closePath();
	
	var grd=ctx.createRadialGradient(0.45*canvasWidth, 0.5*canvasHeight,0.1*canvasWidth,0.45*canvasWidth, 0.5*canvasHeight,0.7*canvasWidth);
	grd.addColorStop(0,'#2E0F00');
	grd.addColorStop(1,'#CC6600');
	
    ctx.strokeStyle = '#2E0F00';
	ctx.fillStyle = grd;
	ctx.lineWidth = 5;
	ctx.lineJoin = 'miter';
	ctx.miterLimit=5;
	ctx.stroke();
    ctx.fill();
	
	//WIOSLA
	ctx.beginPath();
	
	ctx.moveTo(0.45*canvasWidth, 0.3*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.45*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.45*canvasWidth, 0.4*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.55*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.45*canvasWidth, 0.5*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.65*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.45*canvasWidth, 0.6*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.75*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.55*canvasWidth, 0.3*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.45*canvasHeight + Math.sin(current_time * 2) * 10);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.4*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.55*canvasHeight + Math.sin(current_time * 2) * 10);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.5*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.65*canvasHeight + Math.sin(current_time * 2) * 10);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.6*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.75*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.closePath();

	ctx.lineWidth = 3;

	ctx.stroke();
	
	//ZAGIEL
	ctx.beginPath();
	
	ctx.moveTo(0, 0.2*canvasHeight);
	ctx.quadraticCurveTo(0.5*canvasWidth, 0.3*canvasHeight + Math.sin(current_time * 5) * 10, canvasWidth, 0.2*canvasHeight);
	ctx.quadraticCurveTo(0.5*canvasWidth, 0.8*canvasHeight + Math.sin(current_time * 5 + 0.5) * 10, 0, 0.2*canvasHeight);
	
	ctx.closePath();
	
	ctx.fillStyle = 'gray';
	// ctx.stroke();
    ctx.fill();

	ctx.restore();
}
var enemyIcon = function(obj){
	ctx.save();	
	var move = (game.now - game.updatedAt)/16;
	ctx.translate(obj.x + move*obj.vx, obj.y + move*obj.vy);
	ctx.rotate(Math.atan2(obj.x,obj.y));
	var lineWidth = 2;
	var canvasWidth = 30;
	var canvasHeight = 1.15*canvasWidth;
    //var canvas = document.getElementById('corsair');

	//	canvas.width = canvasWidth;
	//	canvas.height = canvasHeight;
	  
//	ctx.rotate(Math.PI);
	ctx.translate(-canvasWidth/2,-canvasHeight/2);
	//LODKA
    ctx.beginPath();
	
    ctx.moveTo(0.35*canvasWidth, lineWidth);
	ctx.lineTo(0.65*canvasWidth, lineWidth);
    ctx.quadraticCurveTo(0.85*canvasWidth, 0.4*canvasHeight , 0.5*canvasWidth, canvasHeight);
	ctx.quadraticCurveTo(0.15*canvasWidth, 0.4*canvasHeight , 0.35*canvasWidth, lineWidth);
	
	ctx.closePath();
	
	var grd=ctx.createRadialGradient(0.45*canvasWidth, 0.5*canvasHeight,0.1*canvasWidth,0.45*canvasWidth, 0.5*canvasHeight,0.7*canvasWidth);
	grd.addColorStop(0,'#2E0F00');
	grd.addColorStop(1,'#CC6600');
	
    ctx.strokeStyle = '#2E0F00';
	ctx.fillStyle = grd;
	ctx.lineWidth = 5;
	ctx.lineJoin = 'miter';
	ctx.miterLimit=5;
	ctx.stroke();
    ctx.fill();
	
	//WIOSLA
	ctx.beginPath();
	
	ctx.moveTo(0.45*canvasWidth, 0.3*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.45*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.45*canvasWidth, 0.4*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.55*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.45*canvasWidth, 0.5*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.65*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.45*canvasWidth, 0.6*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.75*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.55*canvasWidth, 0.3*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.45*canvasHeight + Math.sin(current_time * 2) * 10);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.4*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.55*canvasHeight + Math.sin(current_time * 2) * 10);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.5*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.65*canvasHeight + Math.sin(current_time * 2) * 10);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.6*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.75*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.closePath();

	ctx.lineWidth = 3;

	ctx.stroke();
	
	//ZAGIEL
	ctx.beginPath();
	
	ctx.moveTo(0, 0.2*canvasHeight);
	ctx.quadraticCurveTo(0.5*canvasWidth, 0.3*canvasHeight + Math.sin(current_time * 5) * 10, canvasWidth, 0.2*canvasHeight);
	ctx.quadraticCurveTo(0.5*canvasWidth, 0.8*canvasHeight + Math.sin(current_time * 5 + 0.5) * 10, 0, 0.2*canvasHeight);
	
	ctx.closePath();
	
	ctx.fillStyle = 'red';
	// ctx.stroke();
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
	  
	var move = (game.now - game.updatedAt)/16;
	ctx.translate(obj.x + move*obj.vx, obj.y + move*obj.vy);
	ctx.rotate(mrot || 0);
	ctx.rotate(Math.PI);
	ctx.translate(-canvasWidth/2,-canvasHeight/2);
	//LODKA
    ctx.beginPath();
	
    ctx.moveTo(0.35*canvasWidth, lineWidth);
	ctx.lineTo(0.65*canvasWidth, lineWidth);
    ctx.quadraticCurveTo(0.85*canvasWidth, 0.4*canvasHeight , 0.5*canvasWidth, canvasHeight);
	ctx.quadraticCurveTo(0.15*canvasWidth, 0.4*canvasHeight , 0.35*canvasWidth, lineWidth);
	
	ctx.closePath();
	
	var grd=ctx.createRadialGradient(0.45*canvasWidth, 0.5*canvasHeight,0.1*canvasWidth,0.45*canvasWidth, 0.5*canvasHeight,0.7*canvasWidth);
	grd.addColorStop(0,'#2E0F00');
	grd.addColorStop(1,'#CC6600');
	
    ctx.strokeStyle = '#2E0F00';
	ctx.fillStyle = grd;
	ctx.lineWidth = 5;
	ctx.lineJoin = 'miter';
	ctx.miterLimit=5;
	ctx.stroke();
    ctx.fill();
	
	//WIOSLA
	ctx.beginPath();
	
	ctx.moveTo(0.45*canvasWidth, 0.3*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.45*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.45*canvasWidth, 0.4*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.55*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.45*canvasWidth, 0.5*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.65*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.45*canvasWidth, 0.6*canvasHeight);
	ctx.lineTo(0.05*canvasWidth, 0.75*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.moveTo(0.55*canvasWidth, 0.3*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.45*canvasHeight + Math.sin(current_time * 2) * 10);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.4*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.55*canvasHeight + Math.sin(current_time * 2) * 10);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.5*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.65*canvasHeight + Math.sin(current_time * 2) * 10);
	                                 
	ctx.moveTo(0.55*canvasWidth, 0.6*canvasHeight);
	ctx.lineTo(0.95*canvasWidth, 0.75*canvasHeight + Math.sin(current_time * 2) * 10);
	
	ctx.closePath();

	ctx.lineWidth = 3;

	ctx.stroke();
	
	//ZAGIEL
	ctx.beginPath();
	
	ctx.moveTo(0, 0.2*canvasHeight);
	ctx.quadraticCurveTo(0.5*canvasWidth, 0.3*canvasHeight + Math.sin(current_time * 5) * 10, canvasWidth, 0.2*canvasHeight);
	ctx.quadraticCurveTo(0.5*canvasWidth, 0.8*canvasHeight + Math.sin(current_time * 5 + 0.5) * 10, 0, 0.2*canvasHeight);
	
	ctx.closePath();
	
	ctx.fillStyle = 'white';
	// ctx.stroke();
    ctx.fill();
	}

var treasure_icon = function(obj){
	ctx.save();
	
	var move = (game.now - game.updatedAt)/16;
    var lineWidth = 2;
	var w = 50;
	var h = 0.8*w;

	ctx.lineWidth = lineWidth;
	ctx.translate(obj.x + move*obj.vx, obj.y + move*obj.vy);
	ctx.rotate(Math.sin(current_time + obj.x) / 4);
	ctx.translate(-w/2,-h/2);

	//DIAMENT
	ctx.beginPath();
	
    ctx.moveTo(0.25*w, lineWidth);
    ctx.lineTo(0.75*w, lineWidth);
	ctx.lineTo(w, 0.25*h);
	ctx.lineTo(0.5*w, h);
	ctx.lineTo(0, 0.25*h);
	ctx.lineTo(0.25*w, lineWidth);
	
	ctx.closePath();
	
	ctx.strokeStyle = 'black';
	ctx.fillStyle = '#E60000';
	var v = Math.round(Math.sin(current_time * 5 + obj.y / 100) * 255);
	ctx.fillStyle = 'rgb(250, ' + v + ', ' + v + ')';
	ctx.stroke();
    ctx.fill();
	
	ctx.beginPath();
	
    ctx.moveTo(0.25*w, lineWidth);
    ctx.lineTo(0.75*w, lineWidth);
	ctx.lineTo(w, 0.25*h);
	ctx.lineTo(0.5*w, h);
	ctx.lineTo(0, 0.25*h);
	ctx.lineTo(0.25*w, lineWidth);
	
	ctx.moveTo(0, 0.25*h);
	ctx.lineTo(0.30*w, 0.35*h);
	ctx.lineTo(0.70*w, 0.35*h);
	ctx.lineTo(w, 0.25*h);
    ctx.lineTo(0.75*w, lineWidth);
	ctx.lineTo(0.25*w, lineWidth);
	
    ctx.moveTo(0.35*w, lineWidth);
	ctx.lineTo(0.30*w, 0.35*h);
	ctx.lineTo(0.5*w, h);
	ctx.lineTo(0.70*w, 0.35*h);
	ctx.lineTo(0.60*w, lineWidth);
		
	ctx.closePath();
	
	ctx.strokeStyle = 'black';
	ctx.fillStyle = '#CC0000';	
	ctx.stroke();
    ctx.fill();	
	ctx.restore();
}

var draw_pirate = function(obj) {
	ctx.save();
	corsairIcon(obj);
	ctx.restore();
}
var draw_world = function() {


	
	ctx.fillStyle = 'rgb(255, 255, 0)';
	for(var key in game.treasures) {
		circle(game.treasures[key]);
		treasure_icon(game.treasures[key]);
	}

	ctx.fillStyle = 'rgb(255, 0, 0)';
	for(var key in game.corsairs) {
		enemyIcon(game.corsairs[key]);
	}

	ctx.fillStyle = 'rgb(0, 155, 0)';
	for(var key in game.pirates) {
		if(game.pirates[key]!=me)
		another_pirate_Icon(game.pirates[key]);
	}

	ctx.fillStyle = 'rgb(12, 155, 0)';
	if(me){
		draw_pirate(me);
	}
	
}

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

	var draw_world_horizontal = function() {
		draw_world();
		if(camera.x + canvas.width / 2 > world_size) {
			ctx.save();
			ctx.translate(world_size, 0);
			draw_world();
			ctx.restore();
		}
		if(camera.x - canvas.width / 2 < 0) {
			ctx.save();
			ctx.translate(-world_size, 0);
			draw_world();
			ctx.restore();
		}
	}

	draw_world_horizontal();
	if(camera.y + canvas.height / 2 > world_size) {
		ctx.save();
		ctx.translate(0, world_size);
		draw_world_horizontal();
		ctx.restore();
	}
	if(camera.y - canvas.height / 2 < 0) {
		ctx.save();
		ctx.translate(0, -world_size);
		draw_world_horizontal();
		ctx.restore();
	}

	
/*
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
*/	
	ctx.restore();

	draw_wind_particles();

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
			if(typeof last_pad !== 'undefined') {
				for(var i = 0; i < pad.buttons.length; ++i) {
					if(pad.buttons[i] > 0.5 && last_pad.buttons[i] < 0.5 ) {
						powerup(i);
					}
				}
			}
			last_pad = clone(pad);

			if(Math.abs(pad.axes[1]) + Math.abs(pad.axes[0]) > 0.1)
				mrot = Math.atan2(pad.axes[0], -pad.axes[1]);

			socket.emit('move', { 
				vx: pad.axes[0],
				vy: pad.axes[1],
				alpha:mrot
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
	if( number == 3 ) {
		socket.emit('scary');
	}
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
		if(left_key) mrot -= treshold_rotate;
		if(right_key) mrot += treshold_rotate;
		mrot = ( mrot + 2 * Math.PI ) % (2 * Math.PI);
		mvy = 0;	
		mvx = 0;
		//console.log(treshold_rotate);
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
