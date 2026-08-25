/**
 * InputSmoother - Smooth out analog stick jitter
 */
class InputSmoother {
  constructor(smoothFactor = 0.2) {
    this.smoothFactor = smoothFactor;
    this.lastInput = {
      throttle: 0,
      steer: 0,
      boost: false,
      jump: false,
      handbrake: false
    };
  }

  /**
   * Smooth analog input
   */
  smoothInput(input) {
    const smoothed = { ...input };

    // Smooth analog values
    smoothed.throttle = this.lerp(
      this.lastInput.throttle,
      input.throttle,
      this.smoothFactor
    );

    smoothed.steer = this.lerp(
      this.lastInput.steer,
      input.steer,
      this.smoothFactor
    );

    // Apply deadzone
    if (Math.abs(smoothed.throttle) < 0.05) smoothed.throttle = 0;
    if (Math.abs(smoothed.steer) < 0.05) smoothed.steer = 0;

    this.lastInput = smoothed;
    return smoothed;
  }

  /**
   * Linear interpolation
   */
  lerp(a, b, t) {
    return a + (b - a) * t;
  }
}

module.exports = InputSmoother;
