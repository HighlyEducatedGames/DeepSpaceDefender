const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const backgroundMusicVolumeSlider = document.getElementById('backgroundMusicVolume');
const soundEffectsVolumeSlider = document.getElementById('soundEffectsVolume');
const BOMB_RADIUS = 300;
const BOMB_DAMAGE = 150;
const boostBarWidth = 200;
const boostBarHeight = 20;
const boostBarX = canvas.width / 2 - boostBarWidth / 2 - 250;
const boostBarY = 20;
const chargeBarWidth = 200;
const chargeBarHeight = 20;
const chargeBarX = canvas.width / 2 - chargeBarWidth / 2 + 350;
const chargeBarY = 20;
const shieldBarWidth = 200;
const shieldBarHeight = 20;
const shieldBarX = chargeBarX; // Align horizontally with the blaster bar
const shieldBarY = chargeBarY + chargeBarHeight + 5; // Positioned below the blaster bar
const TANK_HEALTH = 30;
const ENEMY_HEALTH = 10;
const PROJECTILE_DAMAGE = 10;
const PARTIALLY_CHARGED_PROJECTILE_DAMAGE = 50;
const FULLY_CHARGED_PROJECTILE_DAMAGE = 150;
const SPLIT_PROJECTILE_DAMAGE = 25;
const PLAYER_MAX_HEALTH = 30;
const MAX_ENEMIES = 20; // Maximum number of enemies allowed
const MAX_POWER_UPS = 3;
const VERTICAL_MARGIN = 50;
const MAX_REGULAR_ENEMIES = 6; // Adjust as needed
const MAX_ENEMY_TANKS = 3; // Adjust as needed
const MAX_STEALTH_ENEMIES = 4; // Adjust as needed
const ASTEROID_DAMAGE = 10;
const ASTEROID_SPEED = 200;
const ASTEROID_SIZES = [
    { width: 75, height: 75 },
    { width: 50, height: 50 },
    { width: 30, height: 30 }
];
const asteroidSpawnInterval = Math.random() * 1500 + 1000; // Interval between 0.5 and 2 seconds


let lastTime = 0;
let enemyRespawnTimeouts = [];
let nextLifeScore = 1500;
let isBoosting = false;
let boostEndTime = 0;
let boostCooldownEndTime = 0;
let isInvincible = false;
let bossHitByBomb = false;
let biomechHitByBomb = false;
let cyberDragonHitByBomb = false;
let temporalSerpentHitByBomb = false;
let temporalSerpentLastBombDamageTime = 0; // Add this property
let keys = {};
let player;
let coins = [];
let enemies = [];
let projectiles = [];
let powerUp = null;
let powerUpActive = false;
let powerUpExpirationTime = 0;
let powerUpSpawnTime = 0;
let powerUpDirection = 1;
let powerUpZigZagSpeed = 100;
let powerUpSpawned = false;
let score = 0;
let level = 1;
let gameOver = false;
let spacebarPressedTime = 0;
let isCharging = false;
let chargingSoundTimeout;
let levelStartTime = 0;
let levelDuration = 30000; // Example duration, adjust as needed
let countdown = 0;
let bombs = 0;
let bombPowerUp = null;
let bombSpawnTime = 0;
let bombActive = false;
let bombFlashTime = 0;
let bombSpawned = false;
let bomb = {
    x: 0,
    y: 0,
    radius: BOMB_RADIUS,
    active: false
};
let isMenuOpen = true;
let boss = null;
let homingMissilePowerUp = null;
let homingMissileSpawnTime = 0;
let homingMissileSpawned = false;
let homingMissiles = [];
let shieldPowerUp = null;
let shieldPowerUpSpawnTime = 0;
let shieldPowerUpSpawned = false;
let shieldActive = false;
let shieldPowerUpExpirationTime = 0;
let ally = null;
let allySpawnTime = 0;
let allyDuration = 15000; // 15 seconds
let allyInterval = 60000; // 60 seconds
let allyWarningTime = 3000; // 3 seconds before arrival
let allyRotationAngle = 0; // Initial angle for circular pattern
let allyOrbitRadius = 100; // Radius of the circular orbit
let homingMissilesInventory = 0;
let powerUpSpawnedThisLevel = false;
let bombPowerUpSpawnedThisLevel = false;
let homingMissilePowerUpSpawnedThisLevel = false;
let shieldPowerUpSpawnedThisLevel = false;
let reversePowerUp = null;
let reversePowerUpSpawnTime = 0;
let reversePowerUpSpawnedThisLevel = false;
let reversePowerUpActive = false;
let reversePowerUpExpirationTime = 0;
let boostPowerUp = null;
let boostPowerUpSpawnTime = 0;
let boostPowerUpSpawnedThisLevel = false;
let boostPowerUpActive = false;
let boostPowerUpExpirationTime = 0;
let biomechLeviathan = null;
let tractorBeam = null;
let tractorBeamCooldown = false;
let inkCloud = null;
let empBlast = {
    active: false,
    x: 0,
    y: 0,
    radius: 200,
    duration: 3000
};

let empBlastEndTime = 0;
let empBlastActive = false;
let isPlayerDisabledByEMP = false;
let asteroids = [];
let flamethrowerPowerUp = null;
let flamethrowerSpawnTime = 0;
let flamethrowerSpawnedThisLevel = false;
let flamethrowerActive = false;
let flameParticles = [];
let flamethrowerExpirationTime = 0;





// Load images
const titleScreenImage = new Image();
titleScreenImage.src = 'assets/images/title_screen.png';

const playerImage = new Image();
playerImage.src = 'assets/images/player.png';

const playerReverseImage = new Image(); // Added reverse image
playerReverseImage.src = 'assets/images/player_reverse.png';

const enemyImage = new Image();
enemyImage.src = 'assets/images/enemy.png';

const coinImage = new Image();
coinImage.src = 'assets/images/coin.png';

const powerUpImage = new Image();
powerUpImage.src = 'assets/images/powerUp.png';

const bombPowerUpImage = new Image();
bombPowerUpImage.src = 'assets/images/bombPowerUp.png';

const playerThrustImage = new Image();
playerThrustImage.src = 'assets/images/player_thrust.png';

const bossImage = new Image();
bossImage.src = 'assets/images/boss.png';

const bossProjectileImage = new Image();
bossProjectileImage.src = 'assets/images/boss_projectile.png';

const homingMissilePowerUpImage = new Image();
homingMissilePowerUpImage.src = 'assets/images/homingMissilePowerUp.png';

const homingMissileImage = new Image();
homingMissileImage.src = 'assets/images/homing_missile.png';

const shieldPowerUpImage = new Image();
shieldPowerUpImage.src = 'assets/images/shield_powerUp.png';

const allyImage = new Image();
allyImage.src = 'assets/images/ally.png';

const enemyTankImage = new Image();
enemyTankImage.src = 'assets/images/enemy_tank.png';

const stealthEnemyImage = new Image();
stealthEnemyImage.src = 'assets/images/stealth_enemy.png';

const reversePowerUpImage = new Image();
reversePowerUpImage.src = 'assets/images/reversePowerUp.png';

const boostPowerUpImage = new Image();
boostPowerUpImage.src = 'assets/images/boostPowerUp.png';

const biomechLeviathanImage = new Image();
biomechLeviathanImage.src = 'assets/images/biomech_leviathan2.png';

const cyberDragonImage = new Image();
cyberDragonImage.src = 'assets/images/cyber_dragon.png'; 

const asteroidImage = new Image();
asteroidImage.src = 'assets/images/asteroid.png';

const temporalSerpentImage = new Image();
temporalSerpentImage.src = 'assets/images/temporal_serpent.png'; // Replace with the actual path to your image

const serpentHead = new Image();
serpentHead.src = 'assets/images/serpentHead.png'; // Update with the correct path to your image

const serpentSegment = new Image();
serpentSegment.src = 'assets/images/serpentSegment.png'; // Update with the correct path to your image

const flamethrowerPowerUpImage = new Image();
flamethrowerPowerUpImage.src = 'assets/images/flamethrowerPowerUp.png';

// Load audio
const backgroundMusic = document.getElementById('backgroundMusic');
const bossMusic = document.getElementById('bossMusic');

const coinSound = document.getElementById('coinSound');
const fireSound = document.getElementById('fireSound');
const powerUpSound = document.getElementById('powerUpSound');
const collisionSound = document.getElementById('collisionSound');
const chargingSound = document.getElementById('chargingSound');
const accelerationSound = document.getElementById('accelerationSound');
const bombSound = document.getElementById('bombSound');
const boostSound = document.getElementById('boostSound');
const reverseSound = document.getElementById('reverseSound');
const homingMissileSound = document.getElementById('homingMissileSound');
const allySound = document.getElementById('allySound');
const allyOverSound = document.getElementById('allyOver');
const circularOrbitSound = document.getElementById('circularOrbitSound');
const followPlayerSound = document.getElementById('followPlayerSound');
const lifeLostSound = document.getElementById('lifeLostSound');
const tractorBeamSound = document.getElementById('tractorBeamSound');
const splatSound = document.getElementById('splatSound');
const empSound = document.getElementById('empSound'); // Add the EMP sound file
const laserChargingSound = document.getElementById('laserChargingSound');
const spiralShotSound = document.getElementById('spiralShotSound');
const teleportSound = document.getElementById('teleportSound');
const explosionSound = document.getElementById('explosionSound');
const hazardSound = document.getElementById('hazardSound');
const flameSound = document.getElementById('flameSound');
const torchSound = document.getElementById('torchSound');


const soundEffects = [coinSound, fireSound, powerUpSound, collisionSound, chargingSound, accelerationSound, bombSound, boostSound, reverseSound, homingMissileSound, allySound, allyOver, circularOrbitSound, followPlayerSound, lifeLostSound, tractorBeamSound, splatSound, empSound, laserChargingSound, spiralShotSound, teleportSound, explosionSound, hazardSound, flameSound, torchSound];

// Set initial volumes
backgroundMusic.volume = 0.5;
bossMusic.volume = 0.5;
soundEffects.forEach(sound => sound.volume = 0.5);

// gamepad functionality
let gamepadIndex = null;
let prevGamepadState = {};

function connectGamepad(e) {
    gamepadIndex = e.gamepad.index;
    prevGamepadState[gamepadIndex] = {
        buttons: [],
        axes: []
    };
}

function disconnectGamepad(e) {
    delete prevGamepadState[gamepadIndex];
    gamepadIndex = null;
}

window.addEventListener('gamepadconnected', connectGamepad);
window.addEventListener('gamepaddisconnected', disconnectGamepad);

function handleGamepadInput() {
    if (gamepadIndex === null) return;

    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (!gamepad) return;

    const buttons = gamepad.buttons.map(button => button.pressed);
    const leftTrigger = gamepad.buttons[6].value > 0.1;  // Adjusted to > 0.1 to detect any press
    const rightTrigger = gamepad.buttons[7].value > 0.1; // Adjusted to > 0.1 to detect any press
    const leftStickX = gamepad.axes[0];
    const dpadLeft = buttons[14];
    const dpadRight = buttons[15];
    const leftBumper = buttons[4];  // LB button
    const rightBumper = buttons[5]; // RB button

    // Fire button (A button)
    if (buttons[0] && !prevGamepadState[gamepadIndex].buttons[0]) {
        handleKeyDown({ key: ' ' });
    } else if (!buttons[0] && prevGamepadState[gamepadIndex].buttons[0]) {
        handleKeyUp({ key: ' ' });
    }

    // Bomb button (B button)
    if (buttons[1] && !prevGamepadState[gamepadIndex].buttons[1]) {
        handleKeyDown({ key: 'b' });
    } else if (!buttons[1] && prevGamepadState[gamepadIndex].buttons[1]) {
        handleKeyUp({ key: 'b' });
    } else if (buttons[1] && gameOver) {
        restartGame();
    }

    // Boost button (X button)
    if (buttons[2] && !prevGamepadState[gamepadIndex].buttons[2]) {
        handleKeyDown({ key: 'x' });
    } else if (!buttons[2] && prevGamepadState[gamepadIndex].buttons[2]) {
        handleKeyUp({ key: 'x' });
    }

    // Homing Missile button (Y button)
    if (buttons[3] && !prevGamepadState[gamepadIndex].buttons[3]) {
        handleKeyDown({ key: 'h' });
    } else if (!buttons[3] && prevGamepadState[gamepadIndex].buttons[3]) {
        handleKeyUp({ key: 'h' });
    }

    // Bomb button (LB button)
    if (leftBumper && !prevGamepadState[gamepadIndex].buttons[4]) {
        handleKeyDown({ key: 'b' });
    } else if (!leftBumper && prevGamepadState[gamepadIndex].buttons[4]) {
        handleKeyUp({ key: 'b' });
    }

    // Homing Missile button (RB button)
    if (rightBumper && !prevGamepadState[gamepadIndex].buttons[5]) {
        handleKeyDown({ key: 'h' });
    } else if (!rightBumper && prevGamepadState[gamepadIndex].buttons[5]) {
        handleKeyUp({ key: 'h' });
    }

    // Thrust (Right Trigger)
    if (rightTrigger) {
        if (!keys['ArrowUp']) {
            handleKeyDown({ key: 'ArrowUp' });
        }
    } else {
        if (keys['ArrowUp']) {
            handleKeyUp({ key: 'ArrowUp' });
        }
    }

    // Reverse (Left Trigger)
    if (leftTrigger) {
        if (!keys['ArrowDown']) {
            handleKeyDown({ key: 'ArrowDown' });
        }
    } else {
        if (keys['ArrowDown']) {
            handleKeyUp({ key: 'ArrowDown' });
        }
    }

    // Pause button (Start button)
    if (buttons[9] && !prevGamepadState[gamepadIndex].buttons[9]) {
        handleKeyDown({ key: 'm' });
    } else if (!buttons[9] && prevGamepadState[gamepadIndex].buttons[9]) {
        handleKeyUp({ key: 'm' });
    }

    // Refresh button (Menu button)
    if (buttons[8] && !prevGamepadState[gamepadIndex].buttons[8]) {
        location.reload(); // Refresh the browser
    }

    // Rotate left (Left Stick or D-pad left)
    if (leftStickX < -0.5 || dpadLeft) {
        handleKeyDown({ key: 'ArrowLeft' });
    } else {
        handleKeyUp({ key: 'ArrowLeft' });
    }

    // Rotate right (Left Stick or D-pad right)
    if (leftStickX > 0.5 || dpadRight) {
        handleKeyDown({ key: 'ArrowRight' });
    } else {
        handleKeyUp({ key: 'ArrowRight' });
    }

    // Save the current state for the next frame
    prevGamepadState[gamepadIndex].buttons = buttons;
    prevGamepadState[gamepadIndex].axes = [leftStickX];
}

// end of gamepad functionality
// Key Board Functionality

// Cheat codes definition
const cheatCodes = {
    invincibility: ['i', 'd', 'd', 'q', 'd'],
    bombsAndMissiles: ['i', 'd', 'f', 'a'],
    unlimitedBoost: ['i', 'd', 'b', 'o', 'o', 's', 't']
};
let currentCheatIndex = {
    invincibility: 0,
    bombsAndMissiles: 0,
    unlimitedBoost: 0 
};

let isCheatCodeActivated = false; // Track if the cheat code is activated
let isUnlimitedBoostActivated = false;

function addEventListeners() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

function removeEventListeners() {
    window.removeEventListeners('keydown', handleKeyDown);
    window.removeEventListeners('keyup', handleKeyUp);
}

function handleKeyUp(e) {
    keys[e.key] = false;

    if (e.key === ' ') {
        fireProjectile();
        isCharging = false;
        clearTimeout(chargingSoundTimeout);
        chargingSound.pause();
        chargingSound.currentTime = 0;
        flameSound.pause();
        flameSound.currentTime = 0;
    }

    if (e.key === 'ArrowUp') {
        accelerationSound.pause();
        accelerationSound.currentTime = 0;
    }

    if (e.key === 'ArrowDown') {
        reverseSound.pause();
        reverseSound.currentTime = 0;
    }
}

function handleKeyDown(e) {
    keys[e.key] = true;

    // Check for invincibility cheat code sequence
    if (e.key === cheatCodes.invincibility[currentCheatIndex.invincibility]) {
        currentCheatIndex.invincibility++;
        if (currentCheatIndex.invincibility === cheatCodes.invincibility.length) {
            isInvincible = !isInvincible;
            isCheatCodeActivated = isInvincible; // Track if cheat code is activated
            currentCheatIndex.invincibility = 0;
        }
    } else {
        currentCheatIndex.invincibility = 0;
    }

    // Check for bombs and missiles cheat code sequence
    if (e.key === cheatCodes.bombsAndMissiles[currentCheatIndex.bombsAndMissiles]) {
        currentCheatIndex.bombsAndMissiles++;
        if (currentCheatIndex.bombsAndMissiles === cheatCodes.bombsAndMissiles.length) {
            bombs += 20;
            homingMissilesInventory += 20;
            currentCheatIndex.bombsAndMissiles = 0;
        }
    } else {
        currentCheatIndex.bombsAndMissiles = 0;
    }

    // Check for unlimited boost cheat code sequence
    if (e.key === cheatCodes.unlimitedBoost[currentCheatIndex.unlimitedBoost]) {
        currentCheatIndex.unlimitedBoost++;
        if (currentCheatIndex.unlimitedBoost === cheatCodes.unlimitedBoost.length) {
            isUnlimitedBoostActivated = !isUnlimitedBoostActivated; // Toggle unlimited boost
            currentCheatIndex.unlimitedBoost = 0;
        }
    } else {
        currentCheatIndex.unlimitedBoost = 0;
    }

    if (e.key === 'm' || e.key === 'M') {
        toggleMenu();
    }

    if (backgroundMusic.paused && !gameOver && !isMenuOpen) {
        startBackgroundMusic();
    }

    if (e.key === ' ' && isMenuOpen) {
        toggleMenu();
        initializeGame();
        requestAnimationFrame(gameLoop);
    } else if (e.key === ' ' && !isMenuOpen) {
        if (!isCharging) {
            isCharging = true;
            spacebarPressedTime = performance.now();
            chargingSoundTimeout = setTimeout(() => {
                if (!flamethrowerActive && !chargingSound.playing) {
                    chargingSound.play();
                }
            }, 250);
        }
    }

    if (e.key === 'ArrowUp') {
        accelerationSound.play();
    }

    if (e.key === 'ArrowDown') {
        reverseSound.play();
    }

    if (e.key === 'b' || e.key === 'B') {
        useBomb();
    }

    if (e.key === 'x' || e.key === 'X') {
        useBoost();
    }

    if (e.key === '0') {
        level = 5;
        initLevel(level);
    }

    if (e.key === '1') {
        level = 10;
        initLevel(level);
    }

    if (e.key === '2') {
        level = 15;
        initLevel(level);
    }

    if (e.key === '3') {
        level = 20;
        initLevel(level);
    }

    if (e.key === '4') {
        level = 25;
        initLevel(level);
    }

    if (e.key === 'h' || e.key === 'H') {
        useHomingMissile();
    }
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// end input

function startBackgroundMusic() {
    backgroundMusic.play().catch(error => {
    });
}

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function startBossMusic() {
    if (!bossMusic.playing) {
        stopBackgroundMusic();  // Stop background music if playing
        bossMusic.play().catch(error => {
        });
    }
}

function stopBossMusic() {
    bossMusic.pause();
    bossMusic.currentTime = 0;
}

function manageMusic() {
    const isBossLevel = level % 5 === 0;
    if (isBossLevel && !bossMusic.playing) {
        stopBackgroundMusic();
        startBossMusic();
    } else if (!isBossLevel && !backgroundMusic.playing) {
        stopBossMusic();
        startBackgroundMusic();
    }
}

function initializeGame() {
    player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 50,
        height: 50,
        speed: 200,
        rotation: -Math.PI / 2,
        velocity: { x: 0, y: 0 },
        thrust: 0,
        deceleration: 0.98,
        maxSpeed: 300,
        lives: 3,
        lastCollisionTime: 0,
        health: PLAYER_MAX_HEALTH
    };

    coins = [];
    for (let i = 0; i < 5; i++) {
        coins.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            width: 20,
            height: 20
        });
    }

    // Clear existing timeouts
    enemyRespawnTimeouts.forEach(timeout => clearTimeout(timeout));
    enemyRespawnTimeouts = [];

    resetPowerUpTimers();

    enemies = [];
    projectiles = [];
    powerUp = null;
    powerUpActive = false;
    powerUpExpirationTime = 0;
    powerUpDirection = Math.random() < 0.5 ? 1 : -1;
    powerUpZigZagSpeed = 100;
    powerUpSpawned = false;
    score = 0;
    level = 1;
    gameOver = false;
    spacebarPressedTime = 0;
    isCharging = false;
    chargingSoundTimeout = null;
    levelDuration = 30000;
    countdown = levelDuration / 1000;
    levelStartTime = performance.now();
    nextLifeScore = 1500;
    bombs = 0;
    bombPowerUp = null;
    bombSpawned = false;
    bombActive = false;
    bombFlashTime = 0;
    boss = null;
    cyberDragon = null;
    biomechLeviathan = null;
    bossHitByBomb = false;
    homingMissiles = [];
    homingMissilePowerUp = null;
    homingMissilesInventory = 0;
    shieldPowerUp = null;
    shieldActive = false;
    shieldPowerUpExpirationTime = 0;
    allySpawnTime = performance.now();
    allyInterval = 60000;
    allyWarningTime = 3000;
    allyDuration = 15000;
    reversePowerUp = null;
    reversePowerUpSpawnTime = 0;
    reversePowerUpSpawnedThisLevel = false;
    reversePowerUpActive = false;
    reversePowerUpExpirationTime = 0;
    boostPowerUp = null;
    boostPowerUpSpawnTime = 0;
    boostPowerUpSpawnedThisLevel = false;
    boostPowerUpActive = false;
    boostPowerUpExpirationTime = 0;
    flamethrowerPowerUp = null;
    flamethrowerSpawnedThisLevel = false;
    flamethrowerActive = false;
    initLevel(level);
    stopBackgroundMusic();
    stopBossMusic();
    startBackgroundMusic();
}


function checkCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

function handleGameOver() {
    // Stop background and boss music
    stopBackgroundMusic();
    stopBossMusic();
    
    // Play game over music
    gameOverMusic.currentTime = 0; // Reset the music to start
    gameOverMusic.play().catch(error => {
        console.error("Error playing game over music:", error);
    });
}

function stopGameOverMusic() {
    const gameOverMusic = document.getElementById('gameOverMusic');
    gameOverMusic.pause();
    gameOverMusic.currentTime = 0;
}

