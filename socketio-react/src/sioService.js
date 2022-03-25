import { io } from 'socket.io-client';

let socket;

export const initSocket = (token) => {
    socket = io(process.env.REACT_APP_SOCKET_ENDPOINT, {
        auth: {
            token,
        },
    });
    console.log(`Connecting socket...`);
}

export const disconnectSocket = () => {
    console.log('Disconnecting socket...');
    if (socket) socket.disconnect();
}

// Handle message receive event
export const subscribeToMessages = (cb) => {
    if (!socket) return (true);
    socket.on('message', msg => {
        console.log('Room event received!');
        return cb(null, msg);
    });
}

export const sendMessage = ({ message, roomName }, cb) => {
    if (socket) socket.emit('message', { message, roomName }, cb);
}

export const joinRoom = (roomName, cb) => {
    if (socket) socket.emit('join', roomName, cb )
}