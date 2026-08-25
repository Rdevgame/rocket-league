class RocketLeagueSideswipe {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 600;

    this.gameState = {
      ball: { x: 400, y: 100, vx: 0, vy: 0, radius: 8 },
      cars: [
        { x: 200, y: 300, vx: 0, vy: 0, width: 30, height: 15, team: 0, jumping: false, jumpPower: 0 },
        { x: 600, y: 300, vx: 0, vy: 0, width: 30, height: 15, team: 1, jumping: false, jumpPower: 0 }
      ],
      score: { team0: 0, team1: 0 },
      gravity: 0.5
    };

    this.keys = {};
    this.setupControls();
    this.gameLoop();
  }

  setupControls() {
    window.addEventListener('keydown', (e) => { this.keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
  }

  update() {
    const car = this.gameState.cars[0];
    const ball = this.gameState.ball;

    // Car movement
    if (this.keys['ArrowUp'] || this.keys['w']) car.vy = -8;
    if (this.keys['ArrowDown'] || this.keys['s']) car.vy = 8;
    if (this.keys[' '] && !car.jumping) {
      car.jumping = true;
      car.jumpPower = -15;
    }

    // Update car position
    car.y += car.vy;
    if (car.jumping) {
      car.y += car.jumpPower;
      car.jumpPower += this.gameState.gravity;
      if (car.y + car.height / 2 >= this.canvas.height - 20) {
        car.y = this.canvas.height - 20 - car.height / 2;
        car.jumping = false;
        car.jumpPower = 0;
      }
    } else {
      car.y = Math.min(car.y, this.canvas.height - 20 - car.height / 2);
    }
    car.y = Math.max(car.y, car.height / 2);

    // Ball physics
    ball.vy += this.gameState.gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball bounce off ground
    if (ball.y + ball.radius >= this.canvas.height - 20) {
      ball.y = this.canvas.height - 20 - ball.radius;
      ball.vy *= -0.85;
    }
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.vy *= -0.85;
    }

    // Ball bounce off walls
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= this.canvas.width) {
      ball.vx *= -0.9;
      ball.x = Math.max(ball.radius, Math.min(this.canvas.width - ball.radius, ball.x));
    }

    // Car-ball collision
    this.gameState.cars.forEach(car => {
      const dx = ball.x - car.x;
      const dy = ball.y - car.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = ball.radius + car.width / 2;

      if (distance < minDist) {
        const angle = Math.atan2(dy, dx);
        const speed = 15;
        ball.vx = Math.cos(angle) * speed;
        ball.vy = Math.sin(angle) * speed - 5;
        ball.x = car.x + Math.cos(angle) * minDist;
        ball.y = car.y + Math.sin(angle) * minDist;
      }
    });

    // Goal detection
    if (ball.y > this.canvas.height - 20) {
      if (ball.x < this.canvas.width / 2) {
        this.gameState.score.team1++;
      } else {
        this.gameState.score.team0++;
      }
      this.resetBall();
    }

    // AI for second car
    const aiCar = this.gameState.cars[1];
    if (Math.abs(ball.y - aiCar.y) > 30) {
      aiCar.vy = ball.y > aiCar.y ? 6 : -6;
    } else {
      aiCar.vy *= 0.9;
    }

    aiCar.y += aiCar.vy;
    aiCar.y = Math.max(aiCar.y, aiCar.height / 2);
    aiCar.y = Math.min(aiCar.y, this.canvas.height - 20 - aiCar.height / 2);
  }

  resetBall() {
    this.gameState.ball.x = this.canvas.width / 2;
    this.gameState.ball.y = 100;
    this.gameState.ball.vx = 0;
    this.gameState.ball.vy = 0;
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1f3a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid background
    this.ctx.strokeStyle = '#2a3f5f';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.canvas.width; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }

    // Ground
    this.ctx.fillStyle = '#0f5f3f';
    this.ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);

    // Center line
    this.ctx.strokeStyle = '#00d4ff';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw cars
    this.gameState.cars.forEach((car, i) => {
      this.ctx.fillStyle = car.team === 0 ? '#00d4ff' : '#ff6600';
      this.ctx.fillRect(car.x - car.width / 2, car.y - car.height / 2, car.width, car.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(car.x - car.width / 2 + 5, car.y - car.height / 2 + 3, 5, 5);
    });

    // Draw ball
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(this.gameState.ball.x, this.gameState.ball.y, this.gameState.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Update score display
    document.getElementById('blueScore').textContent = this.gameState.score.team0;
    document.getElementById('orangeScore').textContent = this.gameState.score.team1;
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new RocketLeagueSideswipe();
});
