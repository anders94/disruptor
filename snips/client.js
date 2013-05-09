var restify = require('restify');

var client = restify.createJsonClient({
	url: 'http://127.0.0.1:1111',
	agent: false,
	version: '~1.0'
    });

client.post('/masterStart', {app: 'data/wordcount/counter'}, function (err, req, res, obj) {
	if (err != null)
	    console.log("error: ", err);
	else {
	    console.log('%d -> %j', res.statusCode, res.headers);
	    console.log('%j', obj);
	}
    });
