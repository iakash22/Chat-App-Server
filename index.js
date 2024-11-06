const express = require('express');
require('dotenv').config({ path: './.env' });
const cookieParser = require('cookie-parser');
const { Server } = require("socket.io")
const { createServer } = require("http")
const uuid = require('uuid');
// const { createUser } = require('./seeders/user');
const cors = require("cors");
const cloudinaryConnect = require('./configs/cloudinary');
const dbConnect = require('./configs/dbConnet');
const { socketAuthenticator } = require('./middlewares/auth');
const userRoute = require('./routers/user');
const chatRoute = require('./routers/chat');
const adminRoute = require('./routers/admin');
const { errorMiddleware } = require('./middlewares/error');
const { NEW_MESSAGE, NEW_MESSAGE_ALERT, START_TYPING, STOP_TYPING, REFETCH_CHATS, CHAT_JOINED, CHAT_LEAVED, ONLINE_USER } = require('./constants/events');
const { userSocketIDs, onlineUsers } = require('./constants/userMap');
const { getSocketIDs } = require('./lib/helper');
const Message = require('./models/message');
const { corsOptions } = require('./configs/corsOptions');

const PORT = process.env.PORT || 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: corsOptions });

app.set('io', io);

cloudinaryConnect();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(cors(corsOptions));

app.use('/api/v1/user', userRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/admin', adminRoute);

io.use((socket, next) => {
    cookieParser()(
        socket.request,
        socket.request.res,
        async (err) => await socketAuthenticator(err, socket, next)
    )
})

io.on("connection", (socket) => {
    const user = socket.user;
    // console.log(user);

    userSocketIDs.set(user._id.toString(), socket.id);

    console.log("User Connected!", socket.id);
    // console.log(userSocketIDs);

    socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
        const messageForRealTime = {
            _id: uuid.v1(),
            sender: {
                _id: user._id,
                name: user.name,
            },
            content: message,
            chatId: chatId,
            createdAt: new Date().toISOString(),
        }

        const messageForDB = {
            content: message,
            sender: user._id,
            chat: chatId,
        }

        const usersSocket = getSocketIDs(members);
        io.to(usersSocket).emit(NEW_MESSAGE, { chatId, message: messageForRealTime });
        io.to(usersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

        // console.log(NEW_MESSAGE, messageForRealTime);
        try {
            await Message.create(messageForDB);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on(START_TYPING, ({ members, chatId }) => {
        console.log("typing", members, chatId);
        
        const memberSockets = getSocketIDs(members);
        socket.to(memberSockets).emit(START_TYPING, { chatId });
    });

    socket.on(STOP_TYPING, ({ members, chatId }) => {
        console.log("Stop typing", members, chatId);
        
        const memberSockets = getSocketIDs(members);
        socket.to(memberSockets).emit(STOP_TYPING, { chatId });
    });

    socket.on(CHAT_JOINED, ({ members, userId }) => {
        onlineUsers.add(userId.toString());
        // console.log("Chat Joined", userId);
        const memberSockets = getSocketIDs(members);
        io.to(memberSockets).emit(ONLINE_USER, Array.from(onlineUsers));        
    });

    socket.on(CHAT_LEAVED, ({ members, userId }) => {
        onlineUsers.delete(userId.toString());
        // console.log("Chat LEAVED", userId);

        const memberSockets = getSocketIDs(members);
        io.to(memberSockets).emit(ONLINE_USER, Array.from(onlineUsers)); 
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected!");
        userSocketIDs.delete(user._id.toString());
        onlineUsers.delete(user._id.toString());
        socket.broadcast.emit(ONLINE_USER, Array.from(onlineUsers));
    });
})

app.use(errorMiddleware);

server.listen(PORT, () => {
    console.log(`Server Listen on port ${PORT}`);
})

app.get('/', (req, res) => {
    res.send('Hello Word');
})
dbConnect();
// createUser(10);