import { PlayerProjectile, ChargedProjectile } from './projectiles/PlayerProjectile.js';
import Bomb from './projectiles/Bomb.js';
import Missile from './projectiles/Missile.js';
import BiomechLeviathan from './bosses/BiomechLeviathan.js';
import Flame from './projectiles/Flame.js';
import Laser from './projectiles/Laser.js';
import ParticleBomb from './projectiles/ParticleBomb.js';
import AbilityTimer from './AbilityTimer.js';
import { Action } from './InputHandler.js';

export default class Player {
  width = 50;
  height = 50;
  offset = 4;
  speed = 200;
  maxSpeed = 300;
  rotation = -Math.PI * 0.5;
  rotationSpeed = 4;
  velocity = { x: 0, y: 0 };
  thrust = 0;
  acceleration = 300;
  deceleration = 0.98;
  maxLives = 9999;
  lives = 3;
  maxHealth = 30;
  health = this.maxHealth;
  nextLifeScore = 1500;
  isCharging = false;
  isBoosting = false;
  boostSpeed = 600;
  boostEndTime = 0;
  boostCooldownEndTime = 0;
  bomb = null;
  bombs = 0;
  maxBombs = 20;
  missiles = 0;
  maxMissiles = 20;
  images = {
    idle: document.getElementById('player_image'),
    thrust: document.getElementById('player_thrust_image'),
    reverse: document.getElementById('player_reverse_image'),
  };
  sounds = {
    acceleration: document.getElementById('acceleration_sound'),
    reverse: document.getElementById('reverse_sound'),
    fire: document.getElementById('fire_sound'),
    charging: document.getElementById('charging_sound'),
    torchedEnemy: document.getElementById('torch_sound'),
    boost: document.getElementById('boost_sound'),
    lostLife: document.getElementById('lifelost_sound'),
  };

  constructor(game) {
    /** @type {import('./Game.js').default} */
    this.game = game;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5 + this.game.topMargin * 0.5;
    this.flame = new Flame(this.game);
    this.laser = new Laser(this.game);
    this.particleBomb = new ParticleBomb(this.game);
    this.abilities = {
      projectile: new AbilityTimer(this.game, 15000, 'powerup_image'),
      shield: new AbilityTimer(this.game, 15000, 'shield_powerup_image'),
      boost: new AbilityTimer(this.game, 10000, 'boost_powerup_image'),
      reverse: new AbilityTimer(this.game, 10000, 'reverse_powerup_image'),
      flame: new AbilityTimer(this.game, 10000, 'flame_powerup_image'),
      laser: new AbilityTimer(this.game, 10000, 'laser_powerup_image'),
      particleBomb: new AbilityTimer(this.game, 10000, 'particle_bomb_powerup_image'),
    };
  }

