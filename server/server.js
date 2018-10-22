const express = require('express')
const path = require('path')
const socketIO = require('socket.io')
const http = require('http')

const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)
const io = socketIO(server)

app.use(express.static(path.join(__dirname,'../public')))

io.on('connection', (socket) => {
    console.log('Client connected..')
    socket.on('sendMessage', (data)=>{
        //console.log('data received' + data)
        io.emit('receiveMessage',{from:'user', msg:data.msg, createdAt: new Date().getTime()})
    })



    socket.on('disconnect', () =>{
        console.log('Client Disconnected')
    })
})

server.listen(port,()=>{
    console.log(`server is up and running on ${port}`)
})