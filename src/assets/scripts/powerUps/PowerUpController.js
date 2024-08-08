import powerUps from './PowerUp.js';

export default class PowerUpController {
  constructor(game) {
    this.game = game;
    this.powerUps = powerUps;
    this.activePowerUps = [];
    this.maxPowerUps = 3;
  }

  draw(ctx) {
    // this.activePowerUps.forEach((powerUp) => powerUp.draw(ctx));
  }

  update() {
    // this.activePowerUps.forEach((powerUp, index) => {
    //  if (powerUp.markedForDeletion) this.activePowerUps.splice(index, 1);
    // });
  }

  removeAll() {
    this.activePowerUps = [];
  }
}

//RESET TIMERS

// function resetPowerUpTimers() {
//   powerUp = null;
//   powerUpSpawned = false;
//   powerUpSpawnTime = performance.now() + Math.random() * 5000 + 2000;
//   powerUpSpawnedThisLevel = false;

//   bombPowerUp = null;
//   bombSpawned = false;
//   bombPowerUpSpawnTime = performance.now() + Math.random() * 5000 + 6000;
//   bombPowerUpSpawnedThisLevel = false;

//   homingMissilePowerUp = null;
//   homingMissileSpawned = false;
//   homingMissilePowerUpSpawnTime = performance.now() + Math.random() * 5000 + 14000;
//   homingMissilePowerUpSpawnedThisLevel = false;

//   shieldPowerUp = null;
//   shieldPowerUpSpawned = false;
//   shieldPowerUpSpawnTime = performance.now() + Math.random() * 5000 + 10000;
//   shieldPowerUpSpawnedThisLevel = false;

//   reversePowerUp = null;
//   reversePowerUpSpawned = false;
//   reversePowerUpSpawnTime = performance.now() + Math.random() * 5000 + 10000;
//   reversePowerUpSpawnedThisLevel = false;

//   boostPowerUp = null;
//   boostPowerUpSpawned = false;
//   boostPowerUpSpawnTime = performance.now() + Math.random() * 5000 + 10000;
//   boostPowerUpSpawnedThisLevel = false;

//   flamethrowerPowerUp = null;
//   flamethrowerSpawned = false;
//   flamethrowerSpawnTime = performance.now() + Math.random() * 5000 + 15000;
//   flamethrowerSpawnedThisLevel = false;
// }

// function updatePowerUps(deltaTime, timestamp) {
//   const totalPowerUps =
//     (powerUp ? 1 : 0) +
//     (bombPowerUp ? 1 : 0) +
//     (homingMissilePowerUp ? 1 : 0) +
//     (shieldPowerUp ? 1 : 0) +
//     (reversePowerUp ? 1 : 0) +
//     (boostPowerUp ? 1 : 0);

//   if (!powerUp && timestamp >= powerUpSpawnTime && !powerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
//     spawnPowerUp();
//     powerUpSpawnedThisLevel = true;
//   }
//   if (!bombPowerUp && timestamp >= bombSpawnTime && !bombPowerUpSpawnedThisLevel && totalPowerUps < MAX_POWER_UPS) {
//     spawnBombPowerUp();
//     bombPowerUpSpawnedThisLevel = true;
//   }
//   if (
//     !homingMissilePowerUp &&
//     timestamp >= homingMissilePowerUpSpawnTime &&
//     !homingMissilePowerUpSpawnedThisLevel &&
//     totalPowerUps < MAX_POWER_UPS
//   ) {
//     spawnHomingMissilePowerUp();
//     homingMissilePowerUpSpawnedThisLevel = true;
//   }
//   if (
//     !shieldPowerUp &&
//     timestamp >= shieldPowerUpSpawnTime &&
//     !shieldPowerUpSpawnedThisLevel &&
//     totalPowerUps < MAX_POWER_UPS
//   ) {
//     spawnShieldPowerUp();
//     shieldPowerUpSpawnedThisLevel = true;
//   }
//   if (
//     !reversePowerUp &&
//     timestamp >= reversePowerUpSpawnTime &&
//     !reversePowerUpSpawnedThisLevel &&
//     totalPowerUps < MAX_POWER_UPS
//   ) {
//     spawnReversePowerUp();
//     reversePowerUpSpawnedThisLevel = true;
//   }
//   if (
//     !boostPowerUp &&
//     timestamp >= boostPowerUpSpawnTime &&
//     !boostPowerUpSpawnedThisLevel &&
//     totalPowerUps < MAX_POWER_UPS
//   ) {
//     spawnBoostPowerUp();
//     boostPowerUpSpawnedThisLevel = true;
//   }
//   if (
//     !flamethrowerPowerUp &&
//     timestamp >= flamethrowerSpawnTime &&
//     !flamethrowerSpawnedThisLevel &&
//     totalPowerUps < MAX_POWER_UPS
//   ) {
//     spawnFlamethrowerPowerUp();
//     flamethrowerSpawnedThisLevel = true;
//   }

