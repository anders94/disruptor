(function() {
    var child = require('child_process');

    //--- Exported Functions

    exports.start = function(file) {
	var process = child.fork(__dirname + '/' + file);
	process.on('message', function(m) {
		console.log('PARENT got message:', m);
	    });
	process.send({ hello: 'world' });
    };
}());
