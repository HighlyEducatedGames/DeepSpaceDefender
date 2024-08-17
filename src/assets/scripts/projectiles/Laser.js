import Explosion from '../effects/Explosion.js';

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
    this.particles = [];
    this.canReactivate = true; // Flag to control reactivation

    this.sounds = {
      hit: document.getElementById('laser_hit_sound'),
      fire: document.getElementById('laser_fire_sound'),
      charge: document.getElementById('laser_charge_sound'),
    };

    this.duration = 3000; // Laser duration in milliseconds
    this.activationTime = null; // Time when the laser was activated
  }

  draw(ctx) {
    if (!this.active) return;  // Stop drawing if laser is not active

    ctx.save();
    ctx.strokeStyle = `rgba(0, 255, 255, ${this.alpha})`;
    ctx.lineWidth = this.width;
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.endX, this.endY);
    ctx.stroke();
    ctx.restore();

    // Draw particles
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  update(deltaTime) {
    if (!this.active) return;  // Stop updating if laser is not active

    // Deactivate if duration has passed
    if (this.activationTime && performance.now() - this.activationTime > this.duration) {
      this.deactivate();
      return;
    }

    this.updatePosition();
    this.alpha -= this.fadeRate;
    if (this.alpha <= 0) this.alpha = 0;

    this.generateParticles();
    this.updateParticles(deltaTime);
    this.handleCollisions();

    this.manageSound();
  }

  updatePosition() {
    const player = this.game.player;
    this.startX = player.x + Math.cos(player.rotation) * player.width * 0.5;
    this.startY = player.y + Math.sin(player.rotation) * player.height * 0.5;
    this.endX = player.x + Math.cos(player.rotation) * (player.width * 0.5 + this.length);
    this.endY = player.y + Math.sin(player.rotation) * (player.height * 0.5 + this.length);
  }

  generateParticles() {
    const numParticles = 5;
    for (let i = 0; i < numParticles; i++) {
      const t = i / (numParticles - 1);
      const x = this.startX + t * (this.endX - this.startX);
      const y = this.startY + t * (this.endY - this.startY);
      if (this.particles.length < 50) {
        this.particles.push(new PlayerLaserParticle(this.game, x, y));
      } else {
        this.particles.shift(); // Reuse the oldest particle slot
        this.particles.push(new PlayerLaserParticle(this.game, x, y));
      }
    }
  }

  updateParticles(deltaTime) {
    this.particles.forEach((particle, index) => {
      particle.update(deltaTime);
      if (particle.markedForDeletion) {
        this.particles.splice(index, 1);
      }
    });
  }

  handleCollisions() {
    this.checkEnemyCollisions();
    this.checkBossCollisions();
  }

  checkEnemyCollisions() {
    this.game.enemies.enemies.forEach((enemy) => {
      const dx = this.endX - (enemy.x + enemy.width / 2);
      const dy = this.endY - (enemy.y + enemy.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < enemy.width / 2) {
        enemy.takeDamage(this.enemyDamage);
        if (this.sounds.hit) this.sounds.hit.play();

        if (enemy.markedForDeletion) {
          // Play sound and add score
          if (this.game.player.sounds.torchedEnemy) {
            this.game.cloneSound(this.game.player.sounds.torchedEnemy);
          }
          this.game.addScore(enemy.score);
          
          // Create an explosion effect
          this.game.effects.push(new Explosion(this.game, enemy.x, enemy.y, false));
        }
      }
    });
  }

  checkBossCollisions() {
    const boss = this.game.boss;
    if (boss) {
      const dx = this.endX - (boss.x + boss.width / 2);
      const dy = this.endY - (boss.y + boss.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < boss.width / 2) {
        boss.health -= this.bossDamage;
        if (this.sounds.hit) this.sounds.hit.play();

        if (boss.health <= 0) {
          this.game.handleBossDeath();
        }
      }
    }
  }

  manageSound() {
    if (this.active) {
      if (this.sounds.charge && !this.sounds.charge.paused) {
        this.sounds.charge.pause();
        this.sounds.charge.currentTime = 0;
      }

      if (this.sounds.fire && !this.sounds.fire.playing) {
        this.sounds.fire.loop = true;
        this.sounds.fire.play();
      }
    } else {
      if (this.sounds.fire && !this.sounds.fire.paused) {
        this.sounds.fire.pause();
        this.sounds.fire.currentTime = 0;
      }
    }
  }

  activate() {
    if (this.canReactivate) {
      this.active = true;
      this.alpha = 1;
      this.activationTime = performance.now(); // Record activation time
      this.canReactivate = false; // Prevent reactivation until button is released

      // Stop the charging sound as the laser is activated
      if (this.sounds.charge && !this.sounds.charge.paused) {
        this.sounds.charge.pause();
        this.sounds.charge.currentTime = 0;
      }
    }
  }

  deactivate() {
    this.active = false;
    this.clearParticles();
    this.manageSound(); // Ensure sound stops when laser is deactivated
  }

  handleButtonRelease() {
    this.canReactivate = true; // Allow laser to be reactivated on next press
  }

  clearParticles() {
    this.particles = [];
  }
}

class PlayerLaserParticle {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.speed = 15;
    this.maxLife = 30;
    this.life = this.maxLife;
    this.vx = (Math.random() - 0.5) * this.speed;
    this.vy = (Math.random() - 0.5) * this.speed;
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
  }
}
