const nodeStatic = require('node-static');
const http = require('http');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;

var fileServer = new nodeStatic.Server({
  headers:{
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
});
var app = http.createServer(function(req, res) {
  fileServer.serve(req, res);
}).listen(port, ()=>{
    console.log(`Server is up and running on ${port}`)
});

let io = socketIO.listen(app);

io.sockets.on('connect',(socket)=>{
    
    socket.on('message', (message)=>{
        //change this to specific room, rather to all
        //socket.to()
        socket.broadcast.emit('message',message);
    });

    socket.on('create_or_join_room', room => {
        var clientsInRoom = io.sockets.adapter.rooms[room];
        var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    
        if (numClients === 0) {
          socket.join(room);
          socket.emit('created', room, socket.id);
        } else if (numClients === 1) {
          io.sockets.in(room).emit('join', room);
          socket.join(room);
          socket.emit('joined', room, socket.id);
          io.sockets.in(room).emit('ready');
        } else { // max two clients
          socket.emit('full', room);
        }
    });



});