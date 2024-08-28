import Explosion from '../effects/Explosion.js';
import { FriendlyProjectile, Particle, Projectile } from '../GameObject';

export default class Flame {
  game: Game;
  active = false;
  particlesPerTick = 1;
  sound: HTMLAudioElement;

  constructor(game: Game) {
    this.game = game;
    this.sound = this.game.getAudio('flame_sound');
  }

  update() {
    if (this.active) {
      if (this.sound.paused) {
        this.sound.loop = true;
        this.sound.play().catch(() => {});
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
      this.game.projectiles.push(new FlameParticle(this.game));
    }
  }
}

class FlameParticle extends FriendlyProjectile {
  x: number;
  y: number;
  radius = Math.random() * 20 + 10;
  width = this.radius * 2;
  height = this.radius * 2;
  damage = 1;
  speed = 0;
  color = `rgba(${255}, ${Math.random() * 150}, 0, 1)`;
  alpha = 1;
  tickingDamage = 1;
  velocity: { x: number; y: number };

  constructor(game: Game) {
    super(game);
    this.x = this.game.player.x + Math.cos(this.game.player.rotation) * this.game.player.width * 0.5;
    this.y = this.game.player.y + Math.sin(this.game.player.rotation) * this.game.player.height * 0.5;
    this.velocity = {
      x: Math.cos(this.game.player.rotation) * 10 + (Math.random() - 0.5) * 2,
      y: Math.sin(this.game.player.rotation) * 10 + (Math.random() - 0.5) * 2,
    };
  }

  draw(ctx: CTX) {
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
}
