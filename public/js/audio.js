
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
                    var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
                    socket.emit('upstream_audio', blob);
                    setTimeout(1)
                    //this.chunks = [];
                // }
               
            };
            mediaRecorder.onstop = function(e) {
                //var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
                //socket.emit('upstream_audio', blob);
            };
        
            // Start recording
           
            mediaRecorder.start(100);
           // Stop recording after 5 seconds and broadcast it to server
            
        });