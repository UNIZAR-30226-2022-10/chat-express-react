const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:3001']
    }
});

const jwt = require('jsonwebtoken');

// jwt secret
const JWT_SECRET = 'dadada';


app.get('/', (req, res) => {
    res.send('<h1>Hey Socket.io</h1>');
});

io.use(async (socket, next) => {
    // fetch token from handshake auth sent by FE
    const token = socket.handshake.auth.token;
    console.log(token)
    try {
        // verify jwt token and get user data
        const user = await jwt.verify(token, JWT_SECRET);
        console.log('user', user);
        // save the user data into socket object, to be used further
        socket.user = user;
        next();
    } catch (e) {
        // if token is invalid, close connection
        console.log('error: ', e.message);
        return next(new Error(e.message));
    }
});

io.on("connection", (socket) => {
    // join common room
    socket.join('main');
    console.log("a user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("my message", (msg) => {
        console.log("message: " + msg);
        io.emit("my broadcast", `server: ${msg}`);
    });
  
    socket.on("join", (roomName) => {
        console.log("join: " + roomName);
        socket.leave
        socket.join(roomName);

        const outgoingMessage = {
            name: "SERVER",
            id: "server",
            message: `${socket.id} has joined.`,
        };
        socket.to(roomName).emit("message", outgoingMessage);
    });
  
    socket.on("message", ({ message, roomName }, callback) => {
        // generate data to send to receivers
        const outgoingMessage = {
            name: socket.user.name,
            id: socket.user.id,
            message,
        };

        console.log("room: ", roomName)
        // send socket to all in room except sender
        socket.to(roomName).emit("message", outgoingMessage);
        callback({
            status: "ok"
        });
    });
});


http.listen(3000, () => {
    console.log('listening on *:3000');
});