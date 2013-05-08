process.on('message', function(m) {
	console.log('CHILD got message:', m);
    });

setInterval( function() {
	process.send({ foo: 'bar' });
    }, 1000);
