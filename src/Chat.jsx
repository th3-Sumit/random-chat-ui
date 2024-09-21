import React, { useEffect, useState, useRef } from 'react';
import music from "../public/message-tone.mp3";

function Chat({ socket, roomInfo, setRoomInfo }) {
    const [message, setMessage] = useState("");
    const [messageList, setmessageList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null); // For file preview
    const [connectedUser, setConnectedUser] = useState(0)
    const notification = new Audio(music);
    const fileInputRef = useRef(null);

    async function convertFileToBase64(file) {
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
      
          reader.onloadend = () => {
            resolve(reader.result);
          };
      
          reader.onerror = () => {
            reject(new Error('Failed to convert file to Base64'));
          };
      
          reader.readAsDataURL(file);
        });
      }

    const send_message = async () => {
        if ((message !== "" && roomInfo?.name !== "") || (selectedFile && roomInfo?.name !== '')) {
            const messageData = {
                id: Math.random(),
                room: roomInfo?.room,
                author: roomInfo?.name,
                message: message,
                time: new Date(Date.now()).getHours() % 24 + ":" + new Date(Date.now()).getMinutes(),
                file: selectedFile ? await convertFileToBase64(selectedFile) : null,
            };

            await socket.emit('send_message', messageData);
            setmessageList((list) => [...list, messageData]);
            notification.play();
            setMessage('');
            setSelectedFile(null);
            setFilePreview(null); // Clear preview after sending
        }
    };

    const handle_file_send = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);

            // Preview the selected file (image, video)
            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const handleReceiveMsg = (data) => {
            setmessageList((list) => [...list, data]);
            notification.play();
        };

        socket.on('receive_message', handleReceiveMsg);

        socket.on('room_user_count', (data) => {
            setConnectedUser(data)
        })

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
                <h1>Welcome, 
                    <input type="text" value={roomInfo?.name} onChange={(e) => setRoomInfo({...roomInfo, name: e.target.value})}/>
                    </h1>
                <p className='room_name'>Room Id: {roomInfo?.room}</p>
                <span>Connected user: {connectedUser}</span>
            </div>
            <div className="chat-box">
                <div className="message-list" ref={containRef}>
                    {messageList.map((data) => (
                        <div className={`message-content ${roomInfo?.name === data?.author ? "you" : "other"}`} key={data?.id}>
                            <div className="message-bubble">
                                {data?.file && (
                                    <img src={data?.file} alt="" style={{width: "200px"}}/>
                                )}
                                <p className='user-message'>{data?.message}</p>
                                {console.log(data?.file, "++++===")}
                            </div>
                            <div className="message-details">
                                <p className="author">{data?.author}</p>
                                <p className="time">{data?.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {filePreview && (
                    
                        <div className="file-preview">
                            <span className="close-preview" onClick={() => setFilePreview(null)}>X</span>
                            <img src={filePreview} alt="Preview" />
                            {/* Handle image, video, and other file types */}
                            <p>File selected: {selectedFile?.name}</p>
                        </div>

                    )}
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
                        {/* <i class="fa-brands fa-telegram"></i> */}
                    </button>
                    <button className="send-button" style={{ marginLeft: "10px", fontSize: "30px" }} onClick={handle_file_send}>
                        +
                    </button>
                    <button className="send-button" onClick = {() => alert("Authentication required to see profile.")} style={{ marginLeft: "10px", fontSize: "30px" }}>
                    🙍‍♂️
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    
                </div>
            </div>
        </div>
    );
}

export default Chat;
