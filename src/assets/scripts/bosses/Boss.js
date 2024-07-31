import { spawnOffScreenRandomSide } from '../utilities.js';

class Boss {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 100;
    this.height = 100;
    this.speed = 50;
    this.maxHealth = 1000;
    this.health = this.maxHealth;
    this.lastShotTime = 0;
    this.shootInterval = 2000;
    this.canShoot = false;
    this.alive = true;
    this.phase = 1;
    this.phaseTransitioned = [false, false, false];
    this.collisionRadius = 75;

    this.image = new Image();
    this.image.src = 'assets/images/boss.png';
    this.music = new Audio('assets/audio/boss_music.mp3');

    spawnOffScreenRandomSide(this, 100);

    setTimeout(() => {
      this.canShoot = true;
    }, 5000);
  }

  draw(ctx) {
    if (!this.alive) return;

    // Boss
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

    // Health Bar
    const barWidth = this.width;
    const barHeight = 10;
    const barX = this.x;
    const barY = this.y + this.height + 5;
    const healthRatio = this.health / this.maxHealth;

    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  startMusic() {
    if (!this.music.paused) {
      this.game.stopBackgroundMusic();
      this.music.play();
    }
  }

  stopMusic() {
    this.music.pause();
    this.music.currentTime = 0;
  }
}

export default Boss;
