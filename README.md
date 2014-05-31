Disruptor
=========

<img src="http://anders.com/1offs/disruptor.png" width="400" height="228" alt="disruptor" align="right" />

**Disruptor** is a distributed realtime computation system for node.js. Disruptor makes it
easy to process unbounded streams of data across a mesh of many machines. It has minimal 
configuration requirements and no single points of failure.

Peers are started given the address and port of another peer. They quickly find all the other peers 
in the mesh without additional configuration. Worker programs are written in Javascript as 
independant node.js applications which get spawned by each peer in the cluster. As work comes in, 
(json payloads over http requests) it gets distributed and processed amongst the live workers. 
Results come back as responses to the http requests via json payloads.

There is no master peer, monitoring peer or other single point of failure. The design stresses 
simplicity wherever possible and requires minimal setup.

**Note:** Some things, such as the automatic packaging and distribution of client applications, 
are not yet implemented. This is a work in progress.

Install
-----
    npm install -g disruptor

or

    git clone https://github.com/anders94/disruptor.git
    cd disruptor/
    npm install

Usage
-----
Disruptor takes an IP and port on which to listen and the IP and port of some other peer in the 
mesh. All the peers will find each other and stay in communication as peers enter and leave 
the mesh.

    disruptor peer myHost:myPort anotherHost:itsPort

Example
-------
You can simulate a mesh of peers running on a single host. In a shell:

    disruptor peer 127.0.0.1:1111 127.0.0.1:22222

In another shell:

    disruptor peer 127.0.0.1:2222 127.0.0.1:11111

The peers should find each other. Start a few more peers and point each to one of the other peers in 
the mesh and they should all find all the others.

To see what other peers a disruptor peer knows about, visit it with a web browser:

    http://127.0.0.1:1111

In a production environment, rather than 127.0.0.1, you would use a network accessible interface
and run one peer on each machine.

There should be no setup beyond this. Peers that die or become inaccessible should automatically 
removed from the mesh over time. Simulate this by shutting down a peer and watch it get removed.

Be careful about running directly addressible peers on the live Internet. There isn't security 
yet so, although highly improbible, if someone else's mesh were to find your mesh, the meshes 
would attempt to merge. Usually meshes are run on private address ranges such as 192.168.0.0/16, 
172.16.0.0/12 or 10.0.0.0/8 without direct Internet addressibility.

Creating Worker Apps
--------------------
Worker applications exist in directories under apps/ (for example apps/wordcount) and respond to:

```javascript
process.on('message', function() { ... }) 
```

They emit results with:

```javascript
process.send( ... );
```

For example, here is an example word counting worker:

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

Given this input:
```
The First World War was to be the war to end all wars.
```

you should get this output:
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
You start workers by telling one of the running nodes to tell all the peers it knows about to start
a particular application. If we had the first example mesh still running, we might do this:

    disruptor start 127.0.0.1:1111 apps/wordcount/counter

Stopping all the workers is done similarly.

    disruptor stop 127.0.0.1:1111 apps/wordcount/counter

**Note:** Code is not yet distributed automatically. You have to sync the app directory with
all the peers. A good command to use for this is rsync for the time being:

    rsync -ae ssh ~/disruptor/apps 1.2.3.4:~/disruptor

In the future, starting a job will first make sure it runs locally, package it up into a 
compressed archive, distribute it and then start it on all known peers.

**Note: This functionality is under active developed.**

Sending Compute Tasks to Workers
--------------------------------
You can send json payloads to be processed to any node in the cluster through an HTTP socket
connection. The task will be sent to a single random worker and responses will flow back the 
same way.

    disruptor send 127.0.0.1:1111 apps/wordcount/counter \
    "{'the quick brown fox jumped over the lazy dog'}"

Alternatively, you can send requests directly via HTTP:

    $ curl -X POST -H "content-type: application/json" \
        http://localhost:8098/mapred --data @-<<\EOF
    {'the quick brown fox jumped over the lazy dog'}
    EOF

JSON results come back in the body of the HTTP response.

    { message: 'the quick brown fox jumped over the lazy dog',
        total: 9,
       unique: 8 }

**Note: This functionality is under active development.**

Author
------
**Anders Brownworth**

+ [http://twitter.com/anders94](@anders94)
+ [http://github.com/anders94](github.com/anders94)
+ [http://anders.com/](anders.com)

Please get in touch if you would like to contribute.

Are You Using This? Let me know!
--------------------------------
I started this project to do distributed natural language processing and machine 
learning. However, I'm sure the need to massively distribute node.js processing 
exists for many other jobs. I'm interested in solving real-world problems with 
disruptor so it is useful to know what jobs it is or isn't solving. Please tweet 
[http://twitter.com/anders94](@anders94) or otherwise get in touch.

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
