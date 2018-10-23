const express = require('express')
const path = require('path')
const socketIO = require('socket.io')
const http = require('http')

const app = express()

const server = http.createServer(app)
const io = socketIO(server)

app.use(express.static(path.join(__dirname,'../public')))

io.on('connection', (socket) => {
    console.log('Client connected..')
    socket.on('sendMessage', (data)=>{
        io.emit('receiveMessage',{from: 'user', msg: data.msg, createdAt: new Date().getTime()})
    })

    socket.on('stream',function(image){
        socket.emit('stream',image);  
    });

    socket.on('disconnect', () =>{
        console.log('Client Disconnected')
    })

   

})
let port = process.env.PORT || 3000
server.listen(port,()=>{
    console.log(`server is up and running on ${port}`)
})