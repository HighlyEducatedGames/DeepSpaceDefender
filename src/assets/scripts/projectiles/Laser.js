export default class Laser {
  constructor(game) {
    this.game = game;
    this.enemyDamage = 0.005;
    this.bossDamage = 0.0009;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.color = 'red';
    this.alpha = 1;
    this.fadeRate = 0.05;
    this.width = 5;
    this.length = 300;
    this.active = false;

    this.sounds = {
      hit: document.getElementById('laser_hit_sound'),
      fire: document.getElementById('laser_fire_sound'),
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 255, 255, 1)';
    ctx.lineWidth = this.width;
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.endX, this.endY);
    ctx.stroke();
    ctx.restore();
  }

  update() {
    const player = this.game.player;
    this.startX = player.x + Math.cos(player.rotation) * player.width * 0.5;
    this.startY = player.y + Math.sin(player.rotation) * player.height * 0.5;
    this.endX = player.x + Math.cos(player.rotation) * (player.width * 0.5 + this.length);
    this.endY = player.y + Math.sin(player.rotation) * (player.height * 0.5 + this.length);

    this.alpha -= this.fadeRate;
    if (this.alpha <= 0) this.alpha = 0;

    // this.generateParticles();
  }

  generateParticles() {
    const numParticles = 5;
    for (let i = 0; i < numParticles; i++) {
      const t = i / (numParticles - 1);
      const x = this.startX + t * (this.endX - this.startX);
      const y = this.startY + t * (this.endY - this.startY);
      this.game.particles.push(new PlayerLaserParticle(this.game, x, y));
    }
  }
}

class PlayerLaserParticle {
  constructor(game, x, y) {
    this.game = game;
    this.laserEndX = x;
    this.laserEndY = y;
    this.x = x;
    this.y = y;
    this.speed = 15;
    this.maxLife = 30;
    this.life = this.maxLife;
    this.vx = Math.random() - 0.5;
    this.vy = Math.random() - 0.5;
    this.distance = 0;
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.life / this.maxLife})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime) {
    this.laserEndX = this.game.player.laser.endX;
    this.laserEndY = this.game.player.laser.endY;

    this.distance += (this.speed * deltaTime) / 1000;
    this.x = this.laserEndX + this.vx * this.distance;
    this.y = this.laserEndY + this.vy * this.distance;
    this.life--;

    if (this.life <= 0) this.markedForDeletion = true;

    // Wrap around the canvas
    if (this.x < 0) {
      this.x = this.game.width;
    } else if (this.x > this.game.width) {
      this.x = 0;
    }
    if (this.y < 0) {
      this.y = this.game.height;
    } else if (this.y > this.game.height) {
      this.y = 0;
    }
  }
}
