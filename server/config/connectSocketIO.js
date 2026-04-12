const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', "https://system-waste-less-ai-1.onrender.com"],
  }
});

global._io = io;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('join_message', (messageId) => {
    socket.join(`message_${messageId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});