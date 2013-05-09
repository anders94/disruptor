(function() {
    var restify = require('restify'),
        vm = require('./vm');

    //--- Globals

    var me;
    var universe = {};
    var verbose = false;

    //--- Exported Functions

    exports.createPeer = function(a, b) {
	me = a;
	universe[b] = {firstSeen: -1, lastSeen: -1, down: true};

	var server = restify.createServer();
	server.use(restify.bodyParser());
	server.get('/', index);
	server.post('/hello/:host/:port', hello);
	server.post('/masterStart', masterStart);
	server.post('/masterStop', masterStop);
	server.post('/start', start);
	server.post('/stop', stop);

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
		}, 5000);

    };

    exports.getUniverse = function() {
	return(universe);

    }

    exports.masterStart = function(hostPort, app) {
	console.log('telling '+hostPort+' to tell all known peers to start '+app);
	var client = restify.createJsonClient({
		url: 'http://'+hostPort,
		agent: false,
		version: '*'
	    });
	client.post('/masterStart', {app: app}, function(err, req, res, data) {
		if (err != null)
		    console.log('Error: Couldn\'t reach '+req._headers.host);
	    });

    }

    exports.masterStop = function(hostPort, app) {
	console.log('telling '+hostPort+' to tell all known peers to stop '+app);
	var client = restify.createJsonClient({
		url: 'http://'+hostPort,
		agent: false,
		version: '*'
	    });
	client.post('/masterStop', {app: app}, function(err, req, res, data) {
		if (err != null)
		    console.log('Error: Couldn\'t reach '+req._headers.host);
	    });

    }

    ///--- Helpers

    function pollPeers() {
	if (verbose)
	    console.log('polling peers');
	for (var hostPort in universe)
	    checkHostPort(hostPort);
    }

    function checkHostPort(hostPort) {
	setTimeout( function(hostPort) {
		var client = restify.createJsonClient({
			url: 'http://'+hostPort,
			agent: false,
			version: '*'
		    });
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
	    }, rndInt(5000), hostPort); // within the next 5 seconds
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

	for (var key in vm.processes()) {
	    console.log('  + '+key);
	}
    }

    function tellAllPeers(path, cmd) {
	for (var hostPort in universe) {
	    console.log('telling '+hostPort+' '+path+' '+cmd);

	    var client = restify.createJsonClient({
		    url: 'http://'+hostPort,
		    agent: false,
		    version: '*'
		});
	    client.post(path, {app: cmd}, function(err, req, res, data) {
		    if (err == null) {
			console.log(req._headers.host+' replied successfully');
		    }
		    else
			console.log('Error: Couldn\'t reach '+req._headers.host+':'+req._headers.port+' '+err);
		});
	}
    }

    // util functions
    function union(u) { // add in whatever peers we don't already know about
	for(var uk in u) {
	    if (uk != me) {
		var found = false;
		for(var key in universe)
		    if (uk == key)
			found = true;
		if (!found) {
		    u[uk].firstSeen = -1;
		    u[uk].lastSeen = -1;
		    u[uk].down = true;
		    universe[uk] = u[uk];
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

    function getAge(then) {
	var now = new Date().getTime();
	var age = '';
	var day = 1000*60*60*24;
	var hour = 1000*60*60;
	var min = 1000*60;
	var sec = 1000;
	if (then > -1) {
	    delta = now - then;
	    days = Math.floor(delta/day);
	    delta = delta % day;
	    hours = Math.floor(delta/hour);
	    delta = delta % hour;
	    mins = Math.floor(delta/min);
	    delta = delta % min;
	    secs = Math.floor(delta/sec);
	    if (days > 0)
		age = days+' days, ';
	    if (hours > 0)
		age = age+hours+' hours, ';
	    if (mins > 0)
		age = age+mins+' minutes, ';
	    age = age+secs+' seconds';
	}
	else
	    age = 'never';
	return(age);
    }

    // http routines
    function index(req, res, next) {
	if (verbose)
	    console.log('index request from '+req.params.host+':'+req.params.port);
	var connections = 0;
	var s = "<html><body><h1>"+me+" disruptor status</h1>";
	for (var key in universe) {
	    if (!universe[key].down) {
		s = s+'+ <a href="http://'+key+'">'+key+'</a> up '+getAge(universe[key].firstSeen)+'<br>';
		connections += 1;
	    }
	    else
		s = s+'- '+key+' last seen '+getAge(universe[key].lasttSeen)+' ago<br>';
	}
	s = s+'<br>'+connections+' active connections<br><h1>processes</h1>';

	for (var key in vm.processes())
	    s = s+key+'<br>';

	s = s+'</html></body>';

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
	    console.log('hello request from '+req.params.host+':'+req.params.port);
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

    function masterStart(req, res, next) {
	//if (verbose)
	    console.log('master start request for '+req.params.app);
	res.send('masterStart');
	tellAllPeers('/start', req.params.app);
	next();
    }

    function masterStop(req, res, next) {
	//if (verbose)
	    console.log('master stop request for '+req.params.app);
	res.send('masterStop');
	tellAllPeers('/stop', req.params.app);
	next();
    }

    function start(req, res, next) {
	//if (verbose)
	    console.log('start request for '+req.params.app);
	res.send('started');
	vm.start(req.params.app);
	next();
    }

    function stop(req, res, next) {
	//if (verbose)
	    console.log('stop request for '+req.params.app);
	res.send('stopped');
	vm.stop(req.params.app);
	next();
    }
}());
