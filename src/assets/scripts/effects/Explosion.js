export default class Explosion {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.numParticles = 50;
    this.particles = [];
    this.colors = ['red', 'orange', 'yellow'];
    this.markedForDeletion = false;

    this.sound = new Audio('assets/audio/explosion.mp3');

    for (let i = 0; i < this.numParticles; i++) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.particles.push(new ExplosionParticle(this, color));
    }

    this.sound.currentTime = 0;
    this.sound.play();
  }

  update() {
    if (this.particles.length <= 0) this.markedForDeletion = true;
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
