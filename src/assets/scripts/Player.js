class Player {
  constructor(game) {
    this.game = game;
    this.width = 50;
    this.height = 50;
    this.x = this.game.canvas.width * 0.5;
    this.y = this.game.canvas.height * 0.5;
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
    };
    this.setVolumes(0.5); // Initialize volume at 0.5 // TODO: load from localstorage, maybe in window load event
  }

  draw(ctx) {
    // Draw player
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    let image;
    if (this.game.keys.pressed('ArrowUp')) {
      image = this.images.thrust;
    } else if (this.game.keys.pressed('ArrowDown')) {
      image = this.images.reverse;
    } else {
      image = this.images.idle;
    }

    ctx.drawImage(image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
    ctx.restore();
  }

  update(deltaTime) {
    // Rotate player
    if (this.game.keys.isPressed('ArrowLeft') && !this.game.keys.isPressed('ArrowRight'))
      this.rotation -= (this.rotationSpeed * deltaTime) / 1000;
    if (this.game.keys.isPressed('ArrowRight') && !this.game.keys.isPressed('ArrowLeft'))
      this.rotation += (this.rotationSpeed * deltaTime) / 1000;

    // Forward and reverse
    if (this.game.keys.isPressed('ArrowUp')) {
      this.thrust = this.acceleration;
      if (this.sounds.acceleration.paused) {
        this.sounds.acceleration.play();
      }
    } else if (this.game.keys.isPressed('ArrowDown')) {
      this.thrust = -this.acceleration;
      if (this.sounds.reverse.paused) {
        this.sounds.reverse.play();
      }
    } else {
      this.thrust = 0;
    }

    // Stop acceleration sound if no longer pressing ArrowUp
    if (!this.game.keys.isPressed('ArrowUp') && !this.sounds.acceleration.paused) {
      this.sounds.acceleration.pause();
      this.sounds.acceleration.currentTime = 0;
    }

    // Stop reverse sound is no longer pressing ArrowDown or if ArrowUp IS pressed
    if (
      (!this.game.keys.isPressed('ArrowDown') || this.game.keys.isPressed('ArrowUp')) &&
      !this.sounds.reverse.paused
    ) {
      this.sounds.reverse.pause();
      this.sounds.reverse.currentTime = 0;
    }

    /*// Boost handling
        if (this.isBoosting) {
            this.velocity.x = Math.cos(this.rotation) * this.maxSpeed * 2;
            this.velocity.y = Math.sin(this.rotation) * this.maxSpeed * 2;

            // Check if the boost duration has ended
            if (performance.now() >= boostEndTime) {
                endBoost();
            }
        } else {
            this.velocity.x += Math.cos(this.rotation) * this.thrust * deltaTime / 1000;
            this.velocity.y += Math.sin(this.rotation) * this.thrust * deltaTime / 1000;

            if (!keys['ArrowUp'] && !keys['ArrowDown']) {
                player.velocity.x *= player.deceleration;
                player.velocity.y *= player.deceleration;
            }

            const speed = Math.sqrt(player.velocity.x * player.velocity.x + player.velocity.y * player.velocity.y);
            if (speed > player.maxSpeed) {
                player.velocity.x *= player.maxSpeed / speed;
                player.velocity.y *= player.maxSpeed / speed;
            }
        }*/
  }

  isBoostReady() {
    return !this.isBoosting && (this.game.isUnlimitedBoostActivated || performance.now() >= this.boostCooldownEndTime);
  }

  setVolumes(value) {
    for (const sound in this.sounds) {
      this.sounds[sound].volume = value;
    }
  }
}

export default Player;
