/**
 * AIPlayer - Computer-controlled bot with realistic behavior
 */
class AIPlayer {
  constructor(id, team, difficulty = 'medium') {
    this.id = id;
    this.team = team;
    this.difficulty = difficulty;
    this.targetPosition = null;
    this.strategy = 'defense';
    this.reactionTime = this.getReactionTime();
    this.lastDecisionTime = 0;
    this.decisionInterval = 0.5; // seconds
  }

  /**
   * Get reaction time based on difficulty
   */
  getReactionTime() {
    const times = {
      easy: 0.8,
      medium: 0.3,
      hard: 0.1
    };
    return times[this.difficulty] || 0.3;
  }

  /**
   * Calculate AI input
   */
  calculateInput(gameState, carState) {
    const input = {
      throttle: 0,
      steer: 0,
      boost: false,
      jump: false,
      handbrake: false
    };

    const ball = gameState.ball;
    const car = carState;

    // Determine strategy based on ball position
    if (ball.position.z * (this.team === 0 ? 1 : -1) > 0) {
      this.strategy = 'attack';
    } else {
      this.strategy = 'defense';
    }

    // Get target position
    this.targetPosition = this.getTargetPosition(gameState, carState);

    // Calculate direction to target
    const toTarget = {
      x: this.targetPosition.x - car.position.x,
      y: this.targetPosition.y - car.position.y,
      z: this.targetPosition.z - car.position.z
    };

    const distance = Math.sqrt(toTarget.x ** 2 + toTarget.y ** 2 + toTarget.z ** 2);

    if (distance > 1) {
      // Calculate steering
      const carForward = { x: 0, z: 1 }; // Simplified
      const angle = Math.atan2(toTarget.x, toTarget.z);
      
      input.steer = Math.sin(angle);
      input.throttle = distance > 100 ? 1 : 0.5;

      // Use boost when far from target and on ground
      if (distance > 200 && carState.isGrounded) {
        input.boost = true;
      }
    }

    // Jump if needed
    if (Math.abs(toTarget.y) > 2 && carState.isGrounded) {
      input.jump = true;
    }

    return input;
  }

  /**
   * Get target position based on strategy
   */
  getTargetPosition(gameState, carState) {
    const ball = gameState.ball;
    const teamSign = this.team === 0 ? -1 : 1;

    if (this.strategy === 'attack') {
      // Chase ball towards opponent goal
      return {
        x: ball.position.x * 0.8,
        y: ball.position.y,
        z: ball.position.z + (50 * teamSign)
      };
    } else {
      // Defend goal
      return {
        x: ball.position.x * 0.5,
        y: 0,
        z: -(35 * teamSign)
      };
    }
  }
}

module.exports = AIPlayer;