function restartGame() {
    stopGameOverMusic();
    
    // Reset player
    player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 50,
        height: 50,
        speed: 200,
        rotation: -Math.PI / 2,
        velocity: { x: 0, y: 0 },
        thrust: 0,
        deceleration: 0.98,
        maxSpeed: 300,
        lives: 3,
        lastCollisionTime: 0,
        health: PLAYER_MAX_HEALTH
    };

    // Clear coins
    coins = [];
    for (let i = 0; i < 5; i++) {
        coins.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            width: 20,
            height: 20
        });
    }

    // Clear existing timeouts
    enemyRespawnTimeouts.forEach(timeout => clearTimeout(timeout));
    enemyRespawnTimeouts = [];

    // Reset powerup timers
    resetPowerUpTimers();

    // Clear game objects
    enemies = [];
    projectiles = [];
    powerUp = null;
    bombPowerUp = null;
    homingMissilePowerUp = null;
    shieldPowerUp = null;
    reversePowerUp = null;
    boostPowerUp = null;
    homingMissiles = [];
    asteroids = [];
    spiralProjectiles = [];

    // Reset powerup states
    powerUpActive = false;
    powerUpExpirationTime = 0;
    powerUpDirection = Math.random() < 0.5 ? 1 : -1;
    powerUpZigZagSpeed = 100;
    powerUpSpawned = false;
    bombSpawned = false;
    bombActive = false;
    bombFlashTime = 0;
    bossHitByBomb = false;
    homingMissilesInventory = 0;
    shieldActive = false;
    shieldPowerUpExpirationTime = 0;
    reversePowerUpSpawnedThisLevel = false;
    reversePowerUpActive = false;
    reversePowerUpExpirationTime = 0;
    boostPowerUpSpawnedThisLevel = false;
    boostPowerUpActive = false;
    boostPowerUpExpirationTime = 0;

    // Reset game state
    score = 0;
    level = 1;
    gameOver = false;
    spacebarPressedTime = 0;
    isCharging = false;
    chargingSoundTimeout = null;
    levelDuration = 30000;
    countdown = levelDuration / 1000;
    levelStartTime = performance.now();
    nextLifeScore = 1500;
    bombs = 0;

    // Clear bosses
    boss = null;
    cyberDragon = null;
    biomechLeviathan = null;
    temporalSerpent = null;

    // Reset ally spawn times
    allySpawnTime = performance.now();
    allyInterval = 60000;
    allyWarningTime = 3000;
    allyDuration = 15000;

    // Initialize the first level
    initLevel(level);

    // Manage music
    stopBackgroundMusic();
    stopBossMusic();
    startBackgroundMusic();
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyB' && gameOver) {
        restartGame();
    }
});

window.addEventListener("gamepadconnected", function(event) {
    requestAnimationFrame(gameLoop); // Ensure the game loop continues to check for input
});

window.addEventListener("gamepaddisconnected", function(event) {
    gamepadIndex = null;
});

document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyB' && gameOver) {
        restartGame();
    }
});

window.addEventListener("gamepadconnected", function(event) {
    requestAnimationFrame(gameLoop); // Ensure the game loop continues to check for input
});

window.addEventListener("gamepaddisconnected", function(event) {
    gamepadIndex = null;
});

let stars = [];
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2
    });
}

function getRandomPosition(width, height) {
    return {
        x: Math.random() * (canvas.width - width),
        y: Math.random() * (canvas.height - height)
    };
}

function spawnAlly() {
    let side = Math.floor(Math.random() * 4);
    let position = { x: 0, y: 0 };
    let enteringSide = '';

    switch (side) {
        case 0: // Enter from the left
            position.x = -100;
            position.y = Math.random() * canvas.height;
            enteringSide = 'left';
            break;
        case 1: // Enter from the right
            position.x = canvas.width + 100;
            position.y = Math.random() * canvas.height;
            enteringSide = 'right';
            break;
        case 2: // Enter from the top
            position.x = Math.random() * canvas.width;
            position.y = -100;
            enteringSide = 'top';
            break;
        case 3: // Enter from the bottom
            position.x = Math.random() * canvas.width;
            position.y = canvas.height + 100;
            enteringSide = 'bottom';
            break;
    }

    const patterns = ['circularOrbit', 'followPlayer']; // List of possible patterns
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)]; // Randomly select a pattern

    ally = {
        x: position.x,
        y: position.y,
        width: 50,
        height: 50,
        speed: 300, // Ally's speed
        active: true,
        rotation: 0, // Initial rotation
        enteringSide: enteringSide, // Track the side from which the ally enters
        exiting: false, // Add exiting state
        pattern: selectedPattern, // Set the selected pattern
        entering: true // Add entering state
    };

    if (selectedPattern === 'circularOrbit') {
        circularOrbitSound.currentTime = 0;
        circularOrbitSound.play();
    } else if (selectedPattern === 'followPlayer') {
        followPlayerSound.currentTime = 0;
        followPlayerSound.play();
    }
}


function spawnCyberDragon() {
    const offScreenMargin = 100;
    const side = Math.floor(Math.random() * 4);
    let position = { x: 0, y: 0 };

    switch (side) {
        case 0:
            position.x = Math.random() * canvas.width;
            position.y = -offScreenMargin - 100;
            break;
        case 1:
            position.x = Math.random() * canvas.width;
            position.y = canvas.height + offScreenMargin + 100;
            break;
        case 2:
            position.x = -offScreenMargin - 100;
            position.y = Math.random() * canvas.height;
            break;
        case 3:
            position.x = canvas.width + offScreenMargin + 100;
            position.y = Math.random() * canvas.height;
            break;
    }

    cyberDragon = {
        x: position.x,
        y: position.y,
        width: 250,
        height: 250,
        speed: 50,
        health: 3000,
        maxHealth: 3000,
        lastAttackTime: 0,
        attackInterval: 2000,
        canAttack: true,
        phase: 1,
        phaseTransitioned: [false, false, false],
        laserCharging: false,
        laserChargeTime: 0,
        laserChargeDuration: 3500,
        laserReady: false,
        alive: true,
        projectileCollisionRadius: 125, // 250 diameter / 2
        playerCollisionRadius: 47.5, // 95 diameter / 2
        lastBombDamageTime: 0, // Add this property
        spiralProjectiles: [],
        spiralAngle: 0,
        spiralSpeed: 0.1, // Adjust for desired speed of the spiral
        spiralRadius: 100, // Adjust for the size of the spiral
        spiralActive: false,
        spiralStartTime: 0,
        spiralDuration: 5000, // 5 seconds
        spiralCooldown: 4000 // 4 seconds
    };
}



function drawCyberDragonHealthBar(cyberDragon) {
    if (!cyberDragon.alive) return; // Only draw the health bar if the Cyber Dragon is alive

    const barWidth = cyberDragon.width;
    const barHeight = 10;
    const barX = cyberDragon.x - cyberDragon.width / 2;
    const barY = cyberDragon.y + cyberDragon.height / 2 + 10;
    const healthRatio = cyberDragon.health / cyberDragon.maxHealth;

    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}



function updateCyberDragon(deltaTime, timestamp) {
    if (!cyberDragon || !cyberDragon.alive) return;

    // Movement towards the player
    const angleToPlayer = Math.atan2(player.y - cyberDragon.y, player.x - cyberDragon.x);
    cyberDragon.x += Math.cos(angleToPlayer) * cyberDragon.speed * deltaTime / 1000;
    cyberDragon.y += Math.sin(angleToPlayer) * cyberDragon.speed * deltaTime / 1000;

    // Phase transitions
    if (cyberDragon.health <= cyberDragon.maxHealth * 0.75 && !cyberDragon.phaseTransitioned[0]) {
        cyberDragon.phase = 2;
        cyberDragon.phaseTransitioned[0] = true;
    } else if (cyberDragon.health <= cyberDragon.maxHealth * 0.50 && !cyberDragon.phaseTransitioned[1]) {
        cyberDragon.phase = 3;
        cyberDragon.phaseTransitioned[1] = true;
    } else if (cyberDragon.health <= cyberDragon.maxHealth * 0.25 && !cyberDragon.phaseTransitioned[2]) {
        cyberDragon.phase = 4;
        cyberDragon.phaseTransitioned[2] = true;
    }

    // Attack logic
    if (cyberDragon.canAttack && timestamp - cyberDragon.lastAttackTime > cyberDragon.attackInterval) {
        if (!cyberDragon.alive) return;
        switch (cyberDragon.phase) {
            case 1:
                chargeLaser();
                break;
            case 2:
                chargeLaser();
                spawnAsteroid();
                break;
            case 4:
                chargeLaser();
                spawnAsteroid();
                break;
        }
        cyberDragon.lastAttackTime = timestamp;
    }

    // Update laser charge
    if (cyberDragon.laserCharging) {
        updateLaserCharge(deltaTime);
    }

    // Handle spiral projectiles independently of phase checking
    if (cyberDragon.phase >= 3) {
        fireSpiralProjectiles(deltaTime, timestamp);
    }
    updateSpiralProjectiles(deltaTime);
    checkSpiralCollisions();
    drawSpiralProjectiles();
}

function drawCyberDragon() {
    if (cyberDragon && cyberDragon.alive) {
        ctx.save();
        ctx.translate(cyberDragon.x, cyberDragon.y);
        ctx.drawImage(cyberDragonImage, -cyberDragon.width / 2, -cyberDragon.height / 2, cyberDragon.width, cyberDragon.height);
        ctx.restore();
    }
}



function chargeLaser() {
    if (!cyberDragon || !cyberDragon.alive) return;

    if (!cyberDragon.laserCharging) {
        cyberDragon.laserCharging = true;
        cyberDragon.laserChargeTime = 0;
        cyberDragon.laserChargeRadius = 5;  // Reset the charge radius
        laserChargingSound.currentTime = 0;  // Reset sound to start
        laserChargingSound.play();  // Play the charging sound
    }
}

function fireLaser() {
    if (!cyberDragon || !cyberDragon.alive) return;

    if (cyberDragon.laserReady) {
        const angleToPlayer = Math.atan2(player.y - cyberDragon.y, player.x - cyberDragon.x);
        let laser = {
            x: cyberDragon.x,
            y: cyberDragon.y,
            width: 10,  // Laser width
            height: 50,  // Laser length
            directionX: Math.cos(angleToPlayer),
            directionY: Math.sin(angleToPlayer),
            speed: 1000,  // Speed of the laser
            damage: 30,  // Damage dealt by the laser
            fromDragon: true,
            isLaser: true  // Identify this as a laser
        };
        projectiles.push(laser);
        cyberDragon.laserReady = false;
    }
}

function updateLaserCharge(deltaTime) {
    if (cyberDragon && cyberDragon.laserCharging) {
        cyberDragon.laserChargeTime += deltaTime;
        cyberDragon.laserChargeRadius = 5 + (cyberDragon.laserChargeTime / cyberDragon.laserChargeDuration) * 20;  // Increase the radius over time

        if (cyberDragon.laserChargeTime >= cyberDragon.laserChargeDuration) {
            cyberDragon.laserReady = true;
            cyberDragon.laserCharging = false;
            fireLaser();
            laserChargingSound.pause();  // Stop the charging sound
            laserChargingSound.currentTime = 0;  // Reset sound to start
        }
    }
}

function drawLaser(laser) {
    ctx.save();
    ctx.translate(laser.x, laser.y);
    ctx.rotate(Math.atan2(laser.directionY, laser.directionX));
    ctx.fillStyle = 'red';
    ctx.fillRect(0, -laser.width / 2, laser.height, laser.width);
    ctx.restore();
}

function drawLaserCharge() {
    if (cyberDragon && cyberDragon.laserCharging) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(cyberDragon.x, cyberDragon.y, cyberDragon.laserChargeRadius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function spawnAsteroid() {
    if (!cyberDragon || !cyberDragon.alive) return;

    const x = Math.random() * canvas.width;
    const y = -ASTEROID_SIZES[0].height; // Start off screen at the top

    // Randomly select a size
    const size = ASTEROID_SIZES[Math.floor(Math.random() * ASTEROID_SIZES.length)];

    const asteroid = {
        x: x,
        y: y,
        width: size.width,
        height: size.height,
        speed: ASTEROID_SPEED,
        alive: true
    };
    asteroids.push(asteroid);

    // Schedule the next asteroid spawn
    asteroidSpawnTime = Math.random() * 2000 + 2000;
    setTimeout(spawnAsteroid, asteroidSpawnTime);
}
function clearAsteroids() {
    asteroids = [];
    clearTimeout(asteroidSpawnTime); // Stop any scheduled asteroid spawns
}


function updateAsteroids(deltaTime) {
    asteroids.forEach((asteroid, index) => {
        asteroid.y += asteroid.speed * deltaTime / 1000;

        // Check collision with player
        const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
        const asteroidCircle = { x: asteroid.x + asteroid.width / 2, y: asteroid.y + asteroid.height / 2, radius: asteroid.width / 2 };

        if (checkCollision(playerCircle, asteroidCircle)) {
            // Play collision sound
            const collisionSoundClone = collisionSound.cloneNode();
            collisionSoundClone.volume = collisionSound.volume;
            collisionSoundClone.play();

            if (!isInvincible && !shieldActive) {
                player.health -= ASTEROID_DAMAGE;

                if (player.health <= 0) {
                    player.lives--;
                    player.health = PLAYER_MAX_HEALTH;
                    if (player.lives <= 0) {
                        gameOver = true;
                        handleGameOver();
                    }
                }
            }
            asteroid.alive = false;
        }

        // Check collision with bomb
        if (bomb.active) {
            const bombCircle = { x: bomb.x, y: bomb.y, radius: bomb.radius };
            if (checkCollision(bombCircle, asteroidCircle)) {
                asteroid.alive = false;
            }
        }

        // Remove asteroids that go off-screen
        if (asteroid.y > canvas.height) {
            asteroid.alive = false;
        }

        // Remove dead asteroids from the array
        if (!asteroid.alive) {
            asteroids.splice(index, 1);
        }
    });
}




function drawAsteroids() {
    asteroids.forEach(asteroid => {
        if (asteroid.alive) {
            // Draw the comet tail
            const tailLength = 5; // Length of the tail
            const tailOpacity = 0.1; // Starting opacity of the tail

            for (let i = 0; i < tailLength; i++) {
                ctx.fillStyle = `rgba(173, 216, 230, ${tailOpacity * (1 - i / tailLength)})`; // Light blue color
                ctx.beginPath();
                // Draw the tail circles centered relative to the asteroid
                ctx.arc(
                    asteroid.x + asteroid.width / 2, // Center of the asteroid
                    asteroid.y + asteroid.height / 2 - i * 10, // Center vertically and add vertical offset
                    asteroid.width / 2 + i * 2, // Radius grows with each step
                    0, 2 * Math.PI
                );
                ctx.fill();
            }

            // Draw the asteroid
            ctx.drawImage(
                asteroidImage,
                asteroid.x,
                asteroid.y,
                asteroid.width,
                asteroid.height
            );
        }
    });
}


let spiralActive = false;
let spiralStartTime = 0;
let lastSpiralFireTime = 0; // Timer for controlling the rate of fire
const spiralFireInterval = 100; // Interval in milliseconds between projectiles

function fireSpiralProjectiles(deltaTime, timestamp) {
    if (!cyberDragon || !cyberDragon.alive) return;

    if (spiralActive) {
        if (timestamp - spiralStartTime > 7000) {
            spiralActive = false;
            spiralShotSound.pause(); // Stop the sound
            spiralShotSound.currentTime = 0; // Reset sound to start
            spiralStartTime = timestamp;
        } else {
            // Only fire a projectile if the interval has passed
            if (timestamp - lastSpiralFireTime > spiralFireInterval) {
                const angle = cyberDragon.spiralAngle;
                cyberDragon.spiralProjectiles.push({
                    x: cyberDragon.x,
                    y: cyberDragon.y,
                    directionX: Math.cos(angle),
                    directionY: Math.sin(angle),
                    speed: 150, // Adjust for desired speed of the projectiles
                    damage: 10, // Adjust for desired damage
                    radius: 5,
                    maxDistance: 800,
                    traveledDistance: 0
                });
                cyberDragon.spiralAngle += 0.1; // Adjust for desired spiral tightness

                // Update the last fire time
                lastSpiralFireTime = timestamp;
            }
        }
    } else {
        if (timestamp - spiralStartTime > 3000) {
            spiralActive = true;
            playSpiralShotSound(); // Play the sound
            spiralStartTime = timestamp;
        }
    }
}

function playSpiralShotSound() {
    spiralShotSound.currentTime = 0;
    spiralShotSound.play();
    setTimeout(() => {
        if (spiralActive) {
            spiralShotSound.currentTime = 0;
            spiralShotSound.play();
        }
    }, 3500); // Play the sound again after 4 seconds
}


function updateSpiralProjectiles(deltaTime) {
    if (!cyberDragon || !cyberDragon.alive) return;

    cyberDragon.spiralProjectiles.forEach((projectile, index) => {
        projectile.x += projectile.directionX * projectile.speed * deltaTime / 1000;
        projectile.y += projectile.directionY * projectile.speed * deltaTime / 1000;
        projectile.traveledDistance += projectile.speed * deltaTime / 1000;

        if (projectile.traveledDistance > projectile.maxDistance) {
            cyberDragon.spiralProjectiles.splice(index, 1);
        }
    });
}

function drawSpiralProjectiles() {
    cyberDragon.spiralProjectiles.forEach(projectile => {
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    });
}

function checkSpiralCollisions() {
    cyberDragon.spiralProjectiles.forEach((projectile, index) => {
        const dx = projectile.x - player.x;
        const dy = projectile.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check collision with player
        if (distance < projectile.radius + player.width / 2) {
            if (!isInvincible && !shieldActive) {  // Respect player's invincibility and shield status
                // Apply damage to the player
                player.health -= projectile.damage;

                // Play the existing collision sound
                const collisionSoundClone = collisionSound.cloneNode();
                collisionSoundClone.volume = collisionSound.volume;
                collisionSoundClone.play();

                if (player.health <= 0) {
                    player.lives--;
                    player.health = PLAYER_MAX_HEALTH;
                    if (player.lives <= 0) {
                        gameOver = true;
                        handleGameOver();
                    }
                }
            } else if (shieldActive) {
                // Play the existing collision sound for shield hit
                const collisionSoundClone = collisionSound.cloneNode();
                collisionSoundClone.volume = collisionSound.volume;
                collisionSoundClone.play();
            }

            cyberDragon.spiralProjectiles.splice(index, 1);
        }

        // Check collision with bomb
        if (bomb.active) {
            const bombDx = projectile.x - bomb.x;
            const bombDy = projectile.y - bomb.y;
            const bombDistance = Math.sqrt(bombDx * bombDx + bombDy * bombDy);

            if (bombDistance < projectile.radius + bomb.radius) {
                // Remove the projectile if it collides with the bomb
                cyberDragon.spiralProjectiles.splice(index, 1);
            }
        }
    });
}

function spawnBiomechLeviathan() {
    const offScreenMargin = 100;
    const side = Math.floor(Math.random() * 4);
    let position = { x: 0, y: 0 };

    switch (side) {
        case 0:
            position.x = Math.random() * canvas.width;
            position.y = -offScreenMargin - 100;
            break;
        case 1:
            position.x = Math.random() * canvas.width;
            position.y = canvas.height + offScreenMargin + 100;
            break;
        case 2:
            position.x = -offScreenMargin - 100;
            position.y = Math.random() * canvas.height;
            break;
        case 3:
            position.x = canvas.width + offScreenMargin + 100;
            position.y = Math.random() * canvas.height;
            break;
    }

    biomechLeviathan = {
        x: position.x,
        y: position.y,
        width: 200,
        height: 200,
        speed: 40,
        health: 2000,
        maxHealth: 2000,
        lastShotTime: 0,
        shootInterval: 1500,
        canShoot: false,
        alive: true,
        phase: 1,
        phaseTransitioned: [false, false, false],
        playerCollisionRadius: 100, // Define the player collision radius
        projectileCollisionRadius: 120 // Define the projectile collision radius
    };

    tractorBeam = { active: false, startX: 0, startY: 0, endX: 0, endY: 0, strength: 0.20 };

    setTimeout(() => {
        if (biomechLeviathan) biomechLeviathan.canShoot = true;
    }, 5000);
}


function biomechLeviathanTractorBeam() {
    if (!biomechLeviathan || !biomechLeviathan.alive || tractorBeamCooldown) {
        if (tractorBeam) {
            tractorBeam.active = false;
            tractorBeamSound.pause();
            tractorBeamSound.currentTime = 0; // Reset the sound
        }
        return;
    }

    if (!tractorBeam) {
        tractorBeam = { active: false, startX: 0, startY: 0, endX: 0, endY: 0, strength: 0.3 };
    }

    const cycleDuration = 10000; // Total duration of one cycle (5 seconds active, 5 seconds inactive)
    const activeDuration = 5000; // Duration the tractor beam is active

    const timeInCycle = performance.now() % cycleDuration;
    if (timeInCycle < activeDuration) {
        tractorBeam.active = true;
        tractorBeam.startX = biomechLeviathan.x;
        tractorBeam.startY = biomechLeviathan.y;
        tractorBeam.endX = player.x;
        tractorBeam.endY = player.y;

        if (tractorBeamSound.paused) {
            tractorBeamSound.volume = soundEffectsVolumeSlider.value; // Ensure volume matches the slider
            tractorBeamSound.play().catch(error => {
            });
        }
    } else {
        tractorBeam.active = false;
        tractorBeamSound.pause();
        tractorBeamSound.currentTime = 0; // Reset the sound
    }
}


let inkClouds = [];
let lastInkCloudSpawnTime = 0;
const INK_CLOUD_COOLDOWN = 5000; // 5 seconds cooldown between ink cloud spawns

function biomechLeviathanInkCloud() {
    const currentTime = performance.now();
    if (inkClouds.length >= 3) {
        // If there are already 3 ink clouds, do not spawn a new one
        return;
    }

    const spawnDistance = 300; // Distance from the biomech where the ink clouds will spawn
    const randomAngle = Math.random() * 2 * Math.PI; // Random angle in radians

    // Calculate the position of the ink cloud
    const spawnX = biomechLeviathan.x + spawnDistance * Math.cos(randomAngle);
    const spawnY = biomechLeviathan.y + spawnDistance * Math.sin(randomAngle);

    // Initialize the ink cloud with updated properties
    let newInkCloud = {
        x: spawnX,
        y: spawnY,
        initialRadius: 10,
        maxRadius: 200,
        growthRate: 20, // Radius increase per second
        active: true,
        cloudActive: false,
        cloudX: 0,
        cloudY: 0,
        cloudRadius: 0,
        cloudDuration: 5000,
        cloudStartTime: 0,
        startTime: performance.now(),
        lifespan: 5000 // Add lifespan property
    };

    inkClouds.push(newInkCloud);
}

function updateInkClouds(deltaTime) {
    const currentTime = performance.now();
    inkClouds.forEach((inkCloud, index) => {
        if (inkCloud.active) {
            // Grow the ink blob
            const elapsedTime = (currentTime - inkCloud.startTime) / 1000;
            inkCloud.radius = Math.min(inkCloud.initialRadius + inkCloud.growthRate * elapsedTime, inkCloud.maxRadius);

            // Check if ink blob hits the player
            const dx = inkCloud.x - player.x;
            const dy = inkCloud.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < inkCloud.radius + player.width / 2) {
                // Ink blob hits the player
                inkCloud.cloudActive = true;
                inkCloud.cloudX = player.x;
                inkCloud.cloudY = player.y;
                inkCloud.cloudRadius = 150; // Radius of the cloud obscuring vision
                inkCloud.cloudStartTime = performance.now();
                inkCloud.active = false;
                if (!shieldActive) { // Check if the shield is not active
                    player.health -= 10; // Reduce player's health by 10
                }
                splatSound.currentTime = 0; // Reset the sound
                splatSound.volume = soundEffectsVolumeSlider.value; // Ensure volume matches the slider
                splatSound.play(); // Play the splat sound
            } else if (currentTime - inkCloud.startTime > inkCloud.lifespan) {
                // Remove ink cloud if it exceeds its lifespan
                inkClouds.splice(index, 1);
            }
        }
    });

    // Remove expired ink clouds
    inkClouds = inkClouds.filter(inkCloud => inkCloud.cloudActive || inkCloud.active);
}



function drawInkClouds() {
    inkClouds.forEach(inkCloud => {
        if (inkCloud.active) {
            ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
            ctx.beginPath();
            let points = 36; // Number of points to define the splat perimeter
            for (let i = 0; i < points; i++) {
                let angle = (i / points) * 2 * Math.PI;
                let randomFactor = (Math.random() - 0.5) * 0.2; // Adjust for more or less irregularity
                let radius = inkCloud.radius + randomFactor * inkCloud.radius;
                let x = inkCloud.x + Math.cos(angle) * radius;
                let y = inkCloud.y + Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        }

        if (inkCloud.cloudActive) {
            ctx.fillStyle = 'rgba(64, 64, 64, 0.9)'; // Lower opacity for the cloud
            ctx.beginPath();
            let points = 36; // Number of points to define the splat perimeter
            for (let i = 0; i < points; i++) {
                let angle = (i / points) * 2 * Math.PI;
                let randomFactor = (Math.random() - 0.5) * 0.2; // Adjust for more or less irregularity
                let radius = inkCloud.cloudRadius + randomFactor * inkCloud.cloudRadius;
                let x = inkCloud.cloudX + Math.cos(angle) * radius;
                let y = inkCloud.cloudY + Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'grey'; // Grey outline
            ctx.lineWidth = 2; // Thickness of the outline
            ctx.beginPath();
            for (let i = 0; i < points; i++) {
                let angle = (i / points) * 2 * Math.PI;
                let randomFactor = (Math.random() - 0.5) * 0.2; // Adjust for more or less irregularity
                let radius = inkCloud.cloudRadius + randomFactor * inkCloud.cloudRadius;
                let x = inkCloud.cloudX + Math.cos(angle) * radius;
                let y = inkCloud.cloudY + Math.sin(angle) * radius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();

            if (performance.now() > inkCloud.cloudStartTime + inkCloud.cloudDuration) {
                inkCloud.cloudActive = false;
            }
        }
    });
}


let lastEMPTime = 0; // Variable to track the last EMP activation time
const EMP_COOLDOWN = 5000; // 5 seconds cooldown period

function biomechLeviathanEMPBlast() {
    const currentTime = performance.now();
    if (currentTime - lastEMPTime < EMP_COOLDOWN) {
        return; // If cooldown period hasn't elapsed, do not activate EMP
    }

    lastEMPTime = currentTime; // Update the last EMP activation time

    empBlast = {
        active: true,
        x: biomechLeviathan.x,
        y: biomechLeviathan.y,
        radius: 200,
        duration: 2500
    };
    empBlastEndTime = performance.now() + empBlast.duration;
    empBlastActive = true;

    // Destroy projectiles within the EMP blast radius
    projectiles = projectiles.filter(projectile => {
        const dx = projectile.x - empBlast.x;
        const dy = projectile.y - empBlast.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance > empBlast.radius;
    });

    // Re-enable player controls after the EMP blast ends
    setTimeout(() => {
        empBlast.active = false;
        empBlastActive = false;
    }, empBlast.duration);
}

function drawEMPBlast() {
    if (empBlast && empBlast.active) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(empBlast.x, empBlast.y, empBlast.radius, 0, 2 * Math.PI);
        ctx.fill();

        if (empSound.paused) {
            empSound.currentTime = 0;
            empSound.volume = soundEffectsVolumeSlider.value; // Ensure volume matches the slider
        }
    } else {
        empSound.pause();
        empSound.currentTime = 0; // Reset the sound
    }
}

function updateBiomechLeviathan(deltaTime, timestamp) {
    if (!biomechLeviathan) return;

    const angleToPlayer = Math.atan2(player.y - biomechLeviathan.y, player.x - biomechLeviathan.x);
    biomechLeviathan.x += Math.cos(angleToPlayer) * biomechLeviathan.speed * deltaTime / 1000;
    biomechLeviathan.y += Math.sin(angleToPlayer) * biomechLeviathan.speed * deltaTime / 1000;

    // Use tractor beam attack
    biomechLeviathanTractorBeam();

    // Check for other attacks
    const currentTime = performance.now();
    if (biomechLeviathan.phase === 1 && biomechLeviathan.health <= biomechLeviathan.maxHealth * 0.6 && !biomechLeviathan.phaseTransitioned[0]) {
        biomechLeviathan.phaseTransitioned[0] = true;
        biomechLeviathan.phase = 2;
    } else if (biomechLeviathan.phase === 2 && biomechLeviathan.health <= biomechLeviathan.maxHealth * 0.3 && !biomechLeviathan.phaseTransitioned[1]) {
        biomechLeviathan.phaseTransitioned[1] = true;
        biomechLeviathan.phase = 3;
    }

    switch (biomechLeviathan.phase) {
        case 1:
            // Only tractor beam
            break;
        case 2:
            biomechLeviathanInkCloud(); // Use ink cloud attack
            break;
        case 3:
            biomechLeviathanEMPBlast(); // Use EMP blast attack
            break;
    }

    if (biomechLeviathan.health <= 0) {
        biomechLeviathan.alive = false;
        score += 2000;
        biomechLeviathan = null;
        resetTractorBeam(); // Properly reset tractor beam
        inkClouds = []; // Clear any remaining ink clouds
        empBlast = null; // Reset EMP blast
        level++;
        initLevel(level);
        lastTime = performance.now();
    }

    // Check collision with player
    const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
    const biomechLeviathanCircle = { x: biomechLeviathan.x, y: biomechLeviathan.y, radius: biomechLeviathan.width / 2 };

    if (checkCollision(playerCircle, biomechLeviathanCircle)) {
        if (!isInvincible) {
            player.health -= 20; // Adjust damage as needed
        }
    }
}

function drawBiomechLeviathan() {
    if (biomechLeviathan && biomechLeviathan.alive) {
        ctx.save();
        ctx.translate(biomechLeviathan.x, biomechLeviathan.y);
        ctx.drawImage(biomechLeviathanImage, -biomechLeviathan.width / 2, -biomechLeviathan.height / 2, biomechLeviathan.width, biomechLeviathan.height);
        ctx.restore();
    }
}

function drawBiomechLeviathanHealthBar(boss) {
    const barWidth = boss.width;
    const barHeight = 10;
    const barX = boss.x - boss.width / 2;
    const barY = boss.y + boss.height / 2 + 10;
    const healthRatio = boss.health / boss.maxHealth;

    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}


function resetTractorBeam() {
    if (tractorBeam) {
        tractorBeam.active = false;
        tractorBeam.startX = 0;
        tractorBeam.startY = 0;
        tractorBeam.endX = 0;
        tractorBeam.endY = 0;
        tractorBeam.strength = 0;
        tractorBeam = null;
    }
    tractorBeamCooldown = false;
}

function drawTractorBeam() {
    if (tractorBeam && tractorBeam.active && biomechLeviathan && biomechLeviathan.alive) {
        const beamWidth = 20; // Width of the beam at the player end
        const gradient = ctx.createLinearGradient(
            player.x, player.y, // Start point of the gradient (player position)
            tractorBeam.startX, tractorBeam.startY // End point of the gradient (biomech boss position)
        );

        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.5)'); // Yellow at the player end
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)'); // Transparent at the biomech boss end

        const dx = player.x - tractorBeam.startX;
        const dy = player.y - tractorBeam.startY;
        const angle = Math.atan2(dy, dx);

        const playerX1 = player.x + Math.cos(angle + Math.PI / 2) * beamWidth / 2;
        const playerY1 = player.y + Math.sin(angle + Math.PI / 2) * beamWidth / 2;
        const playerX2 = player.x + Math.cos(angle - Math.PI / 2) * beamWidth / 2;
        const playerY2 = player.y + Math.sin(angle - Math.PI / 2) * beamWidth / 2;

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(tractorBeam.startX, tractorBeam.startY); // Start at biomech boss
        ctx.lineTo(playerX1, playerY1); // Draw to one side of the player
        ctx.lineTo(playerX2, playerY2); // Draw to the other side of the player
        ctx.closePath();
        ctx.fill();
    } else {
        if (tractorBeamSound) {
            tractorBeamSound.pause();
            tractorBeamSound.currentTime = 0; // Reset the sound
        }
    }
}
// End bio mech leviathan logic

// temporal serpent
let temporalSerpent = null;
let lastDirectionChangeTime = 0;
const DIRECTION_CHANGE_INTERVAL = 1500; // Change direction every 1.5 seconds
const FOLLOW_PLAYER_INTERVAL = 2500; // Follow the player every 2 seconds
let lastFollowPlayerTime = 0;

function getRandomDirection() {
    const directions = ['right', 'down', 'left', 'up'];
    return directions[Math.floor(Math.random() * directions.length)];
}

function getDirectionTowardsPlayer(player, serpent) {
    const dx = player.x - serpent.x;
    const dy = player.y - serpent.y;
    if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
    } else {
        return dy > 0 ? 'down' : 'up';
    }
}

