var cluster = require('cluster');
var PORT = +process.env.PORT || 1337;

if (cluster.isMaster) {
    // In real life, you'd probably use more than just 2 workers,
    // and perhaps not put the master and worker in the same file.
    //
    // You can also of course get a bit fancier about logging, and
    // implement whatever custom logic you need to prevent DoS
    // attacks and other bad behavior.
    //
    // See the options in the cluster documentation.
    //
    // The important thing is that the master does very little,
    // increasing our resilience to unexpected errors.

    cluster.fork();
    cluster.fork();

    cluster.on('disconnect', function(worker) {
	    console.error('disconnect!');
	    cluster.fork();
	});

} else {
    // the worker
    //
    // This is where we put our bugs!

    var domain = require('domain');

    // See the cluster documentation for more details about using
    // worker processes to serve requests.  How it works, caveats, etc.

    var server = require('http').createServer(function(req, res) {
	    var d = domain.create();
	    d.on('error', function(er) {
		    console.error('error', er.stack);
		    try {
			// make sure we close down within 30 seconds
			var killtimer = setTimeout(function() {
				process.exit(1);
			    }, 30000);
			// But don't keep the process open just for that!
			killtimer.unref();

			// stop taking new requests.
			server.close();

			// Let the master know we're dead.  This will trigger a
			// 'disconnect' in the cluster master, and then it will fork
			// a new worker.
			cluster.worker.disconnect();

			// try to send an error to the request that triggered the problem
			res.statusCode = 500;
			res.setHeader('content-type', 'text/plain');
			res.end('Oops, there was a problem!\n');
		    } catch (er2) {
			// oh well, not much we can do at this point.
			console.error('Error sending 500!', er2.stack);
		    }
		});

	    // Because req and res were created before this domain existed,
	    // we need to explicitly add them.
	    // See the explanation of implicit vs explicit binding below.
	    d.add(req);
	    d.add(res);

	    // Now run the handler function in the domain.
	    d.run(function() {
		    handleRequest(req, res);
		});
	});
    server.listen(PORT);
}

// This part isn't important.  Just an example routing thing.
// You'd put your fancy application logic here.
function handleRequest(req, res) {
    switch(req.url) {
    case '/error':
	// We do some async stuff, and then...
	setTimeout(function() {
		// Whoops!
		flerb.bark();
	    });
	break;
    default:
	res.end('ok');
    }
}
