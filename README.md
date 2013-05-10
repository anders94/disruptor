disruptor
=========

***Warning: This is alpha code.*** Things are in the design stage so they may change without notice.

<img src="http://anders.com/1offs/disruptor.png" width="400" height="228" alt="disruptor" align="right" />

**disruptor** intends to be a distributed P2P fault-tolerant real-time computation platform written in 
node.js. It has minimal configuration requirements and no single point of failure.

Nodes are started by being pointed at another peer and they quickly find all the other nodes in the 
network. Workers are written in Javascript as independant node.js applications which get spawned by 
each node in the cluster. As work in the form of json payloads over http requests comes in, it gets 
distributed amongst the live workers. Results come back via json payloads as responses to the http 
requests.

There is no master peer, monitoring node or other single point of failure in the system and the design 
stresses simplicity wherever possible and requires a minimum of setup.

Install
-----
    git clone https://github.com/anders94/disruptor.git

or

    npm install disruptor

Usage
-----
The application takes an IP and port on which to listen and the IP and port of some other peer 
on the network. All the peers will find each other and stay in communication as peers enter and
leave the network.

    node disruptor peer myHost:myPort anotherHost:anotherPort

Example
-------
In the first shell:

    node disruptor peer 127.0.0.1:1111 127.0.0.1:22222

In the second shell:

    node disruptor peer 127.0.0.1:2222 127.0.0.1:11111

The processes should find each other. Start a few more and point each to one of the live nodes in 
the network and they should all find each other.

To see what other nodes the first disruptor peer knows about, visit it with a web browser:

    http://127.0.0.1:1111

Usually this is done machine to machine with network accessible IP addresses, not all on the same 
host as in this example.

Creating Worker Apps
--------------------
Workers run code that lives in app directories under apps/ (for example apps/wordcount) and 
respond to:

```javascript
process.on('message', function() { ... }) 
```

They emit results with:

```javascript
process.send( ... );
```

For example, here is a word counting worker:

```javascript
var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();

process.on('message', function(message) {
        var total = 0, unique = 0;
        var hash = {};
        var ary = tokenizer.tokenize(message);
        for (var id in ary) { // throw stemmed word into hash
            hash[natural.PorterStemmer.stem(ary[id])] = true;
            total ++;
        }

        for (var key in hash) // count unique word stems
            unique ++;

        process.send({ message: message, total: total, unique: unique });
    });
```

With this example, this input:
```
The First World War was to be the war to end all wars.
```

creates this output:
```
{ message: 'The First World War was to be the war to end all wars.',
    total: 13,
   unique: 9 }
```

Worker apps, once started, run continuously and can send responses at any time. Any number
of differently named workers can run on the same node at the same time.

**Note:** Any npm packages used in worker apps need to be installed on every node. Disruptor
will do this automatically* if you install the modules locally to each app (ie: 
apps/wordcount/npm_modules for the above example) although a standard 'npm install' will put 
them in disruptor's npm_modules. This will work but the code will not be automatically 
distributed to other nodes by disruptor so you would have to do that by hand.

**Note: This functionality is under active developed.**

Starting Workers
----------------
You start workers by telling one of the nodes to tell all the peers it knows about to start
a particular application.

    node disruptor start 127.0.0.1:1111 apps/wordcount/counter

Stopping all the workers is done similarly.

    node disruptor stop 127.0.0.1:1111 apps/wordcount/counter

**Note:** Code is not yet distributed automatically. You have to sync the app directory with
all the peers. A good command to use for this is rsync:

    rsync -ae ssh ~/disruptor/apps 1.2.3.4:~/disruptor

In the future, starting a job will first make sure it runs locally, package it up into a 
compressed archive, distribute it and then start it on all known peers.

**Note: This functionality is under active developed.**

Sending Compute Tasks to Workers
--------------------------------
You can send json payloads to be processed to any node in the cluster through an HTTP socket
connection. The task will be sent to a random worker and responses will flow back the same way.

**Note: This functionality is under active developed.**

Author
------
**Anders Brownworth**

+ [http://twitter.com/anders94](@anders94)
+ [http://github.com/anders94](github.com/anders94)
+ [http://anders.com/](anders.com)

Please get in touch if you would like to contribute.

Are You Using This?
-------------------
Please let me know if you are using disruptor. I'm very interested in solving real-world problems with it so 
it is useful to know what jobs it is or isn't solving. Please tweet [http://twitter.com/anders94](@anders94)
and let me know.

Copyright and license
---------------------
Copyright 2013 Anders Brownworth

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except 
in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

  [http://www.apache.org/licenses/LICENSE-2.0](apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the 
License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either 
express or implied. See the License for the specific language governing permissions and
limitations under the License.
