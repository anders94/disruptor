var dgram = require('dgram');
var message = new Buffer("Some bytes");
var client = dgram.createSocket("udp4");

client.send(message, 0, message.length, 7000, "localhost", function(err, bytes) {
	client.close();
    });
