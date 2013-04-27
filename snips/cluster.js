var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log('forking '+numCPUs+' processes');
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
            console.log('ERROR! worker ' + worker.process.pid + ' died - attempting to restart');
            setTimeout(function() {
                    cluster.fork();
                }, 1000); // wait 1 second before forking again
        });
}
else {
    console.log("run");
}
