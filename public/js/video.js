if (!window.AudioContext) {
    if (!window.webkitAudioContext) {
        alert("Your browser does not support any AudioContext and cannot play back this audio.");
    }
        window.AudioContext = window.webkitAudioContext;
}

    aud_context = new AudioContext();


//broadcast
let broadcast = () =>{
    event.preventDefault()
    var canvas = document.getElementById("preview");
    var context = canvas.getContext('2d');
 
    canvas.width = 350;
    canvas.height = 300;
 
    context.width = canvas.width;
    context.height = canvas.height;
 
    var video = document.getElementById("video");

    function logger(msg){
        $('#logger').text(msg);
    }

    // function loadCamera(stream){
    //     video.src = window.URL.createObjectURL(stream);
    //     logger("Camera connected");
    // }
 
    function loadFail(){
        logger("Camera not connected");
    }
 
    function viewVideo(video,context){
        context.drawImage(video,0,0,context.width,context.height);
        socket.emit('broadcast',canvas.toDataURL('image/webp'));
    }

    navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia );
    
        if(navigator.getUserMedia){
            navigator.getUserMedia({video: true, audio: false},(stream) => {
                video.src = window.URL.createObjectURL(stream);
                logger("Camera connected");
            },loadFail);
        }
 
        setInterval(function(){
            viewVideo(video,context);
        },0.2);

            var constraints = { audio: true };
            navigator.mediaDevices.getUserMedia(constraints).then(function(mediaStream) {
                var mediaRecorder = new MediaRecorder(mediaStream);
                mediaRecorder.onstart = function(e) {
                    this.chunks = [];
                };
                mediaRecorder.ondataavailable = function(e) {
        
                    // if(e.data && e.data.size > 0){
                        console.log(e.data)
                        this.chunks.push(e.data);
                        //var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
                        socket.emit('upstream_audio', e.data);
                        setTimeout(1)
                        //this.chunks = [];
                    // }
                   
                };
                mediaRecorder.onstop = function(e) {
                    //var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
                    //socket.emit('upstream_audio', blob);
                };
            
                // Start recording
               
                mediaRecorder.start(10);
               // Stop recording after 5 seconds and broadcast it to server
                
            });
        
}



//play video
socket.on('play',function(image){
    $('#play').attr('src',image);
});
 // When the client receives a voice message it will play the sound
socket.on('playaudio', function(arrayBuffer) {
    console.log(arrayBuffer.length)
        playByteArray(arrayBuffer)
});

function playByteArray(bytes) {

   // var buffer = new Uint8Array(bytes.length);
    //buffer.set( new Uint8Array(bytes), 0 );

    aud_context.decodeAudioData(bytes.buffer, play);
}

function play( audioBuffer ) {
    var source = aud_context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect( aud_context.destination );
    source.start(0);
}
