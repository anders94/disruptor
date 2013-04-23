var util = require('util'),
    crypto = require('crypto'),
    restify = require('restify');

if (process.argv.length>3) {
    var me = process.argv[2];
    var universe = {};
    universe[process.argv[3]] = {firstSeen: -1, lastSeen: -1};

    var server = restify.createServer();
    server.use(restify.bodyParser());
    server.get('/', index);
    server.post('/hello/:host/:port', hello);

    server.listen(getPort(me), getHost(me), function() {
	    console.log('disruptor peer listening at %s', server.url);
	});

    pollPeers();
    setInterval( function() {
	    pollPeers();
	}, 10000);

    setInterval( function() {
	    stats();
	}, 2000);

}
else {
    console.log('  usage: '+process.argv[0]+' '+process.argv[1]+' localHost:localPort remoteHost:remotePort');
}

function pollPeers() {
    console.log('polling peers');
    for (var url in universe) {
	var client = restify.createJsonClient({
		url: 'http://'+url,
		version: '*'
	    });
	//console.log('  checking '+client.url.href);
	client.post('/hello/' + getHost(me) + '/' + getPort(me), universe, function(err, req, res, u) {
		for(var key in universe) {
		    if (key == req._headers.host) {
			if (err != null) {
			    console.log('  removing '+key);
			    universe[key].down = true;
			}
			else {
			    //console.log('  in contact with '+key);
			    universe[key].down = false;
			    universe[key].lastSeen = new Date().getTime();
			    if (universe[key].firstSeen == -1)
				universe[key].firstSeen = universe[key].lastSeen;
			}
			break;
		    }
		}
		if (err == null) {
		    union(u);
		    //console.log('  received universe: %j', u);
		}
	    });
	//}, 1000+rndInt(250));
    }
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
		//console.log('  potential peer: '+uk);
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
    res.send(util.inspect(universe));
    return(next);
}

function hello(req, res, next) {
    //console.log('request from '+req.params.host+':'+req.params.port);
    res.send(universe);
    var remote = req.params.host+':'+req.params.port;
    var now = new Date().getTime();
    if (typeof universe[remote] === 'undefined') {
	//console.log('  adding '+remote);
	universe[remote] = {firstSeen:now, lastSeen:now, down:false};
    }
    else {
	//console.log('  updating '+remote);
	if (universe[remote].firstSeen == -1)
	    universe[remote].firstSeen = now;
	universe[remote].lastSeen = now;
	universe[remote].down = false;
    }
    union(req.body);
    return(next);
}
