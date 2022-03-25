import { useEffect, useState, useRef } from 'react';
import {
    initSocket,
    disconnectSocket,
    subscribeToMessages,
    sendMessage,
    joinRoom
} from './sioService';

import './App.css'

const SENDER = {
    id: "123",
    name: "John Doe",
};

function App() {
    const MAIN_CHAT_ROOM = "main";

    const [token, setToken] = useState('');
    const [messages, setMessages] = useState([]);
    const [room, setRoom] = useState(MAIN_CHAT_ROOM)

    const tokenInputRef = useRef('');
    const roomInputRef = useRef('');
    const inputRef = useRef('');

    useEffect(() => {
        // Init socket
        initSocket(token);

        subscribeToMessages((err, data) => {
            console.log(data);
            setMessages((prev) => [...prev, data]);
        });

        // Cleanup when user disconnects
        return () => {
            disconnectSocket();
        }
    }, [token]);

    const submitToken = (e) => {
        e.preventDefault();
        const tokenValue = tokenInputRef.current.value;
        setToken(tokenValue);
    };

    const submitRoom = (e) => {
        // TO-DO add support for joining rooms
        e.preventDefault();
        const roomValue = roomInputRef.current.value;
        setRoom(roomValue);
        joinRoom(roomValue, (cb) => {console.log(cb)})
    };

    const submitMessage = (e) => {
        e.preventDefault();
        const message = inputRef.current.value;

        sendMessage({ message, roomName: room }, (cb) => {
            // callback is acknowledgement from server
            console.log(cb);
            setMessages((prev) => [
                ...prev,
                {
                    message,
                    ...SENDER,
                },
            ]);
            // clear the input after the message is sent
            inputRef.current.value = "";
        });
    };

    return (
        <div className="App">
            <p>Current room: {room}</p>
            <form onSubmit={submitToken}>
                <input type="text" placeholder="Enter token" ref={tokenInputRef} />
                <button type="submit">Submit</button>
            </form>
            <form onSubmit={submitRoom}>
                <input type="text" placeholder="Enter room" ref={roomInputRef} />
                <button type="submit">Submit</button>
            </form>
            <div className="box">
                <div className="messages">
                    {messages.map((user, k) => (
                        <div key={k}>
                            {user.name}: {user.message}
                        </div>
                    ))}
                </div>
                <form className="input-div" onSubmit={submitMessage}>
                    <input type="text" placeholder="Type in text" ref={inputRef} />
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
    )
}

export default App;