  draw(ctx) {
    // Draw player
    const xAdjustPos = Math.cos(this.rotation) * this.offset;
    const yAdjustPos = Math.sin(this.rotation) * this.offset;

    let image;
    if (this.game.inputs.actions[Action.MOVE_FORWARD].isPressed) {
      image = this.images.thrust;
    } else if (this.game.inputs.actions[Action.MOVE_BACKWARD].isPressed) {
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
    if (this.game.inputs.codes.invincibility.enabled) {
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
    if (this.abilities.shield.active) {
      const shieldAbility = this.abilities.shield;
      const remainingTime = shieldAbility.duration - shieldAbility.timer;

      let drawShield = true;

      // Check if the shield has less than or equal to 3 seconds remaining
      if (remainingTime <= 3000) {
        // Flash shield by toggling visibility every 300ms
        const flashInterval = 300;
        drawShield = Math.floor(remainingTime / flashInterval) % 2 === 0;
      }

      if (drawShield) {
        const gradient = ctx.createRadialGradient(this.x, this.y, this.width * 0.5, this.x, this.y, this.width);
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.5)');
        gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bomb
    if (this.bomb) this.bomb.draw(ctx);

    // Laser
    if (this.laser.active) this.laser.draw(ctx);

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime) {
    const isPressed = this.game.inputs.isPressed.bind(this.game.inputs);
    const justPressed = this.game.inputs.justPressed.bind(this.game.inputs);
    const justReleased = this.game.inputs.justReleased.bind(this.game.inputs);

    // Update player ability timers
    for (const key in this.abilities) {
      this.abilities[key].update(deltaTime);
    }

    // Rotate player
    if (isPressed(Action.MOVE_LEFT) && !isPressed(Action.MOVE_RIGHT))
      this.rotation -= (this.rotationSpeed * deltaTime) / 1000;
    if (isPressed(Action.MOVE_RIGHT) && !isPressed(Action.MOVE_LEFT))
      this.rotation += (this.rotationSpeed * deltaTime) / 1000;

    // Forward and reverse
    if (isPressed(Action.MOVE_FORWARD)) {
      this.thrust = this.acceleration;
      if (this.sounds.acceleration.paused) this.sounds.acceleration.play();
    } else if (isPressed(Action.MOVE_BACKWARD)) {
      this.thrust = -this.acceleration;
      if (this.sounds.reverse.paused) this.sounds.reverse.play();
    } else {
      this.thrust = 0;
    }

    // Stop acceleration sound if no longer pressing ArrowUp
    if (!isPressed(Action.MOVE_FORWARD) && !this.sounds.acceleration.paused) {
      this.sounds.acceleration.pause();
      this.sounds.acceleration.currentTime = 0;
    }

    // Stop reverse sound is no longer pressing ArrowDown or if ArrowUp IS pressed
    if ((!isPressed(Action.MOVE_BACKWARD) || isPressed(Action.MOVE_FORWARD)) && !this.sounds.reverse.paused) {
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
    if (!isPressed(Action.MOVE_FORWARD) && !isPressed(Action.MOVE_BACKWARD)) {
      this.velocity.x *= this.deceleration;
      this.velocity.y *= this.deceleration;
    }

    // Tractor beam effect on player
    if (this.game.boss && this.game.boss instanceof BiomechLeviathan && this.game.boss.tractorBeam) {
      const tractorBeam = this.game.boss.tractorBeam;
      if (tractorBeam) {
        const dx = tractorBeam.x - this.x;
        const dy = tractorBeam.y - this.y;
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

    // Flame
    this.flame.update(deltaTime);

    // Laser
    this.laser.update(deltaTime);

    // // Charging projectile mechanic
    // if (this.game.controls.keys.fire.isPressed && !this.abilities.flame.active && !this.abilities.laser.active) {
    //   if (!this.isCharging) {
    //     this.isCharging = true;
    //   }
    // } else {
    //   if (this.isCharging) {
    //     this.isCharging = false;
    //     this.sounds.charging.pause();
    //     this.sounds.charging.currentTime = 0;
    //     if (keys.fire.pressedDuration > 1000) this.fireProjectile(true);
    //   }
    // }
    // // Play charging sound after 500ms charge
    // if (this.isCharging && keys.fire.pressedDuration > 200 && this.sounds.charging.paused) {
    //   this.sounds.charging.play();
    // }

    // // Player inputs
    if (!this.game.isGameOver) {
      // Actions which only trigger on initial input
      if (justPressed(Action.FIRE)) this.handleActionFire();
      if (justPressed(Action.BOOST)) this.handleActionBoost();
      if (justPressed(Action.BOMB)) this.handleActionBomb();
      if (justPressed(Action.MISSILE)) this.handleActionMissile();

      // Actions which trigger on a held input
      this.flame.active = false;
      this.laser.active = false;
      if (isPressed(Action.FIRE)) {
        // TODO: only use the ability from the last gained powerup here...
        if (this.abilities.flame.active) this.flame.active = true;
        else if (this.abilities.laser.active) this.laser.active = true;
        this.handleCharging();
      }

      if (justReleased(Action.FIRE)) this.handleActionChargedFire();
    }
  }

  checkCollisions() {
    if (this.bomb) this.bomb.checkCollisions();
  }

  handleActionFire() {
    if (this.abilities.particleBomb.active) {
      this.particleBomb.fire();
      return;
    }

    // Don't fire if certain powerUps are active
    if (this.abilities.flame.active) return;
    if (this.abilities.laser.active) return;

    this.fireProjectile();
  }

  handleCharging() {
    // Don't charge if certain powerUps are active
    if (this.abilities.flame.active) return;
    if (this.abilities.laser.active) return;

    if (!this.isCharging) {
      this.isCharging = true;
      this.sounds.charging.play();
    }
  }

  handleActionChargedFire() {
    if (!this.isCharging) return;
    this.isCharging = false;
    this.sounds.charging.pause();
    this.sounds.charging.currentTime = 0;
    if (this.game.inputs.actions[Action.FIRE].heldDuration >= 1000) this.fireProjectile(true);
  }

  fireProjectile(charged = false) {
    const powers = this.abilities;
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
  }

  handleActionBoost() {
    if (!this.isBoostReady()) return;
    this.isBoosting = true;
    this.boostEndTime = this.game.timestamp + 500;
    // Reduced cooldown if boost power-up is active
    this.boostCooldownEndTime = this.game.timestamp + (this.abilities.boost.active ? 500 : 7000);
    this.sounds.boost.play();
  }

  handleActionBomb() {
    if (this.bomb || this.bombs <= 0) return;
    this.bombs--;
    this.bomb = new Bomb(this.game);
  }

  handleActionMissile() {
    if (this.missiles <= 0) return;
    const enemies = this.game.enemies.enemies.slice();
    this.missiles--;
    if (!this.game.boss) {
      for (let i = 0; i < 3 && enemies.length > 0; i++) {
        // Ensure we don't exceed the number of enemies
        const randomIndex = Math.floor(Math.random() * enemies.length);
        const target = enemies[randomIndex];
        if (target) {
          const missile = new Missile(this.game, target);
          // Only play the missile sound on the first spawned missile
          if (i === 0) this.game.cloneSound(missile.sound);
          this.game.projectiles.push(missile);
          enemies.splice(randomIndex, 1); // Remove the selected enemy from the array
        }
      }
    } else {
      this.game.projectiles.push(new Missile(this.game, this.game.boss));
    }

    //   // TODO: make sure its the head trageted with the serpent head
    //   // projectileCollisionRadius: 125, // 250 diameter / 2 is set in cyberdragon creation
    //   // if (this.target) {
    //   //   if (this.target instanceof CyberDragon) this.collisionRadius = cyberDragon.projectileCollisionRadius;
    //   //   else if (this.target instanceof BiomechLeviathan)
    //   //     this.collisionRadius = biomechLeviathan.projectileCollisionRadius;
    //   //   else if (this.target instanceof TemporalSerpent) this.collisionRadius = temporalSerpent.playerCollisionRadius;
    //   //   else this.collisionRadius = Math.max(this.target.width, this.target.height) / 2;
    //   // }
  }

  isBoostReady() {
    return (
      !this.isBoosting &&
      (this.game.inputs.codes.unlimitedBoost.enabled || this.game.timestamp >= this.boostCooldownEndTime)
    );
  }

  takeDamage(amount) {
    this.game.inputs.playHaptic(100, 0.25);
    if (this.game.inputs.codes.invincibility.enabled) return;
    if (this.isBoosting) return;
    if (this.abilities.shield.active) return;

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
