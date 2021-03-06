var defaults = {
  
  // Transport keys listed here will be automagically loaded from
  // the `{MODULE}/transports/` directory, and passed their relevant options.
  // 
  // The only exception is if a module has a `disabled` key listed, 
  // and set to anything that evaluates to true.
  // 
  // To enable an existing transport, remove its `disabled` key.
  // To disable a transport, assign the `disabled` key, or remove the option altogether.
  transports: {
    
    // Axon Transport Options
    axon: {
      
      // To disable axon transport, un-comment the following line
      // disabled: true,
      
      // The location of the module to load
      // Relative paths are resolved relative to the federation module 
      module : 'transports/axon',
      
      // The port that axon binds to for incomign connections
      PORT_BIND : 8973,
      
      // The default port Axon connects to on the remote host 
      // if no port is specified in the connection URL
      PORT_CONNECT: 8973
    },
    
    // HTTP Transport Options
    http: {
      
      // HTTP transport is disabled by default
      // Remove the following key to enable
      disabled: true,
      
      module : 'transports/http',
      
      // You can make this port 80, but that will require running
      // your service as root. We do not recommend such crazyness.
      //
      // The default HTTP transport is proxy-friendly, so you should
      // be able to situate this behind an HA-Proxy or NGINX.
      PORT_BIND: 8974,
      
      // The default HTTP port to connect to if none is specified.
      PORT_CONNECT: 8974
      
    }
    
  },
  
  // The file path of the routes table to load.
  // This is optional, by default all messages are routed locally
  table_file: null

}

module.exports = defaults;
