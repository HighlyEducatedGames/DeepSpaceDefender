class PowerUp {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
    this.speed = null;
    this.directionX = 0;
    this.directionY = 0;
    this.verticalMargin = 50;
    this.spawnTime = this.game.timestamp;
    this.expirationTime = 0;
    this.zigZagSpeed = 100;
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);
  }

  update(deltaTime) {
    this.x += (this.speed * this.directionX * deltaTime) / 1000;
    this.y += (this.speed * this.directionY * deltaTime) / 1000;

    if (
      this.x < -this.width ||
      this.x > this.game.canvas.width ||
      this.y < -this.height ||
      this.y > this.game.canvas.height
    ) {
      this.markedForDeletion = true;
    }
  }

  getOffScreenSpawnPosition() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    this.x = side === 'left' ? -this.width : this.game.canvas.width;
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
    this.image = new Image();
    this.image.src = 'assets/images/powerUp.png';
    this.sound = new Audio('assets/audio/powerUp.mp3');
    super.getOffScreenSpawnPosition();
  }
}

class BombPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 75;
    this.image = new Image();
    this.image.src = 'assets/images/bombPowerUp.png';
    super.getOffScreenSpawnPosition();
  }
}

class HomingMissilePowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 75;
    this.image = new Image();
    this.image.src = 'assets/images/homingMissilePowerUp.png';
    super.getOffScreenSpawnPosition();
  }
}

class ShieldPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 50;
    this.image = new Image();
    this.image.src = 'assets/images/shield_powerUp.png';
    super.getOffScreenSpawnPosition();
  }
}

class ReversePowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 150;
    this.image = new Image();
    this.image.src = 'assets/images/reversePowerUp.png';
    super.getOffScreenSpawnPosition();
  }
}

class BoostPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 100;
    this.image = new Image();
    this.image.src = 'assets/images/boostPowerUp.png';
    super.getOffScreenSpawnPosition();
  }
}

class flamethrowerPowerUp extends PowerUp {
  constructor(game) {
    super(game);
    this.width = 30;
    this.height = 30;
    this.speed = 100;
    this.image = new Image();
    this.image.src = 'assets/images/flamethrowerPowerUp.png';
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
