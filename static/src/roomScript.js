const videoGrid = document.getElementById('video-grid');
const socket = io('/');
const myPeer = new Peer(undefined, { host: '/', port: 8081 });
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
    myPeer.on('call', (call) => {
      console.log('CAlling the other person');
      call.answer(stream);
    });
    socket.on('user-connected', (givenUserID) => {
      connectToNewUser(givenUserID, stream);
    });
  })
  .catch((err) => console.error(err));

myPeer.on('opem', (id) => {
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
