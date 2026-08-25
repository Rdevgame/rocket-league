const Vector3D = require('../math/Vector3D');
const Quaternion = require('../math/Quaternion');

/**
 * Car - Player-controlled vehicle
 */
class Car {
  constructor(id, team, position = new Vector3D(-50, 1, 0)) {
    this.id = id;
    this.team = team; // 0 or 1
    this.position = position.clone();
    this.velocity = new Vector3D(0, 0, 0);
    this.acceleration = new Vector3D(0, 0, 0);
    this.rotation = new Quaternion(); // Vehicle orientation
    this.angularVelocity = new Vector3D(0, 0, 0); // Rotation speed
    
    // Car properties
    this.radius = 0.45; // Collision radius
    this.mass = 1; // kg
    this.maxSpeed = 2300; // UU/s
    this.maxAcceleration = 1050; // UU/s²
    this.maxAirSpeed = 2300;
    
    // Boost system
    this.boost = 100;
    this.maxBoost = 100;
    this.boostConsumption = 33.3; // Per second at full boost
    this.boostAcceleration = 991.666;
    
    // Jump and flip mechanics
    this.isGrounded = true;
    this.canDoubleJump = true;
    this.jumpTimer = 0;
    this.maxJumpDuration = 0.2; // seconds
    this.jumpPower = 291.667; // UU/s velocity
    this.jumpRotation = 1; // rotation applied per jump
    
    // Input state
    this.input = {
      throttle: 0, // -1 to 1
      steer: 0,    // -1 to 1
      boost: false,
      jump: false,
      handbrake: false
    };
    
    this.isKinematic = false;
  }

  /**
   * Apply car acceleration based on input
   */
  updateMotion(deltaTime) {
    // Calculate forward direction from rotation
    const forward = this.getForwardVector();
    const right = this.getRightVector();

    // Acceleration from throttle
    let accel = this.maxAcceleration * this.input.throttle;
    
    if (this.input.boost && this.boost > 0) {
      accel += this.boostAcceleration;
      this.boost = Math.max(0, this.boost - this.boostConsumption * deltaTime);
    }

    // Apply acceleration
    const acceleration = forward.multiply(accel);
    this.velocity = this.velocity.add(acceleration.multiply(deltaTime));

    // Apply steering
    if (this.isGrounded) {
      this.angularVelocity.z = this.input.steer * 5.25; // rad/s
    } else {
      // Air roll
      this.angularVelocity.z = this.input.steer * 5.25;
    }

    // Speed limit
    const speed = this.velocity.magnitude();
    if (speed > this.maxSpeed) {
      this.velocity = this.velocity.normalize().multiply(this.maxSpeed);
    }
  }

  /**
   * Handle jump input
   */
  jump() {
    if (this.isGrounded) {
      this.isGrounded = false;
      this.canDoubleJump = true;
      this.velocity.y += this.jumpPower;
      this.jumpTimer = this.maxJumpDuration;
    } else if (this.canDoubleJump) {
      this.canDoubleJump = false;
      this.velocity.y = this.jumpPower;
      
      // Flip rotation based on input
      const forward = this.getForwardVector();
      this.velocity = this.velocity.add(forward.multiply(500));
    }
  }

  /**
   * Get forward vector from rotation
   */
  getForwardVector() {
    const forward = new Vector3D(0, 0, 1);
    const rotated = this.rotation.rotateVector(forward);
    return new Vector3D(rotated.x, rotated.y, rotated.z).normalize();
  }

  /**
   * Get right vector from rotation
   */
  getRightVector() {
    const right = new Vector3D(1, 0, 0);
    const rotated = this.rotation.rotateVector(right);
    return new Vector3D(rotated.x, rotated.y, rotated.z).normalize();
  }

  /**
   * Get car state for network transmission
   */
  getState() {
    return {
      id: this.id,
      team: this.team,
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
      rotation: { x: this.rotation.x, y: this.rotation.y, z: this.rotation.z, w: this.rotation.w },
      boost: this.boost,
      isGrounded: this.isGrounded
    };
  }

  /**
   * Reset car to starting position
   */
  reset() {
    this.velocity = new Vector3D(0, 0, 0);
    this.acceleration = new Vector3D(0, 0, 0);
    this.rotation = new Quaternion();
    this.angularVelocity = new Vector3D(0, 0, 0);
    this.boost = 100;
    this.isGrounded = true;
    this.canDoubleJump = true;
  }
}

module.exports = Car;
