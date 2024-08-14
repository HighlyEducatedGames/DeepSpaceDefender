import RegularProjectile from './projectiles/RegularProjectile.js';
import Bomb from './projectiles/Bomb.js';
import HomingMissile from './projectiles/HomingMissile.js';
import BiomechLeviathan from './bosses/BiomechLeviathan.js';

export default class Player {
  constructor(game) {
    this.game = game;
    this.width = 50;
    this.height = 50;
    this.radius = this.width * 0.5;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5 + this.game.topMargin * 0.5;
    this.offset = 4;
    this.speed = 200;
    this.rotation = -Math.PI * 0.5;
    this.rotationSpeed = 4;
    this.velocity = { x: 0, y: 0 };
    this.thrust = 0;
    this.acceleration = 300;
    this.deceleration = 0.98;
    this.maxSpeed = 300;
    this.lives = 3;
    this.collided = false;
    this.collisionTime = 0;
    this.collisionDuration = 1000;
    this.maxHealth = 30;
    this.health = this.maxHealth;
    this.maxLives = 3;
    this.lives = this.maxLives;
    this.nextLifeScore = 1500;
    this.isBoosting = false;
    this.boostEndTime = 0;
    this.boostCooldownEndTime = 0;
    this.isCharging = false;
    this.chargingSoundTimeout = null;
    this.bomb = null;
    this.bombs = 0;
    this.maxBombs = 20;
    this.shieldActive = false;
    this.missiles = 0;
    this.maxMissiles = 20;
    // this.bombSpawnTime = 0;
    // this.bombFlashTime = 0;
    // this.bombSpawned = false;
    this.powerUpActive = false; // TODO power up controller
    this.images = {
      idle: document.getElementById('player_image'),
      thrust: document.getElementById('player_thrust_image'),
      reverse: document.getElementById('player_reverse_image'),
    };
    this.sounds = {
      acceleration: document.getElementById('acceleration_sound'),
      reverse: document.getElementById('reverse_sound'),
      fire: document.getElementById('fire_sound'),
      charging: document.getElementById('charging_sound'),
      flame: document.getElementById('flame_sound'),
      torchedEnemy: document.getElementById('torch_sound'),
      boost: document.getElementById('boost_sound'),
      lostLife: document.getElementById('lifelost_sound'),
    };
  }

