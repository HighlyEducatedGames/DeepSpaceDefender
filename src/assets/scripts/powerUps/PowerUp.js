class PowerUp {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
    this.speed = null;
    this.dx = null;
    this.dy = null;
    this.verticalMargin = 50;
    this.zigZagSpeed = 100;
    this.sound = document.getElementById('powerup_sound');
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);
  }

  update(deltaTime) {
    this.x += (this.speed * this.dx * deltaTime) / 1000;
    this.y += (this.speed * this.dy * deltaTime) / 1000;

    if (this.game.outOfBounds(this)) this.markedForDeletion = true;
  }

  getOffScreenSpawnPosition() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    this.x = side === 'left' ? -this.width * 0.5 : this.game.canvas.width + this.width * 0.5;
    this.y = this.verticalMargin + Math.random() * (this.game.canvas.height - this.height - 2 * this.verticalMargin);
    this.directionX = side === 'left' ? 1 : -1;
    this.directionY = 0;
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
}

class BoostPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 100;
    this.image = document.getElementById('boost_powerup_image');
    super.getOffScreenSpawnPosition();
  }
}

class flamethrowerPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 100;
    this.image = document.getElementById('flame_powerup_image');
    super.getOffScreenSpawnPosition();
  }
}

export default {
  projectile: ProjectilePowerUp,
  bomb: BombPowerUp,
  missile: HomingMissilePowerUp,
  shield: ShieldPowerUp,
  reverse: ReversePowerUp,
  boost: BoostPowerUp,
  flame: flamethrowerPowerUp,
};
