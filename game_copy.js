const soundEffectsVolumeSlider = document.getElementById('soundEffectsVolume');
const MAX_POWER_UPS = 3;

let enemyRespawnTimeouts = [];

function initializeGame() {
  enemyRespawnTimeouts.forEach((timeout) => clearTimeout(timeout));
  enemyRespawnTimeouts = [];
  resetPowerUpTimers();
}

function checkSpiralCollisions() {
  cyberDragon.spiralProjectiles.forEach((projectile, index) => {
    const dx = projectile.x - player.x;
    const dy = projectile.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check collision with player
    if (distance < projectile.radius + player.width / 2) {
      if (!isInvincible && !shieldActive) {
        // Respect player's invincibility and shield status
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

// wormhole logic
const WORMHOLE_PAIRS = [
  { entry: { x: 100, y: 100, radius: 37.5 }, exit: { x: 700, y: 500, radius: 37.5 } },
  { entry: { x: 400, y: 300, radius: 37.5 }, exit: { x: 200, y: 700, radius: 37.5 } },
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
  return (
    x > margin + radius &&
    x < canvasWidth - margin - radius &&
    y > margin + radius &&
    y < canvasHeight - margin - radius
  );
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
    { xMin: canvasWidth / 2, xMax: canvasWidth, yMin: canvasHeight / 2, yMax: canvasHeight }, // Bottom-right quadrant
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
        opacity: 0,
      };
    } while (!isValidSpawnPosition(entry.x, entry.y, entry.radius, canvasWidth, canvasHeight));

    do {
      exit = {
        x: Math.random() * (exitQuadrant.xMax - exitQuadrant.xMin) + exitQuadrant.xMin,
        y: Math.random() * (exitQuadrant.yMax - exitQuadrant.yMin) + exitQuadrant.yMin,
        radius: pair.exit.radius,
        opacity: 0,
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
  wormholes.forEach((wormhole) => {
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
  wormholes.forEach((wormhole) => {
    // Draw entry wormhole with gradient and opacity
    const entryGradient = ctx.createRadialGradient(
      wormhole.entry.x,
      wormhole.entry.y,
      0,
      wormhole.entry.x,
      wormhole.entry.y,
      wormhole.entry.radius,
    );
    entryGradient.addColorStop(0, `rgba(0, 0, 255, ${wormhole.entry.opacity})`);
    entryGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

    ctx.beginPath();
    ctx.arc(wormhole.entry.x, wormhole.entry.y, wormhole.entry.radius, 0, 2 * Math.PI);
    ctx.fillStyle = entryGradient;
    ctx.fill();

    // Draw entry wormhole stroke with gradient and opacity
    const entryStrokeGradient = ctx.createRadialGradient(
      wormhole.entry.x,
      wormhole.entry.y,
      wormhole.entry.radius,
      wormhole.entry.x,
      wormhole.entry.y,
      wormhole.entry.radius + 5,
    );
    entryStrokeGradient.addColorStop(0, `rgba(255, 0, 0, ${wormhole.entry.opacity})`);
    entryStrokeGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.strokeStyle = entryStrokeGradient;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw exit wormhole with gradient and opacity
    const exitGradient = ctx.createRadialGradient(
      wormhole.exit.x,
      wormhole.exit.y,
      0,
      wormhole.exit.x,
      wormhole.exit.y,
      wormhole.exit.radius,
    );
    exitGradient.addColorStop(0, `rgba(255, 0, 0, ${wormhole.exit.opacity})`);
    exitGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.beginPath();
    ctx.arc(wormhole.exit.x, wormhole.exit.y, wormhole.exit.radius, 0, 2 * Math.PI);
    ctx.fillStyle = exitGradient;
    ctx.fill();

    // Draw exit wormhole stroke with gradient and opacity
    const exitStrokeGradient = ctx.createRadialGradient(
      wormhole.exit.x,
      wormhole.exit.y,
      wormhole.exit.radius,
      wormhole.exit.x,
      wormhole.exit.y,
      wormhole.exit.radius + 5,
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
    wormholes.forEach((wormhole) => {
      const playerDistanceToEntry = Math.sqrt((player.x - wormhole.entry.x) ** 2 + (player.y - wormhole.entry.y) ** 2);

      const playerDistanceToExit = Math.sqrt((player.x - wormhole.exit.x) ** 2 + (player.y - wormhole.exit.y) ** 2);

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
  enemies.forEach((enemy) => {
    if (!lastEnemyTeleportTimes.has(enemy)) {
      lastEnemyTeleportTimes.set(enemy, 0);
    }

    if (currentTime - lastEnemyTeleportTimes.get(enemy) > TELEPORT_COOLDOWN) {
      wormholes.forEach((wormhole) => {
        const enemyDistanceToEntry = Math.sqrt((enemy.x - wormhole.entry.x) ** 2 + (enemy.y - wormhole.entry.y) ** 2);

        const enemyDistanceToExit = Math.sqrt((enemy.x - wormhole.exit.x) ** 2 + (enemy.y - wormhole.exit.y) ** 2);

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
  projectiles.forEach((projectile) => {
    if (!projectile.lastTeleportTime) {
      projectile.lastTeleportTime = 0;
    }

    if (currentTime - projectile.lastTeleportTime > PROJECTILE_TELEPORT_COOLDOWN) {
      wormholes.forEach((wormhole) => {
        const distanceToEntry = Math.sqrt(
          (projectile.x - wormhole.entry.x) ** 2 + (projectile.y - wormhole.entry.y) ** 2,
        );

        const distanceToExit = Math.sqrt((projectile.x - wormhole.exit.x) ** 2 + (projectile.y - wormhole.exit.y) ** 2);

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
  flameParticles.forEach((particle) => {
    if (!particle.lastTeleportTime) {
      particle.lastTeleportTime = 0;
    }

    if (currentTime - particle.lastTeleportTime > PROJECTILE_TELEPORT_COOLDOWN) {
      wormholes.forEach((wormhole) => {
        const distanceToEntry = Math.sqrt((particle.x - wormhole.entry.x) ** 2 + (particle.y - wormhole.entry.y) ** 2);

        const distanceToExit = Math.sqrt((particle.x - wormhole.exit.x) ** 2 + (particle.y - wormhole.exit.y) ** 2);

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

function updatePowerUps(deltaTime, timestamp) {
  const totalPowerUps =
    (powerUp ? 1 : 0) +
    (bombPowerUp ? 1 : 0) +
    (homingMissilePowerUp ? 1 : 0) +
    (shieldPowerUp ? 1 : 0) +
    (reversePowerUp ? 1 : 0) +
    (boostPowerUp ? 1 : 0);

  if (!powerUp && timestamp >= powerUpSpawnTime && !powerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
    spawnPowerUp();
    powerUpSpawnedThisLevel = true;
  }
  if (!bombPowerUp && timestamp >= bombSpawnTime && !bombPowerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
    spawnBombPowerUp();
    bombPowerUpSpawnedThisLevel = true;
  }
  if (
    !homingMissilePowerUp &&
    timestamp >= homingMissilePowerUpSpawnTime &&
    !homingMissilePowerUpSpawnedThisLevel &&
    totalPowerUps < MAX_POWER_UPS
  ) {
    spawnHomingMissilePowerUp();
    homingMissilePowerUpSpawnedThisLevel = true;
  }
  if (
    !shieldPowerUp &&
    timestamp >= shieldPowerUpSpawnTime &&
    !shieldPowerUpSpawnedThisLevel &&
    totalPowerUps < MAX_POWER_UPS
  ) {
    spawnShieldPowerUp();
    shieldPowerUpSpawnedThisLevel = true;
  }
  if (
    !reversePowerUp &&
    timestamp >= reversePowerUpSpawnTime &&
    !reversePowerUpSpawnedThisLevel &&
    totalPowerUps < MAX_POWER_UPS
  ) {
    spawnReversePowerUp();
    reversePowerUpSpawnedThisLevel = true;
  }
  if (
    !boostPowerUp &&
    timestamp >= boostPowerUpSpawnTime &&
    !boostPowerUpSpawnedThisLevel &&
    totalPowerUps < MAX_POWER_UPS
  ) {
    spawnBoostPowerUp();
    boostPowerUpSpawnedThisLevel = true;
  }
  if (
    !flamethrowerPowerUp &&
    timestamp >= flamethrowerSpawnTime &&
    !flamethrowerSpawnedThisLevel &&
    totalPowerUps < MAX_POWER_UPS
  ) {
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
    const powerUpCircle = {
      x: powerUpObj.x + powerUpObj.width / 2,
      y: powerUpObj.y + powerUpObj.height / 2,
      radius: powerUpObj.width / 2,
    };

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
      powerUpObj.x += (powerUpObj.speed * powerUpObj.directionX * deltaTime) / 1000;
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

function respawnEnemyAfterDelay(speed, delay) {
  if (level % 5 === 0) return;

  const timeout = setTimeout(() => {
    const currentRegularEnemies = enemies.filter((enemy) => enemy.type === 'regular').length;
    if (currentRegularEnemies < MAX_REGULAR_ENEMIES) {
      spawnEnemy(speed);
    }
  }, delay);
  enemyRespawnTimeouts.push(timeout);
}

function fireProjectile() {
  if (empDisableFire) {
    const nofireSoundClone = nofireSound.cloneNode();
    nofireSoundClone.volume = nofireSound.volume; // Ensure the cloned sound has the same volume
    nofireSoundClone.play(); // Play the cloned sound
    return; // Prevent firing if EMP effect is active
  }

  if (playerLaserPowerUpActive) {
    // Fire laser beam
    console.log('Firing player laser'); // Debugging statement
    createPlayerLaserBeam(
      player.x,
      player.y,
      Math.cos(player.rotation),
      Math.sin(player.rotation),
      'rgba(0, 255, 255, 1)',
    );
    return;
  }

  if (reversePowerUpActive) {
    for (let i = 0; i < 3; i++) {
      const angleOffset = (i - 1) * (Math.PI / 18);
      let reverseProjectile = {
        x: player.x - (Math.cos(player.rotation + angleOffset) * player.width) / 2,
        y: player.y - (Math.sin(player.rotation + angleOffset) * player.height) / 2,
        width: projectileSize,
        height: projectileSize,
        speed: projectileSpeed,
        directionX: -Math.cos(player.rotation + angleOffset),
        directionY: -Math.sin(player.rotation + angleOffset),
        fromPlayer: true,
        isCharged: isCharged,
        traveledDistance: 0,
        damage: damage,
        split: false,
      };
      projectiles.push(reverseProjectile);
    }
  }
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
      split: true,
    };
    projectiles.push(splitProjectile);
  }
}

class FlameParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 20 + 10;
    this.color = `rgba(${255}, ${Math.random() * 150}, 0, 1)`;
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

    // Wrap around the canvas
    if (this.x < 0) {
      this.x = canvas.width;
    } else if (this.x > canvas.width) {
      this.x = 0;
    }

    if (this.y < 0) {
      this.y = canvas.height;
    } else if (this.y > canvas.height) {
      this.y = 0;
    }
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
  const flameParticle = new FlameParticle(
    player.x + (Math.cos(player.rotation) * player.width) / 2,
    player.y + (Math.sin(player.rotation) * player.height) / 2,
  );
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
  flameParticles.forEach((particle) => particle.draw(ctx));
}

function checkFlameDamage() {
  flameParticles.forEach((particle) => {
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
          createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
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
          createExplosion(
            biomechLeviathan.x + biomechLeviathan.width / 2,
            biomechLeviathan.y + biomechLeviathan.height / 2,
          );
          explosionSound.play();

          biomechLeviathan = null; // Remove the Biomech
        }
      }
    }

    // Check damage to Temporal Serpent head only
    if (temporalSerpent) {
      const head = temporalSerpent.segments[0];
      const dx = particle.x - (head.x + head.radius);
      const dy = particle.y - (head.y + head.radius);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < head.radius) {
        temporalSerpent.health -= 0.2; // Slow but constant damage to the Temporal Serpent
        if (temporalSerpent.health <= 0) {
          // Handle Temporal Serpent death
          score += 3000; // Increase score or any other logic
          createExplosion(head.x + head.width / 2, head.y + head.height / 2);
          explosionSound.play();

          temporalSerpent = null; // Remove the Temporal Serpent
        }
      }
    }

    // Check damage to hazardous zones
    hazardousZones.forEach((zone, zoneIndex) => {
      const dx = particle.x - zone.x;
      const dy = particle.y - zone.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < zone.radius) {
        // Remove the hazardous zone
        hazardousZones.splice(zoneIndex, 1);
      }
    });

    // Check damage to hazard particles
    hazardParticles.forEach((hazardParticle, hazardIndex) => {
      const dx = particle.x - hazardParticle.x;
      const dy = particle.y - hazardParticle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < hazardParticle.size) {
        // Remove the hazard particle
        hazardParticles.splice(hazardIndex, 1);
      }
    });
  });
}

// Reduce the volume of the flame sound by 50%
flameSound.volume = 0.5;

// Reduce the volume of the flame sound by 50%
flameSound.volume = 0.5;

function gameLoop(timestamp) {
  if (!isMenuOpen) {
    update(deltaTime, timestamp);
    handleWormholeTeleportation();
    updateWormholes();

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
    }

    requestAnimationFrame(gameLoop);
  }

  function update(deltaTime, timestamp) {
    // Update power-up positions
    updatePowerUpPosition(powerUp, deltaTime);
    updatePowerUpPosition(bombPowerUp, deltaTime);
    updatePowerUpPosition(homingMissilePowerUp, deltaTime);
    updatePowerUpPosition(shieldPowerUp, deltaTime);
    updatePowerUpPosition(reversePowerUp, deltaTime);
    updatePowerUpPosition(boostPowerUp, deltaTime);

    // Boost Power-up active check
    if (boostPowerUpActive && timestamp >= boostPowerUpExpirationTime) {
      boostPowerUpActive = false;
    }

    // Reverse Power-up active check
    if (reversePowerUpActive && timestamp >= reversePowerUpExpirationTime) {
      reversePowerUpActive = false;
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
      if (biomechLeviathan) {
        empBlast.x = biomechLeviathan.x;
        empBlast.y = biomechLeviathan.y;
      }
    }

    // Destroy projectiles within the EMP blast radius
    projectiles = projectiles.filter((projectile) => {
      const dx = projectile.x - empBlast.x;
      const dy = projectile.y - empBlast.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return !empBlast.active || distance > empBlast.radius;
    });
  }
}
