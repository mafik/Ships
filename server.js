
var file = new (require('node-static').Server)('./static');
var port = 1337;
var app = require('http').createServer(function (req, res) {
	file.serve(req, res);
});

var io = require('socket.io').listen(app);

app.listen(port);

console.log('Listening on port ' + port);

io.sockets.on('connection', function (socket) {
    var player = undefined;
	var address = socket.handshake.address;

	console.log('connected ' + address);

	
	socket.on('message', function(data) {
		var str = JSON.stringify(data);
		console.log(str);
	});
});
