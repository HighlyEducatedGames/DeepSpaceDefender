import { Action } from '../InputHandler';
import { FriendlyProjectile, Projectile } from '../GameObject';

export class PlayerProjectile extends FriendlyProjectile {
  x: number;
  y: number;
  width = 5;
  height = 5;
  damage = 10;
  speed = 500;
  radius = this.width * 0.5;
  angle: number;
  directionX: number;
  directionY: number;
  traveledDistance = 0;
  maxDistance = 800;

  constructor(game: Game, angle: number) {
    super(game);
    this.angle = angle;
    this.x = this.game.player.x + Math.cos(this.game.player.rotation + angle) * (this.game.player.width * 0.5);
    this.y = this.game.player.y + Math.sin(this.game.player.rotation + angle) * (this.game.player.height * 0.5);
    this.directionX = Math.cos(this.game.player.rotation + angle);
    this.directionY = Math.sin(this.game.player.rotation + angle);
  }

  draw(ctx: CTX) {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime: number) {
    this.x += (this.speed * this.directionX * deltaTime) / 1000;
    this.y += (this.speed * this.directionY * deltaTime) / 1000;
    this.traveledDistance += (this.speed * deltaTime) / 1000;

    if (this.traveledDistance > this.maxDistance) {
      this.markedForDeletion = true;
      return;
    }

    // Screen wrap
    if (this.x < 0) this.x = this.game.width;
    if (this.x > this.game.width) this.x = 0;
    if (this.y < 0) this.y = this.game.height;
    if (this.y > this.game.height) this.y = 0;
  }
}

export class ChargedProjectile extends PlayerProjectile {
  isFull: boolean;
  partialDamage = 50;
  fullDamage = 150;
  splitDistance = 300;

  constructor(game: Game, angle: number) {
    super(game, angle);
    this.isFull = this.game.inputs.actions[Action.FIRE].heldDuration >= 2000;
    this.damage = this.isFull ? this.fullDamage : this.partialDamage;
    this.speed = this.isFull ? 300 : 400;
    this.width = this.isFull ? 30 : 20;
    this.height = this.isFull ? 30 : 20;
  }

  update(deltaTime: number) {
    super.update(deltaTime);
    if (this.isFull && this.traveledDistance >= this.splitDistance) {
      this.splitChargedProjectile();
      this.markedForDeletion = true;
    }
  }

  splitChargedProjectile() {
    const numberOfProjectiles = 8;
    const angleIncrement = (Math.PI * 2) / numberOfProjectiles;

    for (let i = 0; i < numberOfProjectiles; i++) {
      const angle = i * angleIncrement;
      this.game.projectiles.push(new SplitChargedProjectile(this, angle));
    }
  }
}

class SplitChargedProjectile extends PlayerProjectile {
  source: Projectile;
  damage = 25;
  width = 5;
  height = 5;
  speed = 500;

  constructor(source: Projectile, angle: number) {
    super(source.game, angle);
    this.source = source;
    this.x = this.source.x;
    this.y = this.source.y;
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
  }
}
