var WebsocketServer = require('ws').Server;
 
var server = new WebsocketServer({ port: process.env.PORT });
server.on('connection', function(socket) {
  socket.on('message', function(msg) {
    server.clients.forEach(function(other) {
      if(other === socket) {
        return;
      }
 
      other.send(msg);
    });
  });
});