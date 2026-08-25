const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const Game = require('./core/Game');
const MatchmakingSystem = require('./matchmaking/MatchmakingSystem');
const ReplaySystem = require('./game/ReplaySystem');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// HTTP Server
const server = app.listen(PORT, () => {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`🚀 Rocket League Server running on http://localhost:${PORT}`);
  console.log(`${'═'.repeat(50)}\n`);
});

// Socket.IO Setup
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Game Systems
const gameInstance = new Game(io);
const matchmakingSystem = new MatchmakingSystem();
const replaySystem = new ReplaySystem();

// Start replay recording
replaySystem.startRecording();

// Socket Connection Handler
io.on('connection', (socket) => {
  console.log(`✅ Player connected: ${socket.id}`);

  // Player joins game
  socket.on('join-game', (playerData) => {
    gameInstance.addPlayer(socket.id, playerData);
    socket.emit('game-state', gameInstance.getGameState());
    io.emit('player-joined', { name: playerData.name });
  });

  // Player input
  socket.on('player-input', (inputData) => {
    gameInstance.handlePlayerInput(socket.id, inputData);
  });

  // Request replay save
  socket.on('save-replay', (filename) => {
    replaySystem.saveReplay(filename);
  });

  // Player leaves
  socket.on('disconnect', () => {
    console.log(`❌ Player disconnected: ${socket.id}`);
    gameInstance.removePlayer(socket.id);
    io.emit('player-left');
  });
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    players: Object.keys(gameInstance.players).length,
    timestamp: new Date() 
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    score: gameInstance.score,
    gameTime: gameInstance.gameTime,
    players: gameInstance.players
  });
});

app.get('/api/queue', (req, res) => {
  res.json(matchmakingSystem.getQueueStatus());
});

console.log('🎮 Rocket League Game Server initialized');
console.log('📝 Replay system: RECORDING');
console.log('🔗 WebSocket ready for connections\n');
