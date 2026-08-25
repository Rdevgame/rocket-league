const Vector3D = require('../math/Vector3D');

/**
 * ParticleSystem - Visual effects for goals, boosts, and collisions
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 10000;
  }

  /**
   * Emit particles from a position
   */
  emit(position, velocity, color, count = 50, lifetime = 1) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * Math.PI / 4;
      const speed = Math.random() * 200 + 100;

      const particleVel = new Vector3D(
        Math.sin(angle) * Math.cos(spread) * speed,
        Math.sin(spread) * speed + 200,
        Math.cos(angle) * Math.cos(spread) * speed
      );

      this.particles.push({
        position: position.clone(),
        velocity: particleVel.add(velocity.multiply(0.5)),
        color: color,
        lifetime: lifetime,
        maxLifetime: lifetime,
        size: Math.random() * 0.5 + 0.2
      });
    }
  }

  /**
   * Emit boost trail particles
   */
  emitBoostTrail(position, velocity, team) {
    const color = team === 0 ? 0x00d4ff : 0xff6600;
    this.emit(position, velocity, color, 15, 0.5);
  }

  /**
   * Emit goal explosion
   */
  emitGoalExplosion(position, team) {
    const color = team === 0 ? 0x00d4ff : 0xff6600;
    this.emit(position, new Vector3D(0, 0, 0), color, 200, 2);
  }

  /**
   * Emit collision particles
   */
  emitCollision(position, impact) {
    this.emit(position, impact, 0xcccccc, 30, 0.8);
  }

  /**
   * Update particles
   */
  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.lifetime -= deltaTime;
      if (particle.lifetime <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Apply gravity
      particle.velocity.y -= 9.81 * deltaTime * 100;
      particle.velocity = particle.velocity.multiply(0.98); // Drag
      particle.position = particle.position.add(particle.velocity.multiply(deltaTime));
    }
  }

  /**
   * Get particles for rendering
   */
  getParticles() {
    return this.particles;
  }
}

module.exports = ParticleSystem;
