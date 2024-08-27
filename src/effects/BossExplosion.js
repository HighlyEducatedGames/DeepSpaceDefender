export default class BossExplosion {
  constructor(game, x, y, doSound = true) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.x = x;
    this.y = y;
    this.doSound = doSound;
    this.numParticles = 150;
    this.numShockwaves = 5;
    this.particles = [];
    this.shockwaves = [];
    this.markedForDeletion = false;
    this.rotationSpeed = 0.05;
    this.explosionStrength = 5;
    this.sound = document.getElementById('explosion_sound');

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push(new BossParticle(this));
    }

    for (let i = 0; i < this.numShockwaves; i++) {
      const initialRadius = i * 5;
      const initialAngle = i * (Math.PI / 6);
      this.shockwaves.push(new BossShockWave(this, initialRadius, initialAngle));
    }

    if (this.doSound) {
      this.sound.currentTime = 0;
      this.sound.play();
    }
  }

  draw(ctx) {
    this.shockwaves.forEach((shockwave) => shockwave.draw(ctx));
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  update(deltaTime) {
    this.shockwaves.forEach((shockwave) => shockwave.update(deltaTime));
    this.shockwaves = this.shockwaves.filter((shockwave) => !shockwave.markedForDeletion);

    this.particles.forEach((particle) => particle.update(deltaTime));
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);

    if (this.particles.length === 0 && this.shockwaves.length === 0) this.markedForDeletion = true;
  }
}

class BossParticle {
  constructor(explosion) {
    this.explosion = explosion;
    this.game = this.explosion.game;
    this.x = this.explosion.x;
    this.y = this.explosion.y;
    this.radius = Math.random() * 5 + 2;
    this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    this.speed = Math.random() * this.explosion.explosionStrength + 2;
    this.angle = Math.random() * Math.PI * 2;
    this.tracer = { x: this.x, y: this.y };
    this.markedForDeletion = false;

    while (Math.abs(Math.cos(this.angle)) < 0.1 || Math.abs(Math.sin(this.angle)) < 0.1) {
      this.angle = Math.random() * Math.PI * 2;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.tracer.x, this.tracer.y);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.tracer.x = this.x;
    this.tracer.y = this.y;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    if (this.x < 0 || this.x > this.game.width || this.y < 0 || this.y > this.game.height) {
      this.markedForDeletion = true;
    }
  }
}

class BossShockWave {
  constructor(explosion, initialRadius, initialAngle) {
    this.explosion = explosion;
    this.game = this.explosion.game;
    this.x = this.explosion.x;
    this.y = this.explosion.y;
    this.radius = initialRadius;
    this.angle = initialAngle;
    this.speed = 25;
    this.color = 'grey';
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 2, this.radius, 0, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  update(deltaTime) {
    this.radius += this.speed;
    this.angle += this.explosion.rotationSpeed;

    if (this.radius * 2 > this.game.width || this.radius > this.game.height) {
      this.markedForDeletion = true;
    }
  }
}
