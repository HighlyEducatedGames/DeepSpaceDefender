import RegularProjectile from './projectiles/RegularProjectile.js';
import Bomb from './projectiles/Bomb.js';

class Player {
  constructor(game) {
    this.game = game;
    this.width = 50;
    this.height = 50;
    this.x = this.game.canvas.width * 0.5;
    this.y = this.game.canvas.height * 0.5;
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
    this.lastCollisionTime = 0;
    this.maxHealth = 30;
    this.health = this.maxHealth;
    this.maxLives = 3;
    this.lives = this.maxLives;
    this.isBoosting = false;
    this.boostEndTime = 0;
    this.boostCooldownEndTime = 0;
    this.isCharging = false;
    this.chargingSoundTimeout = null;
    this.projectiles = [];
    this.bombs = 20;
    this.missiles = [];
    // this.bombSpawnTime = 0;
    // this.bombFlashTime = 0;
    // this.bombSpawned = false;
    this.powerUpActive = true; // TODO power up controller

    this.images = {
      idle: new Image(),
      thrust: new Image(),
      reverse: new Image(),
    };
    this.images.idle.src = 'assets/images/player.png';
    this.images.thrust.src = 'assets/images/player_thrust.png';
    this.images.reverse.src = 'assets/images/player_reverse.png';

    this.sounds = {
      acceleration: new Audio('assets/audio/acceleration.mp3'),
      reverse: new Audio('assets/audio/reverse.mp3'),
      fire: new Audio('assets/audio/fire.mp3'),
      charging: new Audio('assets/audio/charging.mp3'),
      flame: new Audio('assets/audio/flame.mp3'),
      torchedEnemy: new Audio('assets/audio/torch.mp3'),
      collision: new Audio('assets/audio/collision.mp3'),
      boost: new Audio('assets/audio/boost.mp3'),
      lostLife: new Audio('assets/audio/lifeLost.mp3'),
    };
    this.setVolumes(0.5); // Initialize volume at 0.5 // TODO: load from localstorage, maybe in window load event
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

    if (!this.game.menu.isOpen && !this.game.gameOver) {
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

  }*/

    // Basic movement
    this.velocity.x += (Math.cos(this.rotation) * this.thrust * deltaTime) / 1000;
    this.velocity.y += (Math.sin(this.rotation) * this.thrust * deltaTime) / 1000;

    if (!keys.up.isPressed && !keys.down.isPressed) {
      this.velocity.x *= this.deceleration;
      this.velocity.y *= this.deceleration;
    }

    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
      this.velocity.x *= this.maxSpeed / speed;
      this.velocity.y *= this.maxSpeed / speed;
    }

    // Move player
    this.x += (this.velocity.x * deltaTime) / 1000;
    this.y += (this.velocity.y * deltaTime) / 1000;

    // Screen wrap
    if (this.x < 0) this.x = this.game.canvas.width;
    if (this.x > this.game.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.game.canvas.height;
    if (this.y > this.game.canvas.height) this.y = 0;
  }

  isBoostReady() {
    return !this.isBoosting && (this.game.isUnlimitedBoostActivated || performance.now() >= this.boostCooldownEndTime);
  }

  setVolumes(value) {
    for (const sound in this.sounds) {
      this.sounds[sound].volume = value;
    }
  }

  fireProjectile() {
    // if (/*|| flamethrowerActive || empDisableFire*/) return; // TODO
    const projectilesToFire = this.powerUpActive ? 3 : 1;
    for (let i = 0; i < projectilesToFire; i++) {
      const angleOffset = this.powerUpActive ? (i - 1) * (Math.PI / 18) : 0;
      this.projectiles.push(new RegularProjectile(this.game, angleOffset, false));
    }
    this.sounds.fire.cloneNode().play();
  }

  useBomb() {
    if (this.bombs <= 0) return;
    this.bombs--;
    this.projectiles.push(new Bomb(this.game));
  }

  useBoost() {}

  useMissile() {}
}

export default Player;
