const soundEffectsVolumeSlider = document.getElementById('soundEffectsVolume');
const MAX_POWER_UPS = 3;

let enemyRespawnTimeouts = [];
let nextLifeScore = 1500;
let isBoosting = false;
let boostEndTime = 0;
let boostCooldownEndTime = 0;
let bombPowerUp = null;
let temporalSerpentHitByBomb = false;
let enemies = [];
let projectiles = [];
let powerUp = null;
let powerUpActive = false;
let powerUpExpirationTime = 0;
let powerUpSpawnTime = 0;
let powerUpDirection = 1;
let powerUpZigZagSpeed = 100;
let powerUpSpawned = false;
let homingMissilePowerUp = null;
let homingMissileSpawned = false;
let homingMissiles = [];
let shieldPowerUp = null;
let shieldPowerUpSpawnTime = 0;
let shieldPowerUpSpawned = false;
let shieldActive = false;
let shieldPowerUpExpirationTime = 0;
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

let tractorBeam = null;
let tractorBeamCooldown = false;
let empBlast = {
  active: false,
  x: 0,
  y: 0,
  radius: 200,
  duration: 3000,
};

let empBlastEndTime = 0;
let empBlastActive = false;
let empPulseScale = 1;
let empPulseTime = 0;
let empDisableFire = false;
let flamethrowerPowerUp = null;
let flamethrowerSpawnTime = 0;
let flamethrowerSpawnedThisLevel = false;
let flamethrowerActive = false;
let flameParticles = [];
let flamethrowerExpirationTime = 0;

function handleKeyDown(e) {
  if (e.key === ' ' && isMenuOpen) {
    initializeGame();
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
}

function initializeGame() {
  // Clear existing timeouts
  enemyRespawnTimeouts.forEach((timeout) => clearTimeout(timeout));
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
  spacebarPressedTime = 0;
  chargingSoundTimeout = null;
  nextLifeScore = 1500;
  bombs = 0;
  bombPowerUp = null;
  bombSpawned = false;
  bombFlashTime = 0;
  biomechLeviathan = null;
  homingMissiles = [];
  homingMissilePowerUp = null;
  homingMissilesInventory = 0;
  shieldPowerUp = null;
  shieldActive = false;
  shieldPowerUpExpirationTime = 0;
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

function spawnBiomechLeviathan() {
  tractorBeam = { active: false, startX: 0, startY: 0, endX: 0, endY: 0, strength: 0.2 };

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
      tractorBeamSound.play().catch((error) => {});
    }
  } else {
    tractorBeam.active = false;
    tractorBeamSound.pause();
    tractorBeamSound.currentTime = 0; // Reset the sound
  }
}

let inkClouds = [];

