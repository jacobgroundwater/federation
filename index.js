var url       = require('url');
var path      = require('path');
var events    = require('events');
var fs        = require('fs');

// Import Default Transport Modules
var axon      = require('./transports/axon');
var http      = require('./transports/http');

// Application Defaults
var defaults  = require('./defaults');

// Configure Application Dependencies
var lib       = require('./lib');
var app = {}

// Dependency Injection Magic
//
//             o
//                  O       /`-.__
//                         /  \·'^|
//            o           T    l  *
//                       _|-..-|_
//                O    (^ '----' `)
//                      `\-....-/^   Dependicus Injectus
//            O       o  ) "/ " (
//                      _( (-)  )_
//                  O  /\ )    (  /\
//                    /  \(    ) |  \
//                o  o    \)  ( /    \
//                  /     |(  )|      \
//                 /    o \ \( /       \
//           __.--'   O    \_ /   .._   \
//          //|)\      ,   (_)   /(((\^)'\
//             |       | O         )  `  |
//             |      / o___      /      /
//            /  _.-''^^__O_^^''-._     /
//          .'  /  -''^^    ^^''-  \--'^
//        .'   .`.  `'''----'''^  .`. \
//      .'    /   `'--..____..--'^   \ \
//     /  _.-/                        \ \
// .::'_/^   |                        |  `.
//        .-'|                        |    `-.
//  _.--'`   \                        /       `-.
// /          \                      /           `-._
// `'---..__   `.                  .´_.._   __       \
//          ``'''`.              .'      `'^  `''---'^
//                 `-..______..-'
// 
app.Node      = lib.node      .forge(app);
app.Transport = lib.transport .forge(app);
app.Vertex    = lib.vertex    .forge(app);
app.Gateway   = lib.gateway   .forge(app);
app.Hub       = lib.hub       .forge(app);
app.Actor     = lib.actor     .forge(app);
app.Director  = lib.director  .forge(app);
app.Router    = lib.router    .forge(app);
app.Producer  = lib.producer  .forge(app);
app.Route     = lib.route     .forge(app);
app.Table     = lib.table     .forge(app);

// This is the messy stuff, but thankfully most of the mess
// is contained here. Over time, the logic defined here should
// be refactored into its own modules.
function start(options){
  
  var outbox  = new events.EventEmitter();
  var inbox   = new events.EventEmitter();
  
  var hub     = app.Hub.NewWithEmitters(inbox,outbox);
  
  var gateway = hub.createGateway();
  var vertex  = hub.createVertex();
  
  // Create a Loopback Interface for Protocol-less Addresses
  var loopback = gateway.createTransport();
  loopback.enqueue = loopback.receive;
  
  // Transports are loaded dynamically
  // 
  // Loop over transports defined in `options` and
  // attempt to load and initialize each transport
  var transports     = options.transports;
  var transport_keys = Object.keys(transports);
  
  transport_keys.forEach(function(key){
    
    var tran_options = transports[key];
    var tran_module  = tran_options.module || 'transports/' + key;
    var tran_path    = path.resolve(__dirname, tran_module);
    var tran_setup   = require(tran_path);
    
    if(tran_options.disabled) return;
    
    var transport    = gateway.createTransport(key + ':');
    tran_setup.init(transport,tran_options);
    
  });
  
  // Configure Routes Table
  var route_json = {
    regex: /.*/,
    address: '/'
  }
  var table      = app.Table.New();
  var route      = app.Route.NewFromJSON(route_json);
  table.addRoute(1000000,route);
  
  // Load Optional Routes
  //
  // Addtional routes can be loaded from a JSON file
  // Pass the path to the file in as part of the init options `table_file`
  if(options.table_file){
    var table_json = fs.readFileSync(options.table_file);
    var table_obj  = JSON.parse(table_json);
    for(var i=0; i<table_obj.length; i++){
      var rt_json  = table_obj[i];
      var tb_route = app.Route.NewFromJSON(rt_json);
      table.addRoute(i * 100,tb_route);
    }
  }
  
  // Configure Router
  var r_emit   = new events.EventEmitter();
  var router   = app.Router.NewWithTableAndEmitter(table,r_emit);
  var node     = vertex.createNode();
  var producer = app.Producer.NewWithRouter(router);
  
  // Bind router events to the node handling message transport
  r_emit.on('send',function(address,packet){
    node.send(address,packet);
  });
  
  // Route incoming node messages to the producer -> directory -> actor
  node.receive = function(packet){
    producer.enqueue(packet);
  }
  
  // Producer Contains all Relevant Sub-Systems
  return producer;

}

// Expose defaults
module.exports.defaults = defaults;

// Go Baby Go!
module.exports.init     = function(options){
  var opts = options || defaults;
  return start(opts);
}