//   updateSineWavePowerUp(powerUp, deltaTime, 'powerUp');
//   updateSineWavePowerUp(bombPowerUp, deltaTime, 'bombPowerUp');
//   updateSineWavePowerUp(homingMissilePowerUp, deltaTime, 'homingMissilePowerUp');
//   updateSineWavePowerUp(shieldPowerUp, deltaTime, 'shieldPowerUp');
//   updateSineWavePowerUp(reversePowerUp, deltaTime, 'reversePowerUp');
//   updateSineWavePowerUp(boostPowerUp, deltaTime, 'boostPowerUp');
//   updateSineWavePowerUp(flamethrowerPowerUp, deltaTime, 'flamethrowerPowerUp');
// }

// function updateSineWavePowerUp(powerUpObj, deltaTime, type) {
//   if (powerUpObj) {
//     const playerCircle = { x: player.x, y: player.y, radius: player.width / 2 };
//     const powerUpCircle = {
//       x: powerUpObj.x + powerUpObj.width / 2,
//       y: powerUpObj.y + powerUpObj.height / 2,
//       radius: powerUpObj.width / 2,
//     };

//     if (checkCollision(playerCircle, powerUpCircle)) {
//       if (type === 'powerUp') {
//         powerUpActive = true;
//         powerUpExpirationTime = performance.now() + 15000; // Set the power-up duration
//       } else if (type === 'bombPowerUp') {
//         bombs++;
//       } else if (type === 'homingMissilePowerUp') {
//         homingMissilesInventory++;
//       } else if (type === 'shieldPowerUp') {
//         shieldActive = true;
//         shieldPowerUpExpirationTime = performance.now() + 15000; // Set the shield power-up duration
//       } else if (type === 'reversePowerUp') {
//         reversePowerUpActive = true;
//         reversePowerUpExpirationTime = performance.now() + 10000; // Set the reverse power-up duration to 10 seconds
//       } else if (type === 'boostPowerUp') {
//         boostPowerUpActive = true;
//         boostPowerUpExpirationTime = performance.now() + 10000; // Set the boost power-up duration to 10 seconds
//         boostCooldownEndTime = performance.now(); // Reset boost cooldown timer
//       } else if (type === 'flamethrowerPowerUp') {
//         flamethrowerActive = true;
//         flamethrowerExpirationTime = performance.now() + 10000; // Set the flamethrower duration to 10 seconds
//       }
//       const powerUpSoundClone = powerUpSound.cloneNode();
//       powerUpSoundClone.volume = soundEffectsVolumeSlider.value;
//       powerUpSoundClone.play();

//       // Remove the power-up
//       if (type === 'powerUp') powerUp = null;
//       else if (type === 'bombPowerUp') bombPowerUp = null;
//       else if (type === 'homingMissilePowerUp') homingMissilePowerUp = null;
//       else if (type === 'shieldPowerUp') shieldPowerUp = null;
//       else if (type === 'reversePowerUp') reversePowerUp = null;
//       else if (type === 'boostPowerUp') boostPowerUp = null;
//       else if (type === 'flamethrowerPowerUp') flamethrowerPowerUp = null;
//     } else {
//       powerUpObj.x += (powerUpObj.speed * powerUpObj.directionX * deltaTime) / 1000;
//       powerUpObj.y += Math.sin(powerUpObj.x / 50) * 1.5; // Sine wave motion

//       if (powerUpObj.y < 0 || powerUpObj.y + powerUpObj.height > canvas.height) {
//         powerUpObj.directionY *= -1;
//         powerUpObj.y = Math.max(0, Math.min(powerUpObj.y, canvas.height - powerUpObj.height));
//       }

//       if (powerUpObj.x < -powerUpObj.width || powerUpObj.x > canvas.width) {
//         if (type === 'powerUp') powerUp = null;
//         else if (type === 'bombPowerUp') bombPowerUp = null;
//         else if (type === 'homingMissilePowerUp') homingMissilePowerUp = null;
//         else if (type === 'shieldPowerUp') shieldPowerUp = null;
//         else if (type === 'reversePowerUp') reversePowerUp = null;
//         else if (type === 'boostPowerUp') boostPowerUp = null;
//         else if (type === 'flamethrowerPowerUp') flamethrowerPowerUp = null;
//       }
//     }
//   }
// }
