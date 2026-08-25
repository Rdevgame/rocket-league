const Vector3D = require('../math/Vector3D');

/**
 * Replay system - Record and playback matches
 */
class ReplaySystem {
  constructor(maxFrames = 18000) { // 5 minutes at 60 FPS
    this.frames = [];
    this.maxFrames = maxFrames;
    this.isRecording = false;
    this.playbackIndex = 0;
    this.playbackSpeed = 1;
  }

  /**
   * Start recording
   */
  startRecording() {
    this.frames = [];
    this.isRecording = true;
    console.log('📹 Replay recording started');
  }

  /**
   * Record frame
   */
  recordFrame(gameState) {
    if (!this.isRecording) return;
    
    if (this.frames.length >= this.maxFrames) {
      this.frames.shift(); // Remove oldest frame
    }

    this.frames.push({
      timestamp: Date.now(),
      ball: JSON.parse(JSON.stringify(gameState.ball)),
      cars: JSON.parse(JSON.stringify(gameState.cars)),
      score: JSON.parse(JSON.stringify(gameState.score))
    });
  }

  /**
   * Stop recording
   */
  stopRecording() {
    this.isRecording = false;
    console.log(`📹 Replay recording stopped (${this.frames.length} frames)`);
  }

  /**
   * Start playback
   */
  startPlayback() {
    this.playbackIndex = 0;
    console.log('▶️ Replay playback started');
  }

  /**
   * Get next frame
   */
  getNextFrame() {
    if (this.playbackIndex >= this.frames.length) {
      return null;
    }
    return this.frames[this.playbackIndex++];
  }

  /**
   * Save replay to file
   */
  saveReplay(filename) {
    const data = JSON.stringify({
      frames: this.frames,
      duration: this.frames.length / 60,
      savedAt: new Date().toISOString()
    });
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.replay';
    a.click();
    console.log('💾 Replay saved:', filename);
  }

  /**
   * Load replay from file
   */
  async loadReplay(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          this.frames = data.frames;
          console.log('📂 Replay loaded:', data.duration + ' seconds');
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }

  /**
   * Get replay duration
   */
  getDuration() {
    return this.frames.length / 60; // seconds
  }
}

module.exports = ReplaySystem;
