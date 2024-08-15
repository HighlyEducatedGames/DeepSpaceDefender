import { PlayerProjectile, ChargedProjectile } from './projectiles/PlayerProjectile.js';
import Bomb from './projectiles/Bomb.js';
import HomingMissile from './projectiles/HomingMissile.js';
import BiomechLeviathan from './bosses/BiomechLeviathan.js';

export default class Player {
  constructor(game) {
    this.game = game;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5 + this.game.topMargin * 0.5;
    this.width = 50;
    this.height = 50;
    this.offset = 4;
    this.speed = 200;
    this.maxSpeed = 300;
    this.rotation = -Math.PI * 0.5;
    this.rotationSpeed = 4;
    this.velocity = { x: 0, y: 0 };
    this.thrust = 0;
    this.acceleration = 300;
    this.deceleration = 0.98;
    this.maxLives = 9999;
    this.lives = 3;
    this.maxHealth = 30;
    this.health = this.maxHealth;
    this.nextLifeScore = 1500;
    this.isCharging = false;
    this.isBoosting = false;
    this.boostSpeed = 600;
    this.boostEndTime = 0;
    this.boostCooldownEndTime = 0;
    this.bomb = null;
    this.bombs = 0;
    this.maxBombs = 20;
    this.missiles = 0;
    this.maxMissiles = 20;
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
    const keys = this.game.controls.keys;

    // Draw player
    const xAdjustPos = Math.cos(this.rotation) * this.offset;
    const yAdjustPos = Math.sin(this.rotation) * this.offset;

    let image;
    if (keys.up.isPressed) {
      image = this.images.thrust;
    } else if (keys.down.isPressed) {
      image = this.images.reverse;
    } else {
      image = this.images.idle;
    }

    ctx.save();
    ctx.translate(this.x - xAdjustPos, this.y - yAdjustPos);
    ctx.rotate(this.rotation);
    ctx.drawImage(image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
    ctx.restore();

    // Invincibility Shield
    if (this.game.controls.codes.invincibility.enabled) {
      const gradient = ctx.createRadialGradient(this.x, this.y, this.width * 0.5, this.x, this.y, this.width);
      gradient.addColorStop(0, 'rgba(255, 69, 0, 0.5)');
      gradient.addColorStop(0.7, 'rgba(255, 140, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
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
      ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shield Effect
    if (this.game.getPowers().shield.active) {
      const gradient = ctx.createRadialGradient(this.x, this.y, this.width * 0.5, this.x, this.y, this.width);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
      gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
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

    // Speed limiter
    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
      this.velocity.x *= this.maxSpeed / speed;
      this.velocity.y *= this.maxSpeed / speed;
    }

    // Boost handling
    if (this.isBoosting) {
      this.velocity.x = Math.cos(this.rotation) * this.boostSpeed;
      this.velocity.y = Math.sin(this.rotation) * this.boostSpeed;

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
      this.addLife(1);
      this.nextLifeScore += 1500;
    }

    // Bomb
    if (this.bomb) {
      this.bomb.update(deltaTime);
      if (this.bomb.markedForDeletion) this.bomb = null;
    }

    // Charging projectile mechanic
    if (this.game.controls.keys.fire.isPressed) {
      if (!this.isCharging) {
        this.isCharging = true;
      }
    } else {
      if (this.isCharging) {
        this.isCharging = false;
        this.sounds.charging.pause();
        this.sounds.charging.currentTime = 0;
        if (keys.fire.pressedDuration > 1000) this.fireProjectile(true);
      }
    }
    // Play charging sound after 500ms charge
    if (this.isCharging && keys.fire.pressedDuration > 200 && this.sounds.charging.paused) {
      this.sounds.charging.loop = true;
      this.sounds.charging.play();
    }

    // Player inputs
    if (!this.game.menu.isOpen && !this.game.isGameOver) {
      if (keys.fire.justPressed()) this.fireProjectile();
      if (keys.bomb.justPressed()) this.useBomb();
      if (keys.boost.justPressed()) this.useBoost();
      if (keys.missile.justPressed()) this.useMissile();

      if (this.game.getPowers().flame.active && keys.fire.isPressed) this.fireFlame();
    }

    this.checkCollisions();
  }

  checkCollisions() {}

  fireProjectile(charged = false) {
    if (this.game.getPowers().flame.active) return;

    const powers = this.game.getPowers();

    const projectilesToFire = powers.projectile.active ? 3 : 1;
    for (let i = 0; i < projectilesToFire; i++) {
      const angle = powers.projectile.active ? (i - 1) * (Math.PI / 18) : 0;
      const projectile = charged ? new ChargedProjectile(this.game, angle) : new PlayerProjectile(this.game, angle);
      this.game.projectiles.push(projectile);
    }
    this.game.cloneSound(this.sounds.fire);

    if (powers.reverse.active) {
      for (let i = 0; i < 3; i++) {
        const angle = (i - 1) * (Math.PI / 18) + Math.PI;
        const projectile = charged ? new ChargedProjectile(this.game, angle) : new PlayerProjectile(this.game, angle);
        this.game.projectiles.push(projectile);
      }
    }

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
  }

  fireFlame() {
    console.log('FIRE FLAME');
  }

  useBomb() {
    if (this.bomb || this.bombs <= 0) return;
    this.bombs--;
    this.bomb = new Bomb(this.game);
  }

  useBoost() {
    if (!this.isBoostReady()) return;
    this.isBoosting = true;
    this.boostEndTime = this.game.timestamp + 500;
    // Reduced cooldown if boost power-up is active
    this.boostCooldownEndTime = this.game.timestamp + (this.game.getPowers().boost.active ? 500 : 7000);
    this.sounds.boost.play();
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
    if (this.isBoosting) return;
    if (this.game.getPowers().shield.active) return;

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

  addHealth(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  addLife(amount) {
    this.lives = Math.min(this.lives + amount, this.maxLives);
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

  addBomb(amount) {
    this.bombs = Math.min(this.bombs + amount, this.maxBombs);
  }

  addMissile(amount) {
    this.missiles = Math.min(this.missiles + amount, this.maxMissiles);
  }
}
