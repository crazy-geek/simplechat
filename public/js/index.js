let socket = io();
socket.on('connect', function (){
    console.log('Connected to Server')
    socket.emit('newData',{
        name:'Jijo',
        phone:1212
    })
})

socket.on('receiveMessage', function(data){
    console.log('New Data from Server', data)
    receiveMessage(data)
})

socket.on('disconnect', ()=> {
    console.log('Server Disconnected')
})

let sendMessage = function (){
    event.preventDefault()
    let msgTextVal = document.getElementById('txtMsg').value;
    socket.emit('sendMessage', {from:'user', msg:msgTextVal})
    
}
let receiveMessage = function (data){
    let elem = `<li> ${data.from}: ${data.msg} </li>`
    document.getElementById('msgs').innerHTML += elem;
}