function spawnTemporalSerpent() {
    const offScreenMargin = 100;
    const side = Math.floor(Math.random() * 4);
    let position = { x: 0, y: 0 };

    switch (side) {
        case 0: // Top
            position.x = Math.random() * canvas.width;
            position.y = -offScreenMargin;
            break;
        case 1: // Bottom
            position.x = Math.random() * canvas.width;
            position.y = canvas.height + offScreenMargin;
            break;
        case 2: // Left
            position.x = -offScreenMargin;
            position.y = Math.random() * canvas.height;
            break;
        case 3: // Right
            position.x = canvas.width + offScreenMargin;
            position.y = Math.random() * canvas.height;
            break;
    }

    temporalSerpent = {
        x: position.x,
        y: position.y,
        width: 200,
        height: 200,
        speed: 400,
        health: 2000,
        maxHealth: 2000,
        lastAttackTime: 0,
        attackInterval: 3000,
        canAttack: true,
        phase: 1,
        phaseTransitioned: [false, false, false],
        alive: true,
        segments: [
            { x: position.x, y: position.y, radius: 30 }
        ],
        segmentAddInterval: 200,
        lastSegmentAddTime: 0,
        lastBombDamageTime: 0, // Add this property
        direction: getRandomDirection(),
        projectileCollisionRadius: 100,
        playerCollisionRadius: 120,
        maxSegments: 3000
    };

    lastDirectionChangeTime = performance.now();
    lastFollowPlayerTime = performance.now();
}

function attackPhase1() {
    if (temporalSerpent.segments.length === 0) return;

    // The Temporal Serpent leaves a hazardous zone at its last segment position
    const lastSegment = temporalSerpent.segments[temporalSerpent.segments.length - 1];
    hazardousZones.push({
        x: lastSegment.x,
        y: lastSegment.y,
        radius: HAZARD_RADIUS,
        spawnTime: performance.now()
    });

    // Remove old hazardous zones
    hazardousZones = hazardousZones.filter(zone => performance.now() - zone.spawnTime < HAZARD_DURATION);
}


let hazardousZones = [];
const HAZARD_DURATION = 1000; // Duration for the hazardous zone to stay active
const HAZARD_DAMAGE = 1; // Damage to the player if they are in the zone
const HAZARD_RADIUS = 15; // Radius of the hazardous zone
const HAZARD_DAMAGE_RATE = 1000; // Time in milliseconds between damage applications
let hazardCooldownActive = false;
let hazardCooldownTimer = 0;

const HAZARD_COLORS = [
    'rgba(255, 0, 0, 0.6)', // Red
    'rgba(0, 255, 0, 0.6)', // Green
    'rgba(0, 0, 255, 0.6)', // Blue
    'rgba(255, 255, 0, 0.6)', // Yellow
    'rgba(0, 255, 255, 0.6)', // Cyan
    'rgba(255, 0, 255, 0.6)' // Magenta
];


function drawHazardousZones(ctx, timestamp) {
    ctx.save();

    hazardousZones.forEach(zone => {
        // Pick a random color from the array for the gradient
        const colorIndex = Math.floor(Math.random() * HAZARD_COLORS.length);
        const baseColor = HAZARD_COLORS[colorIndex];
        const glowColor = baseColor.replace('0.6', '0.3');

        // Create a radial gradient
        const gradient = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, zone.radius);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, baseColor.replace('0.6', '0'));

        // Set the fill style to the gradient
        ctx.fillStyle = gradient;

        // Draw the main circle with the gradient
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Create a glow effect by drawing a larger, semi-transparent circle around the zone
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius + 10, 0, 2 * Math.PI);
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 5;
        ctx.stroke();

        // Animate the zone's opacity for a pulsing effect
        const pulse = Math.sin(timestamp / 200) * 0.2 + 0.8;
        ctx.globalAlpha = pulse;

        // Draw the inner circle again with varying opacity for the pulsing effect
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius - 5, 0, 2 * Math.PI);
        ctx.fillStyle = baseColor.replace('0.6', '0.8');
        ctx.fill();
    });

    ctx.restore();
}

let isPlayerInHazardZone = false; // Track whether the player is in a hazardous zone

function checkPlayerInHazardousZone(player, timestamp) {
    if (hazardCooldownActive && timestamp < hazardCooldownTimer) {
        return; // Skip the check if the cooldown is active
    }

    let damageApplied = false;
    let playerIsInHazard = false; // Track if the player is in any hazard zone

    hazardousZones.forEach(zone => {
        const dx = player.x - zone.x;
        const dy = player.y - zone.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < zone.radius + player.width / 2) {
            playerIsInHazard = true;
            if (!isInvincible && !shieldActive && !damageApplied) {
                console.log('Applying damage to player.');
                player.health -= HAZARD_DAMAGE;
                damageApplied = true; // Ensure damage is only applied once per check
                if (player.health <= 0) {
                    player.lives--;
                    player.health = PLAYER_MAX_HEALTH;
                    if (player.lives <= 0) {
                        gameOver = true;
                        handleGameOver();
                    }
                }
            }
        }
    });

    if (damageApplied) {
        console.log(`Player is in hazardous zone.`); // Log only when damage is applied
        hazardCooldownActive = true;
        hazardCooldownTimer = timestamp + HAZARD_DAMAGE_RATE; // Set the cooldown timer
    } else {
        hazardCooldownActive = false;
    }

    // Play the audio only if the player has entered a hazardous zone
    if (playerIsInHazard && !isPlayerInHazardZone) {
        hazardSound.play();
        isPlayerInHazardZone = true;
    } else if (!playerIsInHazard && isPlayerInHazardZone) {
        hazardSound.pause();
        isPlayerInHazardZone = false;
    }
}


function attackPhase2() {
    // Define phase 2 attack logic here
}

let energyBarrierActive = false;
const energyBarrierDuration = 5000; // Duration of the energy barrier in milliseconds
const energyBarrierCooldown = 10000; // Cooldown period in milliseconds
let energyBarrierEndTime = 0;
let energyBarrierCooldownEndTime = 0;

function activateEnergyBarrier() {
    if (performance.now() >= energyBarrierCooldownEndTime) {
        energyBarrierActive = true;
        energyBarrierEndTime = performance.now() + energyBarrierDuration;
        energyBarrierCooldownEndTime = performance.now() + energyBarrierCooldown;
    }
}

function updateEnergyBarrier() {
    if (energyBarrierActive && performance.now() >= energyBarrierEndTime) {
        energyBarrierActive = false;
    }
}

function handleProjectileReflection(projectile) {
    if (energyBarrierActive) {
        // Calculate the reflection direction (simply invert the direction here)
        projectile.directionX = -projectile.directionX;
        projectile.directionY = -projectile.directionY;

        // Change the projectile to an enemy projectile
        projectile.fromPlayer = false;
        projectile.fromBoss = true;

        // Increase the size of the projectile
        projectile.width *= 5;
        projectile.height *= 5;

        // Optionally, you can change the color or other properties of the projectile to indicate it has been reflected
        projectile.color = 'red'; // Example: change color to indicate it's an enemy projectile

    }
}

function attackPhase3() {
    activateEnergyBarrier();
}

let energyBarrierRadius = 50; // Define the radius of the energy barrier

function drawEnergyBarrier(ctx) {
    if (energyBarrierActive && temporalSerpent && temporalSerpent.alive) {
        const headX = temporalSerpent.segments[0].x;
        const headY = temporalSerpent.segments[0].y;

        ctx.save();
        ctx.strokeStyle = 'purple'; // Change color to cyan for a more energetic look
        ctx.lineWidth = 5;

        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'yellow';

        ctx.beginPath();
        ctx.arc(headX, headY, energyBarrierRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }
}




function attackPhase4() {
    // Check if there are enough segments to perform the attack
    if (temporalSerpent.segments.length < 10) return; // Adjust this number based on desired difficulty

    const segmentsToExplode = [];
    const numSegments = 2; // Number of segments to detach and explode

    // Select random segments to detach
    for (let i = 0; i < numSegments; i++) {
        const randomIndex = Math.floor(Math.random() * temporalSerpent.segments.length);
        const segment = temporalSerpent.segments[randomIndex];
        segmentsToExplode.push(segment);
        // Remove the segment from the serpent
        temporalSerpent.segments.splice(randomIndex, 1);
    }

    // Detach selected segments and set them up for explosion
    segmentsToExplode.forEach(segment => {
        const stayDuration = 2000; // Time in milliseconds to stay before exploding
        const explosionDelay = stayDuration + 1500; // Time in milliseconds before the segment explodes

        // Mark the segment for explosion
        segment.explode = true;
        segment.explosionTime = performance.now() + explosionDelay;

        // Add the detached segment to a global array for detached segments
        detachedSegments.push(segment);
    });
}

const detachedSegments = [];

// Function to handle the explosion of detached segments
function handleSegmentExplosions(timestamp) {
    if (!temporalSerpent || !temporalSerpent.alive) return;

    const segmentsToRemove = [];

    detachedSegments.forEach((segment, index) => {
        if (timestamp >= segment.explosionTime) {
            // Perform the explosion effect
            createExplosion(segment.x, segment.y);
            // Play the explosion sound
            explosionSound.play();

            // Check for damage to the player
            const explosionRadius = 250; // Adjust radius as needed
            const distanceToPlayer = Math.sqrt(Math.pow(player.x - segment.x, 2) + Math.pow(player.y - segment.y, 2));
            if (distanceToPlayer <= explosionRadius) {
                if (!isInvincible && !shieldActive) {
                    player.health -= 20; // Adjust damage as needed
                    const collisionSoundClone = collisionSound.cloneNode();
                    collisionSoundClone.volume = collisionSound.volume;
                    collisionSoundClone.play();

                    if (player.health <= 0) {
                        player.lives--;
                        player.health = PLAYER_MAX_HEALTH;
                        lifeLostSound.play();
                        if (player.lives <= 0) {
                            gameOver = true;
                            handleGameOver();
                        }
                    }
                }
            }

            // Mark segment for removal
            segmentsToRemove.push(index);
        }
    });

    // Remove exploded segments from the detached segments array
    for (let i = segmentsToRemove.length - 1; i >= 0; i--) {
        detachedSegments.splice(segmentsToRemove[i], 1);
    }
}

// Function to create explosion effect
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 2 + 2; // Random size
        this.life = 100; // Lifetime of the particle in frames
        this.dx = (Math.random() - 0.5) * 5; // Horizontal velocity
        this.dy = (Math.random() - 0.5) * 5; // Vertical velocity
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.life--;
        if (this.life < 0) {
            this.life = 0;
        }
    }

    draw(ctx) {
        if (this.life > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}

const particles = [];

function createExplosion(x, y) {
    const colors = ['red', 'orange', 'yellow'];
    for (let i = 0; i < 50; i++) { // Number of particles per explosion
        const color = colors[Math.floor(Math.random() * colors.length)];
        particles.push(new Particle(x, y, color));
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        if (particle.life <= 0) {
            particles.splice(i, 1); // Remove dead particles
        }
    }
}

function drawParticles(ctx) {
    particles.forEach(particle => particle.draw(ctx));
}

// Function to draw detached segments
function drawDetachedSegments(ctx) {
    detachedSegments.forEach(segment => {
        ctx.drawImage(serpentSegment, segment.x - segment.radius, segment.y - segment.radius, segment.radius * 2, segment.radius * 2);
    });
}

function updateTemporalSerpent(deltaTime, timestamp) {
    if (!temporalSerpent || !temporalSerpent.alive) return;

    const head = temporalSerpent.segments[0];
    const moveDistance = temporalSerpent.speed * deltaTime / 1000;

    // Change direction at random intervals
    if (timestamp - lastDirectionChangeTime > DIRECTION_CHANGE_INTERVAL) {
        temporalSerpent.direction = getRandomDirection();
        lastDirectionChangeTime = timestamp;
    }

    // Change direction towards the player at specific intervals
    if (timestamp - lastFollowPlayerTime > FOLLOW_PLAYER_INTERVAL) {
        temporalSerpent.direction = getDirectionTowardsPlayer(player, head);
        lastFollowPlayerTime = timestamp;
    }

    // Move the head based on the current direction
    switch (temporalSerpent.direction) {
        case 'right':
            head.x += moveDistance;
            if (head.x >= canvas.width - head.radius) {
                head.x = canvas.width - head.radius;
                temporalSerpent.direction = 'down';
            }
            break;
        case 'down':
            head.y += moveDistance;
            if (head.y >= canvas.height - head.radius) {
                head.y = canvas.height - head.radius;
                temporalSerpent.direction = 'left';
            }
            break;
        case 'left':
            head.x -= moveDistance;
            if (head.x <= head.radius) {
                head.x = head.radius;
                temporalSerpent.direction = 'up';
            }
            break;
        case 'up':
            head.y -= moveDistance;
            if (head.y <= head.radius) {
                head.y = head.radius;
                temporalSerpent.direction = 'right';
            }
            break;
    }

    // Leave a hazardous zone behind the last segment
    if (temporalSerpent.segments.length > 0) {
        const lastSegment = temporalSerpent.segments[temporalSerpent.segments.length - 1];
        hazardousZones.push({
            x: lastSegment.x,
            y: lastSegment.y,
            radius: HAZARD_RADIUS,
            spawnTime: timestamp
        });

        // Remove old hazardous zones
        hazardousZones = hazardousZones.filter(zone => timestamp - zone.spawnTime < HAZARD_DURATION);
    }

    // Add new segment to the tail at the increased interval
    const increasedSegmentInterval = temporalSerpent.segmentAddInterval * 3;

    if (timestamp - temporalSerpent.lastSegmentAddTime > increasedSegmentInterval) {
        const newSegment = { x: head.x, y: head.y, radius: head.radius };
        temporalSerpent.segments.push(newSegment);
        temporalSerpent.lastSegmentAddTime = timestamp;

        if (temporalSerpent.segments.length > temporalSerpent.maxSegments) {
            temporalSerpent.segments.shift();
        }
    }

    // Update segments to follow the previous segment with increased spacing
    const segmentSpacing = 30;
    for (let i = temporalSerpent.segments.length - 1; i > 0; i--) {
        const segment = temporalSerpent.segments[i];
        const previousSegment = temporalSerpent.segments[i - 1];
        const distance = Math.sqrt(
            Math.pow(previousSegment.x - segment.x, 2) +
            Math.pow(previousSegment.y - segment.y, 2)
        );

        if (distance > segmentSpacing) {
            segment.x = previousSegment.x;
            segment.y = previousSegment.y;
        }
    }

    // Phase transitions
    if (temporalSerpent.health <= temporalSerpent.maxHealth * 0.75 && !temporalSerpent.phaseTransitioned[0]) {
        temporalSerpent.phase = 2;
        temporalSerpent.phaseTransitioned[0] = true;
    } else if (temporalSerpent.health <= temporalSerpent.maxHealth * 0.50 && !temporalSerpent.phaseTransitioned[1]) {
        temporalSerpent.phase = 3;
        temporalSerpent.phaseTransitioned[1] = true;
    } else if (temporalSerpent.health <= temporalSerpent.maxHealth * 0.25 && !temporalSerpent.phaseTransitioned[2]) {
        temporalSerpent.phase = 4;
        temporalSerpent.phaseTransitioned[2] = true;
    }

    // Attack logic
    if (temporalSerpent.canAttack && timestamp - temporalSerpent.lastAttackTime > temporalSerpent.attackInterval) {
        switch (temporalSerpent.phase) {
            case 1:
                attackPhase1();
                break;
            case 2:
                attackPhase2();
                break;
            case 3:
                attackPhase3();
                break;
            case 4:
                attackPhase4();
                break;
        }
        temporalSerpent.lastAttackTime = timestamp;
    }
    handleSerpentBombImpact(temporalSerpent, deltaTime, timestamp);
}

function handleSerpentBombImpact(enemy, deltaTime, timestamp) {
    if (bomb.active && timestamp - bombSpawnTime > BOMB_DAMAGE_INTERVAL) {
        const dx = enemy.x - bomb.x;
        const dy = enemy.y - bomb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= BOMB_RADIUS) {
            enemy.health -= BOMB_DAMAGE;
            enemy.lastBombDamageTime = timestamp;

            if (enemy.health <= 0) {
                enemy.alive = false;
            }

            // Trigger Temporal Serpent leave screen function if it's the Temporal Serpent
            if (enemy === temporalSerpent) {
                makeTemporalSerpentLeaveScreen(TEMPORAL_SERPENT_LEAVE_DURATION);
            }
        }
    }
}


