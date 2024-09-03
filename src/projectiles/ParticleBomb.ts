import { FriendlyProjectile } from '../GameObject';

export default class ParticleBomb {
  game: Game;
  numParticles = 20;
  sound: HTMLAudioElement;

  constructor(game: Game) {
    this.game = game;
    this.sound = this.game.getAudio('particle_bomb_sound');
  }

  fire() {
    this.createProjectiles();
    this.game.cloneSound(this.sound);
  }

  createProjectiles() {
    for (let i = 0; i < this.numParticles; i++) {
      const angle = (i / this.numParticles) * Math.PI * 2;
      const projectile = new ParticleBombParticle(this.game, angle);
      this.game.projectiles.push(projectile);
    }
  }
}

class ParticleBombParticle extends FriendlyProjectile {
  angle: number;
  x = this.game.player.x;
  y = this.game.player.y;
  width = 0;
  height = 0;
  radius = 5;
  speed = 500;
  alpha = 1;
  fadeRate = 0.02;
  damage = 10;

  constructor(game: Game, angle: number) {
    super(game);
    this.angle = angle;
    this.vx = Math.cos(angle);
    this.vy = Math.sin(angle);
  }

  draw(ctx: CTX) {
    ctx.fillStyle = `rgba(255, 165, 0, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime: number) {
    this.x += (this.vx * this.speed * deltaTime) / 1000;
    this.y += (this.vy * this.speed * deltaTime) / 1000;
    this.alpha -= this.fadeRate;
    if (this.alpha <= 0) this.markedForDeletion = true;
  }
}
