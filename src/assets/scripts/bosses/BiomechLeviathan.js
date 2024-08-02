import { spawnOffScreenRandomSide } from '../utilities.js';

class BiomechLeviathan {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 200;
    this.height = 200;
    this.speed = 40;
    this.maxHealth = 2000;
    this.health = this.maxHealth;
    this.lastAttackTime = 0;
    this.attackInterval = 1500;
    this.canAttack = true;
    this.alive = true; // TODO - check cyber dragon
    this.phase = 1;
    this.phaseTransitioned = [false, false, false];
    this.playerCollisionRadius = 100;
    this.projectileCollisionRadius = 120;

    this.image = new Image();
    this.image.src = 'assets/images/biomech_leviathan.png';

    this.sounds = {
      tractorBeam: new Audio('assets/audio/tractorBeamSound.mp3'),
      emp: new Audio('assets/audio/empSound.mp3'),
      eat: new Audio('assets/audio/biomechEat.mp3'),
      splat: new Audio('assets/audio/splatSound.mp3'),
      noFire: new Audio('assets/audio/nofire.mp3'),
    };

    spawnOffScreenRandomSide(this, 100);
  }

  draw(ctx) {
    if (!this.alive) return;

    // Draw Leviathan
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();

    // Health Bar
    const barWidth = this.width;
    const barHeight = 10;
    const barX = this.x - this.width / 2;
    const barY = this.y + this.height / 2 + 10;
    const healthRatio = this.health / this.maxHealth;

    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}

export default BiomechLeviathan;
