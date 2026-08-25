/**
 * Quaternion - 3D Rotation representation
 */
class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  multiply(q) {
    return new Quaternion(
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
    );
  }

  rotateVector(v) {
    const qv = new Quaternion(v.x, v.y, v.z, 0);
    const q_inv = new Quaternion(-this.x, -this.y, -this.z, this.w);
    const rotated = this.multiply(qv).multiply(q_inv);
    return { x: rotated.x, y: rotated.y, z: rotated.z };
  }

  static fromAxisAngle(axis, angle) {
    const half = angle / 2;
    const s = Math.sin(half);
    return new Quaternion(
      axis.x * s,
      axis.y * s,
      axis.z * s,
      Math.cos(half)
    );
  }
}

module.exports = Quaternion;
