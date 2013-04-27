var util = require('util'),
    fs = require('fs'),
    crypto = require('crypto'),
    shasum = crypto.createHash('sha1'),
    code = "";

var s = fs.ReadStream('prog.js');
s.on('data', function(d) {
        shasum.update(d);
        code = code + d;
    });

s.on('end', function() {
        var d = shasum.digest('hex');
        console.log(code);
        console.log('sha sum: '+d);
    });
