import Asteroid from '../hazards/Asteroid.js';
import Explosion from '../effects/Explosion.js';

export default class CyberDragon {
  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 250;
    this.height = 250;
    this.speed = 50;
    this.maxHealth = 3000;
    this.health = this.maxHealth;
    this.lastAttackTime = 0;
    this.attackInterval = 2000;
    this.asteroidInverval = 600;
    this.canAttack = true;
    this.phase = 3;
    this.phaseTransitioned = [false, false, false, false];
    this.laserCharging = false;
    this.laserChargeRadius = 5;
    this.laserChargeTime = 0;
    this.laserChargeDuration = 3500;
    this.laserReady = false;
    this.projectileCollisionRadius = 125;
    this.playerCollisionRadius = 47.5;
    this.lastBombDamageTime = 0;
    this.spiralAngle = 0;
    this.spiralActive = false;
    this.spiralStartTime = 0;
    this.spiralDuration = 5000;
    this.spiralCooldown = 4000;
    this.lastSpiralFireTime = 0;
    this.spiralFireInterval = 100;
    this.healthBarWidth = this.width;
    this.healthBarHeight = 10;
    this.healthBarX = this.x - this.width / 2;
    this.healthBarY = this.y + this.height / 2 + 10;
    this.projectiles = [];
    this.playerCollisionRadius = 65;
    this.damage = 0.1;
    this.score = this.maxHealth;
    this.nextAsteroidTimer = null;
    this.markedForDeletion = false;
    this.image = document.getElementById('cyber_dragon_image');
    this.sounds = {
      laserCharging: document.getElementById('laser_charging_sound'),
      spiralShot: document.getElementById('spiral_shot_sound'),
    };
    this.music = null;

