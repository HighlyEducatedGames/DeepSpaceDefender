import { PlayerProjectile, ChargedProjectile } from './projectiles/PlayerProjectile';
import Bomb from './projectiles/Bomb';
import Missile from './projectiles/Missile';
import BiomechLeviathan from './bosses/BiomechLeviathan';
import Flame from './projectiles/Flame';
import Laser from './projectiles/Laser';
import ParticleBomb from './projectiles/ParticleBomb';
import AbilityTimer from './AbilityTimer';
import { Action } from './InputHandler';
import { GameObject } from './GameObject';

export default class Player extends GameObject {
  x = this.game.width * 0.5;
  y = this.game.height * 0.5 + this.game.topMargin * 0.5;
  radius = 25;
  width = 50;
  height = 50;
  flame = new Flame(this.game);
  laser = new Laser(this.game);
  particleBomb = new ParticleBomb(this.game);
  abilities = {
    projectile: new AbilityTimer(this.game, 15000, 'powerup_image'),
    shield: new AbilityTimer(this.game, 15000, 'shield_powerup_image'),
    boost: new AbilityTimer(this.game, 10000, 'boost_powerup_image'),
    reverse: new AbilityTimer(this.game, 10000, 'reverse_powerup_image'),
    flame: new AbilityTimer(this.game, 10000, 'flame_powerup_image'),
    laser: new AbilityTimer(this.game, 10000, 'laser_powerup_image'),
    particleBomb: new AbilityTimer(this.game, 10000, 'particle_bomb_powerup_image'),
  };
  offset = 4;
  speed = 0;
  maxSpeed = 300;
  rotation = -Math.PI * 0.5;
  rotationSpeed = 4;
  acceleration = 300;
  deceleration = 0.98;
  maxLives = 9999;
  lives = 3;
  maxHealth = 30;
  health = this.maxHealth;
  nextLifeScore = 1500;
  isCharging = false;
  chargingTriggerThreshold = 200;
  isBoosting = false;
  boostSpeed = 600;
  boostTimer = 0;
  boostDuration = 500;
  boostCooldownTimer = 0;
  bomb: Bomb | null = null;
  bombs = 0;
  maxBombs = 20;
  missiles = 0;
  maxMissiles = 20;
  images = {
    idle: this.game.getImage('player_image'),
    thrust: this.game.getImage('player_thrust_image'),
    reverse: this.game.getImage('player_reverse_image'),
  };
  sounds = {
    acceleration: this.game.getAudio('acceleration_sound'),
    reverse: this.game.getAudio('reverse_sound'),
    fire: this.game.getAudio('fire_sound'),
    charging: this.game.getAudio('charging_sound'),
    torchedEnemy: this.game.getAudio('torch_sound'),
    boost: this.game.getAudio('boost_sound'),
    lostLife: this.game.getAudio('lifelost_sound'),
  };

  constructor(game: Game) {
    super(game);
  }

