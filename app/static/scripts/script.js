document.getElementById("makeRoomBtn").addEventListener("click", makeNewRoom);
document.getElementById("joinRoomBtn").addEventListener("click", requestToJoinRoom);

const socket = io.connect('https://sastastream.herokuapp.com/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: 'playpeer.herokuapp.com',
  path: '/',
  secure: true
})


let peerId = undefined

myPeer.on('open', id => {
  // console.log("HERO: ", id)
  peerId = id
  socket.emit('new-peer', peerId)
})


function makeNewRoom() {
  roomId = document.getElementById('newRoomId').value
  document.getElementById('newRoomId').value = ''
  socket.emit('make-new-room', roomId)
}


function requestToJoinRoom() {
  roomId = document.getElementById('joinRoomId').value
  document.getElementById('joinRoomId').value = ''
  socket.emit('ask-to-join-room', {'roomId': roomId, 'peerId': peerId})
}


const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})


function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
} 