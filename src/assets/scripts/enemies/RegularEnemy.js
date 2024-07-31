import { spawnOffScreenRandomSide } from '../utilities.js';

class RegularEnemy {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 50;
    this.height = 50;
    this.speed = 50 + this.game.level;
    // this.directionX = position.directionX; // TODO: how are we using these properties??
    // this.directionY = position.directionY;
    this.shootInterval = Math.random() * 2000 + 3000;
    this.lastShotTime = 0;
    this.canShoot = false;
    this.alive = true;
    this.maxHealth = 10;
    this.health = this.maxHealth;

    this.image = new Image();
    this.image.src = 'assets/images/enemy.png';

    spawnOffScreenRandomSide(this, 50);

    setTimeout(() => {
      this.canShoot = true;
    }, 2000);
  }
}

export default RegularEnemy;
