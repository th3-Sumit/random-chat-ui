import React, { useEffect, useState, useRef } from 'react'
import music from "../public/message-tone.mp3"
function Chat({ socket, roomInfo }) {
    const [message, setMessage] = useState("")
    const [messageList, setmessageList] = useState([]);
    const notification = new Audio(music)

    console.log(messageList)
    const send_message = async () => {

        if (message !== "") {
            const messageData = {
                id: Math.random(),
                room: roomInfo?.room,
                author: roomInfo?.name,
                message: message,
                time: new Date(Date.now()).getHours() % 24 + ":" + new Date(Date.now()).getMinutes(),
            }
            await socket.emit('send_message', messageData);
            setmessageList((list) => [...list, messageData]);
            notification.play();
            setMessage('')
        }

    }

    useEffect(() => {
        const handleReceiveMsg = (data) => {
            setmessageList((list) => [...list, data])
        }

        socket.on('receive_message', handleReceiveMsg)

        return () => {
            socket.off("receive_message", handleReceiveMsg)
        }
    }, [socket])

    const containRef = useRef(null)
    useEffect(() => {
        containRef.current.scrollTop = containRef.current.scrollHeight
    }, [messageList])
    return (
        <>
            <div className="chat_container">
                <h1>Welcome {roomInfo?.name}</h1>
                <div className="chat_box">
                    <div className="auto-scrolling-dev"
                        ref={containRef}
                        style={{ height: "450px", overflowY: "auto", border: "2px solid yello" }}
                    >
                        {messageList.map((data) => (
                            <div className='message_content' key={data?.id} id={roomInfo?.name === data?.author ? "you" : "other"}>
                                <div>
                                    <div className="msg" id={roomInfo?.name === data?.author ? "y" : "b"}>
                                        <p className='user-message'>{data?.message}</p>
                                    </div>
                                    <div className="msg_details">
                                        <p>{data?.author}</p>
                                        <p>{data?.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>



                    <div className="chat_body">
                        <input type="text"
                            placeholder='Type your message here...'
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => { e.key === 'Enter' && send_message() }}
                            value={message}
                        />
                        <button onClick={send_message}>&#9658;</button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Chat