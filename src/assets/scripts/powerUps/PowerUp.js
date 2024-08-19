class PowerUp {
  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
    this.speed = null;
    this.dx = null;
    this.dy = null;
    this.margin = 50;
    this.zigZagSpeed = 100;
    this.sound = document.getElementById('powerup_sound');
    this.markedForDeletion = false;
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
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 75;
    this.image = document.getElementById('bomb_powerup_image');
    super.getOffScreenSpawnPosition();
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.addBomb(1);
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class HomingMissilePowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 75;
    this.image = document.getElementById('missile_powerup_image');
    super.getOffScreenSpawnPosition();
  }
  update(deltaTime) {
    super.update(deltaTime);
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.addMissile(1);
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class ProjectilePowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 20;
    this.height = 20;
    this.speed = 75;
    this.image = document.getElementById('powerup_image');
    super.getOffScreenSpawnPosition();
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.getPowers().projectile.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class BoostPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 100;
    this.duration = 5000;
    this.image = document.getElementById('boost_powerup_image');
    super.getOffScreenSpawnPosition();
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.getPowers().boost.activate();
      // Reset cooldown when you get the powerup so you can use boost right away
      this.game.player.boostCooldownEndTime = this.game.timestamp;
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class ShieldPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 50;
    this.image = document.getElementById('shield_powerup_image');
    super.getOffScreenSpawnPosition();
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.getPowers().shield.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class ReversePowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 150;
    this.image = document.getElementById('reverse_powerup_image');
    super.getOffScreenSpawnPosition();
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.getPowers().reverse.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class FlameThrowerPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 100;
    this.image = document.getElementById('flame_powerup_image');
    super.getOffScreenSpawnPosition();
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.getPowers().flame.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class LaserPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 100;
    this.image = document.getElementById('laser_powerup_image');
    super.getOffScreenSpawnPosition();
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.getPowers().laser.activate();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class ParticleBombPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 100;
    this.image = document.getElementById('particle_bomb_powerup_image');
    super.getOffScreenSpawnPosition();
  }

  update(deltaTime) {
    super.update(deltaTime);
    // Player Collision
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.getPowers().particleBomb.activate();
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
