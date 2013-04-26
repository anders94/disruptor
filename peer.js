var util = require('util'),
    crypto = require('crypto'),
    restify = require('restify');

var verbose = false;

if (process.argv.length>3) {
    var me = process.argv[2];
    var universe = {};
    universe[process.argv[3]] = {firstSeen: -1, lastSeen: -1, down: true};

    var server = restify.createServer();
    server.use(restify.bodyParser());
    server.get('/', index);
    server.post('/hello/:host/:port', hello);

    server.listen(getPort(me), getHost(me), function() {
	    console.log('disruptor peer listening at %s', server.url);
	});

    setTimeout( function() {
	    pollPeers();
	}, 25);
    setInterval( function() {
	    pollPeers();
	}, 50000);

    if (verbose)
	setInterval( function() {
		stats();
	    }, 2000);

}
else {
    console.log('  usage: '+process.argv[0]+' '+process.argv[1]+' localHost:localPort remoteHost:remotePort');
}

function pollPeers() {
    if (verbose)
	console.log('polling peers');
    for (var url in universe)
	checkUrl(url);
}

function checkUrl(url) {
    setTimeout( function(url) {
	    var client = restify.createJsonClient({
		    url: 'http://'+url,
		    version: '*'
		});
	    if (verbose)
		console.log('  checking '+client.url.href);
	    client.post('/hello/' + getHost(me) + '/' + getPort(me), universe, function(err, req, res, u) {
		    for(var key in universe) {
			if (key == req._headers.host) {
			    if (err != null) {
				if (!universe[key].down) {
				    console.log('  removing '+key);
				    universe[key].down = true;
				}
			    }
			    else {
				universe[key].down = false;
				universe[key].lastSeen = new Date().getTime();
				if (universe[key].firstSeen == -1) {
				    console.log('  adding '+key);
				    universe[key].firstSeen = universe[key].lastSeen;
				}
				break;
			    }
			}
			if (err == null) {
			    union(u);
			}
		    }
		});
	}, rndInt(2000), url);
}

function stats() {
    var connections = 0;
    console.log('peer stats:');

    for (var key in universe) {
	if (!universe[key].down) {
	    console.log('  + '+key);
	    connections += 1;
	}
	else
	    console.log('  - '+key);
    }
    console.log(connections+' active connections');
}

// util functions
function union(u) { // add in whatever peers we don't already know about
    for(var uk in u) { // for each element in the given universe
	if (uk != me) { // if this entry isn't us
	    var found = false;
	    for(var key in universe) // for each of our known peers
		if (uk == key) // test to see if we have it
		    found = true;
	    if (!found) { // if we don't already have it
		u[uk].firstSeen = -1;
		u[uk].lastSeen = -1;
		u[uk].down = true;
		universe[uk] = u[uk]; // add it to our universe
		checkUrl(uk);
		if (verbose)
		    console.log('  potential peer: '+uk);
	    }
	}
    }
}

function rndInt(i) {
    return(Math.floor(Math.random() * i));
}

function getHost(s) {
    return(s.split(":")[0]);
}

function getPort(s) {
    return(s.split(":")[1]);
}

// http routines
function index(req, res, next) {
    var connections = 0;
    var s = "<html><body><h1>"+me+" disruptor status</h1>";
    for (var key in universe) {
	if (!universe[key].down) {
	    s = s+'+ <a href="http://'+key+'">'+key+'</a><br>';
	    connections += 1;
	}
	else
	    s = s+'- '+key+'<br>';
    }
    s = s+'<br>'+connections+' active connections<br></body></html>';

    res.writeHead(200, {
            'Content-Length': Buffer.byteLength(s),
	    'Content-Type': 'text/html'
	});
    res.write(s);
    res.end();
    next();
}

function hello(req, res, next) {
    if (verbose)
	console.log('request from '+req.params.host+':'+req.params.port);
    res.send(universe);
    var remote = req.params.host+':'+req.params.port;
    var now = new Date().getTime();
    if (typeof universe[remote] === 'undefined') {
	console.log('  adding '+remote);
	universe[remote] = {firstSeen:now, lastSeen:now, down:false};
    }
    else {
	if (verbose)
	    console.log('  updating '+remote);
	if (universe[remote].firstSeen == -1) {
	    universe[remote].firstSeen = now;
	    console.log('  adding '+remote);
	}
	universe[remote].lastSeen = now;
	universe[remote].down = false;
    }
    union(req.body);
    next();
}
