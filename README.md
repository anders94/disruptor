disruptor
=========

Warning: This is alpha code. I'm still in the design stage so things will change without notice.

**disruptor** intends to be a distributed fault-tolerant real-time computation platform. Eventually
it may include a distributed hash table and filesystem as well.

Install
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

The processes should find eachother. Start a few more and point each to one of the live nodes in 
the network and they should all find eachother.

To see what nodes the first process knows about:

    curl http://127.0.0.1:1111

TODO
----
Currently the nodes can find eachother and notice when nodes go away.

The next step is to enable a computational request to one of the nodes which will vend
it out to all the nodes it knows are alive. That node, acting as master, will collect all
the results and feed them back to the requestor.

I am currently working on the design for this. Please get in touch if you would like to contribute.
