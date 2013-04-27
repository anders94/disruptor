var util = require('util'),
    vm = require('vm'),
    fs = require('fs'),
    domain = require('domain'),
    code = "";

var data = {
    animal: 'cat',
    count: 2
};

var s = fs.ReadStream('prog.js');
s.on('data', function(d) {
	code = code + d;
    });

s.on('end', function() {
        var d = domain.create();
	d.on('error', function(err) {
		console.error('caught error: ', err);
	    });
	d.run( function() {
		var script = vm.createScript(code, 'inline.code');
		var a = new Date().getTime();
		script.runInNewContext(data);
		var b = new Date().getTime();
		console.log(b-a);
		console.log(util.inspect(data));
	    });
    });

setTimeout( function() {
	console.log('done');
    }, 1000);
