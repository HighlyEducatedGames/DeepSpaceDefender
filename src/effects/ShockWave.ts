import { Effect, Particle } from '../GameObject';

export default class ShockWave extends Effect {
  x: number;
  y: number;
  doSound: boolean;
  numParticles = 80;
  colors = ['#cccccc', '#999999', '#666666', '#333333'];
  particles: ShockWaveParticle[] = [];
  shockWave: EllipticalShockWave;
  sound: HTMLAudioElement;

  constructor(game: Game, x: number, y: number, doSound = true) {
    super(game);
    this.x = x;
    this.y = y;
    this.doSound = doSound;
    this.sound = this.game.getAudio('explosion_sound');
    this.shockWave = new EllipticalShockWave(this, x, y);

    for (let i = 0; i < this.numParticles; i++) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.particles.push(new ShockWaveParticle(this, color));
    }

    if (this.doSound) {
      this.sound.currentTime = 0;
      this.sound.play().catch(() => {});
    }
  }

  draw(ctx: CTX) {
    this.shockWave.draw(ctx);
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  update(deltaTime: number) {
    this.shockWave.update();
    this.particles.forEach((particle) => particle.update(deltaTime));
  }

  cleanup() {
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
    if (this.particles.length === 0 && this.shockWave.alpha <= 0) {
      this.markedForDeletion = true;
    }
  }
}

class ShockWaveParticle extends Particle {
  shockwave: ShockWave;
  color: string;
  x: number;
  y: number;
  radius = Math.random() * 2 + 1; // Smaller particles (radius between 1 and 3)
  alpha = 1; // Initial opacity
  life = 700;
  dx = (Math.random() - 0.5) * 4 + (Math.random() - 0.5) * 2; // Less correlated horizontal velocity
  dy = (Math.random() - 0.5) * 4 + (Math.random() - 0.5) * 2; // Less correlated vertical velocity
  gravity = 0.01; // Reduced gravity to keep particles more level
  friction = 0.98;

  constructor(shockwave: ShockWave, color: string) {
    super(shockwave.game);
    this.shockwave = shockwave;
    this.color = color;
    this.x = this.shockwave.x + (Math.random() - 0.5) * 10; // Slightly randomize initial x position
    this.y = this.shockwave.y + (Math.random() - 0.5) * 10; // Slightly randomize initial y position
  }

  draw(ctx: CTX) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.hexToRgb(this.color)}, ${this.alpha})`;
    ctx.fill();
  }

  update(deltaTime: number) {
    this.dy += this.gravity;
    this.x += this.dx;
    this.y += this.dy;
    this.dx *= this.friction;
    this.dy *= this.friction;

    this.alpha -= deltaTime / this.life;
    if (this.alpha <= 0 || this.radius <= 0.2) {
      this.markedForDeletion = true;
    }
  }

  // Helper function to convert hex color to RGB
  hexToRgb(hex: string) {
    let bigint = parseInt(hex.substring(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r},${g},${b}`;
  }
}

class EllipticalShockWave {
  game: Game;
  shockwave: ShockWave;
  x: number;
  y: number;
  radiusX = 0;
  radiusY = 0;
  alpha = 1;
  growthRateX = 6;
  growthRateY = 3;
  fadeRate = 0.07;

  constructor(shockwave: ShockWave, x: number, y: number) {
    this.game = shockwave.game;
    this.shockwave = shockwave;
    this.x = x;
    this.y = y;
  }

  draw(ctx: CTX) {
    if (this.alpha > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }

  update() {
    this.radiusX += this.growthRateX;
    this.radiusY += this.growthRateY;
    this.alpha -= this.fadeRate;
  }
}
