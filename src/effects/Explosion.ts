import { Effect, Particle } from '../GameObject';

export default class Explosion extends Effect {
  x: number;
  y: number;
  doSound: boolean;
  numParticles = 50;
  colors = ['red', 'orange', 'yellow'];
  particles: ExplosionParticle[] = [];
  sound: HTMLAudioElement;

  constructor(game: Game, x: number, y: number, doSound = true) {
    super(game);
    this.game = game;
    this.x = x;
    this.y = y;
    this.doSound = doSound;
    this.sound = this.game.getAudio('explosion_sound');

    for (let i = 0; i < this.numParticles; i++) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.particles.push(new ExplosionParticle(this, color));
    }

    if (this.doSound) {
      this.sound.currentTime = 0;
      this.sound.play();
    }
  }

  draw(ctx: CTX) {
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  update(deltaTime: number) {
    this.particles.forEach((particle) => particle.update(deltaTime));
  }

  cleanup() {
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
    if (this.particles.length === 0) this.markedForDeletion;
  }
}

class ExplosionParticle extends Particle {
  explosion: Explosion;
  x: number;
  y: number;
  color: string;
  radius = Math.random() * 2 + 2;
  life = 1650;
  dx = (Math.random() - 0.5) * 5;
  dy = (Math.random() - 0.5) * 5;

  constructor(explosion: Explosion, color: string) {
    super(explosion.game);
    this.explosion = explosion;
    this.x = this.explosion.x;
    this.y = this.explosion.y;
    this.color = color;
  }

  draw(ctx: CTX) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update(deltaTime: number) {
    this.x += this.dx;
    this.y += this.dy;
    this.life -= deltaTime;
    if (this.life <= 0) this.markedForDeletion = true;
  }
}