function drawTemporalSerpentHealthBar(ctx, canvas, temporalSerpent) {
    if (!temporalSerpent || !temporalSerpent.alive) return;

    const barWidth = 200; // Width of the health bar
    const barHeight = 20; // Height of the health bar
    const barX = (canvas.width - barWidth) / 2; // Centered horizontally
    const barY = canvas.height - barHeight - 30; // Positioned at the bottom of the canvas with some margin

    const healthRatio = temporalSerpent.health / temporalSerpent.maxHealth;

    // Save the current context state
    ctx.save();

    // Draw the health bar background
    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Draw the current health
    ctx.fillStyle = 'green';
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    // Draw the border of the health bar
    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Set the font for the text
    ctx.font = '10px "Press Start 2P", cursive'; // Use the correct font and size
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    // Draw the "Temporal Serpent" text
    ctx.fillText('Temporal Serpent', canvas.width / 2, barY + barHeight + 20); // Positioned below the health bar

    // Restore the context to its original state
    ctx.restore();
}

function drawTemporalSerpent() {
    if (!temporalSerpent || !temporalSerpent.alive) return;

    // Draw segments first
    temporalSerpent.segments.forEach((segment, index) => {
        if (index !== 0) { // Skip the head segment
            if (segment.x > 0 && segment.x < canvas.width && segment.y > 0 && segment.y < canvas.height) {
                ctx.drawImage(serpentSegment, segment.x - segment.radius, segment.y - segment.radius, segment.radius * 2, segment.radius * 2);
            }
        }
    });

    // Draw the head segment last
    const head = temporalSerpent.segments[0];
    if (head.x > 0 && head.x < canvas.width && head.y > 0 && head.y < canvas.height) {
        ctx.drawImage(serpentHead, head.x - head.radius, head.y - head.radius, head.radius * 2, head.radius * 2);
    }
}

function makeTemporalSerpentLeaveScreen(duration) {
    if (temporalSerpent) {
        const offScreenMargin = 100;
        temporalSerpent.x = -offScreenMargin;
        temporalSerpent.y = -offScreenMargin;
        setTimeout(() => {
            if (temporalSerpent && temporalSerpent.alive) {
                const position = getRandomBorderPosition();
                temporalSerpent.x = position.x;
                temporalSerpent.y = position.y;
            }
        }, duration);
    }
}

function clearSerpentSegments() {
    if (temporalSerpent) {
        // Clear the active segments of the Temporal Serpent
        temporalSerpent.segments = [];

        // Optionally, reset other properties if needed
        temporalSerpent.alive = false;
        temporalSerpent.health = temporalSerpent.maxHealth;
        temporalSerpent.phase = 1;
        temporalSerpent.phaseTransitioned = [false, false, false];
    }

    // Clear the detached segments
    detachedSegments.length = 0; // This is a more efficient way to clear an array

    // Clear hazardous zones
    hazardousZones.length = 0;
}

function handleSerpentDeath() {
    clearSerpentSegments();
    // Additional logic for handling serpent death, such as playing an animation, updating score, etc.
}



// Call spawnTemporalSerpent() at the appropriate place in your game initialization or level setup

function updateProjectiles(deltaTime, timestamp) {
    let projectilesToRemove = new Set();
    handleWormholeTeleportation();

    projectiles.forEach((projectile, index) => {
        if (projectile.heatSeeking && projectile.fromBoss) {
            // Heat-seeking logic for boss projectiles targeting the player
            const angleToPlayer = Math.atan2(player.y - projectile.y, player.x - projectile.x);
            const heatSeekingStrength = 0.1; // Adjust strength as needed

            projectile.directionX = (1 - heatSeekingStrength) * projectile.directionX + heatSeekingStrength * Math.cos(angleToPlayer);
            projectile.directionY = (1 - heatSeekingStrength) * projectile.directionY + heatSeekingStrength * Math.sin(angleToPlayer);

            const directionLength = Math.sqrt(projectile.directionX * projectile.directionX + projectile.directionY * projectile.directionY);
            projectile.directionX /= directionLength;
            projectile.directionY /= directionLength;
        }

        projectile.x += projectile.speed * projectile.directionX * deltaTime / 1000;
        projectile.y += projectile.speed * projectile.directionY * deltaTime / 1000;
        projectile.traveledDistance += projectile.speed * deltaTime / 1000;

        if (projectile.traveledDistance > projectile.maxDistance) {
            projectiles.splice(index, 1);
            return;
        }

        if (projectile.isCharged) {
            if (projectile.traveledDistance >= 300) {
                splitChargedProjectile(projectile);
                projectiles.splice(index, 1);
                return;
            }
        }

        if (projectile.fromPlayer) {
            if (projectile.x < 0) projectile.x = canvas.width;
            if (projectile.x > canvas.width) projectile.x = 0;
            if (projectile.y < 0) projectile.y = canvas.height;
            if (projectile.y > canvas.height) projectile.y = 0;
        }

        if (projectile.traveledDistance > 800) {
            projectiles.splice(index, 1);
            return;
        }

        if (projectile.fromPlayer) {
            if (energyBarrierActive && checkCollision({ x: projectile.x, y: projectile.y, radius: projectile.width / 2 }, { x: temporalSerpent.segments[0].x, y: temporalSerpent.segments[0].y, radius: temporalSerpent.width / 2 })) {
                handleProjectileReflection(projectile);
            } else {
                enemies.forEach((enemy, enemyIndex) => {
                    if (enemy.type === 'stealthEnemy' && !enemy.visible) {
                        return;
                    }

                    const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
                    const enemyCircle = { x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, radius: enemy.width / 2 };

                    if (checkCollision(projectileCircle, enemyCircle)) {
                        const collisionSoundClone = collisionSound.cloneNode();
                        collisionSoundClone.volume = collisionSound.volume;
                        collisionSoundClone.play();

                        if (enemy.health) {
                            enemy.health -= projectile.damage;
                            if (enemy.health <= 0) {

                                if (enemy.type === 'enemyTank') {
                                    respawnEnemyTank(5000);
                                } else if (enemy.type === 'stealthEnemy') {
                                    respawnStealthEnemy(7000);
                                } else {
                                    const enemySpeed = 50 + level * 10;
                                    respawnEnemyAfterDelay(enemySpeed, 7000);
                                }

                                enemies.splice(enemyIndex, 1);
                                score += 10;
                            }
                        } else {
                            enemies.splice(enemyIndex, 1);
                            score += 10;
                        }

                        projectiles.splice(index, 1);
                    }
                });

                if (cyberDragon && cyberDragon.alive) {
                    const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
                    const dragonCenterX = cyberDragon.x;
                    const dragonCenterY = cyberDragon.y;
                    const dragonProjectileCircle = {
                        x: dragonCenterX,
                        y: dragonCenterY,
                        radius: cyberDragon.projectileCollisionRadius
                    };

                    if (checkCollision(projectileCircle, dragonProjectileCircle)) {
                        cyberDragon.health -= projectile.damage;
                        const collisionSoundClone = collisionSound.cloneNode();
                        collisionSoundClone.volume = collisionSound.volume;
                        collisionSoundClone.play();
                        projectiles.splice(index, 1);

                        if (cyberDragon && cyberDragon.health <= 0) {
                            cyberDragon.alive = false;
			    createExplosion(cyberDragon.x + cyberDragon.width / 2, cyberDragon.y + cyberDragon.height / 2);
			    explosionSound.play();
                            score += 3000;
                            cyberDragon = null;
                            clearAsteroids();
                            level++;
                            initLevel(level);
                            lastTime = performance.now();
                        }
                    }
                }

                if (boss && boss.alive) {
                    const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
                    const bossCircle = { x: boss.x + boss.width / 2, y: boss.y + boss.height / 2, radius: Math.max(boss.width, boss.height) / 2 };

                    if (checkCollision(projectileCircle, bossCircle)) {
                        boss.health -= projectile.damage;
                        const collisionSoundClone = collisionSound.cloneNode();
                        collisionSoundClone.volume = collisionSound.volume;
                        collisionSoundClone.play();
                        projectiles.splice(index, 1);

                        if (boss.health <= 0) {
                            boss.alive = false;
			    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2); // Create explosion at boss's position
			    explosionSound.play();
                            score += 1000;
                            initLevel(level + 1);
                        }
                    }
                }

                if (biomechLeviathan && biomechLeviathan.alive) {
                    const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
                    const leviathanCenterX = biomechLeviathan.x;
                    const leviathanCenterY = biomechLeviathan.y;
                    const leviathanCircle = { x: leviathanCenterX, y: leviathanCenterY, radius: biomechLeviathan.width / 2 };

                    if (checkCollision(projectileCircle, leviathanCircle)) {
                        biomechLeviathan.health -= projectile.damage;
                        const collisionSoundClone = collisionSound.cloneNode();
                        collisionSoundClone.volume = collisionSound.volume;
                        collisionSoundClone.play();
                        projectiles.splice(index, 1);

                        if (biomechLeviathan && biomechLeviathan.health <= 0) {
                            biomechLeviathan.alive = false;
			    createExplosion(biomechLeviathan.x + biomechLeviathan.width / 2, biomechLeviathan.y + biomechLeviathan.height / 2);
			    explosionSound.play();
                            score += 2000;
                            biomechLeviathan = null;
                            level++;
                            initLevel(level);
                            lastTime = performance.now();
                        }
                    }
                }

                if (temporalSerpent && temporalSerpent.alive) {
                    const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
                    const headCircle = { x: temporalSerpent.segments[0].x, y: temporalSerpent.segments[0].y, radius: 30 }; // Updated radius for head

                    if (checkCollision(projectileCircle, headCircle)) {
                        temporalSerpent.health -= projectile.damage + 25;
                        const collisionSoundClone = collisionSound.cloneNode();
                        collisionSoundClone.volume = collisionSound.volume;
                        collisionSoundClone.play();
                        projectiles.splice(index, 1);

                        if (temporalSerpent.health <= 0) {
                            temporalSerpent.alive = false;
                            score += 3000;
                            temporalSerpent = null;
                            level++;
                            initLevel(level);
                            lastTime = performance.now();
                        }
                    } else {
                        // Check collision with other segments
                        for (let i = 1; i < temporalSerpent.segments.length; i++) {
                            const segmentCircle = { x: temporalSerpent.segments[i].x, y: temporalSerpent.segments[i].y, radius: 30 }; // Updated radius for segments

                            if (checkCollision(projectileCircle, segmentCircle)) {
                                temporalSerpent.segments.splice(i, 1); // Remove the segment
                                temporalSerpent.health -= projectile.damage - 5;
                                const collisionSoundClone = collisionSound.cloneNode();
                                collisionSoundClone.volume = collisionSound.volume;
                                collisionSoundClone.play();
                                projectiles.splice(index, 1);
                                break;
                            }
                        }
                    }
                }
            }
        } else {
            const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
            const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };

            if (checkCollision(playerCircle, projectileCircle)) {
                const collisionSoundClone = collisionSound.cloneNode();
                collisionSoundClone.volume = collisionSound.volume;
                collisionSoundClone.play();

                if (!isInvincible && !shieldActive) {
                    player.health -= 10;
                    if (player.health <= 0) {
                        player.lives--;
                        player.health = PLAYER_MAX_HEALTH;
                        lifeLostSound.play();
                        if (player.lives <= 0) {
                            gameOver = true;
                            handleGameOver();
                        }
                    }
                }

                projectiles.splice(index, 1);
            }
        }

        projectiles.forEach((projectile, i) => {
            for (let j = i + 1; j < projectiles.length; j++) {
                if (projectile.fromPlayer !== projectiles[j].fromPlayer) {
                    const projectile1Circle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
                    const projectile2Circle = { x: projectiles[j].x, y: projectiles[j].y, radius: projectiles[j].width / 2 };

                    if (checkCollision(projectile1Circle, projectile2Circle)) {
                        if (!projectile.isLaser && !projectiles[j].isLaser) {
                            if (projectile.fromPlayer) {
                                projectilesToRemove.add(j);
                            } else {
                                projectilesToRemove.add(i);
                            }

                            const collisionSoundClone = collisionSound.cloneNode();
                            collisionSoundClone.volume = collisionSound.volume;
                            collisionSoundClone.play();
                        }
                    }
                }
            }
        });

        projectiles = projectiles.filter((_, index) => !projectilesToRemove.has(index));
    });

    projectiles.forEach((projectile, index) => {
        asteroids.forEach((asteroid, asteroidIndex) => {
            const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
            const asteroidCircle = { x: asteroid.x + asteroid.width / 2, y: asteroid.y + asteroid.height / 2, radius: asteroid.width / 2 };

            if (checkCollision(projectileCircle, asteroidCircle)) {
                asteroid.alive = false;
                projectiles.splice(index, 1);

                const collisionSoundClone = collisionSound.cloneNode();
                collisionSoundClone.volume = collisionSound.volume;
                collisionSoundClone.play();
            }
        });
    });

    // Ensure spiral projectiles are updated correctly
    if (cyberDragon && cyberDragon.spiralProjectiles) {
        cyberDragon.spiralProjectiles.forEach((projectile, index) => {
            projectile.x += projectile.directionX * projectile.speed * deltaTime / 1000;
            projectile.y += projectile.directionY * projectile.speed * deltaTime / 1000;
            projectile.traveledDistance += projectile.speed * deltaTime / 1000;

            if (projectile.traveledDistance > projectile.maxDistance) {
                cyberDragon.spiralProjectiles.splice(index, 1);
                return;
            }

            // Check collision with player
            const dx = projectile.x - player.x;
            const dy = projectile.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < projectile.radius + player.radius) {
                // Collision detected, reduce player health
                player.health -= projectile.damage;
                if (player.health <= 0) {
                    // Handle player death
                }
                // Remove the projectile
                cyberDragon.spiralProjectiles.splice(index, 1);
                return;
            }
        });
    }
}


function checkCollisionWithLaser(laser, player) {
    // Calculate the laser's end position
    const laserEndX = laser.x + laser.directionX * laser.height;
    const laserEndY = laser.y + laser.directionY * laser.height;

    // Calculate the distance from the player to the laser line
    const dist = Math.abs((laserEndY - laser.y) * player.x - (laserEndX - laser.x) * player.y + laserEndX * laser.y - laserEndY * laser.x) / Math.sqrt((laserEndY - laser.y) ** 2 + (laserEndX - laser.x) ** 2);

    // Check if the player is within the laser width
    return dist <= laser.width / 2;
}

// wormhole logic
const WORMHOLE_PAIRS = [
    { entry: { x: 100, y: 100, radius: 37.5 }, exit: { x: 700, y: 500, radius: 37.5 } }, 
    { entry: { x: 400, y: 300, radius: 37.5 }, exit: { x: 200, y: 700, radius: 37.5 } }  
];

const WORMHOLE_LIFETIME = 10000; // 10 seconds
const WORMHOLE_COOLDOWN = 10000; // 10 seconds
const WORMHOLE_FADE_DURATION = 2000; // 2 seconds for fade in/out
const TELEPORT_COOLDOWN = 1000; // 1 second cooldown

let lastPlayerTeleportTime = 0;
let lastEnemyTeleportTimes = new Map();
let wormholes = [];
let wormholeActive = false;
let wormholeSpawnTime = 0;

function isValidSpawnPosition(x, y, radius, canvasWidth, canvasHeight) {
    const margin = 150;
    return (x > margin + radius && x < canvasWidth - margin - radius &&
            y > margin + radius && y < canvasHeight - margin - radius);
}


function initWormholes(level) {
    if (level <= 7) return;

    wormholes = []; // Clear any existing wormholes
    wormholeActive = true;
    wormholeSpawnTime = performance.now();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const quadrants = [
        { xMin: 0, xMax: canvasWidth / 2, yMin: 0, yMax: canvasHeight / 2 }, // Top-left quadrant
        { xMin: canvasWidth / 2, xMax: canvasWidth, yMin: 0, yMax: canvasHeight / 2 }, // Top-right quadrant
        { xMin: 0, xMax: canvasWidth / 2, yMin: canvasHeight / 2, yMax: canvasHeight }, // Bottom-left quadrant
        { xMin: canvasWidth / 2, xMax: canvasWidth, yMin: canvasHeight / 2, yMax: canvasHeight } // Bottom-right quadrant
    ];

    WORMHOLE_PAIRS.forEach((pair, index) => {
        let entry, exit;

        const entryQuadrant = quadrants[index % 4];
        const exitQuadrant = quadrants[(index + 1) % 4];

        do {
            entry = {
                x: Math.random() * (entryQuadrant.xMax - entryQuadrant.xMin) + entryQuadrant.xMin,
                y: Math.random() * (entryQuadrant.yMax - entryQuadrant.yMin) + entryQuadrant.yMin,
                radius: pair.entry.radius,
                opacity: 0
            };
        } while (!isValidSpawnPosition(entry.x, entry.y, entry.radius, canvasWidth, canvasHeight));

        do {
            exit = {
                x: Math.random() * (exitQuadrant.xMax - exitQuadrant.xMin) + exitQuadrant.xMin,
                y: Math.random() * (exitQuadrant.yMax - exitQuadrant.yMin) + exitQuadrant.yMin,
                radius: pair.exit.radius,
                opacity: 0
            };
        } while (!isValidSpawnPosition(exit.x, exit.y, exit.radius, canvasWidth, canvasHeight));

        wormholes.push({ entry, exit });
    });
}

function updateWormholes(timestamp) {
    if (!wormholeActive && performance.now() - wormholeSpawnTime > WORMHOLE_COOLDOWN) {
        initWormholes(level); // Respawn wormholes
    } else if (wormholeActive && performance.now() - wormholeSpawnTime > WORMHOLE_LIFETIME) {
        wormholeActive = false;
        wormholeSpawnTime = performance.now();
        wormholes = [];
    }

    // Handle fade in/out
    wormholes.forEach(wormhole => {
        const timeSinceSpawn = performance.now() - wormholeSpawnTime;
        if (timeSinceSpawn < WORMHOLE_FADE_DURATION) {
            wormhole.entry.opacity = timeSinceSpawn / WORMHOLE_FADE_DURATION;
            wormhole.exit.opacity = timeSinceSpawn / WORMHOLE_FADE_DURATION;
        } else if (performance.now() - wormholeSpawnTime > WORMHOLE_LIFETIME - WORMHOLE_FADE_DURATION) {
            wormhole.entry.opacity = (WORMHOLE_LIFETIME - (performance.now() - wormholeSpawnTime)) / WORMHOLE_FADE_DURATION;
            wormhole.exit.opacity = (WORMHOLE_LIFETIME - (performance.now() - wormholeSpawnTime)) / WORMHOLE_FADE_DURATION;
        } else {
            wormhole.entry.opacity = 1;
            wormhole.exit.opacity = 1;
        }
    });
}

function drawWormholes() {
    wormholes.forEach(wormhole => {
        // Draw entry wormhole with gradient and opacity
        const entryGradient = ctx.createRadialGradient(
            wormhole.entry.x, wormhole.entry.y, 0,
            wormhole.entry.x, wormhole.entry.y, wormhole.entry.radius
        );
        entryGradient.addColorStop(0, `rgba(0, 0, 255, ${wormhole.entry.opacity})`);
        entryGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

        ctx.beginPath();
        ctx.arc(wormhole.entry.x, wormhole.entry.y, wormhole.entry.radius, 0, 2 * Math.PI);
        ctx.fillStyle = entryGradient;
        ctx.fill();

        // Draw entry wormhole stroke with gradient and opacity
        const entryStrokeGradient = ctx.createRadialGradient(
            wormhole.entry.x, wormhole.entry.y, wormhole.entry.radius,
            wormhole.entry.x, wormhole.entry.y, wormhole.entry.radius + 5
        );
        entryStrokeGradient.addColorStop(0, `rgba(255, 0, 0, ${wormhole.entry.opacity})`);
        entryStrokeGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.strokeStyle = entryStrokeGradient;
        ctx.lineWidth = 5;
        ctx.stroke();

        // Draw exit wormhole with gradient and opacity
        const exitGradient = ctx.createRadialGradient(
            wormhole.exit.x, wormhole.exit.y, 0,
            wormhole.exit.x, wormhole.exit.y, wormhole.exit.radius
        );
        exitGradient.addColorStop(0, `rgba(255, 0, 0, ${wormhole.exit.opacity})`);
        exitGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(wormhole.exit.x, wormhole.exit.y, wormhole.exit.radius, 0, 2 * Math.PI);
        ctx.fillStyle = exitGradient;
        ctx.fill();

        // Draw exit wormhole stroke with gradient and opacity
        const exitStrokeGradient = ctx.createRadialGradient(
            wormhole.exit.x, wormhole.exit.y, wormhole.exit.radius,
            wormhole.exit.x, wormhole.exit.y, wormhole.exit.radius + 5
        );
        exitStrokeGradient.addColorStop(0, `rgba(0, 0, 255, ${wormhole.exit.opacity})`);
        exitStrokeGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

        ctx.strokeStyle = exitStrokeGradient;
        ctx.lineWidth = 5;
        ctx.stroke();
    });
}

const PROJECTILE_TELEPORT_COOLDOWN = 500; // Cooldown period in milliseconds

