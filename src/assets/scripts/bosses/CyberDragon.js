import { spawnOffScreenRandomSide } from '../utilities.js';

class CyberDragon {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 250;
    this.height = 250;
    this.speed = 50;
    this.maxHealth = 3000;
    this.health = this.maxHealth;
    this.lastAttackTime = 0;
    this.attackInterval = 2000;
    this.canAttack = true;
    this.phase = 1;
    this.phaseTransitioned = [false, false, false];
    this.laserCharging = false;
    this.laserChargeRadius = 5;
    this.laserChargeTime = 0;
    this.laserChargeDuration = 3500;
    this.laserReady = false;
    this.alive = true; // TODO: think about destroying objects and respawning them and where in the code to best do this
    this.projectileCollisionRadius = 125;
    this.playerCollisionRadius = 47.5;
    this.lastBombDamageTime = 0;
    this.spiralProjectiles = [];
    this.spiralAngle = 0;
    this.spiralSpeed = 0.1;
    this.spiralRadius = 100;
    this.spiralActive = false;
    this.spiralStartTime = 0;
    this.spiralDuration = 5000;
    this.spiralCooldown = 4000;

    this.image = new Image();
    this.image.src = 'assets/images/cyber_dragon.png';

    this.sounds = {
      laserCharging: new Audio('assets/audio/laser_charging.mp3'),
    };

    spawnOffScreenRandomSide(this, 100);
  }

  chargeLaser() {
    // if (!cyberDragon || !cyberDragon.alive) return; // TODO is this needed?
    if (!this.laserCharging) {
      this.laserCharging = true;
      this.laserChargeTime = 0;
      this.laserChargeRadius = 5;
      this.sounds.laserCharging.currentTime = 0;
      this.sounds.laserCharging.play();
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    // Dragon
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
    ctx.restore();

    // Boss Bar
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

  update() {}
}

export default CyberDragon;
