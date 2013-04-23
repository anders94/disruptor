disruptor
=========

Warning: This is highly alpha - don't expect any of this to actually work yet.

Disruptor intends to be a distributed fault-tolerant real-time computation platform. Eventually
it may include a distributed hash table and filesystem but that is beyond the scope of the 
project at this point.

Setup
-----
    npm install disruptor

Usage
-----
    node peer myHost:myPort anotherHost:anotherPort

Example
-------
In the first shell:
    node peer 127.0.0.1:1111 127.0.0.1:22222

In the second shell:
    node peer 127.0.0.1:2222 127.0.0.1:11111

Each process should find the other. To see what nodes the first process knows about:
    curl http://127.0.0.1:1111

TODO
----
Currently the nodes can find eachother and notice when nodes go away but that's about it.
The next step is to open up a computational request to one of the nodes which will vend
it out to all the nodes it knows are alive. That node, acting as master, will collect all
the results and feed them back to the requestor.
