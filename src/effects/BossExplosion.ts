import { Effect, Particle } from '../GameObject';

export default class BossExplosion extends Effect {
  x: number;
  y: number;
  doSound: boolean;
  particles: Particle[] = [];
  numParticles = 150;
  numShockWaves = 5;
  rotationSpeed = 0.05;
  explosionStrength = 5;
  sound: HTMLAudioElement;

  constructor(game: Game, x: number, y: number, doSound = true) {
    super(game);
    this.x = x;
    this.y = y;
    this.doSound = doSound;
    this.sound = this.game.getAudio('explosion_sound');

    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push(new BossParticle(this));
    }

    for (let i = 0; i < this.numShockWaves; i++) {
      const initialRadius = i * 5;
      const initialAngle = i * (Math.PI / 6);
      this.particles.push(new BossShockWave(this, initialRadius, initialAngle));
    }

    if (this.doSound) this.game.cloneSound(this.sound);
  }

  draw(ctx: CTX) {
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  update(deltaTime: number) {
    this.particles.forEach((particle) => particle.update(deltaTime));
  }

  cleanup() {
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
    if (this.particles.length === 0) this.markedForDeletion = true;
  }
}

class BossParticle extends Particle {
  explosion: BossExplosion;
  x: number;
  y: number;
  radius = Math.random() * 5 + 2;
  color = `hsl(${Math.random() * 360}, 100%, 50%)`;
  speed: number;
  angle = Math.random() * Math.PI * 2;
  tracer: { x: number; y: number };

  constructor(explosion: BossExplosion) {
    super(explosion.game);
    this.explosion = explosion;
    this.x = this.explosion.x;
    this.y = this.explosion.y;
    this.speed = Math.random() * this.explosion.explosionStrength + 2;
    this.tracer = { x: this.x, y: this.y };
    this.markedForDeletion = false;

    while (Math.abs(Math.cos(this.angle)) < 0.1 || Math.abs(Math.sin(this.angle)) < 0.1) {
      this.angle = Math.random() * Math.PI * 2;
    }
  }

  draw(ctx: CTX) {
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

class BossShockWave extends Particle {
  explosion: BossExplosion;
  x: number;
  y: number;
  radius: number;
  angle: number;
  speed = 25;
  color = 'grey';

  constructor(explosion: BossExplosion, radius: number, angle: number) {
    super(explosion.game);
    this.explosion = explosion;
    this.x = this.explosion.x;
    this.y = this.explosion.y;
    this.radius = radius;
    this.angle = angle;
  }

  draw(ctx: CTX) {
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

  update() {
    this.radius += this.speed;
    this.angle += this.explosion.rotationSpeed;

    if (this.radius * 2 > this.game.width || this.radius > this.game.height) {
      this.markedForDeletion = true;
    }
  }
}
