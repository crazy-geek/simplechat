'use strict';
const TURN_URL = 'turn:numb.viagenie.ca?username=41784574&key=4080218913';

var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var pc;
var remoteStream;
var turnReady;

var pcConfig = {
  'iceServers': [{
    'urls': [
          {'url':'stun:stun.l.google.com:19302'},
          {'url': 'turn:YzYNCouZM1mhqhmseWk6@13.250.13.83:3478?transport=udp','credential': 'YzYNCouZM1mhqhmseWk6'}
        ],
    
  }]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};


let localVideo = document.getElementById('localvdo')
let remoteVideo = document.getElementById('remotevdo')

let startBtn = document.getElementById('startButton');
let callBtn = document.getElementById('callButton');
let endBtn = document.getElementById('hangupButton');

callBtn.disabled = true;
endBtn.disabled = true;

//startBtn.addEventListener('click', onStartVideoChat);
//callBtn.addEventListener('click', onStartStreaming);
endBtn.addEventListener('click', handleRemoteHangup);

var socket = io.connect();

if (location.hostname !== 'localhost') {
    requestTurn(TURN_URL);
}
pc = new RTCPeerConnection(null);
let room = prompt('Enter a room name to Join','Private')
CreateOrJoinRoom(room)
onStartVideoChat()
function onStartVideoChat(){
  console.log('streaming started')
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })
      .then(gotStream)
      .catch(function(e) {
        alert('getUserMedia() error: ' + e);
      });
      callBtn.disabled = false;
      endBtn.disabled = false;
};


function gotStream(stream) {
    console.log('got stream')
    localStream = stream;
    localVideo.srcObject = stream;
    sendMessage('GOT_USR_MEDIA');
    if (isInitiator) {
      maybeStart();
    }
  }

function CreateOrJoinRoom(room) {
    if(room !== '')
        socket.emit('create_or_join_room', room);
}
socket.on('created', function(room) {
    console.log('Created room ' + room);
    isInitiator = true;
  });
  
  socket.on('full', function(room) {
    console.log('Room ' + room + ' is full');
  });
  
  socket.on('join', function (room){
    isChannelReady = true;
  });

  socket.on('joined', function (room){
    isChannelReady = true;
  });

  //****************

  function sendMessage (message){
    socket.emit('message', message);
  }

  socket.on('message', message => {
    console.log('Server reponds', message)
    if (message === 'GOT_USR_MEDIA') {
        maybeStart();
      } else if (message.type === 'offer') {
        if (!isInitiator && !isStarted) {
          maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
      } else if (message.type === 'answer' && isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate' && isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate
        });
        pc.addIceCandidate(candidate);
      } else if (message === 'bye' && isStarted) {
        handleRemoteHangup();
      }
  })

  function maybeStart(){
    console.log(isStarted, localStream, isChannelReady)
    if (!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
      createPeerConnection();
      pc.addStream(localStream);
      isStarted = true;
      if (isInitiator) {
        doCall();
      }
    }
  }

  function createPeerConnection(){
    console.log('try create peer connection')
    try {
      
      pc.onicecandidate = handleIceCandidate;
      pc.onaddstream = handleRemoteStreamAdded;
      pc.onremovestream = handleRemoteStreamRemoved;
    } catch (e) {
      console.log('Failed to create PeerConnection, exception: ' + e.message);
      alert('Cannot create RTCPeerConnection object.');
      return;
    }
  };

  function handleIceCandidate(event) {
    console.log('icecandidate event: ', event);
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    } else {
      console.log('End of candidates.');
    }
  };

  function handleRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
  }
  
  function handleRemoteStreamRemoved(event) {
    console.log('Remote stream removed. Event: ', event);
  }

  function doCall() {
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
  };

  function handleCreateOfferError(err){
    console.log(err)
  }
  function doAnswer() {
    pc.createAnswer().then(
      setLocalAndSendMessage,
      onCreateSessionDescriptionError
    );
  };

  function setLocalAndSendMessage(sessionDescription) {
    pc.setLocalDescription(sessionDescription);
    sendMessage(sessionDescription);
  };
  
  function onCreateSessionDescriptionError(error) {
    console.log('Failed to create session description: ' + error.toString());
  };

  function handleRemoteHangup() {
    console.log('Session terminated.');
    stop();
    isInitiator = false;
  };

  function requestTurn(turnURL) {
     
      turnReady = true;
    // socket.emit('GET_TURN_SERVER');
    // var turnExists = false;
    // for (var i in pcConfig.iceServers) {
    //   if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
    //     turnExists = true;
    //     turnReady = true;
    //     break;
    //   }
    // }
    // if (!turnExists) {
      console.log('Getting TURN server from ', turnURL);
      //socket.emit('GET_TURN_SERVER');
      // No TURN server. Get one from computeengineondemand.appspot.com:
      // var xhr = new XMLHttpRequest();
      // xhr.onreadystatechange = function() {
      //   if (xhr.readyState === 4 && xhr.status === 200) {
      //     var turnServer = JSON.parse(xhr.responseText);
      //     console.log('Got TURN server: ', turnServer);
      //     pcConfig.iceServers.push({
      //       'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
      //       'credential': turnServer.password
      //     });
      //     turnReady = true;
      //   }
      // };
      // xhr.open('GET', turnURL, true);
      // xhr.send();
    //}
  };

  function stop() {
    isStarted = false;
    pc.close();
    pc = null;
  };
  