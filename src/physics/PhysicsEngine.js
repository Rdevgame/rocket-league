const Vector3D = require('../math/Vector3D');

/**
 * Physics Engine - Handles 3D rigid body physics simulation
 */
class PhysicsEngine {
  constructor() {
    this.gravity = new Vector3D(0, -9.81, 0);
    this.bodies = [];
    this.deltaTime = 1 / 60; // 60 FPS
    this.airResistance = 0.99; // Air drag coefficient
  }

  addBody(body) {
    this.bodies.push(body);
  }

  removeBody(body) {
    const index = this.bodies.indexOf(body);
    if (index > -1) {
      this.bodies.splice(index, 1);
    }
  }

  /**
   * Update physics simulation
   */
  update() {
    // Apply forces and update positions
    for (let body of this.bodies) {
      if (body.isKinematic) continue;

      // Apply gravity
      body.velocity = body.velocity.add(this.gravity.multiply(this.deltaTime));

      // Apply air resistance
      body.velocity = body.velocity.multiply(this.airResistance);

      // Update position
      body.position = body.position.add(body.velocity.multiply(this.deltaTime));

      // Update rotation
      if (body.angularVelocity && body.rotation) {
        body.rotation.x += body.angularVelocity.x * this.deltaTime;
        body.rotation.y += body.angularVelocity.y * this.deltaTime;
        body.rotation.z += body.angularVelocity.z * this.deltaTime;
      }
    }

    // Collision detection and response
    this.resolveCollisions();
  }

  /**
   * Detect and resolve collisions between bodies
   */
  resolveCollisions() {
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const body1 = this.bodies[i];
        const body2 = this.bodies[j];

        if (this.checkCollision(body1, body2)) {
          this.handleCollision(body1, body2);
        }
      }
    }
  }

  /**
   * Sphere-to-Sphere collision detection
   */
  checkCollision(body1, body2) {
    const distance = body1.position.distance(body2.position);
    const minDistance = (body1.radius || 0) + (body2.radius || 0);
    return distance < minDistance;
  }

  /**
   * Handle collision response
   */
  handleCollision(body1, body2) {
    // Normal vector
    const normal = body2.position.subtract(body1.position).normalize();

    // Relative velocity
    const relativeVelocity = body1.velocity.subtract(body2.velocity);

    // Velocity along normal
    const velocityAlongNormal = relativeVelocity.dot(normal);

    // Don't process if velocities are separating
    if (velocityAlongNormal > 0) return;

    // Coefficient of restitution (bounciness)
    const e = Math.max(body1.restitution || 0.5, body2.restitution || 0.5);

    // Impulse scalar
    const mass1 = body1.mass || 1;
    const mass2 = body2.mass || 1;
    const impulseScalar = -(1 + e) * velocityAlongNormal / (1 / mass1 + 1 / mass2);

    // Apply impulse
    const impulse = normal.multiply(impulseScalar);
    if (!body1.isKinematic) body1.velocity = body1.velocity.add(impulse.multiply(1 / mass1));
    if (!body2.isKinematic) body2.velocity = body2.velocity.add(impulse.multiply(-1 / mass2));

    // Separate bodies to prevent overlap
    const overlap = (body1.radius || 0) + (body2.radius || 0) - body1.position.distance(body2.position);
    if (overlap > 0) {
      const separationVector = normal.multiply(overlap / 2 + 0.01);
      if (!body1.isKinematic) body1.position = body1.position.subtract(separationVector);
      if (!body2.isKinematic) body2.position = body2.position.add(separationVector);
    }
  }
}

module.exports = PhysicsEngine;
