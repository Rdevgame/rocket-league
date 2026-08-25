const Vector3D = require('../math/Vector3D');

/**
 * Arena - Game arena with boundaries and collision
 */
class Arena {
  constructor() {
    // Field dimensions (meters)
    this.width = 68; // 200 UU
    this.length = 104; // 200 UU in length
    this.height = 100;
    
    // Goal dimensions
    this.goalWidth = 17.5; // 50 UU
    this.goalDepth = 7.5; // 10 UU
    this.goalHeight = 6.25; // 17.5 UU
    
    // Boost pads
    this.boostPads = this.generateBoostPads();
    
    // Walls and boundaries
    this.walls = this.generateWalls();
    
    // Goals
    this.goals = [
      { team: 0, position: new Vector3D(0, 0, -52), normal: new Vector3D(0, 0, 1) }, // Blue goal
      { team: 1, position: new Vector3D(0, 0, 52), normal: new Vector3D(0, 0, -1) }  // Orange goal
    ];
  }

  /**
   * Generate boost pad locations
   */
  generateBoostPads() {
    return [
      // Corner boost pads
      { position: new Vector3D(-27.5, 0, -46.5), amount: 100, respawnTime: 10 },
      { position: new Vector3D(27.5, 0, -46.5), amount: 100, respawnTime: 10 },
      { position: new Vector3D(-27.5, 0, 46.5), amount: 100, respawnTime: 10 },
      { position: new Vector3D(27.5, 0, 46.5), amount: 100, respawnTime: 10 },
      // Mid-field pads
      { position: new Vector3D(-34, 0, 0), amount: 25, respawnTime: 5 },
      { position: new Vector3D(34, 0, 0), amount: 25, respawnTime: 5 },
      { position: new Vector3D(0, 0, -34), amount: 25, respawnTime: 5 },
      { position: new Vector3D(0, 0, 34), amount: 25, respawnTime: 5 }
    ];
  }

  /**
   * Generate arena walls
   */
  generateWalls() {
    return [
      // Side walls
      { position: new Vector3D(-34, 0, 0), normal: new Vector3D(1, 0, 0), width: 104, height: 100 },
      { position: new Vector3D(34, 0, 0), normal: new Vector3D(-1, 0, 0), width: 104, height: 100 },
      // End walls
      { position: new Vector3D(0, 0, -52), normal: new Vector3D(0, 0, 1), width: 68, height: 100 },
      { position: new Vector3D(0, 0, 52), normal: new Vector3D(0, 0, -1), width: 68, height: 100 },
      // Ceiling
      { position: new Vector3D(0, 100, 0), normal: new Vector3D(0, -1, 0), width: 68, height: 104 }
    ];
  }

  /**
   * Check if position is in goal box
   */
  isInGoal(position, teamGoal) {
    const goal = this.goals[teamGoal];
    const dx = Math.abs(position.x - goal.position.x);
    const dy = position.y;
    const dz = Math.abs(position.z - goal.position.z);
    
    return dx <= this.goalWidth / 2 && 
           dy <= this.goalHeight && 
           dz <= this.goalDepth;
  }

  /**
   * Check if position is in bounds
   */
  isInBounds(position) {
    return Math.abs(position.x) <= this.width / 2 &&
           position.y >= 0 && position.y <= this.height &&
           Math.abs(position.z) <= this.length / 2;
  }

  /**
   * Clamp position to arena bounds
   */
  clampToBounds(position) {
    const clamped = position.clone();
    clamped.x = Math.max(-this.width / 2, Math.min(this.width / 2, clamped.x));
    clamped.y = Math.max(0, Math.min(this.height, clamped.y));
    clamped.z = Math.max(-this.length / 2, Math.min(this.length / 2, clamped.z));
    return clamped;
  }
}

module.exports = Arena;