function handleWormholeTeleportation() {
    const currentTime = performance.now();
    const teleportSound = document.getElementById('teleportSound');

    // Check player entry
    if (currentTime - lastPlayerTeleportTime > TELEPORT_COOLDOWN) {
        wormholes.forEach(wormhole => {
            const playerDistanceToEntry = Math.sqrt(
                (player.x - wormhole.entry.x) ** 2 +
                (player.y - wormhole.entry.y) ** 2
            );

            const playerDistanceToExit = Math.sqrt(
                (player.x - wormhole.exit.x) ** 2 +
                (player.y - wormhole.exit.y) ** 2
            );

            if (playerDistanceToEntry < wormhole.entry.radius) {
                player.x = wormhole.exit.x;
                player.y = wormhole.exit.y;
                lastPlayerTeleportTime = currentTime;
                teleportSound.currentTime = 0; // Reset sound to the beginning
                teleportSound.play();
            } else if (playerDistanceToExit < wormhole.exit.radius) {
                player.x = wormhole.entry.x;
                player.y = wormhole.entry.y;
                lastPlayerTeleportTime = currentTime;
                teleportSound.currentTime = 0; // Reset sound to the beginning
                teleportSound.play();
            }
        });
    }

    // Check enemies entry
    enemies.forEach(enemy => {
        if (!lastEnemyTeleportTimes.has(enemy)) {
            lastEnemyTeleportTimes.set(enemy, 0);
        }

        if (currentTime - lastEnemyTeleportTimes.get(enemy) > TELEPORT_COOLDOWN) {
            wormholes.forEach(wormhole => {
                const enemyDistanceToEntry = Math.sqrt(
                    (enemy.x - wormhole.entry.x) ** 2 +
                    (enemy.y - wormhole.entry.y) ** 2
                );

                const enemyDistanceToExit = Math.sqrt(
                    (enemy.x - wormhole.exit.x) ** 2 +
                    (enemy.y - wormhole.exit.y) ** 2
                );

                if (enemyDistanceToEntry < wormhole.entry.radius) {
                    enemy.x = wormhole.exit.x;
                    enemy.y = wormhole.exit.y;
                    lastEnemyTeleportTimes.set(enemy, currentTime);
                } else if (enemyDistanceToExit < wormhole.exit.radius) {
                    enemy.x = wormhole.entry.x;
                    enemy.y = wormhole.entry.y;
                    lastEnemyTeleportTimes.set(enemy, currentTime);
                }
            });
        }
    });

    // Check player projectile entry
    projectiles.forEach(projectile => {
        if (!projectile.lastTeleportTime) {
            projectile.lastTeleportTime = 0;
        }

        if (currentTime - projectile.lastTeleportTime > PROJECTILE_TELEPORT_COOLDOWN) {
            wormholes.forEach(wormhole => {
                const distanceToEntry = Math.sqrt(
                    (projectile.x - wormhole.entry.x) ** 2 +
                    (projectile.y - wormhole.entry.y) ** 2
                );

                const distanceToExit = Math.sqrt(
                    (projectile.x - wormhole.exit.x) ** 2 +
                    (projectile.y - wormhole.exit.y) ** 2
                );

                if (distanceToEntry < wormhole.entry.radius) {
                    projectile.x = wormhole.exit.x;
                    projectile.y = wormhole.exit.y;
                    projectile.lastTeleportTime = currentTime; // Update the last teleport time
                    // Optionally add some logic to slightly adjust the direction if necessary
                } else if (distanceToExit < wormhole.exit.radius) {
                    projectile.x = wormhole.entry.x;
                    projectile.y = wormhole.entry.y;
                    projectile.lastTeleportTime = currentTime; // Update the last teleport time
                    // Optionally add some logic to slightly adjust the direction if necessary
                }
            });
        }
    });

    // Check flamethrower particles entry
    flameParticles.forEach(particle => {
        if (!particle.lastTeleportTime) {
            particle.lastTeleportTime = 0;
        }

        if (currentTime - particle.lastTeleportTime > PROJECTILE_TELEPORT_COOLDOWN) {
            wormholes.forEach(wormhole => {
                const distanceToEntry = Math.sqrt(
                    (particle.x - wormhole.entry.x) ** 2 +
                    (particle.y - wormhole.entry.y) ** 2
                );

                const distanceToExit = Math.sqrt(
                    (particle.x - wormhole.exit.x) ** 2 +
                    (particle.y - wormhole.exit.y) ** 2
                );

                if (distanceToEntry < wormhole.entry.radius) {
                    particle.x = wormhole.exit.x;
                    particle.y = wormhole.exit.y;
                    particle.lastTeleportTime = currentTime; // Update the last teleport time
                } else if (distanceToExit < wormhole.exit.radius) {
                    particle.x = wormhole.entry.x;
                    particle.y = wormhole.entry.y;
                    particle.lastTeleportTime = currentTime; // Update the last teleport time
                }
            });
        }
    });
}


function updatePowerUpPosition(powerUpObj, deltaTime) {
    if (powerUpObj) {
        powerUpObj.x += powerUpObj.speed * powerUpObj.directionX * deltaTime / 1000;
        powerUpObj.y += powerUpObj.speed * powerUpObj.directionY * deltaTime / 1000;

        if (powerUpObj.x < -powerUpObj.width || powerUpObj.x > canvas.width || powerUpObj.y < -powerUpObj.height || powerUpObj.y > canvas.height) {
            if (powerUpObj === powerUp) powerUp = null;
            else if (powerUpObj === bombPowerUp) bombPowerUp = null;
            else if (powerUpObj === homingMissilePowerUp) homingMissilePowerUp = null;
            else if (powerUpObj === shieldPowerUp) shieldPowerUp = null;
            else if (powerUpObj === reversePowerUp) reversePowerUp = null;
            else if (powerUpObj === boostPowerUp) boostPowerUp = null;
        }
    }
}

// Update the homing missile logic
function updateHomingMissiles(deltaTime) {
    homingMissiles.forEach((missile, index) => {
        if (!missile.alive) return; // Skip if the missile is not alive

        // Acquire target if missile has none or if the target is dead
        if (!missile.target || !missile.target.alive) {
            missile.target = enemies.find(enemy => enemy.alive) ||
                             (boss && boss.alive ? boss : null) ||
                             (biomechLeviathan && biomechLeviathan.alive ? biomechLeviathan : null) ||
                             (cyberDragon && cyberDragon.alive ? cyberDragon : null) ||
                             (temporalSerpent && temporalSerpent.alive ? temporalSerpent : null);
        }

        if (missile.target) {
            let targetX, targetY, collisionRadius;

            // Calculate target position and collision radius based on the target type
            if (missile.target === cyberDragon) {
                targetX = missile.target.x;
                targetY = missile.target.y;
                collisionRadius = cyberDragon.projectileCollisionRadius;
            } else if (missile.target === biomechLeviathan) {
                targetX = missile.target.x + biomechLeviathan.width / 2;
                targetY = missile.target.y + biomechLeviathan.height / 2;
                collisionRadius = biomechLeviathan.projectileCollisionRadius;
            } else if (missile.target === boss) {
                targetX = missile.target.x + boss.width / 2;
                targetY = missile.target.y + boss.height / 2;
                collisionRadius = boss.collisionRadius;
            } else if (missile.target === temporalSerpent) {
                const head = temporalSerpent.segments[0]; // Targeting the head
                targetX = head.x;
                targetY = head.y;
                collisionRadius = temporalSerpent.playerCollisionRadius; // Assuming a similar radius to other bosses
            } else {
                targetX = missile.target.x + missile.target.width / 2;
                targetY = missile.target.y + missile.target.height / 2;
                collisionRadius = Math.max(missile.target.width, missile.target.height) / 2;
            }

            // Move the missile towards the target
            const angleToTarget = Math.atan2(targetY - missile.y, targetX - missile.x);
            missile.x += Math.cos(angleToTarget) * missile.speed * deltaTime / 1000 || 0;
            missile.y += Math.sin(angleToTarget) * missile.speed * deltaTime / 1000 || 0;

            // Ensure the missile's position is a valid number
            if (isNaN(missile.x) || isNaN(missile.y)) {
                console.error(`Missile ${index} position is NaN. Skipping update.`);
                return;
            }

            // Define collision circles for the missile and the target
            const missileCircle = { x: missile.x, y: missile.y, radius: missile.width / 2 };
            const targetCircle = { x: targetX, y: targetY, radius: collisionRadius };

            // Check for collision
            if (checkCollision(missileCircle, targetCircle)) {

                // Handle collision effects
                if (missile.target === boss) {
                    boss.health -= missile.damage;
                    if (boss.health <= 0) {
                        boss.alive = false;
			createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2); // Create explosion at boss's position
			explosionSound.play();
                        score += 1000;
                    }
                } else if (missile.target === biomechLeviathan) {
                    biomechLeviathan.health -= missile.damage;
                    if (biomechLeviathan.health <= 0) {
                        biomechLeviathan.alive = false;
			createExplosion(biomechLeviathan.x + biomechLeviathan.width / 2, biomechLeviathan.y + biomechLeviathan.height / 2);
			explosionSound.play();
                        score += 2000;
                    }
                    tractorBeam.active = false;
                    tractorBeamCooldown = true;
                    setTimeout(() => {
                        tractorBeamCooldown = false;
                    }, 5000);
                } else if (missile.target === cyberDragon) {
                    cyberDragon.health -= missile.damage;
                    if (cyberDragon.health <= 0) {
                        cyberDragon.alive = false;
			createExplosion(cyberDragon.x + cyberDragon.width / 2, cyberDragon.y + cyberDragon.height / 2);
			explosionSound.play();
                        score += 3000;
                    }
                } else if (missile.target === temporalSerpent) {
                    temporalSerpent.health -= missile.damage;
                    if (temporalSerpent.health <= 0) {
                        temporalSerpent.alive = false;
                        score += 2000; // Adjust score as needed
                    }
                } else {
                    missile.target.alive = false;
                    enemies = enemies.filter(enemy => enemy.alive);

                    if (missile.target.type === 'enemyTank') {
                        respawnEnemyTank(5000);
                    } else if (missile.target.type === 'stealthEnemy') {
                        respawnStealthEnemy(7000);
                    } else {
                        const enemySpeed = 50 + level * 10;
                        respawnEnemyAfterDelay(enemySpeed, 7000);
                    }
                    score += 10;
                }

                // Play collision sound and remove the missile
                const collisionSoundClone = collisionSound.cloneNode();
                collisionSoundClone.volume = collisionSound.volume;
                collisionSoundClone.play();
                homingMissiles.splice(index, 1);
            }
        } else {
            homingMissiles.splice(index, 1);
        }
    });
}



function drawHomingMissiles() {
    homingMissiles.forEach((missile, index) => {
        if (missile.alive) {

            // Check if the missile is within the canvas bounds
            if (missile.x >= 0 && missile.x <= canvas.width && missile.y >= 0 && missile.y <= canvas.height) {
                ctx.drawImage(homingMissileImage, missile.x - missile.width / 2, missile.y - missile.height / 2, missile.width, missile.height);
            } else {
                
            }
        } else {
            
        }
    });
}

function updateBiomechLeviathan(deltaTime, timestamp) {
    if (!biomechLeviathan) return;

    const angleToPlayer = Math.atan2(player.y - biomechLeviathan.y, player.x - biomechLeviathan.x);
    biomechLeviathan.x += Math.cos(angleToPlayer) * biomechLeviathan.speed * deltaTime / 1000;
    biomechLeviathan.y += Math.sin(angleToPlayer) * biomechLeviathan.speed * deltaTime / 1000;

    // Use tractor beam attack
    biomechLeviathanTractorBeam();

    // Check for other attacks
    const currentTime = performance.now();
    if (biomechLeviathan.phase === 1 && biomechLeviathan.health <= biomechLeviathan.maxHealth * 0.6 && !biomechLeviathan.phaseTransitioned[0]) {
        biomechLeviathan.phaseTransitioned[0] = true;
        biomechLeviathan.phase = 2;
    } else if (biomechLeviathan.phase === 2 && biomechLeviathan.health <= biomechLeviathan.maxHealth * 0.3 && !biomechLeviathan.phaseTransitioned[1]) {
        biomechLeviathan.phaseTransitioned[1] = true;
        biomechLeviathan.phase = 3;
    }

    switch (biomechLeviathan.phase) {
        case 1:
            // Only tractor beam
            break;
        case 2:
            biomechLeviathanInkCloud(); // Use ink cloud attack
            break;
        case 3:
            biomechLeviathanEMPBlast(); // Use EMP blast attack
            break;
    }

    if (biomechLeviathan.health <= 0) {
        biomechLeviathan.alive = false;
	createExplosion(biomechLeviathan.x + biomechLeviathan.width / 2, biomechLeviathan.y + biomechLeviathan.height / 2);
	explosionSound.play();
        score += 2000;
        biomechLeviathan = null;
        level++;
        initLevel(level);
        lastTime = performance.now();
    }
}



function updateAlly(deltaTime, timestamp) {
    if (!ally) return;

    if (ally.entering) {
        // Move the ally onto the screen
        const entrySpeed = ally.speed * deltaTime / 1000;
        switch (ally.enteringSide) {
            case 'left':
                ally.x += entrySpeed;
                if (ally.x >= 50) ally.entering = false;
                break;
            case 'right':
                ally.x -= entrySpeed;
                if (ally.x <= canvas.width - 50) ally.entering = false;
                break;
            case 'top':
                ally.y += entrySpeed;
                if (ally.y >= 50) ally.entering = false;
                break;
            case 'bottom':
                ally.y -= entrySpeed;
                if (ally.y <= canvas.height - 50) ally.entering = false;
                break;
        }
    } else if (!ally.exiting) {
        const distanceToPlayer = Math.sqrt((player.x - ally.x) ** 2 + (player.y - ally.y) ** 2);

        if (distanceToPlayer > allyOrbitRadius + 10) {
            // Move ally towards the player before starting the circular orbit
            const angleToPlayer = Math.atan2(player.y - ally.y, player.x - ally.x);
            ally.x += Math.cos(angleToPlayer) * ally.speed * deltaTime / 1000;
            ally.y += Math.sin(angleToPlayer) * ally.speed * deltaTime / 1000;
        } else {
            switch (ally.pattern) {
                case 'circularOrbit':
                    // New circular orbit pattern
                    allyRotationAngle += (2 * Math.PI * deltaTime) / 5000; // Full rotation every 5 seconds
                    ally.x = player.x + Math.cos(allyRotationAngle) * allyOrbitRadius;
                    ally.y = player.y + Math.sin(allyRotationAngle) * allyOrbitRadius;
                    break;
                case 'followPlayer':
                    // Existing follow player pattern
                    if (distanceToPlayer > 75) {
                        const angleToPlayer = Math.atan2(player.y - ally.y, player.x - ally.x);
                        ally.x += Math.cos(angleToPlayer) * ally.speed * deltaTime / 1000;
                        ally.y += Math.sin(angleToPlayer) * ally.speed * deltaTime / 1000;
                    }
                    break;
            }
        }

        // Fire projectiles in the opposite direction of the player
        if (timestamp % 200 < deltaTime) { // Rapid fire every 200ms
            const angleToPlayer = Math.atan2(player.y - ally.y, player.x - ally.x);
            const fireDirection = angleToPlayer + Math.PI; // Opposite direction
            ally.rotation = fireDirection; // Rotate ally to face the direction it is shooting

            let projectile = {
                x: ally.x,
                y: ally.y,
                width: 5,
                height: 5,
                speed: 500,
                directionX: -Math.cos(angleToPlayer),
                directionY: -Math.sin(angleToPlayer),
                fromPlayer: true,
                traveledDistance: 0, // Add this property
                maxDistance: 1000, // Set a max travel distance
                damage: 25 // Set damage for ally projectiles
            };
            projectiles.push(projectile);
        }

        // Check if the ally's duration has ended
        if (timestamp > allySpawnTime + allyDuration) {
            ally.exiting = true;
            allyOverSound.play(); // Play the ally over sound
        }
    } else {
        // Move the ally off the screen
        let exitSpeed = ally.speed * deltaTime / 1000;
        switch (ally.enteringSide) {
            case 'left':
                ally.x += exitSpeed;
                if (ally.x > canvas.width + ally.width) {
                    ally = null;
                }
                break;
            case 'right':
                ally.x -= exitSpeed;
                if (ally.x < -ally.width) {
                    ally = null;
                }
                break;
            case 'top':
                ally.y += exitSpeed;
                if (ally.y > canvas.height + ally.height) {
                    ally = null;
                }
                break;
            case 'bottom':
                ally.y -= exitSpeed;
                if (ally.y < -ally.height) {
                    ally = null;
                }
                break;
        }
    }
}

function drawAlly() {
    if (ally && ally.active) {
        ctx.save();
        ctx.translate(ally.x, ally.y);
        ctx.rotate(ally.rotation); // Rotate the ally
        ctx.drawImage(allyImage, -ally.width / 2, -ally.height / 2, ally.width, ally.height);
        ctx.restore();
    }
}

function getValidSpawnPosition(width, height) {
    let position;
    let distance;
    let isOverlapping;
    do {
        position = {
            x: Math.random() * (canvas.width - width),
            y: Math.random() * (canvas.height - height)
        };
        distance = Math.sqrt(
            (player.x - position.x) ** 2 +
            (player.y - position.y) ** 2
        );

        // Check if the new entity overlaps with existing entities
        isOverlapping = enemies.some(enemy => {
            const enemyDistance = Math.sqrt(
                (enemy.x - position.x) ** 2 +
                (enemy.y - position.y) ** 2
            );
            return enemyDistance < width + 50; // Add a buffer to prevent overlapping
        }) || coins.some(coin => {
            const coinDistance = Math.sqrt(
                (coin.x - position.x) ** 2 +
                (coin.y - position.y) ** 2
            );
            return coinDistance < width + 50; // Add a buffer to prevent overlapping
        }) || (powerUp && distance < width + 50) || (bombPowerUp && distance < width + 50) || (homingMissilePowerUp && distance < width + 50) || (shieldPowerUp && distance < width + 50);

    } while (distance < 400 || isOverlapping);

    return position;
}


function spawnPowerUp() {
    const position = getOffScreenSpawnPosition(20, 20);
    powerUp = {
        x: position.x,
        y: position.y,
        width: 20,
        height: 20,
        speed: 50,
        directionX: position.directionX,
        directionY: position.directionY
    };
    powerUpSpawned = true;
}

function spawnBombPowerUp() {
    const position = getOffScreenSpawnPosition(30, 30);
    bombPowerUp = {
        x: position.x,
        y: position.y,
        width: 30,
        height: 30,
        speed: 75,
        directionX: position.directionX,
        directionY: position.directionY
    };
    bombSpawned = true;
}

function spawnHomingMissilePowerUp() {
    const position = getOffScreenSpawnPosition(30, 30);
    homingMissilePowerUp = {
        x: position.x,
        y: position.y,
        width: 30,
        height: 30,
        speed: 75,
        directionX: position.directionX,
        directionY: position.directionY
    };
    homingMissileSpawned = true;
}

function spawnShieldPowerUp() {
    const position = getOffScreenSpawnPosition(30, 30);
    shieldPowerUp = {
        x: position.x,
        y: position.y,
        width: 30,
        height: 30,
        speed: 50,
        directionX: position.directionX,
        directionY: position.directionY
    };
    shieldPowerUpSpawned = true;
}

function spawnReversePowerUp() {
    const position = getOffScreenSpawnPosition(30, 30); // Match dimensions with other power-ups
    reversePowerUp = {
        x: position.x,
        y: position.y,
        width: 30,
        height: 30,
        speed: 150,
        directionX: position.directionX,
        directionY: position.directionY
    };
    reversePowerUpSpawned = true;
}

function spawnBoostPowerUp() {
    const position = getOffScreenSpawnPosition(30, 30);
    boostPowerUp = {
        x: position.x,
        y: position.y,
        width: 30,
        height: 30,
        speed: 100,
        directionX: position.directionX,
        directionY: position.directionY
    };
    boostPowerUpSpawnedThisLevel = true; // Correctly set the flag
}

function spawnFlamethrowerPowerUp() {
    const position = getOffScreenSpawnPosition(30, 30);
    flamethrowerPowerUp = {
        x: position.x,
        y: position.y,
        width: 30,
        height: 30,
        speed: 100,
        directionX: position.directionX,
        directionY: position.directionY
    };
    flamethrowerSpawnedThisLevel = true;
}

function updateFlamethrowerPosition(deltaTime) {
    if (flamethrowerPowerUp) {
        flamethrowerPowerUp.x += flamethrowerPowerUp.speed * flamethrowerPowerUp.directionX * deltaTime / 1000;
        flamethrowerPowerUp.y += flamethrowerPowerUp.speed * flamethrowerPowerUp.directionY * deltaTime / 1000;

        if (flamethrowerPowerUp.x < -flamethrowerPowerUp.width || flamethrowerPowerUp.x > canvas.width || flamethrowerPowerUp.y < -flamethrowerPowerUp.height || flamethrowerPowerUp.y > canvas.height) {
            flamethrowerPowerUp = null;
        }
    }
}

function getRandomBorderPosition() {
    let side = Math.floor(Math.random() * 4);
    let position = { x: 0, y: 0 };

    switch (side) {
        case 0:
            position.x = Math.random() * canvas.width;
            position.y = -50;
            break;
        case 1:
            position.x = canvas.width + 50;
            position.y = Math.random() * canvas.height;
            break;
        case 2:
            position.x = Math.random() * canvas.width;
            position.y = canvas.height + 50;
            break;
        case 3:
            position.x = -50;
            position.y = Math.random() * canvas.height;
            break;
    }

    return position;
}

function resetPowerUpTimers() {
    powerUp = null;
    powerUpSpawned = false;
    powerUpSpawnTime = performance.now() + Math.random() * 5000 + 2000;
    powerUpSpawnedThisLevel = false;

    bombPowerUp = null;
    bombSpawned = false;
    bombPowerUpSpawnTime = performance.now() + Math.random() * 5000 + 6000;
    bombPowerUpSpawnedThisLevel = false;

    homingMissilePowerUp = null;
    homingMissileSpawned = false;
    homingMissilePowerUpSpawnTime = performance.now() + Math.random() * 5000 + 14000;
    homingMissilePowerUpSpawnedThisLevel = false;

    shieldPowerUp = null;
    shieldPowerUpSpawned = false;
    shieldPowerUpSpawnTime = performance.now() + Math.random() * 5000 + 10000;
    shieldPowerUpSpawnedThisLevel = false;

    reversePowerUp = null;
    reversePowerUpSpawned = false;
    reversePowerUpSpawnTime = performance.now() + Math.random() * 5000 + 10000;
    reversePowerUpSpawnedThisLevel = false;

    boostPowerUp = null;
    boostPowerUpSpawned = false;
    boostPowerUpSpawnTime = performance.now() + Math.random() * 5000 + 10000;
    boostPowerUpSpawnedThisLevel = false;

    flamethrowerPowerUp = null;
    flamethrowerSpawned = false;
    flamethrowerSpawnTime = performance.now() + Math.random() * 5000 + 15000;
    flamethrowerSpawnedThisLevel = false;
}

function getBossForLevel(level) {
    const bosses = ['boss', 'biomechLeviathan', 'cyberDragon', 'temporalSerpent'];
    const bossIndex = (Math.floor((level - 5) / 5)) % bosses.length;
    return bosses[bossIndex];
}