  draw(ctx: CTX) {
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
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime: number) {
    const isPressed = this.game.inputs.isPressed.bind(this.game.inputs);
    const justPressed = this.game.inputs.justPressed.bind(this.game.inputs);
    const justReleased = this.game.inputs.justReleased.bind(this.game.inputs);

    // Update player ability timers
    for (const key in this.abilities) {
      this.abilities[key as keyof typeof this.abilities].update(deltaTime);
    }

    // Rotate player
    if (isPressed(Action.MOVE_LEFT) && !isPressed(Action.MOVE_RIGHT))
      this.rotation -= (this.rotationSpeed * deltaTime) / 1000;
    if (isPressed(Action.MOVE_RIGHT) && !isPressed(Action.MOVE_LEFT))
      this.rotation += (this.rotationSpeed * deltaTime) / 1000;

    // Forward and reverse
    if (isPressed(Action.MOVE_FORWARD)) {
      this.speed = this.acceleration;
      if (this.sounds.acceleration.paused) this.sounds.acceleration.play().catch(() => {});
    } else if (isPressed(Action.MOVE_BACKWARD)) {
      this.speed = -this.acceleration;
      if (this.sounds.reverse.paused) this.sounds.reverse.play().catch(() => {});
    } else {
      this.speed = 0;
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
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      this.vx *= this.maxSpeed / speed;
      this.vy *= this.maxSpeed / speed;
    }

    // Boost handling
    if (this.boostCooldownTimer > 0) this.boostCooldownTimer -= deltaTime;
    if (this.isBoosting) {
      this.vx = Math.cos(this.rotation) * this.boostSpeed;
      this.vy = Math.sin(this.rotation) * this.boostSpeed;

      this.boostTimer -= deltaTime;
      if (this.boostTimer <= 0) this.isBoosting = false;
    } else {
      // Basic movement
      this.vx += (Math.cos(this.rotation) * this.speed * deltaTime) / 1000;
      this.vy += (Math.sin(this.rotation) * this.speed * deltaTime) / 1000;
    }

    // Deceleration
    if (!isPressed(Action.MOVE_FORWARD) && !isPressed(Action.MOVE_BACKWARD)) {
      this.vx *= this.deceleration;
      this.vy *= this.deceleration;
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
          this.vx += (dx / distance) * pullStrength * deltaTime;
          this.vy += (dy / distance) * pullStrength * deltaTime;
        }
      }
    }

    // Move player
    this.x += (this.vx * deltaTime) / 1000;
    this.y += (this.vy * deltaTime) / 1000;

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
    this.flame.update();

    // Laser
    this.laser.update();

    // Player inputs
    const empActive = this.game.boss instanceof BiomechLeviathan && Boolean(this.game.boss.empBlast);
    if (!this.game.isGameOver && !empActive) {
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

    if (!this.isCharging && this.game.inputs.actions[Action.FIRE].heldDuration >= this.chargingTriggerThreshold) {
      this.isCharging = true;
      this.sounds.charging.play().catch(() => {});
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
    this.boostTimer = this.boostDuration;
    // Reduced cooldown if boost power-up is active
    this.boostCooldownTimer = this.abilities.boost.active ? 500 : 7000;
    this.sounds.boost.play().catch(() => {});
  }

  handleActionBomb() {
    if (this.bomb || this.bombs <= 0) return;
    this.bombs--;
    this.bomb = new Bomb(this.game);
  }

  handleActionMissile() {
    if (this.missiles <= 0) return;
    this.missiles--;
    if (!this.game.boss) {
      const enemies = this.game.enemies.enemies
        .slice()
        .sort((a, b) => this.getDistanceToPlayer(a) - this.getDistanceToPlayer(b));

      // Launch missiles at the 3 closest enemies
      for (let i = 0; i < 3 && i < enemies.length; i++) {
        const target = enemies[i];
        if (target) {
          const missile = new Missile(this.game, target);
          // Only play the missile sound on the first spawned missile
          if (i === 0) this.game.cloneSound(missile.sound);
          this.game.projectiles.push(missile);
        }
      }
    } else {
      this.game.projectiles.push(new Missile(this.game, this.game.boss));
    }
  }

  isBoostReady() {
    return !this.isBoosting && (this.game.inputs.codes.unlimitedBoost.enabled || this.boostCooldownTimer <= 0);
  }

  takeDamage(amount: number) {
    this.game.inputs.playHaptic(100, 0.25);
    if (this.game.inputs.codes.invincibility.enabled) return;
    if (this.isBoosting) return;
    if (this.abilities.shield.active) return;

    this.health -= amount;
    if (this.health <= 0) {
      this.lives--;
      this.health = this.maxHealth;
      this.sounds.lostLife.play().catch(() => {});
    }
    if (this.lives < 0) {
      this.health = 0;
      this.lives = 0;
      this.game.gameOver();
    }
  }

  addHealth(amount: number) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  addLife(amount: number) {
    this.lives = Math.min(this.lives + amount, this.maxLives);
  }

  addBomb(amount: number) {
    this.bombs = Math.min(this.bombs + amount, this.maxBombs);
  }

  addMissile(amount: number) {
    this.missiles = Math.min(this.missiles + amount, this.maxMissiles);
  }

  getAngleToPlayer(object: { x: number; y: number }) {
    return Math.atan2(this.y - object.y, this.x - object.x);
  }

  getDistanceToPlayer(object: { x: number; y: number }) {
    return Math.hypot(this.x - object.x, this.y - object.y);
  }

  getDirectionToPlayer(object: { x: number; y: number }): Direction {
    const dx = this.x - object.x;
    const dy = this.y - object.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }

  stopMovement() {
    this.vx = 0;
    this.vy = 0;
    this.speed = 0;
  }
}
