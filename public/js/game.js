/**
 * 3D Game Client - Three.js Renderer
 */
class RocketLeagueGame {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.socket = null;
    
    this.gameState = {
      ball: { position: { x: 0, y: 0.2, z: 0 } },
      cars: [],
      score: { team0: 0, team1: 0 },
      gameTime: 0
    };
    
    this.meshes = {
      ball: null,
      cars: {},
      arena: null
    };
    
    this.playerInputs = {
      throttle: 0,
      steer: 0,
      boost: false,
      jump: false,
      handbrake: false
    };
    
    this.init();
  }

  /**
   * Initialize game
   */
  async init() {
    // Setup Three.js
    this.setupScene();
    this.setupLights();
    this.createArena();
    this.createBall();
    this.setupControls();
    this.connectSocket();
    this.animate();
  }

  /**
   * Setup Three.js scene
   */
  setupScene() {
    const canvas = document.getElementById('canvas');
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 500, 1000);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 30, 60);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Setup lighting
   */
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.far = 500;
    this.scene.add(directionalLight);
    
    // Point light (goal glow)
    const blueGoalLight = new THREE.PointLight(0x00d4ff, 0.5);
    blueGoalLight.position.set(0, 10, -52);
    this.scene.add(blueGoalLight);
    
    const orangeGoalLight = new THREE.PointLight(0xff6600, 0.5);
    orangeGoalLight.position.set(0, 10, 52);
    this.scene.add(orangeGoalLight);
  }

  /**
   * Create arena
   */
  createArena() {
    // Field dimensions
    const width = 68;
    const length = 104;
    const height = 100;
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(width, length);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a4d2e,
      roughness: 0.7,
      metalness: 0.3
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Side walls (left and right)
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
    
    // Goal zones
    const goalMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      roughness: 0.5,
      metalness: 0.5,
      emissive: 0x0066aa
    });
    
    const blueGoal = new THREE.Mesh(
      new THREE.BoxGeometry(17.5, 6.25, 7.5),
      goalMaterial
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
    
    this.meshes.arena = { ground, leftWall, rightWall, blueGoal, orangeGoal, ceiling };
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
   * Create or update car mesh
   */
  createCar(carState) {
    if (this.meshes.cars[carState.id]) return; // Already exists
    
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
    
    this.meshes.cars[carState.id] = car;
  }

  /**
   * Update car positions
   */
  updateCars(carsState) {
    for (let carState of carsState) {
      if (!this.meshes.cars[carState.id]) {
        this.createCar(carState);
      }
      
      const mesh = this.meshes.cars[carState.id];
      mesh.position.set(carState.position.x, carState.position.y, carState.position.z);
      mesh.quaternion.set(carState.rotation.x, carState.rotation.y, carState.rotation.z, carState.rotation.w);
    }
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
    
    // Input loop
    setInterval(() => {
      // Throttle
      if (keys['arrowup'] || keys['w']) {
        this.playerInputs.throttle = Math.min(1, this.playerInputs.throttle + 0.1);
      } else if (keys['arrowdown'] || keys['s']) {
        this.playerInputs.throttle = Math.max(-1, this.playerInputs.throttle - 0.1);
      } else {
        this.playerInputs.throttle *= 0.9;
      }
      
      // Steering
      if (keys['arrowleft'] || keys['a']) {
        this.playerInputs.steer = Math.min(1, this.playerInputs.steer + 0.1);
      } else if (keys['arrowright'] || keys['d']) {
        this.playerInputs.steer = Math.max(-1, this.playerInputs.steer - 0.1);
      } else {
        this.playerInputs.steer *= 0.9;
      }
      
      // Boost
      this.playerInputs.boost = keys['shift'];
      
      // Handbrake
      this.playerInputs.handbrake = keys['control'];
      
      // Send to server
      if (this.socket) {
        this.socket.emit('player-input', this.playerInputs);
      }
    }, 16); // ~60 FPS
  }

  /**
   * Connect to server via Socket.IO
   */
  connectSocket() {
    this.socket = io();
    
    this.socket.on('connect', () => {
      console.log('🔗 Connected to server');
      this.socket.emit('join-game', { name: `Player_${Date.now()}` });
      document.getElementById('loading').style.display = 'none';
    });
    
    this.socket.on('game-state', (state) => {
      this.gameState = state;
    });
    
    this.socket.on('game-update', (state) => {
      this.gameState = state;
      
      // Update ball
      this.meshes.ball.position.set(state.ball.position.x, state.ball.position.y, state.ball.position.z);
      
      // Update cars
      this.updateCars(state.cars);
      
      // Update HUD
      this.updateHUD(state);
    });
    
    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });
  }

  /**
   * Update HUD display
   */
  updateHUD(state) {
    document.getElementById('blueScore').textContent = state.score.team0;
    document.getElementById('orangeScore').textContent = state.score.team1;
    
    const minutes = Math.floor(state.gameTime / 60);
    const seconds = Math.floor(state.gameTime % 60);
    document.getElementById('timeDisplay').textContent = 
      `${5 - minutes}:${(59 - seconds).toString().padStart(2, '0')}`;
    
    // Find player's car
    const playerCar = state.cars.find(c => this.socket.id === c.id);
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
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Simple camera follow
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

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
  new RocketLeagueGame();
});