function initLevel(level) {
    // Clear existing timeouts
    enemyRespawnTimeouts.forEach(timeout => clearTimeout(timeout));
    enemyRespawnTimeouts = [];

    enemies = [];
    projectiles = [];
    player.velocity = { x: 0, y: 0 };
    player.thrust = 0;

    // Clear Tractor beam
    if (tractorBeam) {
        tractorBeam.active = false;
        tractorBeam.startX = 0;
        tractorBeam.startY = 0;
        tractorBeam.endX = 0;
        tractorBeam.endY = 0;
        tractorBeam.strength = 0;
        tractorBeam = null;
    }
    tractorBeamCooldown = false;

    // Clear asteroids
    asteroids = [];
    // Clear serpent segments
    clearSerpentSegments();

    const isBossLevel = level % 5 === 0;

    if (isBossLevel) {
        const bossName = getBossForLevel(level);

        switch (bossName) {
            case 'boss':
                spawnBoss();
                break;
            case 'biomechLeviathan':
                spawnBiomechLeviathan();
                break;
            case 'cyberDragon':
                spawnCyberDragon();
                break;
            case 'temporalSerpent':
                spawnTemporalSerpent();
                break;
            default:
                console.error('Unknown boss:', bossName);
        }
        countdown = Infinity;
    } else {
        const enemySpeed = 50 + level;
        let numRegularEnemies = Math.min(level, MAX_REGULAR_ENEMIES);
        let numEnemyTanks = level >= 3 ? Math.min(Math.ceil(level * 0.3), MAX_ENEMY_TANKS) : 0;
        let numStealthEnemies = level >= 6 ? Math.min(Math.ceil(level * 0.2), MAX_STEALTH_ENEMIES) : 0;

        for (let i = 0; i < numRegularEnemies; i++) {
            spawnEnemy(enemySpeed);
        }

        for (let i = 0; i < numEnemyTanks; i++) {
            spawnEnemyTank();
        }

        for (let i = 0; i < numStealthEnemies; i++) {
            spawnStealthEnemy();
        }

        countdown = levelDuration / 1000; // Set countdown for non-boss levels
    }

    coins = [];
    for (let i = 0; i < 5; i++) {
        coins.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            width: 20,
            height: 20
        });
    }

    resetPowerUpTimers();

    levelStartTime = performance.now();
    countdown = isBossLevel ? Infinity : levelDuration / 1000;

    manageMusic();
    initWormholes(level);
}

function spawnBoss() {
    const offScreenMargin = 100; // Distance off the screen for spawning
    const side = Math.floor(Math.random() * 4);
    let position = { x: 0, y: 0 };

    switch (side) {
        case 0: // Spawn from the top
            position.x = Math.random() * canvas.width;
            position.y = -offScreenMargin - 100;
            break;
        case 1: // Spawn from the bottom
            position.x = Math.random() * canvas.width;
            position.y = canvas.height + offScreenMargin + 100;
            break;
        case 2: // Spawn from the left
            position.x = -offScreenMargin - 100;
            position.y = Math.random() * canvas.height;
            break;
        case 3: // Spawn from the right
            position.x = canvas.width + offScreenMargin + 100;
            position.y = Math.random() * canvas.height;
            break;
    }

    boss = {
        x: position.x,
        y: position.y,
        width: 100,
        height: 100,
        speed: 50,
        health: 1000,
        maxHealth: 1000,
        lastShotTime: 0,
        shootInterval: 2000,
        canShoot: false,
        alive: true,
        phase: 1,
        phaseTransitioned: [false, false, false],
     	collisionRadius: 75
    };

    setTimeout(() => {
        if (boss) boss.canShoot = true;
    }, 5000);
}

function drawBoss() {
    if (boss && boss.alive) {
        ctx.save();

        // Translate to the center of the boss's collision circle
        ctx.translate(boss.x, boss.y);

        // Draw the boss image, offsetting by half its width and height
        ctx.drawImage(
            bossImage,
            -boss.width / 2 + 100, // Offset by half the width for centering
            -boss.height / 2 + 100, // Offset by half the height for centering
            boss.width,
            boss.height
        );

        ctx.restore();
    }
}

function createHeatSeekingProjectile(boss) {
    return {
        x: boss.x,
        y: boss.y,
        width: 40,
        height: 40,
        speed: 300,
        directionX: 0,
        directionY: 0,
        heatSeeking: true,
        target: player, // Ensure it targets the player
        maxDistance: 800,
        traveledDistance: 0,
        damage: 10
    };
}

function drawBossHealthBar(boss) {
    const barWidth = boss.width;
    const barHeight = 10;
    const barX = boss.x;
    const barY = boss.y + boss.height + 5;
    const healthRatio = boss.health / 1000; // Assuming boss's maximum health is 1000

    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}


function bossAttackPattern1() {
    // Simple projectile attack
    let bossProjectile = {
        x: boss.x + boss.width / 2,
        y: boss.y + boss.height,
        width: 40,
        height: 40,
        speed: 250,
        directionX: (player.x - boss.x) / Math.sqrt((player.x - boss.x) ** 2 + (player.y - boss.y) ** 2),
        directionY: (player.y - boss.y) / Math.sqrt((player.x - boss.x) ** 2 + (player.y - boss.y) ** 2),
        fromPlayer: false,
        fromBoss: true,
        heatSeeking: true
    };
    projectiles.push(bossProjectile);
}

function bossAttackPattern2() {
    // Spread shot attack
    for (let i = -2; i <= 2; i++) {
        let angle = Math.atan2(player.y - boss.y, player.x - boss.x) + (i * Math.PI / 12);
        let bossProjectile = {
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height,
            width: 25,
            height: 25,
            speed: 275,
            directionX: Math.cos(angle),
            directionY: Math.sin(angle),
            fromPlayer: false,
            fromBoss: true,
            heatSeeking: false
        };
        projectiles.push(bossProjectile);
    }
}

function bossAttackPattern3() {
    const numberOfProjectiles = 10;
    const angleIncrement = (2 * Math.PI) / numberOfProjectiles;

    for (let i = 0; i < numberOfProjectiles; i++) {
        let angle = i * angleIncrement;
        let bossProjectile = {
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2, // Ensure the projectiles start from the center of the boss
            width: 20,
            height: 20,
            speed: 350,
            directionX: Math.cos(angle),
            directionY: Math.sin(angle),
            fromPlayer: false,
            fromBoss: true,
            heatSeeking: false
        };
        projectiles.push(bossProjectile);
    }
} 

function updateBoss(deltaTime, timestamp) {
    if (!boss) return;

    const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
    boss.x += Math.cos(angleToPlayer) * boss.speed * deltaTime / 1000;
    boss.y += Math.sin(angleToPlayer) * boss.speed * deltaTime / 1000;

    if (boss.health < boss.maxHealth * 0.6 && boss.phase === 1 && !boss.phaseTransitioned[1]) {
        boss.phase = 2;
        boss.phaseTransitioned[1] = true;
        boss.speed += 20;
    } else if (boss.health < boss.maxHealth * 0.2 && boss.phase === 2 && !boss.phaseTransitioned[2]) {
        boss.phase = 3;
        boss.phaseTransitioned[2] = true;
        boss.shootInterval = 1000;
    }

    if (boss.canShoot && timestamp - boss.lastShotTime > boss.shootInterval) {
        switch (boss.phase) {
            case 1:
                bossAttackPattern1();
                break;
            case 2:
                bossAttackPattern2();
                break;
            case 3:
                bossAttackPattern3();
                break;
        }
        boss.lastShotTime = timestamp;
    }

if (boss && boss.health <= 0) {
    boss.alive = false;
    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2); // Create explosion at boss's position
    score += 1000;
    boss = null;
    level++;
    initLevel(level);
    lastTime = performance.now();
}
}


function updatePowerUps(deltaTime, timestamp) {
    const totalPowerUps = (powerUp ? 1 : 0) + (bombPowerUp ? 1 : 0) + (homingMissilePowerUp ? 1 : 0) + (shieldPowerUp ? 1 : 0) + (reversePowerUp ? 1 : 0) + (boostPowerUp ? 1 : 0);

    if (!powerUp && timestamp >= powerUpSpawnTime && !powerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
        spawnPowerUp();
        powerUpSpawnedThisLevel = true;
    }
    if (!bombPowerUp && timestamp >= bombSpawnTime && !bombPowerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
        spawnBombPowerUp();
        bombPowerUpSpawnedThisLevel = true;
    }
    if (!homingMissilePowerUp && timestamp >= homingMissilePowerUpSpawnTime && !homingMissilePowerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
        spawnHomingMissilePowerUp();
        homingMissilePowerUpSpawnedThisLevel = true;
    }
    if (!shieldPowerUp && timestamp >= shieldPowerUpSpawnTime && !shieldPowerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
        spawnShieldPowerUp();
        shieldPowerUpSpawnedThisLevel = true;
    }
    if (!reversePowerUp && timestamp >= reversePowerUpSpawnTime && !reversePowerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
        spawnReversePowerUp();
        reversePowerUpSpawnedThisLevel = true;
    }
    if (!boostPowerUp && timestamp >= boostPowerUpSpawnTime && !boostPowerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
        spawnBoostPowerUp();
        boostPowerUpSpawnedThisLevel = true;
    }
    if (!flamethrowerPowerUp && timestamp >= flamethrowerSpawnTime && !flamethrowerSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
        spawnFlamethrowerPowerUp();
        flamethrowerSpawnedThisLevel = true;
    }

    updateSineWavePowerUp(powerUp, deltaTime, 'powerUp');
    updateSineWavePowerUp(bombPowerUp, deltaTime, 'bombPowerUp');
    updateSineWavePowerUp(homingMissilePowerUp, deltaTime, 'homingMissilePowerUp');
    updateSineWavePowerUp(shieldPowerUp, deltaTime, 'shieldPowerUp');
    updateSineWavePowerUp(reversePowerUp, deltaTime, 'reversePowerUp');
    updateSineWavePowerUp(boostPowerUp, deltaTime, 'boostPowerUp');
    updateSineWavePowerUp(flamethrowerPowerUp, deltaTime, 'flamethrowerPowerUp');
}

function updateSineWavePowerUp(powerUpObj, deltaTime, type) {
    if (powerUpObj) {
        const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
        const powerUpCircle = { x: powerUpObj.x + powerUpObj.width / 2, y: powerUpObj.y + powerUpObj.height / 2, radius: powerUpObj.width / 2 };

        if (checkCollision(playerCircle, powerUpCircle)) {
            if (type === 'powerUp') {
                powerUpActive = true;
                powerUpExpirationTime = performance.now() + 15000; // Set the power-up duration
            } else if (type === 'bombPowerUp') {
                bombs++;
            } else if (type === 'homingMissilePowerUp') {
                homingMissilesInventory++;
            } else if (type === 'shieldPowerUp') {
                shieldActive = true;
                shieldPowerUpExpirationTime = performance.now() + 15000; // Set the shield power-up duration
            } else if (type === 'reversePowerUp') {
                reversePowerUpActive = true;
                reversePowerUpExpirationTime = performance.now() + 10000; // Set the reverse power-up duration to 10 seconds
            } else if (type === 'boostPowerUp') {
                boostPowerUpActive = true;
                boostPowerUpExpirationTime = performance.now() + 10000; // Set the boost power-up duration to 10 seconds
                boostCooldownEndTime = performance.now(); // Reset boost cooldown timer
            } else if (type === 'flamethrowerPowerUp') {
                flamethrowerActive = true;
                flamethrowerExpirationTime = performance.now() + 10000; // Set the flamethrower duration to 10 seconds
            }
            const powerUpSoundClone = powerUpSound.cloneNode();
            powerUpSoundClone.volume = soundEffectsVolumeSlider.value;
            powerUpSoundClone.play();

            // Remove the power-up
            if (type === 'powerUp') powerUp = null;
            else if (type === 'bombPowerUp') bombPowerUp = null;
            else if (type === 'homingMissilePowerUp') homingMissilePowerUp = null;
            else if (type === 'shieldPowerUp') shieldPowerUp = null;
            else if (type === 'reversePowerUp') reversePowerUp = null;
            else if (type === 'boostPowerUp') boostPowerUp = null;
            else if (type === 'flamethrowerPowerUp') flamethrowerPowerUp = null;
        } else {
            powerUpObj.x += powerUpObj.speed * powerUpObj.directionX * deltaTime / 1000;
            powerUpObj.y += Math.sin(powerUpObj.x / 50) * 1.5; // Sine wave motion

            if (powerUpObj.y < 0 || powerUpObj.y + powerUpObj.height > canvas.height) {
                powerUpObj.directionY *= -1;
                powerUpObj.y = Math.max(0, Math.min(powerUpObj.y, canvas.height - powerUpObj.height));
            }

            if (powerUpObj.x < -powerUpObj.width || powerUpObj.x > canvas.width) {
                if (type === 'powerUp') powerUp = null;
                else if (type === 'bombPowerUp') bombPowerUp = null;
                else if (type === 'homingMissilePowerUp') homingMissilePowerUp = null;
                else if (type === 'shieldPowerUp') shieldPowerUp = null;
                else if (type === 'reversePowerUp') reversePowerUp = null;
                else if (type === 'boostPowerUp') boostPowerUp = null;
                else if (type === 'flamethrowerPowerUp') flamethrowerPowerUp = null;
            }
        }
    }
}



function spawnEnemy() {
    const currentRegularEnemies = enemies.filter(enemy => enemy.type === 'regular').length;
    if (currentRegularEnemies >= MAX_REGULAR_ENEMIES) return;

    const position = getOffScreenSpawnPosition(50, 50);
    let enemy = {
        type: 'regular',
        x: position.x,
        y: position.y,
        width: 50,
        height: 50,
        speed: 50 + level,
        directionX: position.directionX,
        directionY: position.directionY,
        shootInterval: Math.random() * 2000 + 3000,
        lastShotTime: 0,
        canShoot: false,
        alive: true,
        health: ENEMY_HEALTH
    };
    enemies.push(enemy);

    setTimeout(() => {
        enemy.canShoot = true;
    }, 2000);
}

function spawnEnemyTank() {
    const currentEnemyTanks = enemies.filter(enemy => enemy.type === 'enemyTank').length;
    if (currentEnemyTanks >= MAX_ENEMY_TANKS) return;

    const position = getOffScreenSpawnPosition(60, 60);
    let enemyTank = {
        type: 'enemyTank',
        x: position.x,
        y: position.y,
        width: 60,
        height: 60,
        speed: 60,
        directionX: position.directionX,
        directionY: position.directionY,
        shootInterval: Math.random() * 1000 + 2000,
        lastShotTime: 0,
        canShoot: false,
        alive: true,
        health: TANK_HEALTH
    };
    enemies.push(enemyTank);

    setTimeout(() => {
        enemyTank.canShoot = true;
    }, 2000);
}

function spawnStealthEnemy() {
    const currentStealthEnemies = enemies.filter(enemy => enemy.type === 'stealthEnemy').length;
    if (currentStealthEnemies >= MAX_STEALTH_ENEMIES) return;

    const position = getOffScreenSpawnPosition(50, 50);
    let stealthEnemy = {
        type: 'stealthEnemy',
        x: position.x,
        y: position.y,
        width: 50,
        height: 50,
        speed: 150,
        directionX: position.directionX,
        directionY: position.directionY,
        visible: false,
        opacity: 0,
        visibleStartTime: performance.now(),
        visibleDuration: 3000, // 3 seconds visible
        invisibleDuration: 3000, // 3 seconds invisible
        health: ENEMY_HEALTH,
        alive: true,
        canShoot: false,
        lastShotTime: 0,
        shootInterval: Math.random() * 1000 + 1000 // Random shooting interval between 2-5 seconds
    };

    enemies.push(stealthEnemy);

    setTimeout(() => {
        stealthEnemy.canShoot = true;
    }, 2000);
}


function respawnEnemyAfterDelay(speed, delay) {
    if (level % 5 === 0) return;

    const timeout = setTimeout(() => {
        const currentRegularEnemies = enemies.filter(enemy => enemy.type === 'regular').length;
        if (currentRegularEnemies < MAX_REGULAR_ENEMIES) {
            spawnEnemy(speed);
        }
    }, delay);
    enemyRespawnTimeouts.push(timeout);
}

function respawnEnemyTank(delay) {
    if (level % 5 === 0 || level <= 5) return;

    const timeout = setTimeout(() => {
        const currentEnemyTanks = enemies.filter(enemy => enemy.type === 'enemyTank').length;
        if (currentEnemyTanks >= MAX_ENEMY_TANKS) return;

        let position;
        let distance;
        let isOverlapping;
        do {
            position = getRandomBorderPosition();
            distance = Math.sqrt(
                (player.x - position.x) ** 2 +
                (player.y - position.y) ** 2
            );

            // Check if the new enemy tank overlaps with existing enemies
            isOverlapping = enemies.some(enemy => {
                const enemyDistance = Math.sqrt(
                    (enemy.x - position.x) ** 2 +
                    (enemy.y - position.y) ** 2
                );
                return enemyDistance < enemy.width + 60; // Add a buffer to prevent overlapping
            });
        } while (distance < 400 || isOverlapping);

        let enemyTank = {
            type: 'enemyTank',
            x: position.x,
            y: position.y,
            width: 60,
            height: 60,
            speed: 60,
            directionX: (player.x - position.x) / Math.sqrt((player.x - position.x) ** 2 + (player.y - position.y) ** 2),
            directionY: (player.y - position.y) / Math.sqrt((player.x - position.x) ** 2 + (player.y - position.y) ** 2),
            shootInterval: Math.random() * 1000 + 2000,
            lastShotTime: 0,
            canShoot: false,
            alive: true,
            health: TANK_HEALTH
        };
        enemies.push(enemyTank);

        setTimeout(() => {
            enemyTank.canShoot = true;
        }, 2000);
    }, delay + 1000);
    enemyRespawnTimeouts.push(timeout);
}

function respawnStealthEnemy(delay) {
    if (level % 5 === 0 || level <= 10) return;

    const timeout = setTimeout(() => {
        const currentStealthEnemies = enemies.filter(enemy => enemy.type === 'stealthEnemy').length;
        if (currentStealthEnemies >= MAX_STEALTH_ENEMIES) return;

        let position;
        let distance;
        let isOverlapping;
        do {
            position = getRandomBorderPosition();
            distance = Math.sqrt(
                (player.x - position.x) ** 2 +
                (player.y - position.y) ** 2
            );

            // Check if the new stealth enemy overlaps with existing enemies
            isOverlapping = enemies.some(enemy => {
                const enemyDistance = Math.sqrt(
                    (enemy.x - position.x) ** 2 +
                    (enemy.y - position.y) ** 2
                );
                return enemyDistance < enemy.width + 50; // Add a buffer to prevent overlapping
            });
        } while (distance < 400 || isOverlapping);

        let stealthEnemy = {
            type: 'stealthEnemy',
            x: position.x,
            y: position.y,
            width: 50,
            height: 50,
            speed: 150,
            directionX: (player.x - position.x) / Math.sqrt((player.x - position.x) ** 2 + (player.y - position.y) ** 2),
            directionY: (player.y - position.y) / Math.sqrt((player.x - position.x) ** 2 + (player.y - position.y) ** 2),
            visible: false,
            opacity: 0,
            visibleStartTime: performance.now(),
            visibleDuration: 3000, // 3 seconds visible
            invisibleDuration: 3000, // 3 seconds invisible
            health: ENEMY_HEALTH,
            alive: true,
            canShoot: false,
            lastShotTime: 0,
            shootInterval: Math.random() * 1000 + 1000 // Random shooting interval between 2-5 seconds
        };

        enemies.push(stealthEnemy);

        setTimeout(() => {
            stealthEnemy.canShoot = true;
        }, 2000);
    }, delay);
    enemyRespawnTimeouts.push(timeout);
}


function getOffScreenSpawnPosition(width, height) {
    const side = Math.random() < 0.5 ? 'left' : 'right'; // Randomly choose left or right side
    const position = {
        x: side === 'left' ? -width : canvas.width,
        y: VERTICAL_MARGIN + Math.random() * (canvas.height - height - 2 * VERTICAL_MARGIN), // Ensure vertical spawn within margin
        directionX: side === 'left' ? 1 : -1, // Set direction based on spawn position
        directionY: 0 // Only horizontal movement
    };
    return position;
}



function fireProjectile() {
    if (isMenuOpen || flamethrowerActive) return;

    const chargeDuration = (performance.now() - spacebarPressedTime) / 1000;
    let projectileSize = 5;
    let projectileSpeed = 500;
    let damage = PROJECTILE_DAMAGE;
    let isCharged = false;

    if (chargeDuration >= 2) {
        projectileSize = 30;
        projectileSpeed = 300;
        damage = FULLY_CHARGED_PROJECTILE_DAMAGE;
        isCharged = true;
    } else if (chargeDuration >= 1) {
        projectileSize = 20;
        projectileSpeed = 400;
        damage = PARTIALLY_CHARGED_PROJECTILE_DAMAGE;
    }

    const projectilesToFire = powerUpActive ? 3 : 1;
    for (let i = 0; i < projectilesToFire; i++) {
        const angleOffset = powerUpActive ? (i - 1) * (Math.PI / 18) : 0;
        let projectile = {
            x: player.x + Math.cos(player.rotation + angleOffset) * player.width / 2,
            y: player.y + Math.sin(player.rotation + angleOffset) * player.height / 2,
            width: projectileSize,
            height: projectileSize,
            speed: projectileSpeed,
            directionX: Math.cos(player.rotation + angleOffset),
            directionY: Math.sin(player.rotation + angleOffset),
            fromPlayer: true,
            isCharged: isCharged,
            traveledDistance: 0,
            damage: damage,
            split: false
        };
        projectiles.push(projectile);
    }

    if (reversePowerUpActive) {
        for (let i = 0; i < 3; i++) {
            const angleOffset = (i - 1) * (Math.PI / 18);
            let reverseProjectile = {
                x: player.x - Math.cos(player.rotation + angleOffset) * player.width / 2,
                y: player.y - Math.sin(player.rotation + angleOffset) * player.height / 2,
                width: projectileSize,
                height: projectileSize,
                speed: projectileSpeed,
                directionX: -Math.cos(player.rotation + angleOffset),
                directionY: -Math.sin(player.rotation + angleOffset),
                fromPlayer: true,
                isCharged: isCharged,
                traveledDistance: 0,
                damage: damage,
                split: false
            };
            projectiles.push(reverseProjectile);
        }
    }

    const fireSoundClone = fireSound.cloneNode();
    fireSoundClone.volume = fireSound.volume;
    fireSoundClone.play();
}

function splitChargedProjectile(projectile) {
    const numberOfProjectiles = 8;
    const angleIncrement = (2 * Math.PI) / numberOfProjectiles;

    for (let i = 0; i < numberOfProjectiles; i++) {
        const angle = i * angleIncrement;
        let splitProjectile = {
            x: projectile.x,
            y: projectile.y,
            width: 5,
            height: 5,
            speed: 500,
            directionX: Math.cos(angle),
            directionY: Math.sin(angle),
            fromPlayer: true,
            isCharged: false,
	    maxDistance: 800,
            traveledDistance: 0,
            damage: SPLIT_PROJECTILE_DAMAGE,
            split: true
        };
        projectiles.push(splitProjectile);
    }
}

class FlameParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 20 + 10;
        const r = 255;
        const g = Math.random() * 150 + 50; // Increase the lower limit for green
        const b = Math.random() * 50; // Add a small amount of blue for more variation
        this.color = `rgba(${r}, ${g}, ${b}, 1)`;
        this.velocity = {
            x: Math.cos(player.rotation) * 10 + (Math.random() - 0.5) * 2,
            y: Math.sin(player.rotation) * 10 + (Math.random() - 0.5) * 2,
        };
        this.alpha = 1; // transparency
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.size *= 0.96;
        this.alpha -= 0.02;
    }

    draw(ctx) {
        if (this.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }
}

function createFlameParticle() {
    const flameParticle = new FlameParticle(player.x + Math.cos(player.rotation) * player.width / 2, player.y + Math.sin(player.rotation) * player.height / 2);
    flameParticles.push(flameParticle);
}


function updateFlameParticles() {
    for (let i = flameParticles.length - 1; i >= 0; i--) {
        const particle = flameParticles[i];
        particle.update();
        if (particle.size < 0.5 || particle.alpha <= 0) {
            flameParticles.splice(i, 1); // Remove expired particles
        }
    }
}

function drawFlameParticles(ctx) {
    flameParticles.forEach(particle => particle.draw(ctx));
}

function checkFlameDamage() {
    flameParticles.forEach(particle => {
        // Check damage to regular enemies
        enemies.forEach((enemy, enemyIndex) => {
            const dx = particle.x - (enemy.x + enemy.width / 2);
            const dy = particle.y - (enemy.y + enemy.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < enemy.width / 2) {
                enemy.health -= 1; // Adjust the damage value as needed
                
                // Play torch sound on collision
                if (torchSound) {
                    if (torchSound.paused) {
                        torchSound.play();
                    } else {
                        torchSound.currentTime = 0; // Reset sound if it's already playing
                        torchSound.play();
                    }
                }

                if (enemy.health <= 0) {
                    // Handle enemy death
                    score += 10; // Increase score or any other logic

                    // Call the appropriate respawn function based on enemy type
                    if (enemy.type === 'enemyTank') {
                        respawnEnemyTank(5000);
                    } else if (enemy.type === 'stealthEnemy') {
                        respawnStealthEnemy(7000);
                    } else {
                        const enemySpeed = 50 + level * 10;
                        respawnEnemyAfterDelay(enemySpeed, 7000);
                    }

                    enemies.splice(enemyIndex, 1);
                }
            }
        });

        // Check damage to projectiles
        projectiles.forEach((projectile, index) => {
            const dx = particle.x - (projectile.x + projectile.width / 2);
            const dy = particle.y - (projectile.y + projectile.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < projectile.width / 2) {
                // Remove the projectile
                projectiles.splice(index, 1);
            }
        });

        // Check damage to boss
        if (boss) {
            const dx = particle.x - (boss.x + boss.width / 2);
            const dy = particle.y - (boss.y + boss.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < boss.width / 2) {
                boss.health -= 0.1; // Slow but constant damage to the boss
                if (boss.health <= 0) {
                    // Handle boss death
                    score += 1000; // Increase score or any other logic
		    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2); // Create explosion at boss's position
		    explosionSound.play();

                    boss = null; // Remove the boss
                }
            }
        }

        // Check damage to Cyber Dragon
        if (cyberDragon) {
            const dx = particle.x - (cyberDragon.x + cyberDragon.width / 2);
            const dy = particle.y - (cyberDragon.y + cyberDragon.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < cyberDragon.width / 2) {
                cyberDragon.health -= 0.1; // Slow but constant damage to the Cyber Dragon
                if (cyberDragon.health <= 0) {
                    // Handle Cyber Dragon death
		    createExplosion(cyberDragon.x + cyberDragon.width / 2, cyberDragon.y + cyberDragon.height / 2);
		    explosionSound.play();
                    score += 3000; // Increase score or any other logic
                    cyberDragon = null; // Remove the Cyber Dragon
                }
            }
        }

        // Check damage to Biomech
        if (biomechLeviathan) {
            const dx = particle.x - (biomechLeviathan.x + biomechLeviathan.width / 2);
            const dy = particle.y - (biomechLeviathan.y + biomechLeviathan.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < biomechLeviathan.width / 2) {
                biomechLeviathan.health -= 0.1; // Slow but constant damage to the Biomech
                if (biomechLeviathan.health <= 0) {
                    // Handle Biomech death
                    score += 2000; // Increase score or any other logic
               	    createExplosion(biomechLeviathan.x + biomechLeviathan.width / 2, biomechLeviathan.y + biomechLeviathan.height / 2);
	            explosionSound.play();

                    biomechLeviathan = null; // Remove the Biomech
                }
            }
        }

        // Check damage to Temporal Serpent
        if (temporalSerpent) {
            const dx = particle.x - (temporalSerpent.x + temporalSerpent.width / 2);
            const dy = particle.y - (temporalSerpent.y + temporalSerpent.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < temporalSerpent.width / 2) {
                temporalSerpent.health -= 0.1; // Slow but constant damage to the Temporal Serpent
                if (temporalSerpent.health <= 0) {
                    // Handle Temporal Serpent death
                    score += 300; // Increase score or any other logic
                    temporalSerpent = null; // Remove the Temporal Serpent
                }
            }
        }
    });
}

function useBomb() {
    if (bombs > 0 && !bombActive) {
        bombs--;
        bombActive = true;
        bombFlashTime = performance.now(); // Set the flash start time

        // Play bomb sound
        bombSound.currentTime = 0;
        bombSound.play();

        // Bomb effect logic (damage and other effects)
        const playerCircle = { x: player.x, y: player.y, radius: BOMB_RADIUS };

        // Handle enemy destruction
        enemies = enemies.filter(enemy => {
            const enemyCircle = { x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, radius: enemy.width / 2 };
            if (checkCollision(playerCircle, enemyCircle)) {
                if (enemy.type === 'enemyTank') {
                    respawnEnemyTank(5000);
                } else if (enemy.type === 'stealthEnemy') {
                    respawnStealthEnemy(7000);
                } else {
                    const enemySpeed = 50 + level * 10;
                    respawnEnemyAfterDelay(enemySpeed, 7000);
                }
                score += 10;
                return false;
            }
            return true;
        });

        // Handle projectile destruction
        projectiles = projectiles.filter(projectile => {
            if (!projectile.fromPlayer) {
                const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
                if (checkCollision(playerCircle, projectileCircle)) {
                    return false;
                }
            }
            return true;
        });

        // Handle spiral projectile destruction
        if (cyberDragon && cyberDragon.spiralProjectiles) {
            cyberDragon.spiralProjectiles = cyberDragon.spiralProjectiles.filter(projectile => {
                const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.radius };
                return !checkCollision(playerCircle, projectileCircle);
            });
        }

        // Handle boss damage
        if (boss && !bossHitByBomb) {
            const bossCircle = { x: boss.x + boss.width / 2, y: boss.y + boss.height / 2, radius: boss.width / 2 };
            if (checkCollision(playerCircle, bossCircle)) {
                boss.health -= BOMB_DAMAGE;
                bossHitByBomb = true;
                if (boss.health <= 0) {
                    boss.alive = false;
		    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2); // Create explosion at boss's position
		    explosionSound.play();
                    score += 1000;
                }
            }
        }

        // Handle biomech leviathan damage
        if (biomechLeviathan && biomechLeviathan.alive && !biomechHitByBomb) {
            const biomechLeviathanCircle = { x: biomechLeviathan.x, y: biomechLeviathan.y, radius: biomechLeviathan.width / 2 };
            if (checkCollision(playerCircle, biomechLeviathanCircle)) {
                biomechLeviathan.health -= BOMB_DAMAGE;
                biomechHitByBomb = true;
                if (biomechLeviathan.health <= 0) {
                    biomechLeviathan.alive = false;
		    createExplosion(biomechLeviathan.x + biomechLeviathan.width / 2, biomechLeviathan.y + biomechLeviathan.height / 2);
		    explosionSound.play();
                    score += 2000;
                } else {
                    // Stop the tractor beam and start the cooldown
                    tractorBeam.active = false;
                    tractorBeamCooldown = true;
                    setTimeout(() => {
                        tractorBeamCooldown = false;
                    }, 5000);
                }
            }
        }

        // Handle cyber dragon damage
        if (cyberDragon && cyberDragon.alive && !cyberDragonHitByBomb) {
            const cyberDragonCircle = { x: cyberDragon.x, y: cyberDragon.y, radius: cyberDragon.width / 2 };
            if (checkCollision(playerCircle, cyberDragonCircle)) {
                cyberDragon.health -= BOMB_DAMAGE;
                cyberDragonHitByBomb = true;
                if (cyberDragon.health <= 0) {
                    cyberDragon.alive = false;
		    createExplosion(cyberDragon.x + cyberDragon.width / 2, cyberDragon.y + cyberDragon.height / 2);
		    explosionSound.play();
                    score += 3000;
                    cyberDragon = null;
                    level++;
                    initLevel(level);
                    lastTime = performance.now();
                }
            }
        }

        // Handle temporal serpent damage
        if (temporalSerpent && temporalSerpent.alive && !temporalSerpentHitByBomb) {
            const temporalSerpentCircle = { x: temporalSerpent.segments[0].x, y: temporalSerpent.segments[0].y, radius: temporalSerpent.segments[0].radius };
            if (checkCollision(playerCircle, temporalSerpentCircle)) {
                temporalSerpent.health -= BOMB_DAMAGE;
                makeTemporalSerpentLeaveScreen()
                temporalSerpentHitByBomb = true;
                temporalSerpent.lastBombDamageTime = performance.now(); // Record the bomb damage time
                if (temporalSerpent.health <= 0) {
                    temporalSerpent.alive = false;
                    score += 2000;
                    temporalSerpent = null;
                    level++;
                    initLevel(level);
                    lastTime = performance.now();
                } else {
                    // Temporarily make the serpent leave the screen
                    setTimeout(() => {
                        temporalSerpent.x = -temporalSerpent.width * 2; // Move off-screen
                        temporalSerpent.y = -temporalSerpent.height * 2;
                        setTimeout(() => {
                            // Return the serpent after 5 seconds
                            const position = getOffScreenSpawnPosition(temporalSerpent.width, temporalSerpent.height);
                            temporalSerpent.x = position.x;
                            temporalSerpent.y = position.y;
                            temporalSerpentHitByBomb = false; // Reset the flag
                        }, 5000);
                    }, 0);
                }
            }
        }

        // Handle asteroid destruction
        asteroids.forEach(asteroid => {
            const asteroidCircle = { x: asteroid.x + asteroid.width / 2, y: asteroid.y + asteroid.height / 2, radius: asteroid.width / 2 };
            if (checkCollision(playerCircle, asteroidCircle)) {
                asteroid.alive = false;
            }
        });

        // Remove dead asteroids from the array
        asteroids = asteroids.filter(asteroid => asteroid.alive);
    }
}


function updateBombs(deltaTime) {
    if (bombActive) {
        const timeSinceBomb = performance.now() - bombFlashTime;

        if (timeSinceBomb >= 1000) { // Bomb is active for 1 second
            bombActive = false;
            bossHitByBomb = false;
            biomechHitByBomb = false;
            cyberDragonHitByBomb = false;
            temporalSerpentHitByBomb = false;
        }

        // Handle enemy destruction and other effects here
        enemies = enemies.filter(enemy => {
            const playerCircle = { x: player.x, y: player.y, radius: BOMB_RADIUS };
            const enemyCircle = { x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, radius: enemy.width / 2 };
            if (checkCollision(playerCircle, enemyCircle)) {
                if (enemy.type === 'enemyTank') {
                    respawnEnemyTank(5000);
                } else if (enemy.type === 'stealthEnemy') {
                    respawnStealthEnemy(7000);
                } else {
                    const enemySpeed = 50 + level * 10;
                    respawnEnemyAfterDelay(enemySpeed, 7000);
                }
                score += 10;
                return false;
            }
            return true;
        });

        // Check for collisions with asteroids
        asteroids.forEach((asteroid, index) => {
            const bombCircle = { x: bomb.x, y: bomb.y, radius: bomb.radius };
            const asteroidCircle = { x: asteroid.x + asteroid.width / 2, y: asteroid.y + asteroid.height / 2, radius: asteroid.width / 2 };

            if (checkCollision(bombCircle, asteroidCircle)) {
                asteroid.alive = false;
            }

            // Remove dead asteroids from the array
            if (!asteroid.alive) {
                asteroids.splice(index, 1);
            }
        });

        // Check for collisions with projectiles
        projectiles.forEach((projectile, index) => {
            const bombCircle = { x: bomb.x, y: bomb.y, radius: bomb.radius };
            const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };

            if (!projectile.fromPlayer && checkCollision(bombCircle, projectileCircle)) {
                projectiles.splice(index, 1);
            }
        });

        // Check for collisions with spiral projectiles
        if (cyberDragon && cyberDragon.spiralProjectiles) {
            cyberDragon.spiralProjectiles.forEach((projectile, index) => {
                const bombCircle = { x: bomb.x, y: bomb.y, radius: bomb.radius };
                const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.radius };

                if (checkCollision(bombCircle, projectileCircle)) {
                    cyberDragon.spiralProjectiles.splice(index, 1);
                }
            });
        }
    }
}



function useHomingMissile() {
    if (homingMissilesInventory > 0) {
        let target = enemies.find(enemy => enemy.alive) ||
                     (boss && boss.alive ? boss : null) ||
                     (biomechLeviathan && biomechLeviathan.alive ? biomechLeviathan : null) ||
                     (cyberDragon && cyberDragon.alive ? cyberDragon : null) ||
                     (temporalSerpent && temporalSerpent.alive ? temporalSerpent.segments[0] : null); // Target the head of the temporalSerpent

        if (target) {
            homingMissilesInventory--;
            for (let i = 0; i < 3; i++) { // Fire 3 missiles
                let homingMissile = {
                    x: player.x,
                    y: player.y,
                    width: 20,
                    height: 20,
                    speed: 300,
                    directionX: 0,
                    directionY: 0,
                    target: target,
                    fromPlayer: true,
                    damage: 50, // Define homing missile damage
                    alive: true,
                    traveledDistance: 0, // Track distance traveled
                    maxDistance: 1000 // Define a maximum travel distance for the missile
                };
                homingMissiles.push(homingMissile);
            }

            // Play the homing missile sound
            const homingMissileSoundClone = homingMissileSound.cloneNode();
            homingMissileSoundClone.volume = soundEffectsVolumeSlider.value; // Ensure volume matches the slider
            homingMissileSoundClone.play().catch(error => {});
        }
    }
}

function checkGamepadMenuButton() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad) {
            // The Menu button on an Xbox controller typically has an index of 9
            if (gamepad.buttons[9].pressed) {
                location.reload(); // Refresh the page
            }
        }
    }
}

// Reduce the volume of the flame sound by 50%
flameSound.volume = 0.5;

// Reduce the volume of the flame sound by 50%
flameSound.volume = 0.5;

function gameLoop(timestamp) {
    checkGamepadMenuButton();

    // Handle gamepad input in any state
    handleGamepadInput();

    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, canvas.width / 2 - 30, canvas.height / 2 + 40);
        ctx.fillText('Level: ' + level, canvas.width / 2 - 30, canvas.height / 2 + 70);
        ctx.fillText('Press B to Restart', canvas.width / 2 - 30, canvas.height / 2 + 100);
        stopBackgroundMusic();
        stopBossMusic();

        // Continue the game loop to ensure inputs are processed
        requestAnimationFrame(gameLoop);
        return;
    }

    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (!isMenuOpen) {
        update(deltaTime, timestamp);
        handleWormholeTeleportation();
        updateWormholes();
        updateAlly(deltaTime, timestamp);
        checkAndAdvanceLevel();
        manageMusic();

        // Update bombs before other entities
        updateBombs(deltaTime);

        if (boss) {
            updateBoss(deltaTime, timestamp);
        }

        if (biomechLeviathan) {
            updateBiomechLeviathan(deltaTime, timestamp);
        }

        if (cyberDragon) {
            updateCyberDragon(deltaTime, timestamp);
            updateAsteroids(deltaTime, timestamp);
            drawCyberDragon();
            drawLaserCharge();
            drawAsteroids();
            drawSpiralProjectiles();
        }

        if (temporalSerpent) {
            updateTemporalSerpent(deltaTime, timestamp);
            checkPlayerInHazardousZone(player, timestamp);
        }

        draw();

        if (biomechLeviathan) {
            drawBiomechLeviathan();
            drawTractorBeam();
            updateInkClouds(deltaTime);
            drawInkClouds();
            drawEMPBlast();
        }

        if (cyberDragon) {
            drawCyberDragon();
            drawLaserCharge();
            drawAsteroids();
            drawSpiralProjectiles();
        }

        if (temporalSerpent) {
            drawHazardousZones(ctx);
            drawTemporalSerpent();
            drawTemporalSerpentHealthBar();
            drawEnergyBarrier(ctx);
        }
    }

    // Check if it's time to spawn the ally
    if (timestamp > allySpawnTime + allyInterval) {
        allySpawnTime = timestamp;
        allySound.play(); // Play warning sound 3 seconds before spawning
        setTimeout(spawnAlly, allyWarningTime);
    }

    if (flamethrowerActive) {
        if (timestamp > flamethrowerExpirationTime) {
            flamethrowerActive = false;
            flameSound.pause();
            flameSound.currentTime = 0;
        } else if (keys[' '] && !gameOver) {
            createFlameParticle();

            if (flameSound.paused) {
                flameSound.loop = true;
                flameSound.play();
            }
        } else {
            if (!flameSound.paused) {
                flameSound.pause();
                flameSound.currentTime = 0;
            }
        }
    } else {
        if (!flameSound.paused) {
            flameSound.pause();
            flameSound.currentTime = 0;
        }

        if (keys[' '] && !gameOver) {
            if (!isCharging) {
                isCharging = true;
                spacebarPressedTime = timestamp;
                chargingSoundTimeout = setTimeout(() => {
                    if (!flamethrowerActive && !chargingSound.playing) {
                        chargingSound.play();
                    }
                }, 250);
            }
        } else {
            if (isCharging) {
                isCharging = false;
                clearTimeout(chargingSoundTimeout);
                chargingSound.pause();
                chargingSound.currentTime = 0;
            }
        }
    }

    updateFlameParticles();
    checkFlameDamage(); // Add this line to check for flame damage to enemies, projectiles, and bosses
    requestAnimationFrame(gameLoop);
}


function useBoost() {
    if (isBoosting || (!isUnlimitedBoostActivated && performance.now() < boostCooldownEndTime)) return;

    isBoosting = true;
    if (!isInvincible) { // Only set isInvincible if it's not already true
        isInvincible = true;
    }
    boostEndTime = performance.now() + 500;
    boostCooldownEndTime = performance.now() + (boostPowerUpActive ? 500 : 7000); // Reduced cooldown if boost power-up is active

    const boostSoundClone = boostSound.cloneNode();
    boostSoundClone.volume = boostSound.volume;
    boostSoundClone.play();

    player.velocity.x = Math.cos(player.rotation) * player.maxSpeed * 2;
    player.velocity.y = Math.sin(player.rotation) * player.maxSpeed * 2;
}

// Function to end the boost
function endBoost() {
    isBoosting = false;
    if (!isCheatCodeActivated) { // Only reset isInvincible if the cheat code is not active
        isInvincible = false;
    }
}

function isBoostReady() {
    return !isBoosting && (isUnlimitedBoostActivated || performance.now() >= boostCooldownEndTime);
}

function update(deltaTime, timestamp) {
    const rotationSpeed = 4;
    const thrustAcceleration = 300;

    // Update power-up positions
    updatePowerUpPosition(powerUp, deltaTime);
    updatePowerUpPosition(bombPowerUp, deltaTime);
    updatePowerUpPosition(homingMissilePowerUp, deltaTime);
    updatePowerUpPosition(shieldPowerUp, deltaTime);
    updatePowerUpPosition(reversePowerUp, deltaTime);
    updatePowerUpPosition(boostPowerUp, deltaTime);
    updateInkClouds(deltaTime);  // Update ink cloud here
    updateLaserCharge(deltaTime);

    // Boost Power-up active check
    if (boostPowerUpActive && timestamp >= boostPowerUpExpirationTime) {
        boostPowerUpActive = false;
    }

    // Tractor beam effect on player
    if (tractorBeam && tractorBeam.active) {
        const dx = tractorBeam.startX - player.x;
        const dy = tractorBeam.startY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const pullStrength = tractorBeam.strength;
            player.velocity.x += (dx / distance) * pullStrength * deltaTime;
            player.velocity.y += (dy / distance) * pullStrength * deltaTime;
        }
    }

    // Player movement logic
    if (keys['ArrowLeft']) player.rotation -= rotationSpeed * deltaTime / 1000;
    if (keys['ArrowRight']) player.rotation += rotationSpeed * deltaTime / 1000;

    if (keys['ArrowUp']) {
        player.thrust = thrustAcceleration;
        if (accelerationSound.paused) {
            accelerationSound.play();
        }
    } else if (keys['ArrowDown']) {
        player.thrust = -thrustAcceleration;
        if (reverseSound.paused) {
            reverseSound.play();
        }
    } else {
        player.thrust = 0;
        if (!keys['ArrowUp']) {
            accelerationSound.pause();
            accelerationSound.currentTime = 0;
        }
        if (!keys['ArrowDown']) {
            reverseSound.pause();
            reverseSound.currentTime = 0;
        }
    }

    // Reverse Power-up active check
    if (reversePowerUpActive && timestamp >= reversePowerUpExpirationTime) {
        reversePowerUpActive = false;
    }

