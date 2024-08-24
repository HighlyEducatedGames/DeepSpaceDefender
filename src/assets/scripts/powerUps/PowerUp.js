class PowerUp {
  x = null;
  y = null;
  dx = 0;
  dy = 0;
  margin = 50;
  markedForDeletion = false;
  sound = document.getElementById('powerup_sound');

  constructor(game, { width, height, speed, image }) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.image = document.getElementById(image);

    this.getOffScreenSpawnPosition();
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime) {
    this.x += (this.speed * this.dx * deltaTime) / 1000;

    //Sin Wave
    this.y += Math.sin(this.x / 50) * 1.5;

    if (this.y < 0 || this.y + this.height > this.game.height) {
      this.directionY *= -1;
      this.y = Math.max(0, Math.min(this.y, this.game.height - this.height));
    }

    if (this.game.outOfBounds(this, this.width)) this.markedForDeletion = true;
  }

  checkCollisions() {
    if (this.game.checkCollision(this, this.game.player)) {
      this.onPlayerCollision();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }

  onPlayerCollision() {
    throw new Error('You forgot to override a onPlayerCollision method in a PowerUp sub class.');
  }

  getOffScreenSpawnPosition() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    this.x = side === 'left' ? -this.width * 0.5 : this.game.width + this.width * 0.5;
    this.y = this.game.getRandomY(this.margin);
    this.dx = side === 'left' ? 1 : -1;
    this.dy = 0;
  }
}

class BombPowerUp extends PowerUp {
  constructor(game) {
    super(game, { width: 30, height: 30, speed: 75, image: 'bomb_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.addBomb(1);
  }
}

class HomingMissilePowerUp extends PowerUp {
  constructor(game) {
    super(game, { width: 30, height: 30, speed: 75, image: 'missile_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.addMissile(1);
  }
}

class ProjectilePowerUp extends PowerUp {
  constructor(game) {
    super(game, { width: 20, height: 20, speed: 75, image: 'powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.projectile.activate();
  }
}

class BoostPowerUp extends PowerUp {
  constructor(game) {
    super(game, { width: 30, height: 30, speed: 100, image: 'boost_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.boost.activate();
    // Reset cooldown when you get the powerup, so you can use boost right away
    this.game.player.boostCooldownEndTime = this.game.timestamp;
  }
}

class ShieldPowerUp extends PowerUp {
  constructor(game) {
    super(game, { width: 30, height: 30, speed: 50, image: 'shield_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.shield.activate();
  }
}

class ReversePowerUp extends PowerUp {
  constructor(game) {
    super(game, { width: 30, height: 30, speed: 150, image: 'reverse_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.reverse.activate();
  }
}

class FlameThrowerPowerUp extends PowerUp {
  constructor(game) {
    super(game, { width: 30, height: 30, speed: 100, image: 'flame_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.flame.activate();
  }
}

class LaserPowerUp extends PowerUp {
  constructor(game) {
    super(game, { width: 30, height: 30, speed: 100, image: 'laser_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.laser.activate();
  }
}

class ParticleBombPowerUp extends PowerUp {
  constructor(game) {
    super(game, { width: 30, height: 30, speed: 100, image: 'particle_bomb_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.particleBomb.activate();
  }
}

export default {
  bomb: BombPowerUp,
  missile: HomingMissilePowerUp,
  projectile: ProjectilePowerUp,
  boost: BoostPowerUp,
  shield: ShieldPowerUp,
  reverse: ReversePowerUp,
  flame: FlameThrowerPowerUp,
  laser: LaserPowerUp,
  particleBomb: ParticleBombPowerUp,
};
