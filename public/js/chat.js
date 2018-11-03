
socket.on('receiveMessage', function(data){
    receiveMessage(data)
})

let sendMessage = function (){
    event.preventDefault()
    let msgTextVal = document.getElementById('txtMsg').value;
    if(msgTextVal == '')
        return;
    socket.emit('sendMessage', {from:'user', msg:msgTextVal})
    document.getElementById('txtMsg').value = ''
    
}
let renderMessage = function (data){
    let elem = `<li> ${data.from}: ${data.msg} </li>`
    document.getElementById('msgs').innerHTML += elem;
}

