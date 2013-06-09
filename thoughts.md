Node.js as the Lowest Common Denominator
----------------------------------------
Node.js is great for I/O bound tasks. (and not quite as good for things that are CPU bound)
Most needs for realtime processing are around parallelizing I/O - tasks like breaking big 
data sets into little peices across many machines and processing them in parallel. Disruptor
intends to coordinate the distribution of realtime tasks amongst many peers using the 
node.js virtual machine as the common building block.

Worker Code Execution Strategy
------------------------------
Pluses and minuses on different strategies for executing arbitrary javascript:

exec
  * in process - no thread startup / requirement for waiting thread strategy
  * can overwrite our local variables - very dangerous

vm
  * sandboxed from our local variables
  * in process - no thread startup / requirement for waiting thread strategy
  * we can catch errors using 'domains' without bailing on the master process
  * only basic javascript - no nodeisms - ex: require is not defined. (can this be passed?)

child process
  * all the power of node / npm packages, etc
  * security issue - might be possible to coerce the app into running arbitrary code
  * need to run apps from the filesystem, not from strings
  * need a way to package up the code, send it to the peers and unpackage it
    * code bundle is a compressed blob of a standard node app including node_modules
    * WebDAV-like process for delivering code bundle?
  * workers implement process.on('message', function(m) { ... and do a 
    process.send({ foo: 'bar' }); to return data to the server

In the exec and vm contexts, code has no filename so we should sha1 digest the content 
and use that as the name / handle.

Workers, once started, should always be running so we don't have to pay the performance
penalty of starting the vm every time a block of work needs to be done. Workers are sent 
data at arbitrary times and return results in a similarly arbitrary way. This means we 
need a strategy for worker management - setup / teardown.

There needs to be a worker startup / shutdown process which works independently from 
passing work to the workers and getting resuts back. Workers may be started on all nodes 
or a target number of nodes. A chunk of work can be sent to all workers or a single worker
via some distribution policy. (round robin, weighted, least connections, etc.) Should 
collating of the data coming back be the responsibility of some user code sent to the
controlling peer or just the responsibility of the requestor?

In the streaming context I want to send work to the least loaded peer so I will probably
optimize for that first. Get in touch with @anders94 if you have a need for sending the
same job to all or a set of peers. Until I get distributed dataset support, I don't know 
that this will be very useful but get in touch if you have a specific need.
