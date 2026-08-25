const Vector3D = require('../math/Vector3D');

/**
 * Advanced Physics - Realistic ball prediction and spin mechanics
 */
class AdvancedPhysics {
  constructor() {
    this.maxFramePrediction = 360; // 6 seconds at 60 FPS
    this.predictionFrames = [];
  }

  /**
   * Predict ball trajectory
   */
  predictBallTrajectory(ball, frames = 120) {
    const predictions = [];
    let predictedBall = {
      position: ball.position.clone(),
      velocity: ball.velocity.clone(),
      angularVelocity: ball.angularVelocity.clone()
    };

    const gravity = new Vector3D(0, -9.81, 0);
    const airResistance = 0.99;
    const deltaTime = 1 / 60;

    for (let i = 0; i < frames; i++) {
      // Apply physics
      predictedBall.velocity = predictedBall.velocity.add(gravity.multiply(deltaTime));
      predictedBall.velocity = predictedBall.velocity.multiply(airResistance);
      predictedBall.position = predictedBall.position.add(predictedBall.velocity.multiply(deltaTime));

      predictions.push({
        frame: i,
        position: predictedBall.position.clone(),
        velocity: predictedBall.velocity.clone()
      });

      // Stop if ball is out of bounds
      if (predictedBall.position.y < -10) break;
    }

    return predictions;
  }

  /**
   * Calculate perfect hit direction
   */
  calculatePerfectHit(ball, targetPosition, carVelocity) {
    const ballToTarget = targetPosition.subtract(ball.position);
    const requiredVelocity = ballToTarget.normalize().multiply(2300);
    const hitForce = requiredVelocity.subtract(ball.velocity);
    return hitForce;
  }

  /**
   * Calculate ball spin from car properties
   */
  calculateBallSpin(carVelocity, hitNormal, ballNormal) {
    // Backspin, topspin, and curvespin based on hit angle
    const tangent = carVelocity.subtract(
      hitNormal.multiply(carVelocity.dot(hitNormal))
    );
    return tangent.cross(hitNormal).multiply(0.5);
  }

  /**
   * Calculate optimal aerial path
   */
  calculateAerialPath(carPos, carVel, targetPos) {
    const toTarget = targetPos.subtract(carPos);
    const distance = toTarget.magnitude();
    
    // Calculate time needed to reach target
    const maxAirSpeed = 2300;
    const timeToReach = distance / maxAirSpeed;
    
    // Calculate required velocity
    const requiredVel = toTarget.normalize().multiply(maxAirSpeed);
    
    return {
      targetVelocity: requiredVel,
      timeToReach: timeToReach,
      distance: distance
    };
  }
}

module.exports = AdvancedPhysics;
