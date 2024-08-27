export default class Explosion {
  constructor(game, x, y, doSound = true) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.x = x;
    this.y = y;
    this.doSound = doSound;
    this.numParticles = 50;
    this.colors = ['red', 'orange', 'yellow'];
    this.particles = [];
    this.markedForDeletion = false;
    this.sound = document.getElementById('explosion_sound');

    for (let i = 0; i < this.numParticles; i++) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.particles.push(new ExplosionParticle(this, color));
    }

    if (this.doSound) {
      this.sound.currentTime = 0;
      this.sound.play();
    }
  }

  draw(ctx) {
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  update(deltaTime) {
    this.particles.forEach((particle) => particle.update(deltaTime));
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
    if (this.particles.length === 0) this.markedForDeletion;
  }
}

class ExplosionParticle {
  constructor(explosion, color) {
    this.explosion = explosion;
    this.game = this.explosion.game;
    this.x = this.explosion.x;
    this.y = this.explosion.y;
    this.color = color;
    this.radius = Math.random() * 2 + 2; // Random size
    this.life = 100; // Lifetime of the particle in frames
    this.dx = (Math.random() - 0.5) * 5; // Horizontal velocity
    this.dy = (Math.random() - 0.5) * 5; // Vertical velocity
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.life--;
    if (this.life <= 0) this.markedForDeletion = true;
  }
}