function biomechLeviathanInkCloud() {
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
    lifespan: 5000, // Add lifespan property
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
        if (!shieldActive) {
          // Check if the shield is not active
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
  inkClouds = inkClouds.filter((inkCloud) => inkCloud.cloudActive || inkCloud.active);
}

function drawInkClouds() {
  inkClouds.forEach((inkCloud) => {
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
let empSparkParticles = [];

class EMPSparkParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 2;
    this.color = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.5})`; // Cyan with random transparency
    this.velocity = {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
    };
    this.alpha = 1; // transparency
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
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
    duration: 2500,
  };
  empBlastEndTime = performance.now() + empBlast.duration;
  empBlastActive = true;
  empDisableFire = true;

  // Destroy projectiles within the EMP blast radius
  projectiles = projectiles.filter((projectile) => {
    const dx = projectile.x - empBlast.x;
    const dy = projectile.y - empBlast.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance > empBlast.radius;
  });

  // Re-enable player controls after the EMP blast ends
  setTimeout(() => {
    empBlast.active = false;
    empBlastActive = false;
    empDisableFire = false;
  }, empBlast.duration);
}

function drawEMPBlast() {
  if (empBlast && empBlast.active) {
    empPulseTime += 0.1; // Adjust the speed of the pulsing
    empPulseScale = 1 + Math.sin(empPulseTime) * 0.1; // Adjust the range of the pulsing

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(empBlast.x, empBlast.y, empBlast.radius * empPulseScale, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Generate spark particles
    if (Math.random() < 0.5) {
      // Adjust the frequency of spark generation
      empSparkParticles.push(new EMPSparkParticle(empBlast.x, empBlast.y));
    }

    // Update and draw spark particles
    empSparkParticles.forEach((spark, index) => {
      spark.update();
      spark.draw(ctx);
      if (spark.alpha <= 0) {
        empSparkParticles.splice(index, 1); // Remove the spark when it fades out
      }
    });

    if (empSound.paused) {
      empSound.currentTime = 0;
      empSound.volume = soundEffectsVolumeSlider.value; // Ensure volume matches the slider
    }
  } else {
    empSound.pause();
    empSound.currentTime = 0; // Reset the sound
    empSparkParticles = []; // Clear sparks when EMP is not active
  }
}

function drawTractorBeam() {
  if (tractorBeam && tractorBeam.active && biomechLeviathan && biomechLeviathan.alive) {
    const beamWidth = 20; // Width of the beam at the player end
    const gradient = ctx.createLinearGradient(
      player.x,
      player.y, // Start point of the gradient (player position)
      tractorBeam.startX,
      tractorBeam.startY, // End point of the gradient (biomech boss position)
    );

    gradient.addColorStop(0, 'rgba(255, 255, 0, 0.5)'); // Yellow at the player end
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)'); // Transparent at the biomech boss end

    const dx = player.x - tractorBeam.startX;
    const dy = player.y - tractorBeam.startY;
    const angle = Math.atan2(dy, dx);

    const playerX1 = player.x + (Math.cos(angle + Math.PI / 2) * beamWidth) / 2;
    const playerY1 = player.y + (Math.sin(angle + Math.PI / 2) * beamWidth) / 2;
    const playerX2 = player.x + (Math.cos(angle - Math.PI / 2) * beamWidth) / 2;
    const playerY2 = player.y + (Math.sin(angle - Math.PI / 2) * beamWidth) / 2;

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

let hazardousZones = [];
const HAZARD_DURATION = 250; // Duration for the hazardous zone to stay active
const HAZARD_DAMAGE = 1; // Damage to the player if they are in the zone
const HAZARD_RADIUS = 15; // Radius of the hazardous zone
const HAZARD_DAMAGE_RATE = 1000; // Time in milliseconds between damage applications
let hazardCooldownActive = false;
let hazardCooldownTimer = 0;

function attackPhase1() {
  if (temporalSerpent.segments.length === 0) return;

  const lastSegment = temporalSerpent.segments[temporalSerpent.segments.length - 1];
  createHazardParticles(lastSegment.x, lastSegment.y);

  hazardousZones.push({
    x: lastSegment.x,
    y: lastSegment.y,
    radius: HAZARD_RADIUS,
    spawnTime: performance.now(),
  });
}

class HazardParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.reset();
  }

  reset() {
    this.size = Math.random() * 10 + 5; // Random size between 5 and 15
    this.alpha = 1; // Full opacity
    this.decay = Math.random() * 0.02 + 0.01; // Increase decay rate for faster fading
    this.dx = (Math.random() - 0.5) * 1; // Horizontal velocity
    this.dy = (Math.random() - 0.5) * 1; // Vertical velocity
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.alpha -= this.decay;
    if (this.alpha <= 0) {
      this.reset();
    }
  }

  draw(ctx) {
    if (this.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 0, 1)'; // Green color
      ctx.fill();
      ctx.restore();
    }
  }
}

let hazardParticles = [];
const maxHazardParticles = 1; // Limit the number of particles

function createHazardParticles(x, y) {
  for (let i = 0; i < maxHazardParticles; i++) {
    const particle = new HazardParticle(x, y);
    hazardParticles.push(particle);
  }
}

function updateHazardParticles() {
  hazardParticles.forEach((particle) => particle.update());
}

function drawHazardParticles(ctx) {
  hazardParticles.forEach((particle) => particle.draw(ctx));
}

function updateHazardousZones(timestamp) {
  hazardousZones = hazardousZones.filter((zone) => timestamp - zone.spawnTime < HAZARD_DURATION);
}

function drawHazardousZones(ctx, timestamp) {
  ctx.save();

  hazardousZones.forEach((zone) => {
    createHazardParticles(zone.x, zone.y); // Create particles for each hazardous zone

    // Optionally, draw a faint base circle
    ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(zone.x, zone.y, zone.radius, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.restore();
}

let isPlayerInHazardZone = false; // Track whether the player is in a hazardous zone

function checkPlayerInHazardousZone(player, timestamp) {
  if (hazardCooldownActive && timestamp < hazardCooldownTimer) {
    return;
  }

  let damageApplied = false;
  let playerIsInHazard = false;

  hazardParticles.forEach((particle) => {
    const dx = player.x - particle.x;
    const dy = player.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < particle.size + player.width / 2) {
      playerIsInHazard = true;
      if (!isInvincible && !shieldActive && !damageApplied) {
        player.health -= HAZARD_DAMAGE;
        damageApplied = true;
        if (player.health <= 0) {
          player.lives--;
          player.health = PLAYER_MAX_HEALTH;
          if (player.lives <= 0) {
          }
        }
      }
    }
  });

  if (damageApplied) {
    hazardCooldownActive = true;
    hazardCooldownTimer = timestamp + HAZARD_DAMAGE_RATE;
  } else {
    hazardCooldownActive = false;
  }

  if (playerIsInHazard && !isPlayerInHazardZone) {
    hazardSound.play();
    isPlayerInHazardZone = true;
  } else if (!playerIsInHazard && isPlayerInHazardZone) {
    hazardSound.pause();
    isPlayerInHazardZone = false;
  }
}

function updateDetachedSegments(deltaTime) {
  detachedSegments.forEach((segment, index) => {
    if (segment.travelDirection) {
      const travelDistance = segment.speed * (deltaTime / 1000);
      segment.x += segment.travelDirection.x * travelDistance;
      segment.y += segment.travelDirection.y * travelDistance;
      segment.travelDistance -= travelDistance;

      if (segment.travelDistance <= 0) {
        segment.explode = true;
        segment.explosionTime = performance.now();
        delete segment.travelDirection; // Remove travelDirection to stop further movement
      }
    }
  });
}

function attackPhase2() {
  if (temporalSerpent.segments.length < 10) return; // Ensure there are enough segments for the attack

  const segmentsToFire = [];
  const numSegments = 1; // Number of segments to detach and fire at the player per attack

  // Select a random segment to detach and fire
  for (let i = 0; i < numSegments; i++) {
    const randomIndex = Math.floor(Math.random() * temporalSerpent.segments.length);
    const segment = temporalSerpent.segments[randomIndex];
    segmentsToFire.push(segment);
    // Remove the segment from the serpent
    temporalSerpent.segments.splice(randomIndex, 1);
  }

  // Detach selected segments and set them up to travel towards the player and explode
  segmentsToFire.forEach((segment) => {
    const dx = player.x - segment.x;
    const dy = player.y - segment.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const travelDuration = 3000; // Time in milliseconds for the segment to travel before exploding

    segment.travelDirection = { x: dx / distance, y: dy / distance };
    segment.travelDistance = 600; // Distance in pixels to travel towards the player

    // Increase the segment speed by reducing the travel duration
    const increasedSpeedFactor = 4; // Increase speed by this factor
    const newTravelDuration = travelDuration / increasedSpeedFactor; // Reduce travel duration to increase speed

    segment.speed = segment.travelDistance / (newTravelDuration / 1000); // New speed based on increased factor

    segment.startX = segment.x;
    segment.startY = segment.y;
    segment.explode = true;
    segment.explosionTime = performance.now() + newTravelDuration; // Update explosion time based on new travel duration

    // Add the detached segment to a global array for detached segments
    detachedSegments.push(segment);
  });
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
  segmentsToExplode.forEach((segment) => {
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

// Function to draw detached segments
function drawDetachedSegments(ctx) {
  detachedSegments.forEach((segment) => {
    ctx.drawImage(
      serpentSegment,
      segment.x - segment.radius,
      segment.y - segment.radius,
      segment.radius * 2,
      segment.radius * 2,
    );
  });
}

function updateTemporalSerpent(deltaTime, timestamp) {
  if (!temporalSerpent || !temporalSerpent.alive) return;

  const head = temporalSerpent.segments[0];
  const moveDistance = (temporalSerpent.speed * deltaTime) / 1000;

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

  // Leave a hazardous zone behind the last segment at a specified interval
  const interval = 500; // Change this value to adjust the interval
  if (temporalSerpent.segments.length > 0 && temporalSerpent.segments.length % interval === 0) {
    const lastSegment = temporalSerpent.segments[temporalSerpent.segments.length - 1];
    hazardousZones.push({
      x: lastSegment.x,
      y: lastSegment.y,
      radius: HAZARD_RADIUS,
      spawnTime: timestamp,
    });

    // Remove old hazardous zones
    hazardousZones = hazardousZones.filter((zone) => timestamp - zone.spawnTime < HAZARD_DURATION);
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
    const distance = Math.sqrt(Math.pow(previousSegment.x - segment.x, 2) + Math.pow(previousSegment.y - segment.y, 2));

    if (distance > segmentSpacing) {
      segment.x = previousSegment.x;
      segment.y = previousSegment.y;
    }
  }

  // Phase transitions
  if (temporalSerpent.health <= temporalSerpent.maxHealth * 0.75 && !temporalSerpent.phaseTransitioned[0]) {
    temporalSerpent.phase = 2;
    temporalSerpent.phaseTransitioned[0] = true;
  } else if (temporalSerpent.health <= temporalSerpent.maxHealth * 0.5 && !temporalSerpent.phaseTransitioned[1]) {
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
        attackPhase4();
        break;
      case 3:
        attackPhase3();
        break;
      case 4:
        attackPhase2();
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

function updateProjectiles(deltaTime, timestamp) {
  let projectilesToRemove = new Set();
  handleWormholeTeleportation();

  projectiles.forEach((projectile, index) => {
    if (projectile.heatSeeking && projectile.fromBoss) {
      // Heat-seeking logic for boss projectiles targeting the player
      const angleToPlayer = Math.atan2(player.y - projectile.y, player.x - projectile.x);
      const heatSeekingStrength = 0.1; // Adjust strength as needed

      projectile.directionX =
        (1 - heatSeekingStrength) * projectile.directionX + heatSeekingStrength * Math.cos(angleToPlayer);
      projectile.directionY =
        (1 - heatSeekingStrength) * projectile.directionY + heatSeekingStrength * Math.sin(angleToPlayer);

      const directionLength = Math.sqrt(
        projectile.directionX * projectile.directionX + projectile.directionY * projectile.directionY,
      );
      projectile.directionX /= directionLength;
      projectile.directionY /= directionLength;
    }
    /*****************************/

    if (projectile.fromPlayer) {
      if (
        energyBarrierActive &&
        checkCollision(
          { x: projectile.x, y: projectile.y, radius: projectile.width / 2 },
          { x: temporalSerpent.segments[0].x, y: temporalSerpent.segments[0].y, radius: temporalSerpent.width / 2 },
        )
      ) {
        handleProjectileReflection(projectile);
      } else {
        if (cyberDragon && cyberDragon.alive) {
          const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
          const dragonCenterX = cyberDragon.x;
          const dragonCenterY = cyberDragon.y;
          const dragonProjectileCircle = {
            x: dragonCenterX,
            y: dragonCenterY,
            radius: cyberDragon.projectileCollisionRadius,
          };

          if (checkCollision(projectileCircle, dragonProjectileCircle)) {
            cyberDragon.health -= projectile.damage;
            const collisionSoundClone = collisionSound.cloneNode();
            collisionSoundClone.volume = collisionSound.volume;
            collisionSoundClone.play();
            projectiles.splice(index, 1);
          }
        }

        if (boss && boss.alive) {
          const projectileCircle = { x: projectile.x, y: projectile.y, radius: projectile.width / 2 };
          const bossCircle = {
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            radius: Math.max(boss.width, boss.height) / 2,
          };

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
              createExplosion(
                biomechLeviathan.x + biomechLeviathan.width / 2,
                biomechLeviathan.y + biomechLeviathan.height / 2,
              );
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

  // Ensure spiral projectiles are updated correctly
  if (cyberDragon && cyberDragon.spiralProjectiles) {
    cyberDragon.spiralProjectiles.forEach((projectile, index) => {
      projectile.x += (projectile.directionX * projectile.speed * deltaTime) / 1000;
      projectile.y += (projectile.directionY * projectile.speed * deltaTime) / 1000;
      projectile.traveledDistance += (projectile.speed * deltaTime) / 1000;

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

function updatePowerUpPosition(powerUpObj, deltaTime) {
  if (powerUpObj) {
    powerUpObj.x += (powerUpObj.speed * powerUpObj.directionX * deltaTime) / 1000;
    powerUpObj.y += (powerUpObj.speed * powerUpObj.directionY * deltaTime) / 1000;

    if (
      powerUpObj.x < -powerUpObj.width ||
      powerUpObj.x > canvas.width ||
      powerUpObj.y < -powerUpObj.height ||
      powerUpObj.y > canvas.height
    ) {
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
      missile.target =
        enemies.find((enemy) => enemy.alive) ||
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
      missile.x += (Math.cos(angleToTarget) * missile.speed * deltaTime) / 1000 || 0;
      missile.y += (Math.sin(angleToTarget) * missile.speed * deltaTime) / 1000 || 0;

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
            createExplosion(
              biomechLeviathan.x + biomechLeviathan.width / 2,
              biomechLeviathan.y + biomechLeviathan.height / 2,
            );
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
          enemies = enemies.filter((enemy) => enemy.alive);
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

function updateBiomechLeviathan(deltaTime, timestamp) {
  if (!biomechLeviathan) return;
  const angleToPlayer = Math.atan2(player.y - biomechLeviathan.y, player.x - biomechLeviathan.x);
  biomechLeviathan.x += (Math.cos(angleToPlayer) * biomechLeviathan.speed * deltaTime) / 1000;
  biomechLeviathan.y += (Math.sin(angleToPlayer) * biomechLeviathan.speed * deltaTime) / 1000;

  // Use tractor beam attack
  biomechLeviathanTractorBeam();

  // Check for other attacks
  if (
    biomechLeviathan.phase === 1 &&
    biomechLeviathan.health <= biomechLeviathan.maxHealth * 0.6 &&
    !biomechLeviathan.phaseTransitioned[0]
  ) {
    biomechLeviathan.phaseTransitioned[0] = true;
    biomechLeviathan.phase = 2;
  } else if (
    biomechLeviathan.phase === 2 &&
    biomechLeviathan.health <= biomechLeviathan.maxHealth * 0.3 &&
    !biomechLeviathan.phaseTransitioned[1]
  ) {
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
  // Fire projectiles in the opposite direction of the player
  if (timestamp % 200 < deltaTime) {
    // Rapid fire every 200ms
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
      damage: 25, // Set damage for ally projectiles
    };
    projectiles.push(projectile);
  }
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
    directionY: position.directionY,
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
    directionY: position.directionY,
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
    directionY: position.directionY,
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
    directionY: position.directionY,
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
    directionY: position.directionY,
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
    directionY: position.directionY,
  };
  boostPowerUpSpawnedThisLevel = true; // Correctly set the flag
}

function spawnFlamethrowerPowerUp() {
  if (level <= 5) return;
  const position = getOffScreenSpawnPosition(30, 30);
  flamethrowerPowerUp = {
    x: position.x,
    y: position.y,
    width: 30,
    height: 30,
    speed: 100,
    directionX: position.directionX,
    directionY: position.directionY,
  };
  flamethrowerSpawnedThisLevel = true;
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
  const bossIndex = Math.floor((level - 5) / 5) % bosses.length;
  return bosses[bossIndex];
}

function initLevel(level) {
  // Clear existing timeouts
  enemyRespawnTimeouts.forEach((timeout) => clearTimeout(timeout));
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
    countdown = levelDuration / 1000; // Set countdown for non-boss levels
  }

  resetPowerUpTimers();

  levelStartTime = performance.now();
  countdown = isBossLevel ? Infinity : levelDuration / 1000;

  manageMusic();
  initWormholes(level);
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

function useBomb() {
    // Play bomb sound
    bombSound.currentTime = 0;
    bombSound.play();

    // Bomb effect logic (damage and other effects)
    const playerCircle = { x: player.x, y: player.y, radius: BOMB_RADIUS };

    // Handle enemy destruction
    enemies = enemies.filter((enemy) => {
      const enemyCircle = { x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, radius: enemy.width / 2 };
      return !checkCollision(playerCircle, enemyCircle);
    });

    // Handle projectile destruction
    projectiles = projectiles.filter((projectile) => {
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
      cyberDragon.spiralProjectiles = cyberDragon.spiralProjectiles.filter((projectile) => {
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
      const biomechLeviathanCircle = {
        x: biomechLeviathan.x,
        y: biomechLeviathan.y,
        radius: biomechLeviathan.width / 2,
      };
      if (checkCollision(playerCircle, biomechLeviathanCircle)) {
        biomechLeviathan.health -= BOMB_DAMAGE;
        biomechHitByBomb = true;
        if (biomechLeviathan.health <= 0) {
          biomechLeviathan.alive = false;
          createExplosion(
            biomechLeviathan.x + biomechLeviathan.width / 2,
            biomechLeviathan.y + biomechLeviathan.height / 2,
          );
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
      const temporalSerpentCircle = {
        x: temporalSerpent.segments[0].x,
        y: temporalSerpent.segments[0].y,
        radius: temporalSerpent.segments[0].radius,
      };
      if (checkCollision(playerCircle, temporalSerpentCircle)) {
        temporalSerpent.health -= BOMB_DAMAGE;
        makeTemporalSerpentLeaveScreen();
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
  }
}

function updateBombs(deltaTime) {
  if (bombActive) {
    const timeSinceBomb = performance.now() - bombFlashTime;

    if (timeSinceBomb >= 1000) {
      // Bomb is active for 1 second
      bombActive = false;
      bossHitByBomb = false;
      biomechHitByBomb = false;
      cyberDragonHitByBomb = false;
      temporalSerpentHitByBomb = false;
    }

    // Handle enemy destruction and other effects here
    enemies = enemies.filter((enemy) => {
      const playerCircle = { x: player.x, y: player.y, radius: BOMB_RADIUS };
      const enemyCircle = { x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2, radius: enemy.width / 2 };
      return !checkCollision(playerCircle, enemyCircle);
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
    let target =
      enemies.find((enemy) => enemy.alive) ||
      (boss && boss.alive ? boss : null) ||
      (biomechLeviathan && biomechLeviathan.alive ? biomechLeviathan : null) ||
      (cyberDragon && cyberDragon.alive ? cyberDragon : null) ||
      (temporalSerpent && temporalSerpent.alive ? temporalSerpent.segments[0] : null); // Target the head of the temporalSerpent

    if (target) {
      homingMissilesInventory--;
      for (let i = 0; i < 3; i++) {
        // Fire 3 missiles
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
          maxDistance: 1000, // Define a maximum travel distance for the missile
        };
        homingMissiles.push(homingMissile);
      }

      // Play the homing missile sound
      const homingMissileSoundClone = homingMissileSound.cloneNode();
      homingMissileSoundClone.volume = soundEffectsVolumeSlider.value; // Ensure volume matches the slider
      homingMissileSoundClone.play().catch((error) => {});
    }
  }
}

// Reduce the volume of the flame sound by 50%
flameSound.volume = 0.5;

// Reduce the volume of the flame sound by 50%
flameSound.volume = 0.5;

function gameLoop(timestamp) {
  if (gameOver) {
    player.health = 0.1;
    player.lives = 0;
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2 - 30, canvas.height / 2 + 40);
    ctx.fillText('Level: ' + level, canvas.width / 2 - 30, canvas.height / 2 + 70);
    ctx.fillText('Press B to Restart', canvas.width / 2 - 30, canvas.height / 2 + 100);
    stopBackgroundMusic();
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

    if (biomechLeviathan) {
      updateBiomechLeviathan(deltaTime, timestamp);
    }

    if (cyberDragon) {
      updateCyberDragon(deltaTime, timestamp);
      drawCyberDragon();
      drawLaserCharge();
      drawSpiralProjectiles();
    }

    if (temporalSerpent) {
      updateTemporalSerpent(deltaTime, timestamp);
      checkPlayerInHazardousZone(player, timestamp);
      updateDetachedSegments(deltaTime);
      updateHazardParticles();
      updateHazardousZones(timestamp);
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
      drawSpiralProjectiles();
    }

    if (temporalSerpent) {
      drawHazardParticles(ctx);
      drawHazardousZones(ctx, performance.now());
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
  }

  updateFlameParticles();
  checkFlameDamage(); // Add this line to check for flame damage to enemies, projectiles, and bosses
  requestAnimationFrame(gameLoop);
}

function useBoost() {
  if (isBoosting || (!isUnlimitedBoostActivated && performance.now() < boostCooldownEndTime)) return;

  isBoosting = true;
  if (!isInvincible) {
    // Only set isInvincible if it's not already true
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
  if (!isCheatCodeActivated) {
    // Only reset isInvincible if the cheat code is not active
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
  updateInkClouds(deltaTime); // Update ink cloud here
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
    // Basic movement
  }

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

  // Update the biomechLeviathan if it exists
  if (biomechLeviathan) {
    updateBiomechLeviathan(deltaTime, timestamp); // Ensure this calls inkCloud initialization
  }

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

    if (
      checkCollision(playerCircle, biomechCircle) &&
      !isInvincible &&
      !shieldActive &&
      timestamp - player.lastCollisionTime >= 3000
    ) {
      player.health -= 10;
      player.lastCollisionTime = timestamp;

      if (player.health <= 0) {
        player.lives--;
        player.health = PLAYER_MAX_HEALTH;
        lifeLostSound.play();
        if (player.lives <= 0) {
        }
      }
      const collisionSoundClone = collisionSound.cloneNode();
      collisionSoundClone.volume = collisionSound.volume;
      collisionSoundClone.play();
      biomechEatSound.currentTime = 0; // Reset the sound to the beginning
      biomechEatSound.play();
    }
  }

  // Collision detection between player and boss
  if (boss && boss.alive) {
    const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
    const bossCircle = {
      x: boss.x + boss.width / 2,
      y: boss.y + boss.height / 2,
      radius: Math.max(boss.width, boss.height) / 2,
    };

    if (
      checkCollision(playerCircle, bossCircle) &&
      !isInvincible &&
      !shieldActive &&
      timestamp - player.lastCollisionTime >= 3000
    ) {
      player.health -= 10;
      player.lastCollisionTime = timestamp;

      if (player.health <= 0) {
        player.lives--;
        player.health = PLAYER_MAX_HEALTH;
        lifeLostSound.play();
        if (player.lives <= 0) {
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

  // Collision detection between player and Temporal Serpent
  if (temporalSerpent && temporalSerpent.alive) {
    const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };

    temporalSerpent.segments.forEach((segment) => {
      const segmentCircle = { x: segment.x, y: segment.y, radius: segment.radius };

      if (
        checkCollision(playerCircle, segmentCircle) &&
        !isInvincible &&
        !shieldActive &&
        timestamp - player.lastCollisionTime >= 3000
      ) {
        player.health -= 10;
        player.lastCollisionTime = timestamp;

        if (player.health <= 0) {
          player.lives--;
          player.health = PLAYER_MAX_HEALTH;
          lifeLostSound.play();
          if (player.lives <= 0) {
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

    if (
      checkCollision(playerCircle, dragonCircle) &&
      !isInvincible &&
      !shieldActive &&
      timestamp - player.lastCollisionTime >= 3000
    ) {
      player.health -= 10;
      player.lastCollisionTime = timestamp;

      if (player.health <= 0) {
        player.lives--;
        player.health = PLAYER_MAX_HEALTH;
        lifeLostSound.play();
        if (player.lives <= 0) {
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
  if (
    isBossLevel &&
    enemies.length === 0 &&
    boss === null &&
    biomechLeviathan === null &&
    (cyberDragon === null || cyberDragon.health <= 0) &&
    (temporalSerpent === null || temporalSerpent.health <= 0)
  ) {
    level++;
    initLevel(level);
  }
}

function drawProjectile() {
  projectiles.forEach((projectile) => {
    if (projectile.fromBoss) {
      // Draw boss projectiles using the image
      ctx.drawImage(
        bossProjectileImage,
        projectile.x - projectile.width / 2,
        projectile.y - projectile.height / 2,
        projectile.width,
        projectile.height,
      );
    } else if (projectile.fromPlayer) {
    } else {
      // Draw other enemy projectiles as red circles
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function draw() {
  drawWormholes();

  if (powerUp) {
    ctx.drawImage(powerUpImage, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
  }

  if (bombPowerUp) {
    ctx.drawImage(bombPowerUpImage, bombPowerUp.x, bombPowerUp.y, bombPowerUp.width, bombPowerUp.height);
  }

  if (homingMissilePowerUp) {
    ctx.drawImage(
      homingMissilePowerUpImage,
      homingMissilePowerUp.x,
      homingMissilePowerUp.y,
      homingMissilePowerUp.width,
      homingMissilePowerUp.height,
    );
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
    ctx.drawImage(
      flamethrowerPowerUpImage,
      flamethrowerPowerUp.x,
      flamethrowerPowerUp.y,
      flamethrowerPowerUp.width,
      flamethrowerPowerUp.height,
    );
  }

  projectiles.forEach(drawProjectile);

  homingMissiles.forEach((missile) => {
    ctx.save();
    ctx.translate(missile.x, missile.y);
    const angleToTarget = Math.atan2(missile.target.y - missile.y, missile.target.x - missile.x);
    ctx.rotate(angleToTarget);
    ctx.drawImage(homingMissileImage, -missile.width / 2, -missile.height / 2, missile.width, missile.height);
    ctx.restore();
  });

  // Draw the tractor beam
  drawTractorBeam();
  drawInkClouds();

  // Draw the ally
  drawAlly();

  // Draw detached segments
  drawDetachedSegments(ctx);

  // Draw particles
  drawParticles(ctx);

  // Draw projectiles
  projectiles.forEach((projectile) => {
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

  drawFlameParticles(ctx);
}
