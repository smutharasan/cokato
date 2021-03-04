const videoGrid = document.getElementById('video-grid');
const socket = io('/');
const myPeer = new Peer(undefined, {
  host: 'peerjs-server.herokuapp.com',
  secure: true,
  port: 443,
});
//const myPeer = new Peer(undefined, { host: 'cokato.herokuapp.com', port: 443 });
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    console.log('hello');
    addVideoStream(myVideo, stream);
    console.log('TEST');
    myPeer.on('call', (call) => {
      console.log('CAlling the other person');
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
      call.on('close', () => {
        video.remove();
      });
    });
    socket.on('user-connected', (givenUserID) => {
      setTimeout(() => {
        // user joined
        connectToNewUser(givenUserID, stream);
      }, 3000);
    });
  })
  .catch((err) => console.error(err));

socket.on('user-disconnected', (userID) => {
  console.log('AHHHHHHHHHHHHHHH');
  console.log(userID);
});

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

// socket.on('user-connected', (givenUserID) => {
//   console.log('hello + ' + givenUserID);
// });

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    console.log('playing');
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(givenID, givenStream) {
  const call = myPeer.call(givenID, givenStream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });
}
