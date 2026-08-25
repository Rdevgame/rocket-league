const PhysicsEngine = require('../physics/PhysicsEngine');
const Ball = require('../entities/Ball');
const Car = require('../entities/Car');
const Arena = require('../entities/Arena');
const Vector3D = require('../math/Vector3D');
const { v4: uuidv4 } = require('uuid');

/**
 * Game - Main game loop and state management
 */
class Game {
  constructor(io) {
    this.io = io;
    this.physicsEngine = new PhysicsEngine();
    this.arena = new Arena();
    this.ball = new Ball();
    this.players = {};
    this.cars = {};
    this.score = { team0: 0, team1: 0 };
    this.gameTime = 0;
    this.maxGameTime = 300; // 5 minutes
    this.isRunning = false;
    this.deltaTime = 1 / 60; // 60 FPS
    
    // Add ball to physics engine
    this.physicsEngine.addBody(this.ball);
    
    // Start game loop
    this.startGameLoop();
  }

  /**
   * Add player to game
   */
  addPlayer(socketId, playerData) {
    const team = Object.keys(this.players).length % 2; // Simple team assignment
    const startPos = team === 0 ? new Vector3D(-50, 1, 0) : new Vector3D(50, 1, 0);
    
    const car = new Car(socketId, team, startPos);
    this.cars[socketId] = car;
    this.players[socketId] = {
      id: socketId,
      name: playerData.name || `Player ${Object.keys(this.players).length}`,
      team: team,
      goals: 0,
      saves: 0,
      assists: 0
    };
    
    this.physicsEngine.addBody(car);
    console.log(`✅ Player ${this.players[socketId].name} joined (Team ${team})`);
  }

  /**
   * Remove player from game
   */
  removePlayer(socketId) {
    if (this.cars[socketId]) {
      this.physicsEngine.removeBody(this.cars[socketId]);
      delete this.cars[socketId];
    }
    if (this.players[socketId]) {
      console.log(`❌ Player ${this.players[socketId].name} left`);
      delete this.players[socketId];
    }
  }

  /**
   * Handle player input
   */
  handlePlayerInput(socketId, inputData) {
    const car = this.cars[socketId];
    if (!car) return;
    
    car.input = {
      throttle: inputData.throttle || 0,
      steer: inputData.steer || 0,
      boost: inputData.boost || false,
      jump: inputData.jump || false,
      handbrake: inputData.handbrake || false
    };
    
    if (inputData.jump && car.isGrounded) {
      car.jump();
    }
  }

  /**
   * Main game loop
   */
  startGameLoop() {
    const tickRate = 60; // Hz
    const tickDuration = 1000 / tickRate;
    
    setInterval(() => {
      this.update();
      this.broadcast();
    }, tickDuration);
  }

  /**
   * Update game state
   */
  update() {
    if (!this.isRunning && Object.keys(this.players).length >= 1) {
      this.isRunning = true;
    }
    
    if (!this.isRunning) return;
    
    // Update game time
    this.gameTime += this.deltaTime;
    
    // Update car physics
    for (let socketId in this.cars) {
      const car = this.cars[socketId];
      car.updateMotion(this.deltaTime);
    }
    
    // Update physics engine
    this.physicsEngine.update();
    
    // Check ground collision for cars
    this.checkGroundCollisions();
    
    // Check goals
    this.checkGoals();
    
    // Check arena bounds
    this.checkArenaBounds();
  }

  /**
   * Check if cars are grounded
   */
  checkGroundCollisions() {
    for (let socketId in this.cars) {
      const car = this.cars[socketId];
      // Simple ground collision
      if (car.position.y <= 0.5) {
        car.position.y = 0.5;
        car.velocity.y = 0;
        car.isGrounded = true;
        car.canDoubleJump = true;
      } else if (car.position.y > 0.5) {
        car.isGrounded = false;
      }
    }
  }

  /**
   * Check for goals
   */
  checkGoals() {
    for (let i = 0; i < this.arena.goals.length; i++) {
      const enemyTeam = i;
      if (this.arena.isInGoal(this.ball.position, 1 - i)) {
        this.score[`team${i}`]++;
        console.log(`🎯 GOAL! Team ${i} scores! (${this.score[`team${i}`]})`);
        this.resetGame();
      }
    }
  }

  /**
   * Check arena bounds and apply corrections
   */
  checkArenaBounds() {
    if (!this.arena.isInBounds(this.ball.position)) {
      this.ball.reset();
    }
  }

  /**
   * Reset game after goal
   */
  resetGame() {
    this.ball.reset();
    for (let socketId in this.cars) {
      this.cars[socketId].reset();
    }
  }

  /**
   * Get current game state
   */
  getGameState() {
    return {
      ball: this.ball.getState(),
      cars: Object.values(this.cars).map(car => car.getState()),
      score: this.score,
      gameTime: this.gameTime,
      players: this.players
    };
  }

  /**
   * Broadcast game state to all players
   */
  broadcast() {
    const gameState = this.getGameState();
    this.io.emit('game-update', gameState);
  }
}

module.exports = Game;
