const { Server } = require('socket.io');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'https://system-waste-less-ai-1.onrender.com'],
      methods: ['GET', 'POST'],
      credentials: true
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
}

module.exports = initSocket;