    this.game.getOffScreenRandomSide(this, 20);
  }

  draw(ctx) {
    // Dragon
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
    ctx.restore();

    // Health Bar
    const healthRatio = this.health / this.maxHealth;
    ctx.fillStyle = 'rgba(187,27,27,0.85)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * healthRatio, this.healthBarHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

    // Laser Charge
    if (this.laserCharging) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y + 6, this.laserChargeRadius, 0, 2 * Math.PI);
      ctx.fill();
    }

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'orange';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.playerCollisionRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime) {
    // Movement
    const distanceToPlayer = this.game.player.getDistanceToPlayer(this);
    // Snap to player if close to avoid bouncing
    const snapThreshold = 2; // Increase this if bouncing continues
    if (distanceToPlayer < snapThreshold) {
      this.x = this.game.player.x;
      this.y = this.game.player.y;
    } else {
      // Move toward player
      const angleToPlayer = this.game.player.getAngleToPlayer(this);
      this.x += (Math.cos(angleToPlayer) * (this.speed * deltaTime)) / 1000;
      this.y += (Math.sin(angleToPlayer) * (this.speed * deltaTime)) / 1000;
    }

    // Health bar follows boss
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y + this.height * 0.5 + 10;

    // Phase Transitions
    if (this.health < this.maxHealth * 0.75 && this.phase === 1 && !this.phaseTransitioned[1]) {
      this.phase = 2;
      this.phaseTransitioned[1] = true;
    } else if (this.health < this.maxHealth * 0.5 && this.phase === 1 && !this.phaseTransitioned[3]) {
      this.phase = 3;
      this.phaseTransitioned[2] = true;
    } else if (this.health < this.maxHealth * 0.25 && this.phase === 1 && !this.phaseTransitioned[3]) {
      this.phase = 4;
      this.phaseTransitioned[2] = true;
    }

    // Laser Charging
    if (this.laserCharging) {
      this.laserChargeTime += deltaTime;
      this.laserChargeRadius = 5 + (this.laserChargeTime / this.laserChargeDuration) * 20;

      if (this.laserChargeTime >= this.laserChargeDuration) {
        this.laserReady = true;
        this.laserCharging = false;
        this.fireLaser();
        this.sounds.laserCharging.pause();
        this.sounds.laserCharging.currentTime = 0;
      }
    }

    // Attack logic
    if (this.canAttack && Date.now() - this.lastAttackTime > this.asteroidInverval) {
      switch (this.phase) {
        case 1:
          this.attackPattern1();
          break;
        case 2:
          this.attackPattern2();
          break;
        case 3:
          this.attackPattern3(deltaTime);
          break;
        case 4:
          this.attackPattern4(deltaTime);
          break;
      }
      this.lastAttackTime = Date.now();
    }

    this.checkCollisions();
  }

  checkCollisions() {
    // Collision with player projectiles
    this.game.player.projectiles.forEach((projectile) => {
      if (this.game.checkCollision(projectile, this)) {
        this.takeDamage(projectile.damage);
        if (this.health <= 0) this.markedForDeletion = true;
        projectile.markedForDeletion = true;
      }
    });

    // Collision with player
    if (this.game.checkCollision(this.game.player, { x: this.x, y: this.y, radius: this.playerCollisionRadius })) {
      this.game.player.takeDamage(this.damage);
      this.game.player.sounds.collision.cloneNode().play();
    }
  }

  attackPattern1() {
    this.chargeLaser();
  }

  attackPattern2() {
    this.chargeLaser();
    this.spawnAsteroid();
  }

  attackPattern3(deltaTime) {
    this.fireSpiralProjectiles(deltaTime);
  }

  attackPattern4(deltaTime) {
    this.chargeLaser();
    this.spawnAsteroid();
    this.fireSpiralProjectiles(deltaTime);
  }

  chargeLaser() {
    if (!this.laserCharging) {
      this.laserCharging = true;
      this.laserChargeTime = 0;
      this.laserChargeRadius = 5;
      this.sounds.laserCharging.currentTime = 0;
      this.sounds.laserCharging.play();
    }
  }

  fireLaser() {
    if (!this.laserReady) return;
    const angleToPlayer = this.game.player.getAngleToPlayer(this);
    this.projectiles.push(new Laser(this, angleToPlayer));
    this.laserReady = false;
  }

  spawnAsteroid() {
    this.projectiles.push(new Asteroid(this.game));
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      if (this.nextAsteroidTimer) clearTimeout(this.nextAsteroidTimer);
      this.game.player.addScore(this.score);
      this.game.effects.push(new Explosion(this.game, this.x, this.y));
      this.projectiles.forEach((projectile) => (projectile.markedForDeletion = true));
      this.markedForDeletion = true;
      this.game.nextLevel();
    }
  }

  fireSpiralProjectiles() {
    const timestamp = Date.now();

    if (this.spiralActive) {
      if (timestamp - this.spiralStartTime > 7000) {
        this.spiralActive = false;
        this.sounds.spiralShot.pause();
        this.sounds.spiralShot.currentTime = 0;
        this.spiralStartTime = timestamp;
      } else {
        // Only fire a projectile if the interval has passed
        if (timestamp - this.lastSpiralFireTime > this.spiralFireInterval) {
          const angle = this.spiralAngle;
          this.projectiles.push(new SpiralProjectile(this, angle));
          this.spiralAngle += 0.1; // Adjust for desired spiral tightness

          // Update the last fire time
          this.lastSpiralFireTime = timestamp;
        }
      }
    } else {
      if (timestamp - this.spiralStartTime > 3000) {
        this.spiralActive = true;
        this.playSpiralShotSound();
        this.spiralStartTime = timestamp;
      }
    }
  }

  playSpiralShotSound() {
    this.sounds.spiralShot.currentTime = 0;
    this.sounds.spiralShot.play();
    setTimeout(() => {
      if (this.spiralActive) {
        this.sounds.spiralShot.currentTime = 0;
        this.sounds.spiralShot.play();
      }
    }, 3500); // Play the sound again after a delay if still active
  }
}

class Laser {
  constructor(dragon, angle) {
    this.dragon = dragon;
    this.game = this.dragon.game;
    this.x = this.dragon.x;
    this.y = this.dragon.y;
    this.width = 20;
    this.height = 50;
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
    this.speed = 1000;
    this.damage = 30;
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.directionY, this.directionX) + Math.PI);
    ctx.fillStyle = 'red';
    ctx.fillRect(-this.width * 0.5, -this.width * 0.5, this.height, this.width);
    ctx.restore();

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime) {
    // Movement
    this.x += (this.speed * this.directionX * deltaTime) / 1000;
    this.y += (this.speed * this.directionY * deltaTime) / 1000;

    if (this.game.outOfBounds(this, this.height)) {
      this.markedForDeletion = true;
    }
  }
}

