import React, { useEffect, useState, useRef } from 'react';
import music from "../public/message-tone.mp3";
// import './Chat.css';  // Use a CSS file for better separation of styles

function Chat({ socket, roomInfo }) {
    const [message, setMessage] = useState("");
    const [messageList, setmessageList] = useState([]);
    const notification = new Audio(music);

    const send_message = async () => {
        if (message !== "") {
            const messageData = {
                id: Math.random(),
                room: roomInfo?.room,
                author: roomInfo?.name,
                message: message,
                time: new Date(Date.now()).getHours() % 24 + ":" + new Date(Date.now()).getMinutes(),
            };
            await socket.emit('send_message', messageData);
            setmessageList((list) => [...list, messageData]);
            notification.play();
            setMessage('');
        }
    };

    useEffect(() => {
        const handleReceiveMsg = (data) => {
            setmessageList((list) => [...list, data]);
            notification.play()
        };

        socket.on('receive_message', handleReceiveMsg);

        return () => {
            socket.off("receive_message", handleReceiveMsg);
        };
    }, [socket]);

    const containRef = useRef(null);
    useEffect(() => {
        containRef.current.scrollTop = containRef.current.scrollHeight;
    }, [messageList]);

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>Welcome, {roomInfo?.name}</h1>
                <p className='room_name'>Room Id: {roomInfo?.room}</p>
            </div>
            <div className="chat-box">
                <div className="message-list" ref={containRef}>
                    {messageList.map((data) => (
                        <div className={`message-content ${roomInfo?.name === data?.author ? "you" : "other"}`} key={data?.id}>
                            <div className="message-bubble">
                                <p className='user-message'>{data?.message}</p>
                            </div>
                            <div className="message-details">
                                <p className="author">{data?.author}</p>
                                <p className="time">{data?.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="chat-input-container">
                    <input
                        type="text"
                        placeholder='Type your message here...'
                        className="chat-input"
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => { e.key === 'Enter' && send_message(); }}
                        value={message}
                    />
                    <button className="send-button" onClick={send_message}>
                        &#9658;
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