// Boost handling
if (isBoosting) {
    player.velocity.x = Math.cos(player.rotation) * player.maxSpeed * 2;
    player.velocity.y = Math.sin(player.rotation) * player.maxSpeed * 2;

    // Check if the boost duration has ended
    if (performance.now() >= boostEndTime) {
        endBoost();
    }
} else {
    player.velocity.x += Math.cos(player.rotation) * player.thrust * deltaTime / 1000;
    player.velocity.y += Math.sin(player.rotation) * player.thrust * deltaTime / 1000;

    if (!keys['ArrowUp'] && !keys['ArrowDown']) {
        player.velocity.x *= player.deceleration;
        player.velocity.y *= player.deceleration;
    }

    const speed = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.y * player.velocity.y);
    if (speed > player.maxSpeed) {
        player.velocity.x *= player.maxSpeed / speed;
        player.velocity.y *= player.maxSpeed / speed;
    }
}

    player.x += player.velocity.x * deltaTime / 1000;
    player.y += player.velocity.y * deltaTime / 1000;

    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;

    if (isBoosting && performance.now() > boostEndTime) {
        isBoosting = false;
        isInvincible = false;
        const speed = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.y * player.velocity.y);
        if (speed > player.maxSpeed) {
            player.velocity.x *= player.maxSpeed / speed;
            player.velocity.y *= player.maxSpeed / speed;
        }
    }

    // Call the updated power-up logic
    updatePowerUps(deltaTime, timestamp);

    // Check if shield power-up has expired
    if (shieldActive && timestamp >= shieldPowerUpExpirationTime) {
        shieldActive = false;
    }

    // Check if the projectile power-up has expired
    if (powerUpActive && timestamp >= powerUpExpirationTime) {
        powerUpActive = false;
    }

    // Collision detection and handling for coins
    coins.forEach((coin, coinIndex) => {
        const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
        const coinCircle = { x: coin.x + coin.width / 2, y: coin.y + coin.height / 2, radius: coin.width / 2 };

        if (checkCollision(playerCircle, coinCircle)) {
            score += 20;
            coins.splice(coinIndex, 1);

            // Increase player's health by 2, but do not exceed the maximum health
            player.health = Math.min(player.health + 2, PLAYER_MAX_HEALTH);

            const coinSoundClone = coinSound.cloneNode();
            coinSoundClone.volume = coinSound.volume;
            coinSoundClone.play();
        }
    });

    // Update the biomechLeviathan if it exists
    if (biomechLeviathan) {
        updateBiomechLeviathan(deltaTime, timestamp);  // Ensure this calls inkCloud initialization
    }

    // Update enemies and handle their movement, shooting, and collisions
    enemies.forEach((enemy, enemyIndex) => {
        const enemyMoveDistance = (enemy.speed * deltaTime) / 1000;
        enemy.x += enemyMoveDistance * enemy.directionX;
        enemy.y += enemyMoveDistance * enemy.directionY;

        if (enemy.x < 0 || enemy.x + enemy.width > canvas.width) {
            enemy.directionX *= -1;
            enemy.x = Math.max(0, Math.min(enemy.x, canvas.width - enemy.width));
        }
        if (enemy.y < 0 || enemy.y + enemy.height > canvas.height) {
            enemy.directionY *= -1;
            enemy.y = Math.max(0, Math.min(enemy.y, canvas.height - enemy.height));
        }

        // Handle stealth enemy visibility and opacity
        if (enemy.type === 'stealthEnemy') {
            const currentTime = performance.now();
            const elapsedTime = currentTime - enemy.visibleStartTime;

            if (enemy.visible) {
                if (elapsedTime < 1000) {
                    enemy.opacity = elapsedTime / 1000; // Gradually increase opacity
                } else if (elapsedTime >= enemy.visibleDuration) {
                    enemy.visible = false;
                    enemy.visibleStartTime = currentTime;
                    enemy.opacity = 1; // Fully opaque
                }
            } else {
                if (elapsedTime < 1000) {
                    enemy.opacity = 1 - (elapsedTime / 1000); // Gradually decrease opacity
                } else if (elapsedTime >= enemy.invisibleDuration) {
                    enemy.visible = true;
                    enemy.visibleStartTime = currentTime;
                    enemy.opacity = 0; // Fully invisible
                }
            }
        }

        // Add visibility check for stealth enemy before shooting
        if ((enemy.type !== 'stealthEnemy' || enemy.visible) && enemy.canShoot && timestamp - enemy.lastShotTime > enemy.shootInterval) {
            let projectile = {
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                width: 5,
                height: 5,
                speed: 300,
                directionX: (player.x - enemy.x) / Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2),
                directionY: (player.y - enemy.y) / Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2),
                fromPlayer: false
            };
            projectiles.push(projectile);
            enemy.lastShotTime = timestamp;
        }

        const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
        const enemyCircle = { x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, radius: enemy.width / 2 };

        if (!isInvincible && !shieldActive && checkCollision(playerCircle, enemyCircle)) {
            const collisionSoundClone = collisionSound.cloneNode();
            collisionSoundClone.volume = collisionSound.volume;
            collisionSoundClone.play();
            player.health -= 10;

            if (player.health <= 0) {
                player.lives--;
                player.health = PLAYER_MAX_HEALTH;
                lifeLostSound.play();
                if (player.lives <= 0) {
                    gameOver = true;
                    handleGameOver();
                }
            }

            if (enemy.type === 'enemyTank') {
                respawnEnemyTank(5000); // Example respawn delay of 5 seconds for tanks
            } else if (enemy.type === 'stealthEnemy') {
                respawnStealthEnemy(7000); // Example respawn delay of 7 seconds for stealth enemies
            } else {
                const enemySpeed = 50 + level * 10;
                respawnEnemyAfterDelay(enemySpeed, 7000); // Respawn regular enemies after 7 seconds
            }

            enemies.splice(enemyIndex, 1);
            score += 10;
        }

        if (enemy.health <= 0) {
            if (enemy.type === 'enemyTank') {
                respawnEnemyTank(5000); // Example respawn delay of 5 seconds for tanks
            } else if (enemy.type === 'stealthEnemy') {
                respawnStealthEnemy(7000); // Example respawn delay of 7 seconds for stealth enemies
            } else {
                const enemySpeed = 50 + level * 10;
                respawnEnemyAfterDelay(enemySpeed, 7000); // Respawn regular enemies after 7 seconds
            }

            enemies.splice(enemyIndex, 1);
            score += 10;
        }
    });

    // Update homing missiles
    updateHomingMissiles(deltaTime);

    // Update projectiles
    updateProjectiles(deltaTime, timestamp);
    // Handle explosions
    handleSegmentExplosions(timestamp);
    // Update particles
    updateParticles();
    updateEnergyBarrier();

    // Handle biomechLeviathan collision with the player
    if (biomechLeviathan && biomechLeviathan.alive) {
        const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
        const biomechCircle = { x: biomechLeviathan.x, y: biomechLeviathan.y, radius: biomechLeviathan.width / 2 };

    if (checkCollision(playerCircle, biomechCircle) && !isInvincible && !shieldActive && timestamp - player.lastCollisionTime >= 3000) {
        player.health -= 10;
        player.lastCollisionTime = timestamp;

        if (player.health <= 0) {
            player.lives--;
            player.health = PLAYER_MAX_HEALTH;
            lifeLostSound.play();
            if (player.lives <= 0) {
                gameOver = true;
                handleGameOver();
            }
        }
        const collisionSoundClone = collisionSound.cloneNode();
        collisionSoundClone.volume = collisionSound.volume;
        collisionSoundClone.play();
    }
}

    // Collision detection between player and boss
if (boss && boss.alive) {
    const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
    const bossCircle = { x: boss.x + boss.width / 2, y: boss.y + boss.height / 2, radius: Math.max(boss.width, boss.height) / 2 };

    if (checkCollision(playerCircle, bossCircle) && !isInvincible && !shieldActive && timestamp - player.lastCollisionTime >= 3000) {
        player.health -= 10;
        player.lastCollisionTime = timestamp;

        if (player.health <= 0) {
            player.lives--;
            player.health = PLAYER_MAX_HEALTH;
            lifeLostSound.play();
            if (player.lives <= 0) {
                gameOver = true;
                handleGameOver();
            }
        }
        const collisionSoundClone = collisionSound.cloneNode();
        collisionSoundClone.volume = collisionSound.volume;
        collisionSoundClone.play();
    }
}

    // EMP blast effect on player
    if (empBlast && empBlast.active) {
        const dx = empBlast.x - player.x;
        const dy = empBlast.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < empBlast.radius) {
            // Apply EMP effects to the player
            player.velocity.x = 0;
            player.velocity.y = 0;
        }

        // Update the EMP blast's position to follow the biomech Leviathan
        empBlast.x = biomechLeviathan.x;
        empBlast.y = biomechLeviathan.y;
    }

    // Destroy projectiles within the EMP blast radius
    projectiles = projectiles.filter(projectile => {
        const dx = projectile.x - empBlast.x;
        const dy = projectile.y - empBlast.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return !empBlast.active || distance > empBlast.radius;
    });

    // Collision detection between player and Temporal Serpent
    if (temporalSerpent && temporalSerpent.alive) {
        const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };

        temporalSerpent.segments.forEach((segment) => {
            const segmentCircle = { x: segment.x, y: segment.y, radius: segment.radius };

            if (checkCollision(playerCircle, segmentCircle) && !isInvincible && !shieldActive && timestamp - player.lastCollisionTime >= 3000) {
                player.health -= 10;
		player.lastCollisionTime = timestamp;

                if (player.health <= 0) {
                    player.lives--;
                    player.health = PLAYER_MAX_HEALTH;
                    lifeLostSound.play();
                    if (player.lives <= 0) {
                        gameOver = true;
                        handleGameOver();
                    }
                }

                const collisionSoundClone = collisionSound.cloneNode();
                collisionSoundClone.volume = collisionSound.volume;
                collisionSoundClone.play();
            }
        });
    }

    if (cyberDragon && cyberDragon.alive) {
        const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
        const dragonCircle = { x: cyberDragon.x, y: cyberDragon.y, radius: cyberDragon.playerCollisionRadius }; // Use playerCollisionRadius

            if (checkCollision(playerCircle, dragonCircle) && !isInvincible && !shieldActive && timestamp - player.lastCollisionTime >= 3000) {
                player.health -= 10;
		player.lastCollisionTime = timestamp;

                if (player.health <= 0) {
                    player.lives--;
                    player.health = PLAYER_MAX_HEALTH;
                    lifeLostSound.play();
                    if (player.lives <= 0) {
                        gameOver = true;
                        handleGameOver();
                    }
                }

            const collisionSoundClone = collisionSound.cloneNode();
            collisionSoundClone.volume = collisionSound.volume;
            collisionSoundClone.play();
        }
    }

    if (cyberDragon) {
        updateCyberDragon(deltaTime, timestamp);
        drawCyberDragon(); 
        drawLaserCharge();
        drawAsteroids();
    }

    // Level timing and progression
    if (level % 5 !== 0) {
        const elapsedTime = performance.now() - levelStartTime;
        countdown = Math.max(0, ((levelDuration - elapsedTime) / 1000).toFixed(1));

        if (elapsedTime >= levelDuration || (coins.length === 0 && enemies.length === 0)) {
            if (coins.length === 0 && enemies.length === 0) {
                score += Math.floor(countdown) * 5;
            }
            level++;
            initLevel(level);
            levelStartTime = performance.now();
            countdown = levelDuration / 1000;
        }
    }

    // Extra life logic based on score
    if (score >= nextLifeScore) {
        player.lives++;
        nextLifeScore += 1500; // Increase next life threshold by 1500 points
    }
}

function checkAndAdvanceLevel() {
    const isBossLevel = level % 5 === 0;
    if (isBossLevel && enemies.length === 0 && 
        boss === null && 
        biomechLeviathan === null && 
        (cyberDragon === null || cyberDragon.health <= 0) && 
        (temporalSerpent === null || temporalSerpent.health <= 0)) {
        level++;
        initLevel(level);
    }
}


function drawProjectile() {
    projectiles.forEach(projectile => {
        if (projectile.fromBoss) {
            // Draw boss projectiles using the image
            ctx.drawImage(bossProjectileImage, projectile.x - projectile.width / 2, projectile.y - projectile.height / 2, projectile.width, projectile.height);
        } else if (projectile.fromPlayer) {
            // Draw player projectiles as blue circles
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.width / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw other enemy projectiles as red circles
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawScoreLevelTime(ctx, score, level, countdown, canvas) {
    ctx.font = '15px "Press Start 2P", cursive';
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Level: ' + level, 10, 50);
    ctx.fillText('Time: ' + Math.floor(countdown), canvas.width / 2 - 30, 20);
}


function drawBoostBar(ctx, boostBarX, boostBarY, boostBarWidth, boostBarHeight, boostCooldownEndTime, boostPowerUpActive) {
    ctx.fillStyle = 'gray';
    ctx.fillRect(boostBarX, boostBarY, boostBarWidth, boostBarHeight);

    const currentTime = performance.now();
    let boostProgress;
    if (isBoostReady()) {
        boostProgress = 1;
    } else {
        boostProgress = Math.max(0, (currentTime - boostCooldownEndTime + (boostPowerUpActive ? 500 : 7000)) / (boostPowerUpActive ? 500 : 7000));
    }

    ctx.fillStyle = 'green';
    ctx.fillRect(boostBarX, boostBarY, boostBarWidth * boostProgress, boostBarHeight);
    ctx.strokeStyle = 'gray';

    if (boostPowerUpActive) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(boostBarX - 3, boostBarY - 3, boostBarWidth + 6, boostBarHeight + 6);
    }
}

function drawHealthBar(ctx, player, boostBarX, boostBarY, boostBarWidth, boostBarHeight) {
    ctx.fillStyle = 'gray';
    ctx.fillRect(boostBarX, boostBarY + boostBarHeight + 5, boostBarWidth, boostBarHeight);

    const healthRatio = player.health / PLAYER_MAX_HEALTH;
    ctx.fillStyle = 'red';
    ctx.fillRect(boostBarX, boostBarY + boostBarHeight + 5, boostBarWidth * healthRatio, boostBarHeight);

    ctx.strokeStyle = 'gray';
    ctx.strokeRect(boostBarX, boostBarY + boostBarHeight + 5, boostBarWidth, boostBarHeight);
}

function drawChargeBar(ctx, chargeBarX, chargeBarY, chargeBarWidth, chargeBarHeight, isCharging, spacebarPressedTime) {
    ctx.fillStyle = 'gray';
    ctx.fillRect(chargeBarX, chargeBarY, chargeBarWidth, chargeBarHeight);

    if (isCharging) {
        const currentTime = performance.now();
        const chargeDuration = (currentTime - spacebarPressedTime) / 1000;
        const chargeProgress = Math.min(chargeDuration / 2, 1);
        ctx.fillStyle = 'blue';
        ctx.fillRect(chargeBarX, chargeBarY, chargeBarWidth * chargeProgress, chargeBarHeight);
        const halfwayMarkerX = chargeBarX + chargeBarWidth / 2;
        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(halfwayMarkerX, chargeBarY);
        ctx.lineTo(halfwayMarkerX, chargeBarY + chargeBarHeight);
        ctx.stroke();
    }
}

function drawShieldBar(ctx, shieldBarX, shieldBarY, shieldBarWidth, shieldBarHeight, shieldActive, shieldPowerUpExpirationTime) {
    ctx.fillStyle = 'gray';
    ctx.fillRect(shieldBarX, shieldBarY, shieldBarWidth, shieldBarHeight);

    if (shieldActive) {
        const currentTime = performance.now();
        const shieldProgress = Math.max(0, (shieldPowerUpExpirationTime - currentTime) / 15000);
        ctx.fillStyle = 'cyan';
        ctx.fillRect(shieldBarX, shieldBarY, shieldBarWidth * shieldProgress, shieldBarHeight);
    }

    ctx.strokeStyle = 'black';
    ctx.strokeRect(shieldBarX, shieldBarY, shieldBarWidth, shieldBarHeight);
}

function drawInventories(ctx, player, bombs, homingMissilesInventory, boostBarX, boostBarY, boostBarWidth, boostBarHeight, chargeBarX, chargeBarWidth, chargeBarY, shieldBarX, shieldBarWidth, shieldBarY) {
    const livesIconX = boostBarX + boostBarWidth + 10;
    ctx.drawImage(playerImage, livesIconX, boostBarY + boostBarHeight + 5, 20, 20);
    ctx.fillStyle = 'white';
    ctx.font = '15px "Press Start 2P", cursive';
    ctx.fillText(': ' + player.lives, livesIconX + 25, boostBarY + boostBarHeight + 20);

    const bombIconX = chargeBarX + chargeBarWidth + 10;
    ctx.drawImage(bombPowerUpImage, bombIconX, chargeBarY, 20, 20);
    ctx.fillText(': ' + bombs, bombIconX + 25, chargeBarY + 15);

    const missileIconX = shieldBarX + shieldBarWidth + 10;
    ctx.drawImage(homingMissilePowerUpImage, missileIconX, shieldBarY, 20, 20);
    ctx.fillText(': ' + homingMissilesInventory, missileIconX + 25, shieldBarY + 15);
}


function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawWormholes();

    if (isMenuOpen) {
        ctx.drawImage(titleScreenImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px "Press Start 2P", cursive';
        const text = 'PAUSED';
        const textWidth = ctx.measureText(text).width;
        const x = (canvas.width - textWidth) / 2;
        const y = canvas.height / 3;
        ctx.fillText(text, x, y);
        return;
    }

    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);

    if (keys['ArrowUp']) {
        ctx.drawImage(playerThrustImage, -player.width / 2, -player.height / 2, player.width, player.height);
    } else if (keys['ArrowDown']) {
        ctx.drawImage(playerReverseImage, -player.width / 2, -player.height / 2, player.width, player.height);
    } else {
        ctx.drawImage(playerImage, -player.width / 2, -player.height / 2, player.width, player.height);
    }

    ctx.restore();

    coins.forEach(coin => {
        ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
    });

    enemies.forEach(enemy => {
        if (enemy.type === 'stealthEnemy') {
            if (enemy.visible) {
                ctx.save();
                ctx.globalAlpha = enemy.opacity;
                ctx.drawImage(stealthEnemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
                ctx.restore();
            } else {
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 1.5, 0, 2 * Math.PI);
                ctx.fill();
            }
        } else if (enemy.type === 'enemyTank') {
            ctx.drawImage(enemyTankImage, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
            ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });

    if (powerUp) {
        ctx.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    }

    if (bombPowerUp) {
        ctx.drawImage(bombPowerUpImage, bombPowerUp.x, bombPowerUp.y, bombPowerUp.width, bombPowerUp.height);
    }

    if (homingMissilePowerUp) {
        ctx.drawImage(homingMissilePowerUpImage, homingMissilePowerUp.x, homingMissilePowerUp.y, homingMissilePowerUp.width, homingMissilePowerUp.height);
    }

    if (shieldPowerUp) {
        ctx.drawImage(shieldPowerUpImage, shieldPowerUp.x, shieldPowerUp.y, shieldPowerUp.width, shieldPowerUp.height);
    }

    if (reversePowerUp) {
        ctx.drawImage(reversePowerUpImage, reversePowerUp.x, reversePowerUp.y, reversePowerUp.width, reversePowerUp.height);
    }

    if (boostPowerUp) {
        ctx.drawImage(boostPowerUpImage, boostPowerUp.x, boostPowerUp.y, boostPowerUp.width, boostPowerUp.height);
    }

    if (flamethrowerPowerUp) {
        ctx.drawImage(flamethrowerPowerUpImage, flamethrowerPowerUp.x, flamethrowerPowerUp.y, flamethrowerPowerUp.width, flamethrowerPowerUp.height);
    }

    projectiles.forEach(drawProjectile);

    homingMissiles.forEach(missile => {
        ctx.save();
        ctx.translate(missile.x, missile.y);
        const angleToTarget = Math.atan2(missile.target.y - missile.y, missile.target.x - missile.x);
        ctx.rotate(angleToTarget);
        ctx.drawImage(homingMissileImage, -missile.width / 2, -missile.height / 2, missile.width, missile.height);
        ctx.restore();
    });

    if (boss) {
        ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);
        drawBossHealthBar(boss);
    }

    if (biomechLeviathan && biomechLeviathan.alive) {
        drawBiomechLeviathan();
        drawBiomechLeviathanHealthBar(biomechLeviathan);
    }

    // Draw the tractor beam
    drawTractorBeam();
    drawInkClouds();

    // Draw the ally
    drawAlly();

    drawScoreLevelTime(ctx, score, level, countdown, canvas);
    drawBoostBar(ctx, boostBarX, boostBarY, boostBarWidth, boostBarHeight, boostCooldownEndTime, boostPowerUpActive);
    drawHealthBar(ctx, player, boostBarX, boostBarY, boostBarWidth, boostBarHeight);
    drawChargeBar(ctx, chargeBarX, chargeBarY, chargeBarWidth, chargeBarHeight, isCharging, spacebarPressedTime);
    drawShieldBar(ctx, shieldBarX, shieldBarY, shieldBarWidth, shieldBarHeight, shieldActive, shieldPowerUpExpirationTime);
    drawInventories(ctx, player, bombs, homingMissilesInventory, boostBarX, boostBarY, boostBarWidth, boostBarHeight, chargeBarX, chargeBarWidth, chargeBarY, shieldBarX, shieldBarWidth, shieldBarY);

    // Draw detached segments
    drawDetachedSegments(ctx);

    // Draw particles
    drawParticles(ctx);

    // Draw projectiles
    projectiles.forEach(projectile => {
        if (projectile.isLaser) {
            drawLaser(projectile);
        } else {
            drawProjectile(projectile);
        }
    });

    if (reversePowerUpActive) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 5;
        ctx.strokeRect(chargeBarX - 2.5, chargeBarY - 2.5, chargeBarWidth + 5, chargeBarHeight + 5);
    }

    if (powerUpActive) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.strokeRect(chargeBarX, chargeBarY, chargeBarWidth, chargeBarHeight);
    }

    if (bombActive) {
        const timeSinceBomb = performance.now() - bombFlashTime;
        if (timeSinceBomb < 1000) { // Flash for 1 second
            const flashPeriod = 200; // Flash every 200ms
            const flashDuration = 100; // Duration of each flash
            if ((timeSinceBomb % flashPeriod) < flashDuration) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(player.x, player.y, BOMB_RADIUS, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    if (cyberDragon) {
        drawCyberDragon();
        drawCyberDragonHealthBar(cyberDragon);
    }
    drawLaserCharge();

    if (temporalSerpent) {
        drawTemporalSerpentHealthBar(ctx, canvas, temporalSerpent);
	drawEnergyBarrier(ctx);
    }

    if (isInvincible) {
	const gradient = ctx.createRadialGradient(player.x, player.y, player.width / 2, player.x, player.y, player.width);
	gradient.addColorStop(0, 'rgba(255, 69, 0, 0.5)'); // Red/orange color with 50% opacity
	gradient.addColorStop(0.7, 'rgba(255, 140, 0, 0.2)'); // Lighter orange color with 20% opacity
	gradient.addColorStop(1, 'rgba(255, 165, 0, 0)'); // Even lighter orange color with 0% opacity
	ctx.fillStyle = gradient;
	ctx.beginPath();
	ctx.arc(player.x, player.y, player.width, 0, 2 * Math.PI);
	ctx.fill();
    }

    if (isBoosting) {
        const gradient = ctx.createRadialGradient(player.x, player.y, player.width / 2, player.x, player.y, player.width);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
        gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.width, 0, 2 * Math.PI);
        ctx.fill();
    }

    if (shieldActive) {
        const gradient = ctx.createRadialGradient(player.x, player.y, player.width / 2, player.x, player.y, player.width);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
        gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.width, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.font = '10px "Press Start 2P", cursive';
    ctx.fillStyle = 'white';
    ctx.fillText('Booster', boostBarX - ctx.measureText('Booster').width - 10, boostBarY + 15);
    ctx.fillText('Health', boostBarX - ctx.measureText('Health').width - 10, boostBarY + boostBarHeight + 20);
    ctx.fillText('Blaster', chargeBarX - ctx.measureText('Blaster').width - 10, chargeBarY + 15);
    ctx.fillText('Shield', shieldBarX - ctx.measureText('Shield').width - 10, shieldBarY + 15);

    drawFlameParticles(ctx);
}



function advanceToLevel(newLevel) {
    level = newLevel;
    countdown = 30;
    initLevel(level);
    startCountdown();
}

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        menu.style.display = 'block';
        stopBackgroundMusic();
    } else {
        menu.style.display = 'none';
        if (!gameOver) {
            startBackgroundMusic();
        }
    }
}


backgroundMusicVolumeSlider.addEventListener('input', () => {
    backgroundMusic.volume = backgroundMusicVolumeSlider.value;
    bossMusic.volume = backgroundMusicVolumeSlider.value;
});

soundEffectsVolumeSlider.addEventListener('input', () => {
    const volume = soundEffectsVolumeSlider.value;
    soundEffects.forEach(sound => sound.volume = volume);
});

menu.style .display = 'block';
initializeGame();
requestAnimationFrame(gameLoop);

titleScreenImage.onload = () => {
    draw();
};
