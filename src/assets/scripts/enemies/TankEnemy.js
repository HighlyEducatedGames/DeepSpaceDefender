import { spawnOffScreenRandomSide } from '../utilities.js';

class TankEnemy {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 60;
    this.height = 60;
    this.speed = 60;
    // this.directionX = (player.x - position.x) / Math.sqrt((player.x - position.x) ** 2 + (player.y - position.y) ** 2); // TODO
    // this.directionY = (player.y - position.y) / Math.sqrt((player.x - position.x) ** 2 + (player.y - position.y) ** 2);
    this.shootInterval = Math.random() * 1000 + 2000;
    this.lastShotTime = 0;
    this.canShoot = false;
    this.alive = true;
    this.maxHealth = 30;
    this.health = this.maxHealth;

    this.image = new Image();
    this.image.src = 'assets/images/enemy_tank.png';

    spawnOffScreenRandomSide(this, 60);

    setTimeout(() => {
      this.canShoot = true;
    }, 2000);
  }
}

export default TankEnemy;
