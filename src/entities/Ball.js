const Vector3D = require('../math/Vector3D');
const Quaternion = require('../math/Quaternion');

/**
 * Ball - Rocket League ball entity
 */
class Ball {
  constructor(position = new Vector3D(0, 0, 0)) {
    this.position = position.clone();
    this.velocity = new Vector3D(0, 0, 0);
    this.acceleration = new Vector3D(0, 0, 0);
    this.radius = 0.1125; // Official ball radius in meters
    this.mass = 0.0126; // Ball mass in kg
    this.restitution = 0.6; // Bounciness
    this.angularVelocity = new Vector3D(0, 0, 0);
    this.rotation = new Quaternion();
    this.isKinematic = false;
    this.maxVelocity = 1000; // Max speed in UU/s
  }

  /**
   * Apply force to ball
   */
  applyForce(force) {
    this.acceleration = this.acceleration.add(force.multiply(1 / this.mass));
  }

  /**
   * Simulate ball spin from car hit
   */
  setSpin(hitVector, normal) {
    // Cross product creates spin
    this.angularVelocity = hitVector.cross(normal);
  }

  /**
   * Get ball state for network transmission
   */
  getState() {
    return {
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
      rotation: { x: this.rotation.x, y: this.rotation.y, z: this.rotation.z, w: this.rotation.w }
    };
  }

  /**
   * Reset ball to center
   */
  reset() {
    this.position = new Vector3D(0, 0.2, 0);
    this.velocity = new Vector3D(0, 0, 0);
    this.acceleration = new Vector3D(0, 0, 0);
    this.rotation = new Quaternion();
    this.angularVelocity = new Vector3D(0, 0, 0);
  }
}

module.exports = Ball;
