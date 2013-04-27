var cluster = require('cluster');

if (cluster.isMaster) {
    cluster.fork();
    cluster.fork();

    cluster.on('disconnect', function(worker) {
	    console.error('disconnect!');
	    cluster.fork();
	});
}
else {
    console.log("run");
}
