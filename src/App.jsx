import React, { useState } from 'react'
import io from 'socket.io-client'
import Chat from './Chat'
import music from '../public/message-tone.mp3'
const socket = io.connect("https://websocket-api-1pok.onrender.com/")
import logo from '../src/assets/logo.png'
function App() {
  const [showChatDashboard, setShowChatDashboard] = useState(false)
  const [roomInfo, setRoomInfo] = useState({
    name: "",
    room: "",
  })

  const notification = new Audio(music)

  const join_chat = () => {
    if (roomInfo?.name !== "" && roomInfo?.room !== "") {
      setShowChatDashboard(true)
      socket.emit('join_room', roomInfo)
      notification.play();
    }
  }

  return (
    <>{!showChatDashboard && (
      <div className="join-room-container">
        <div className="join_room">
          <img src={logo} alt="" className='logo-img'/>
          <h1>Join Chat</h1>
          <input type="text" placeholder='Enter your name' onChange={(e) => setRoomInfo({ ...roomInfo, name: e.target.value })} />
          <input type="text" placeholder='Enter Room Id' onChange={(e) => setRoomInfo({ ...roomInfo, room: e.target.value })} />
          <button onClick={join_chat}>Join</button>
        </div>
      </div>
    )
    }
      {showChatDashboard && (
        <Chat socket={socket} roomInfo={roomInfo} setRoomInfo={setRoomInfo}/>
      )}
    </>
  )
}

export default App