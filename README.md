disruptor
=========

Warning: This is alpha code. Things are in the design stage so they may change without notice.

**disruptor** intends to be a distributed fault-tolerant real-time computation platform with 
minimal configuration requirements. Eventually it may include a distributed hash table and 
filesystem.

Install
-----
    git clone https://github.com/anders94/disruptor.git

or

    npm install disruptor

Usage
-----
The application takes an IP and port on which to listen and the IP and port of some other peer 
on the network. All the peers will find eachother and stay in communication as peers enter and
leave the network.

    node peer myHost:myPort anotherHost:anotherPort

Example
-------
In the first shell:

    node peer 127.0.0.1:1111 127.0.0.1:22222

In the second shell:

    node peer 127.0.0.1:2222 127.0.0.1:11111

The processes should find eachother. Start a few more and point each to one of the live nodes in 
the network and they should all find eachother.

To see what nodes the first process knows about, visit the peer in a browser:

    http://127.0.0.1:1111

TODO
----
Currently the nodes can find eachother and notice when nodes go away. Each node shows a simple
web interface displaying all the peers it knows about and their status within the network.

The next step is to enable a computational request to one of the nodes which will vend
it out to all the nodes it knows are alive. That node, acting as master, will collect all
the results and feed them back to the requestor.

I am currently working on the design for this. Please get in touch if you would like to contribute.

Author
------
**Anders Brownworth**

+ [http://twitter.com/anders94](http://twitter.com/anders94)
+ [http://github.com/anders94](http://github.com/anders94)
+ [http://anders.com/](http://anders.com)

Copyright and license
---------------------
Copyright 2013 Anders Brownworth

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except 
in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

  [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the 
License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either 
express or implied. See the License for the specific language governing permissions and
limitations under the License.
