var util = require('util'),
    restify = require('restify'),
    path = require('path'),
    peer = require('./lib/peer');

var verbose = false;

if (process.argv.length==5 && process.argv[2] == 'peer')
    peer.createPeer(process.argv[3], process.argv[4]);

else if (process.argv.length==5 && process.argv[2] == 'start')
    peer.masterStart(process.argv[3], process.argv[4]);
//peer.startVMs(__dirname + '/' + process.argv[3]);

else if (process.argv.length==5 && process.argv[2] == 'stop')
    peer.masterStop(process.argv[3], process.argv[4]);

else {
    var appname = path.basename(process.argv[1]);
    console.log('Usage: '+process.argv[0]+' '+appname+' peer localIP:localPort remoteIP:remotePort');
    console.log('  or   '+process.argv[0]+' '+appname+' start IP:port apps/dir/app');
    console.log('  or   '+process.argv[0]+' '+appname+' stop IP:port apps/dir/app');
    //console.log('  or   '+process.argv[0]+' '+appname+' send IP:port apps/dir/app data');
}
