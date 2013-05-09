var restify = require('restify');

var server = restify.createServer({
	name: 'myapp',
	version: '1.0.0'
    });
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post('/masterStart', function (req, res, next) {
	res.send(req.params);
	return next();
    });

server.listen(1111, function () {
	console.log('%s listening at %s', server.name, server.url);
    });
