# Introduction

> Federation is a federated event emitter

Federation is a messaging network built on top of Axon,
that lets any two nodes in the federation send routed messages to one and other.

# Goals

- fault tolerance
- zero-configuration setup
- minimal and familiar api

# Install

    $ npm install federation

# Usage

Federation is a peer-to-peer messaging network with no central server.

    var fed   = require('federation');
    
    var node1 = fed.node('node1');
    var node2 = fed.ndoe('node2');

Federation nodes can send and receive messages to each other.
Each node on the network exists at a fully-qualified URL.
Assume the above script is running on host `192.168.0.23`,
then `node1` and `node2` had the respective addresses:

    fed://192.168.0.23/node1
    fed://192.168.0.23/node2

## Send a Message

Nodes can message other nodes with their address:

    var message = "Hello World";
    var address = "fed://192.168.0.23/node2";
    node1.send(address,message);

For nodes on the same host, the hostname may be omitted:

    node1.send("/node2", message);

## Receive Messages

Nodes receive messages to mailboxes which can have handlers:

    node1.on('message',function(message){
      // handle message
    })

The default mailbox is called `message` however other mailboxes can be used with the hash `#` syntax:

    node2.on('#hello',function(message){
      // handle message
    })
    node1.send('/node2#hello',message);

# Specification

- the `fed://` protocol refers to whatever the default protocol will be, perhaps `axon://`
- any protocol can be supported via a `Protocol` interface
- local references are delivered locally, and bypass the any protocol interfaces

## Future Features

- location-independent names will be supported via bang-syntax `!name`
- the request-reply pattern will be applied via _anonymous actors_