var util = require('util'),
    restify = require('restify'),
    path = require('path'),
    peer = require('./lib/peer');

var verbose = false;

if (process.argv.length>4 && process.argv[2] == 'peer') {
    peer.createPeer(process.argv[3], process.argv[4]);

}
else if (process.argv.length>3 && process.argv[2] == 'status') {
    var url = process.argv[3];
    client = restify.createClient({
	    url: 'http://'+url
	});

    client.get('/', function(err, req) {
	    var body = '';
	    if (err != null)
		console.log(err);
	    else {
		req.on('result', function(err, res) {
			if (err != null)
			    console.log(err); // HTTP status code >= 400
			else {
			    res.body = '';
			    res.setEncoding('utf8');
			    res.on('data', function(chunk) {
				    res.body += chunk;
				});

			    res.on('end', function() {
				    console.log(body);
				});
			}
		    });
	    }
	});
}
else {
    console.log('Usage: '+process.argv[0]+' '+path.basename(process.argv[1])+' peer localIP:localPort remoteIP:remotePort');
    console.log('  or   '+process.argv[0]+' '+path.basename(process.argv[1])+' status IP:port');
    //console.log('  or   '+process.argv[0]+' '+process.argv[1]+' start IP:port dir/');
    //console.log('  or   '+process.argv[0]+' '+process.argv[1]+' stop IP:port dir/');
    //console.log('  or   '+process.argv[0]+' '+process.argv[1]+' run IP:port dir/app');
    //console.log('  or   '+process.argv[0]+' '+process.argv[1]+' send IP:port dir/app data');
}