class SpiralProjectile {
  constructor(dragon, angle) {
    this.dragon = dragon;
    this.game = this.dragon.game;
    this.x = this.dragon.x;
    this.y = this.dragon.y;
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
    this.speed = 150;
    this.damage = 10;
    this.radius = 5;
    this.maxDistance = 800;
    this.traveledDistance = 0;
    this.markedForDeletion = false;
    console.log('created spiral projectile');
  }

  draw(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    this.x += (this.directionX * this.speed * this) / 1000;
    this.y += (this.directionY * this.speed * this) / 1000;
    this.traveledDistance += (this.speed * this) / 1000;

    if (this.traveledDistance > this.maxDistance) this.markedForDeletion = true;

    // SPIRAL COLLISIONS
    // cyberDragon.spiralProjectiles.forEach((projectile, index) => {
    //   const dx = projectile.x - player.x;
    //   const dy = projectile.y - player.y;
    //   const distance = Math.sqrt(dx * dx + dy * dy);

    //   // Check collision with player
    //   if (distance < projectile.radius + player.width / 2) {
    //     if (!isInvincible && !shieldActive) {
    //       // Respect player's invincibility and shield status
    //       // Apply damage to the player
    //       player.health -= projectile.damage;

    //       // Play the existing collision sound
    //       const collisionSoundClone = collisionSound.cloneNode();
    //       collisionSoundClone.volume = collisionSound.volume;
    //       collisionSoundClone.play();

    //       if (player.health <= 0) {
    //         player.lives--;
    //         player.health = PLAYER_MAX_HEALTH;
    //         if (player.lives <= 0) {
    //         }
    //       }
    //     } else if (shieldActive) {
    //       // Play the existing collision sound for shield hit
    //       const collisionSoundClone = collisionSound.cloneNode();
    //       collisionSoundClone.volume = collisionSound.volume;
    //       collisionSoundClone.play();
    //     }

    //     cyberDragon.spiralProjectiles.splice(index, 1);
    //   }

    //   // Check collision with bomb
    //   if (bomb.active) {
    //     const bombDx = projectile.x - bomb.x;
    //     const bombDy = projectile.y - bomb.y;
    //     const bombDistance = Math.sqrt(bombDx * bombDx + bombDy * bombDy);

    //     if (bombDistance < projectile.radius + bomb.radius) {
    //       // Remove the projectile if it collides with the bomb
    //       cyberDragon.spiralProjectiles.splice(index, 1);
    //     }
    //   }
    // });
  }
}

// function updateProjectiles(deltaTime, timestamp) {
//   let projectilesToRemove = new Set();
//   handleWormholeTeleportation();

//   // Ensure spiral projectiles are updated correctly
//   if (cyberDragon && cyberDragon.spiralProjectiles) {
//     cyberDragon.spiralProjectiles.forEach((projectile, index) => {
//       projectile.x += (projectile.directionX * projectile.speed * deltaTime) / 1000;
//       projectile.y += (projectile.directionY * projectile.speed * deltaTime) / 1000;
//       projectile.traveledDistance += (projectile.speed * deltaTime) / 1000;

//       if (projectile.traveledDistance > projectile.maxDistance) {
//         cyberDragon.spiralProjectiles.splice(index, 1);
//         return;
//       }

//       // Check collision with player
//       const dx = projectile.x - player.x;
//       const dy = projectile.y - player.y;
//       const distance = Math.sqrt(dx * dx + dy * dy);
//       if (distance < projectile.radius + player.radius) {
//         // Collision detected, reduce player health
//         player.health -= projectile.damage;
//         if (player.health <= 0) {
//           // Handle player death
//         }
//         // Remove the projectile
//         cyberDragon.spiralProjectiles.splice(index, 1);
//         return;
//       }
//     });
//   }
// }
