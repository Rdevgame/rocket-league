const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const Game = require('./core/Game');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// HTTP Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Rocket League Server running on http://localhost:${PORT}`);
});

// Socket.IO Setup
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Game Instance
const gameInstance = new Game(io);

// Socket Connection Handler
io.on('connection', (socket) => {
  console.log(`✅ Player connected: ${socket.id}`);

  // Player joins game
  socket.on('join-game', (playerData) => {
    gameInstance.addPlayer(socket.id, playerData);
    socket.emit('game-state', gameInstance.getGameState());
  });

  // Player input
  socket.on('player-input', (inputData) => {
    gameInstance.handlePlayerInput(socket.id, inputData);
  });

  // Player leaves
  socket.on('disconnect', () => {
    console.log(`❌ Player disconnected: ${socket.id}`);
    gameInstance.removePlayer(socket.id);
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

console.log('🎮 Rocket League Game Server initialized');
