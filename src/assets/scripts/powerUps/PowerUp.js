class PowerUp {
  x = null;
  y = null;
  width = 0;
  height = 0;
  speed = 0;
  dx = 0;
  dy = 0;
  margin = 50;
  image = null;
  sound = document.getElementById('powerup_sound');
  markedForDeletion = false;

  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
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
    throw new Error('You forgot to override a checkCollisions method in a PowerUp sub class.');
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
  width = 30;
  height = 30;
  speed = 75;
  image = document.getElementById('bomb_powerup_image');

  constructor(game) {
    super(game);
    super.getOffScreenSpawnPosition();
  }

  checkCollisions() {
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.addBomb(1);
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class HomingMissilePowerUp extends PowerUp {
  width = 30;
  height = 30;
  speed = 75;
  image = document.getElementById('missile_powerup_image');

  constructor(game) {
    super(game);
    super.getOffScreenSpawnPosition();
  }

  checkCollisions() {
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.addMissile(1);
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class ProjectilePowerUp extends PowerUp {
  width = 20;
  height = 20;
  speed = 75;
  image = document.getElementById('powerup_image');

  constructor(game) {
    super(game);
    super.getOffScreenSpawnPosition();
  }

  checkCollisions() {
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.abilities.projectile.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class BoostPowerUp extends PowerUp {
  width = 30;
  height = 30;
  speed = 100;
  image = document.getElementById('boost_powerup_image');

  constructor(game) {
    super(game);
    super.getOffScreenSpawnPosition();
  }

  checkCollisions() {
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.abilities.boost.activate();
      // Reset cooldown when you get the powerup, so you can use boost right away
      this.game.player.boostCooldownEndTime = this.game.timestamp;
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class ShieldPowerUp extends PowerUp {
  width = 30;
  height = 30;
  speed = 50;
  image = document.getElementById('shield_powerup_image');

  constructor(game) {
    super(game);
    super.getOffScreenSpawnPosition();
  }

  checkCollisions() {
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.abilities.shield.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class ReversePowerUp extends PowerUp {
  width = 30;
  height = 30;
  speed = 150;
  image = document.getElementById('reverse_powerup_image');

  constructor(game) {
    super(game);
    super.getOffScreenSpawnPosition();
  }

  checkCollisions() {
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.abilities.reverse.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class FlameThrowerPowerUp extends PowerUp {
  width = 30;
  height = 30;
  speed = 100;
  image = document.getElementById('flame_powerup_image');

  constructor(game) {
    super(game);
    super.getOffScreenSpawnPosition();
  }

  checkCollisions() {
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.abilities.flame.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class LaserPowerUp extends PowerUp {
  width = 30;
  height = 30;
  speed = 100;
  image = document.getElementById('laser_powerup_image');

  constructor(game) {
    super(game);
    super.getOffScreenSpawnPosition();
  }

  checkCollisions() {
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.abilities.laser.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class ParticleBombPowerUp extends PowerUp {
  width = 30;
  height = 30;
  speed = 100;
  image = document.getElementById('particle_bomb_powerup_image');

  constructor(game) {
    super(game);
    super.getOffScreenSpawnPosition();
  }

  checkCollisions() {
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.abilities.particleBomb.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
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
