import { spawnOffScreenRandomSide } from '../utilities.js';

class StealthEnemy {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 50;
    this.height = 50;
    this.speed = 150;
    // this.directionX = (player.x - position.x) / Math.sqrt((player.x - position.x) ** 2 + (player.y - position.y) ** 2); // TODO
    // this.directionY = (player.y - position.y) / Math.sqrt((player.x - position.x) ** 2 + (player.y - position.y) ** 2);
    this.visible = false;
    this.opacity = 0;
    this.visibleStartTime = performance.now();
    this.visibleDuration = 3000;
    this.invisibleDuration = 3000;
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.alive = true;
    this.canShoot = false;
    this.lastShotTime = 0;
    this.shootInterval = Math.random() * 1000 + 1000;

    this.image = new Image();
    this.image.src = 'assets/images/stealth_enemy.png';

    spawnOffScreenRandomSide(this, 50);

    setTimeout(() => {
      this.canShoot = true;
    }, 2000);
  }
}

export default StealthEnemy;
