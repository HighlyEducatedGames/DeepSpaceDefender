import Explosion from '../effects/Explosion.js';

export default class Flame {
  active = false;
  particlesPerTick = 1;
  sound = document.getElementById('flame_sound');

  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
  }

  update() {
    if (this.active) {
      if (this.sound.paused) {
        this.sound.loop = true;
        this.sound.play();
      }
      this.createParticles();
    } else {
      if (!this.sound.paused) {
        this.sound.pause();
        this.sound.currentTime = 0;
      }
    }
  }

  createParticles() {
    for (let i = 0; i < this.particlesPerTick; i++) {
      this.game.particles.push(new FlameParticle(this.game));
    }
  }
}

class FlameParticle {
  radius = Math.random() * 20 + 10;
  color = `rgba(${255}, ${Math.random() * 150}, 0, 1)`;
  alpha = 1;
  damage = 1;
  tickingDamage = 1;
  markedForDeletion = false;

  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.x = this.game.player.x + Math.cos(this.game.player.rotation) * this.game.player.width * 0.5;
    this.y = this.game.player.y + Math.sin(this.game.player.rotation) * this.game.player.height * 0.5;
    this.velocity = {
      x: Math.cos(this.game.player.rotation) * 10 + (Math.random() - 0.5) * 2,
      y: Math.sin(this.game.player.rotation) * 10 + (Math.random() - 0.5) * 2,
    };
  }

  draw(ctx) {
    if (this.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.radius *= 0.96;
    this.alpha -= 0.02;

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

    if (this.radius < 0.5 || this.alpha <= 0) this.markedForDeletion = true;
  }

  checkCollisions() {
    // Check collision to each enemy
    this.game.enemies.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)) {
        enemy.takeDamage(this.damage);
        if (enemy.markedForDeletion) {
          this.game.cloneSound(this.game.player.sounds.torchedEnemy);
          this.game.addScore(enemy.score);
          this.game.effects.push(new Explosion(this.game, enemy.x, enemy.y, false));
        }
      }
    });

    // Check collision with boss
    if (this.game.boss) {
      if (this.game.checkCollision(this, this.game.boss)) {
        this.game.boss.takeDamage(this.tickingDamage);
        this.markedForDeletion = true;
      }
    }
  }
}