  draw(ctx) {
    const keys = this.game.controls.keys; // Current keys state

    // Draw player

    // Adjust the translation rotation center based on player rotation
    // because the shift property moves the image off center.
    // This keeps the player image centered in the hitbox when rotating
    const xAdjustPos = Math.cos(this.rotation) * this.offset;
    const yAdjustPos = Math.sin(this.rotation) * this.offset;

    ctx.save();
    ctx.translate(this.x - xAdjustPos, this.y - yAdjustPos);
    ctx.rotate(this.rotation);

    let image;
    if (keys.up.isPressed) {
      image = this.images.thrust;
    } else if (keys.down.isPressed) {
      image = this.images.reverse;
    } else {
      image = this.images.idle;
    }

    ctx.drawImage(image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
    ctx.restore();

    // Invincibility Shield
    if (this.game.controls.codes.invincibility.enabled) {
      const gradient = ctx.createRadialGradient(this.x, this.y, this.width / 2, this.x, this.y, this.width);
      gradient.addColorStop(0, 'rgba(255, 69, 0, 0.5)'); // Red/orange color with 50% opacity
      gradient.addColorStop(0.7, 'rgba(255, 140, 0, 0.2)'); // Lighter orange color with 20% opacity
      gradient.addColorStop(1, 'rgba(255, 165, 0, 0)'); // Even lighter orange color with 0% opacity
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Boosting Effect
    if (this.isBoosting) {
      const gradient = ctx.createRadialGradient(this.x, this.y, this.width * 0.5, this.x, this.y, this.width);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
      gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Shield Effect
    if (this.shieldActive) {
      const gradient = ctx.createRadialGradient(this.x, this.y, this.width * 0.5, this.x, this.y, this.width);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
      gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Bomb
    if (this.bomb) this.bomb.draw(ctx);

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime) {
    const keys = this.game.controls.keys; // Current keys state

    // Rotate player
    if (keys.left.isPressed && !keys.right.isPressed) this.rotation -= (this.rotationSpeed * deltaTime) / 1000;
    if (keys.right.isPressed && !keys.left.isPressed) this.rotation += (this.rotationSpeed * deltaTime) / 1000;

    // Forward and reverse
    if (keys.up.isPressed) {
      this.thrust = this.acceleration;
      if (this.sounds.acceleration.paused) this.sounds.acceleration.play();
    } else if (keys.down.isPressed) {
      this.thrust = -this.acceleration;
      if (this.sounds.reverse.paused) this.sounds.reverse.play();
    } else {
      this.thrust = 0;
    }

    // Stop acceleration sound if no longer pressing ArrowUp
    if (!keys.up.isPressed && !this.sounds.acceleration.paused) {
      this.sounds.acceleration.pause();
      this.sounds.acceleration.currentTime = 0;
    }

    // Stop reverse sound is no longer pressing ArrowDown or if ArrowUp IS pressed
    if ((!keys.down.isPressed || keys.up.isPressed) && !this.sounds.reverse.paused) {
      this.sounds.reverse.pause();
      this.sounds.reverse.currentTime = 0;
    }

    // Game over if player is out of lives and health
    if (this.lives <= 0 && this.health <= 0) {
      this.game.gameOver();
    }

    if (!this.game.menu.isOpen && !this.game.isGameOver) {
      if (keys.fire.justPressed()) this.fireProjectile();
      if (keys.bomb.justPressed()) this.useBomb();
      if (keys.boost.justPressed()) this.useBoost();
      if (keys.missile.justPressed()) this.useMissile();
    }

    /*if (keys.fire.isPressed) {
      if (!this.isCharging) {
        this.isCharging = true;
        // this.spacebarHeldTime = performance.now();
        this.chargingSoundTimeout = setTimeout(() => {
          if (/!*!flamethrowerActive &&*!/ this.sounds.charging.paused) {
            // TODO: flamethrower conditional
            this.sounds.charging.play();
          }
        }, 250);
      }
    } else {
      this.isCharging = false;
      clearTimeout(this.chargingSoundTimeout);
      this.sounds.charging.pause();
      this.sounds.charging.currentTime = 0;
      this.sounds.flame.pause();
      this.sounds.flame.currentTime = 0;
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
  }

  }*/

    // Boost handling
    if (this.isBoosting) {
      this.velocity.x = Math.cos(this.rotation) * this.maxSpeed * 2;
      this.velocity.y = Math.sin(this.rotation) * this.maxSpeed * 2;

      // Check if the boost duration has ended
      if (this.game.timestamp >= this.boostEndTime) this.isBoosting = false;
    } else {
      // Basic movement
      this.velocity.x += (Math.cos(this.rotation) * this.thrust * deltaTime) / 1000;
      this.velocity.y += (Math.sin(this.rotation) * this.thrust * deltaTime) / 1000;
    }

    // Deceleration
    if (!keys.up.isPressed && !keys.down.isPressed) {
      this.velocity.x *= this.deceleration;
      this.velocity.y *= this.deceleration;
    }

    // Speed limiter
    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
      this.velocity.x *= this.maxSpeed / speed;
      this.velocity.y *= this.maxSpeed / speed;
    }

    // Tractor beam effect on player
    if (this.game.boss && this.game.boss instanceof BiomechLeviathan && this.game.boss.tractorBeamActive) {
      const tractorBeam = this.game.boss.tractorBeam;
      if (tractorBeam) {
        const dx = tractorBeam.startX - this.x;
        const dy = tractorBeam.startY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const pullStrength = tractorBeam.strength;
          this.velocity.x += (dx / distance) * pullStrength * deltaTime;
          this.velocity.y += (dy / distance) * pullStrength * deltaTime;
        }
      }
    }

    // Move player
    this.x += (this.velocity.x * deltaTime) / 1000;
    this.y += (this.velocity.y * deltaTime) / 1000;

    // Screen wrap
    if (this.x < 0) this.x = this.game.width;
    if (this.x > this.game.width) this.x = 0;
    if (this.y < 0) this.y = this.game.height;
    if (this.y > this.game.height) this.y = 0;

    // Give extra life if target score reached
    if (this.game.score >= this.nextLifeScore) {
      this.lives++;
      this.nextLifeScore += 1500;
    }

    // Bomb
    if (this.bomb) {
      this.bomb.update(deltaTime);
      if (this.bomb.markedForDeletion) this.bomb = null;
    }

    // this.checkCollisions();
  }

  // collide(damage) {
  //   if (!this.collided) {
  //     this.collided = true;
  //     this.collisionTime = 0;
  //     this.takeDamage(damage);
  //     this.game.playCollision();
  //   } else {
  //     if (this.collisionTime > this.collisionDuration) {
  //     } else {
  //       this.collisionTime += deltaTime;
  //     }
  //   }
  // }

  fireProjectile() {
    // if (empDisableFire) {
    //   const nofireSoundClone = nofireSound.cloneNode();
    //   nofireSoundClone.volume = nofireSound.volume; // Ensure the cloned sound has the same volume
    //   nofireSoundClone.play(); // Play the cloned sound
    //   return; // Prevent firing if EMP effect is active
    // }

    // if (playerLaserPowerUpActive) {
    //   // Fire laser beam
    //   console.log('Firing player laser'); // Debugging statement
    //   createPlayerLaserBeam(
    //     player.x,
    //     player.y,
    //     Math.cos(player.rotation),
    //     Math.sin(player.rotation),
    //     'rgba(0, 255, 255, 1)',
    //   );
    //   return;
    // }

    // if (reversePowerUpActive) {
    //   for (let i = 0; i < 3; i++) {
    //     const angleOffset = (i - 1) * (Math.PI / 18);
    //     let reverseProjectile = {
    //       x: player.x - (Math.cos(player.rotation + angleOffset) * player.width) / 2,
    //       y: player.y - (Math.sin(player.rotation + angleOffset) * player.height) / 2,
    //       width: projectileSize,
    //       height: projectileSize,
    //       speed: projectileSpeed,
    //       directionX: -Math.cos(player.rotation + angleOffset),
    //       directionY: -Math.sin(player.rotation + angleOffset),
    //       fromPlayer: true,
    //       isCharged: isCharged,
    //       traveledDistance: 0,
    //       damage: damage,
    //       split: false,
    //     };
    //     projectiles.push(reverseProjectile);
    //   }
    // }

    // if (/*|| flamethrowerActive || empDisableFire*/) return; // TODO

    const projectilesToFire = this.powerUpActive ? 3 : 1;
    for (let i = 0; i < projectilesToFire; i++) {
      const angleOffset = this.powerUpActive ? (i - 1) * (Math.PI / 18) : 0;
      this.game.projectiles.push(new RegularProjectile(this.game, angleOffset));
    }
    this.game.cloneSound(this.sounds.fire);
  }

  useBomb() {
    if (this.bomb || this.bombs <= 0) return;
    this.bombs--;
    this.bomb = new Bomb(this.game);
  }

  useBoost() {
    if (
      this.isBoosting ||
      (!this.game.controls.codes.unlimitedBoost.enabled && this.game.timestamp < this.boostCooldownEndTime)
    )
      return;

    this.isBoosting = true;
    // boostEndTime = performance.now() + 500;
    // boostCooldownEndTime = performance.now() + (boostPowerUpActive ? 500 : 7000); // Reduced cooldown if boost power-up is active
    // const boostSoundClone = boostSound.cloneNode();
    // boostSoundClone.volume = boostSound.volume;
    // boostSoundClone.play();
    // player.velocity.x = Math.cos(player.rotation) * player.maxSpeed * 2;
    // player.velocity.y = Math.sin(player.rotation) * player.maxSpeed * 2;
  }

  isBoostReady() {
    return (
      !this.isBoosting &&
      (this.game.controls.codes.unlimitedBoost.enabled || this.game.timestamp >= this.boostCooldownEndTime)
    );
  }

  useMissile() {
    if (this.missiles <= 0) return;
    const enemies = this.game.enemies;
    const randomEnemy = Math.floor(Math.random() * enemies.length); // TODO: // Find nearest target ??//
    const target = this.boss ? this.boss : enemies[randomEnemy];
    if (!target) return;
    this.missiles--;
    for (let i = 0; i < 3; i++) {
      const missile = new HomingMissile(this.game, target);
      // Only play the missile sound on the first spawned missile
      if (i === 0) missile.sound.cloneNode().play();
      this.game.projectiles.push(missile);
    }
  }

  takeDamage(amount) {
    this.game.controls.playHaptic(100, 0.25);
    if (this.game.controls.codes.invincibility.enabled) return;

    this.health -= amount;
    if (this.health <= 0) {
      this.lives--;
      this.health = this.maxHealth;
      this.sounds.lostLife.play();
    }
    if (this.lives < 0) {
      this.health = 0;
      this.lives = 0;
      this.game.gameOver();
    }
  }

  addHealth(number) {
    this.health = Math.min(this.health + number, this.maxHealth);
  }

  addScore(number) {
    this.score += number;
    // Maybe play sound??
  }

  getAngleToPlayer(object) {
    return Math.atan2(this.y - object.y, this.x - object.x);
  }

  getDistanceToPlayer(object) {
    return Math.hypot(this.x - object.x, this.y - object.y);
  }

  stopPlayerMovement() {
    this.velocity = { x: 0, y: 0 };
    this.thrust = 0;
  }

  addBomb() {
    if (this.bombs < this.maxBombs) this.bombs++;
  }

  addMissile() {
    if (this.missiles < this.maxMissiles) this.missiles++;
  }
}
