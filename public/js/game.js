/**
 * Enhanced 3D Game Client with all features
 */
class RocketLeagueGame {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.socket = null;
    this.gamepadController = null;
    this.inputSmoother = null;
    this.particleSystem = null;
    this.replaySystem = null;
    
    this.gameState = {
      ball: { position: { x: 0, y: 0.2, z: 0 } },
      cars: [],
      score: { team0: 0, team1: 0 },
      gameTime: 0
    };
    
    this.meshes = {
      ball: null,
      cars: {},
      particles: [],
      arena: null,
      trails: {}
    };
    
    this.playerInputs = {
      throttle: 0,
      steer: 0,
      boost: false,
      jump: false,
      handbrake: false
    };
    
    this.stats = {
      goals: 0,
      saves: 0,
      assists: 0,
      boost_usage: 0
    };
    
    this.init();
  }

  /**
   * Initialize game
   */
  async init() {
    this.setupScene();
    this.setupLights();
    this.createArena();
    this.createBall();
    this.setupControls();
    this.gamepadController = new GamepadController();
    this.inputSmoother = new InputSmoother(0.15);
    this.connectSocket();
    this.animate();
  }

  /**
   * Setup Three.js scene
   */
  setupScene() {
    const canvas = document.getElementById('canvas');
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 500, 1000);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 30, 60);
    this.camera.lookAt(0, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Setup lighting
   */
  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    this.scene.add(directionalLight);
    
    const blueGoalLight = new THREE.PointLight(0x00d4ff, 0.7);
    blueGoalLight.position.set(0, 10, -52);
    this.scene.add(blueGoalLight);
    
    const orangeGoalLight = new THREE.PointLight(0xff6600, 0.7);
    orangeGoalLight.position.set(0, 10, 52);
    this.scene.add(orangeGoalLight);
  }

  /**
   * Create arena
   */
  createArena() {
    const width = 68;
    const length = 104;
    const height = 100;
    
    // Ground with grid pattern
    const groundGeometry = new THREE.PlaneGeometry(width, length);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a4d2e';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#2a6d4e';
    ctx.lineWidth = 2;
    for (let i = 0; i < 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.repeat.set(4, 4);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    const groundMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.3
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(2, height, length),
      wallMaterial
    );
    leftWall.position.set(-width / 2, height / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    this.scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(2, height, length),
      wallMaterial
    );
    rightWall.position.set(width / 2, height / 2, 0);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    this.scene.add(rightWall);
    
    // Goal zones with glow
    const blueGoalMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      roughness: 0.5,
      metalness: 0.5,
      emissive: 0x0066aa
    });
    
    const blueGoal = new THREE.Mesh(
      new THREE.BoxGeometry(17.5, 6.25, 7.5),
      blueGoalMaterial
    );
    blueGoal.position.set(0, 3, -52);
    this.scene.add(blueGoal);
    
    const orangeGoalMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.5,
      metalness: 0.5,
      emissive: 0xcc4400
    });
    
    const orangeGoal = new THREE.Mesh(
      new THREE.BoxGeometry(17.5, 6.25, 7.5),
      orangeGoalMaterial
    );
    orangeGoal.position.set(0, 3, 52);
    this.scene.add(orangeGoal);
    
    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(width, length),
      groundMaterial
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    this.scene.add(ceiling);
  }

  /**
   * Create ball
   */
  createBall() {
    const ballGeometry = new THREE.SphereGeometry(0.1125, 32, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.8,
      emissive: 0x444444
    });
    
    this.meshes.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.meshes.ball.castShadow = true;
    this.meshes.ball.receiveShadow = true;
    this.scene.add(this.meshes.ball);
  }

  /**
   * Create car
   */
  createCar(carState) {
    if (this.meshes.cars[carState.id]) return;
    
    const carGeometry = new THREE.BoxGeometry(2, 1.3, 4.5);
    const teamColor = carState.team === 0 ? 0x00d4ff : 0xff6600;
    const carMaterial = new THREE.MeshStandardMaterial({
      color: teamColor,
      roughness: 0.5,
      metalness: 0.7
    });
    
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.castShadow = true;
    car.receiveShadow = true;
    this.scene.add(car);
    
    // Create boost trail emitter
    this.meshes.trails[carState.id] = { particles: [] };
    this.meshes.cars[carState.id] = car;
  }

  /**
   * Update cars
   */
  updateCars(carsState) {
    for (let carState of carsState) {
      if (!this.meshes.cars[carState.id]) {
        this.createCar(carState);
      }
      
      const mesh = this.meshes.cars[carState.id];
      mesh.position.set(carState.position.x, carState.position.y, carState.position.z);
      mesh.quaternion.set(carState.rotation.x, carState.rotation.y, carState.rotation.z, carState.rotation.w);
      
      // Emit boost particles if boosting
      if (carState.boost < 100 && this.socket.id === carState.id) {
        this.addBoostTrail(carState);
      }
    }
  }

  /**
   * Add boost trail
   */
  addBoostTrail(carState) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.6 })
    );
    particle.position.set(carState.position.x, carState.position.y - 0.5, carState.position.z);
    particle.velocity = new THREE.Vector3(0, -1, 0);
    particle.lifetime = 0.5;
    particle.maxLifetime = 0.5;
    this.scene.add(particle);
    this.meshes.particles.push(particle);
  }

  /**
   * Setup keyboard controls
   */
  setupControls() {
    const keys = {};
    
    window.addEventListener('keydown', (e) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === ' ') {
        this.playerInputs.jump = true;
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      keys[e.key.toLowerCase()] = false;
      if (e.key === ' ') {
        this.playerInputs.jump = false;
        e.preventDefault();
      }
    });
    
    // Input update loop
    setInterval(() => {
      let input = {
        throttle: 0,
        steer: 0,
        boost: false,
        jump: false,
        handbrake: false
      };
      
      // Keyboard input
      if (keys['arrowup'] || keys['w']) input.throttle = 1;
      if (keys['arrowdown'] || keys['s']) input.throttle = -1;
      if (keys['arrowleft'] || keys['a']) input.steer = 1;
      if (keys['arrowright'] || keys['d']) input.steer = -1;
      if (keys['shift']) input.boost = true;
      if (keys['control']) input.handbrake = true;
      
      // Gamepad input
      const gamepadInput = this.gamepadController?.getInput();
      if (gamepadInput) {
        input.throttle = gamepadInput.throttle || input.throttle;
        input.steer = gamepadInput.steer || input.steer;
        input.boost = gamepadInput.boost || input.boost;
        input.jump = gamepadInput.jump || input.jump;
        input.handbrake = gamepadInput.handbrake || input.handbrake;
      }
      
      // Smooth input
      input = this.inputSmoother.smoothInput(input);
      
      if (this.socket) {
        this.socket.emit('player-input', input);
      }
    }, 16);
  }

  /**
   * Connect to server
   */
  connectSocket() {
    this.socket = io();
    
    this.socket.on('connect', () => {
      console.log('🔗 Connected to server');
      this.socket.emit('join-game', { name: `Player_${Date.now()}` });
      document.getElementById('loading').style.display = 'none';
    });
    
    this.socket.on('game-update', (state) => {
      this.gameState = state;
      this.meshes.ball.position.set(state.ball.position.x, state.ball.position.y, state.ball.position.z);
      this.updateCars(state.cars);
      this.updateHUD(state);
      this.updateParticles();
    });
    
    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });
  }

  /**
   * Update HUD
   */
  updateHUD(state) {
    document.getElementById('blueScore').textContent = state.score.team0;
    document.getElementById('orangeScore').textContent = state.score.team1;
    
    const minutes = Math.floor(state.gameTime / 60);
    const seconds = Math.floor(state.gameTime % 60);
    document.getElementById('timeDisplay').textContent = 
      `${(5 - minutes)}:${(59 - seconds).toString().padStart(2, '0')}`;
    
    const playerCar = state.cars.find(c => this.socket && this.socket.id === c.id);
    if (playerCar) {
      const boost = Math.round(playerCar.boost);
      document.getElementById('boostPercent').textContent = boost;
      document.getElementById('boostFill').style.width = boost + '%';
      
      const speed = Math.round(
        Math.sqrt(playerCar.velocity.x ** 2 + playerCar.velocity.y ** 2 + playerCar.velocity.z ** 2)
      );
      document.getElementById('speed').textContent = speed;
      document.getElementById('height').textContent = playerCar.position.y.toFixed(1);
    }
  }

  /**
   * Update particles
   */
  updateParticles() {
    for (let i = this.meshes.particles.length - 1; i >= 0; i--) {
      const particle = this.meshes.particles[i];
      particle.lifetime -= 1 / 60;
      
      if (particle.lifetime <= 0) {
        this.scene.remove(particle);
        this.meshes.particles.splice(i, 1);
      } else {
        particle.position.add(particle.velocity);
        particle.material.opacity = particle.lifetime / particle.maxLifetime;
      }
    }
  }

  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const playerCar = this.gameState.cars.find(c => this.socket && this.socket.id === c.id);
    if (playerCar) {
      const targetPos = new THREE.Vector3(
        playerCar.position.x,
        playerCar.position.y + 15,
        playerCar.position.z + 25
      );
      this.camera.position.lerp(targetPos, 0.1);
      this.camera.lookAt(playerCar.position.x, playerCar.position.y + 2, playerCar.position.z);
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new RocketLeagueGame();
});
