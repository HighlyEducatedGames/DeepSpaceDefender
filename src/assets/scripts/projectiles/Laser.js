import Explosion from '../effects/Explosion.js';

export default class Laser {
  constructor(game) {
    this.game = game;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.width = 5;
    this.length = 300;
    this.active = false;

    this.sounds = {
      hit: document.getElementById('laser_hit_sound'),
      fire: document.getElementById('laser_fire_sound'),
      charge: document.getElementById('laser_charge_sound'),
    };
  }

  draw(ctx) {
    if (!this.active) return;

    // DEBUG - Laser region
    if (this.game.debug) {
      ctx.save();
      ctx.strokeStyle = `white`;
      ctx.lineWidth = this.width;
      ctx.beginPath();
      ctx.moveTo(this.startX, this.startY);
      ctx.lineTo(this.endX, this.endY);
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.game.player.x, this.game.player.y, this.length + this.game.player.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  update() {
    this.updatePosition();
    if (!this.active) return;
    this.generateParticles();
  }

  updatePosition() {
    const player = this.game.player;
    this.startX = player.x + Math.cos(player.rotation) * player.width * 0.5;
    this.startY = player.y + Math.sin(player.rotation) * player.height * 0.5;
    this.endX = player.x + Math.cos(player.rotation) * (player.width * 0.5 + this.length);
    this.endY = player.y + Math.sin(player.rotation) * (player.height * 0.5 + this.length);
  }

  generateParticles() {
    const numParticles = 50;
    for (let i = 0; i < numParticles; i++) {
      const t = i / (numParticles - 1);
      const x = this.startX + t * (this.endX - this.startX);
      const y = this.startY + t * (this.endY - this.startY);
      this.game.particles.push(new PlayerLaserParticle(this.game, this, x, y));
    }
  }
}

class PlayerLaserParticle {
  constructor(game, laser, x, y) {
    this.game = game;
    this.laser = laser;
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.radius = 1;
    this.maxLife = 30;
    this.life = this.maxLife;
    this.vx = Math.random() * 2 - 1;
    this.vy = Math.random() * 2 - 1;
    this.distance = 0;
    this.enemyDamage = 0.005;
    this.bossDamage = 0.0009;
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.life / this.maxLife})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime) {
    this.distance += (this.speed * deltaTime) / 1000;
    this.x += this.vx * this.distance;
    this.y += this.vy * this.distance;
    this.life--;

    if (this.life <= 0) this.markedForDeletion = true;

    // Wrap around the canvas
    if (this.x < 0) this.x = this.game.width;
    if (this.x > this.game.width) this.x = 0;
    if (this.y < 0) this.y = this.game.height;
    if (this.y > this.game.height) this.y = 0;

    this.checkEnemyCollisions();
    this.checkBossCollisions();
  }

  checkEnemyCollisions() {
    this.game.enemies.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)) {
        enemy.takeDamage(this.enemyDamage);
        this.markedForDeletion = true;
        this.laser.sounds.hit.play();
        if (enemy.markedForDeletion) {
          this.game.effects.push(new Explosion(this.game, enemy.x, enemy.y));
        }
      }
    });
  }

  checkBossCollisions() {
    const boss = this.game.boss;
    if (boss) {
      if (this.game.checkCollision(this, boss)) {
        boss.takeDamage(this.bossDamage);
        this.markedForDeletion = true;
        this.laser.sounds.hit.play();
      }
    }
  }
}
