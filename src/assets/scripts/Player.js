import RegularProjectile from './projectiles/RegularProjectile.js';

class Player {
  constructor(game) {
    this.game = game;
    this.width = 50;
    this.height = 50;
    this.x = this.game.canvas.width * 0.5;
    this.y = this.game.canvas.height * 0.5;
    this.offset = 5;
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
    this.isBoosting = false;
    this.boostEndTime = 0;
    this.boostCooldownEndTime = 0;
    this.isCharging = false;
    this.chargingSoundTimeout = null;
    this.spacebarHeldTime = 0;
    this.projectiles = [];

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
      teleport: new Audio('assets/audio/teleport.mp3'),
    };
    this.setVolumes(0.5); // Initialize volume at 0.5 // TODO: load from localstorage, maybe in window load event
  }

  draw(ctx) {
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
    if (this.game.keys.isPressed('ArrowUp')) {
      image = this.images.thrust;
    } else if (this.game.keys.isPressed('ArrowDown')) {
      image = this.images.reverse;
    } else {
      image = this.images.idle;
    }

    ctx.drawImage(image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
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
    const keys = this.game.keys; // Current keys state of controls

    // Rotate player
    if (keys.isPressed('ArrowLeft') && !keys.isPressed('ArrowRight'))
      this.rotation -= (this.rotationSpeed * deltaTime) / 1000;
    if (keys.isPressed('ArrowRight') && !keys.isPressed('ArrowLeft'))
      this.rotation += (this.rotationSpeed * deltaTime) / 1000;

    // Forward and reverse
    if (keys.isPressed('ArrowUp')) {
      this.thrust = this.acceleration;
      if (this.sounds.acceleration.paused) this.sounds.acceleration.play();
    } else if (keys.isPressed('ArrowDown')) {
      this.thrust = -this.acceleration;
      if (this.sounds.reverse.paused) this.sounds.reverse.play();
    } else {
      this.thrust = 0;
    }

    // Stop acceleration sound if no longer pressing ArrowUp
    if (!keys.isPressed('ArrowUp') && !this.sounds.acceleration.paused) {
      this.sounds.acceleration.pause();
      this.sounds.acceleration.currentTime = 0;
    }

    // Stop reverse sound is no longer pressing ArrowDown or if ArrowUp IS pressed
    if ((!keys.isPressed('ArrowDown') || keys.isPressed('ArrowUp')) && !this.sounds.reverse.paused) {
      this.sounds.reverse.pause();
      this.sounds.reverse.currentTime = 0;
    }

    if (!this.game.menu.isOpen && !this.game.gameOver) {
      // Space
      if (keys.isPressed(' ')) {
        if (!this.isCharging) {
          this.isCharging = true;
          this.spacebarHeldTime = performance.now();
          this.chargingSoundTimeout = setTimeout(() => {
            if (/*!flamethrowerActive &&*/ this.sounds.charging.paused) {
              // TODO: flamethrower conditional
              this.sounds.charging.play();
            }
          }, 250);
        }
        this.fireProjectile();
      } else {
        this.isCharging = false;
        clearTimeout(this.chargingSoundTimeout);
        this.sounds.charging.pause();
        this.sounds.charging.currentTime = 0;
        this.sounds.flame.pause();
        this.sounds.flame.currentTime = 0;
      }

      if (keys.isPressed('b') || keys.isPressed('B')) {
        // this.useBomb(); // TODO
      }
      if (keys.isPressed('x') || keys.isPressed('X')) {
        // this.useBoost(); // TODO
      }
      if (keys.isPressed('h') || keys.isPressed('H')) {
        // useHomingMissile(); // TODO
      }
    }

    // Basic movement
    this.velocity.x += (Math.cos(this.rotation) * this.thrust * deltaTime) / 1000;
    this.velocity.y += (Math.sin(this.rotation) * this.thrust * deltaTime) / 1000;

    if (!this.game.keys.isPressed('ArrowUp') && !this.game.keys.isPressed('ArrowDown')) {
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
    if (this.game.menu.isOpen /*|| flamethrowerActive || empDisableFire*/) return; // TODO
    const chargeDuration = (performance.now() - this.spacebarHeldTime) / 1000;
    const projectilesToFire = /*powerUpActive ? 3 :*/ 1; // TODO power up
    const angleOffset = /*powerUpActive ? (i - 1) * (Math.PI / 18) :*/ 0; // TODO power up
    for (let i = 0; i < projectilesToFire; i++) {
      this.projectiles.push(new RegularProjectile(this.game, angleOffset, chargeDuration, false));
    }

    this.sounds.fire.cloneNode().play();
  }
}

export default Player;
