/**
 * GamepadController - Gamepad/Controller input support
 */
class GamepadController {
  constructor() {
    this.gamepads = {};
    this.deadzone = 0.15;
    this.init();
  }

  init() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('🎮 Gamepad connected:', e.gamepad.id);
      this.gamepads[e.gamepad.index] = e.gamepad;
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('❌ Gamepad disconnected:', e.gamepad.id);
      delete this.gamepads[e.gamepad.index];
    });
  }

  /**
   * Get input from active gamepad
   */
  getInput() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    
    if (!gamepads[0]) return null;

    const gamepad = gamepads[0];
    if (!gamepad.connected) return null;

    const input = {
      throttle: 0,
      steer: 0,
      boost: false,
      jump: false,
      handbrake: false
    };

    // Left stick - throttle/reverse (Y-axis)
    const leftY = gamepad.axes[1] || 0;
    input.throttle = Math.abs(leftY) > this.deadzone ? -leftY : 0;

    // Right stick - steer (X-axis)
    const rightX = gamepad.axes[2] || 0;
    input.steer = Math.abs(rightX) > this.deadzone ? rightX : 0;

    // Buttons
    input.jump = gamepad.buttons[0]?.pressed || false;      // A button
    input.boost = gamepad.buttons[5]?.pressed || false;      // RB button
    input.handbrake = gamepad.buttons[4]?.pressed || false;  // LB button

    // Triggers for throttle/reverse
    const leftTrigger = gamepad.buttons[6]?.value || 0;
    const rightTrigger = gamepad.buttons[7]?.value || 0;
    
    if (rightTrigger > 0.1) input.throttle = rightTrigger;
    if (leftTrigger > 0.1) input.throttle = -leftTrigger;

    return input;
  }
}

module.exports = GamepadController;
