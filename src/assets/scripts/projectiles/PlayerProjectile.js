import { Action } from '../InputHandler.js';

export class PlayerProjectile {
  width = 5;
  height = 5;
  speed = 500;
  damage = 10;
  traveledDistance = 0;
  maxDistance = 800;
  markedForDeletion = false;

  constructor(game, angle) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.angle = angle;
    this.x = this.game.player.x + Math.cos(this.game.player.rotation + angle) * (this.game.player.width * 0.5);
    this.y = this.game.player.y + Math.sin(this.game.player.rotation + angle) * (this.game.player.height * 0.5);
    this.directionX = Math.cos(this.game.player.rotation + angle);
    this.directionY = Math.sin(this.game.player.rotation + angle);
  }

  draw(ctx) {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime) {
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

  checkCollisions() {
    // Collision with enemies
    this.game.enemies.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)) {
        this.game.playCollision();
        enemy.takeDamage(this.damage);
        if (enemy.markedForDeletion) this.game.addScore(enemy.score);
        this.markedForDeletion = true;
      }
    });

    // Collision with boss
    if (this.game.boss) {
      if (this.game.checkCollision(this, this.game.boss)) {
        this.game.playCollision();
        this.game.boss.takeDamage(this.damage);
        this.markedForDeletion = true;
      }
    }
  }
}

export class ChargedProjectile extends PlayerProjectile {
  partialDamage = 50;
  fullDamage = 150;
  splitDistance = 300;

  constructor(game, angle) {
    super(game, angle);
    this.isFull = this.game.inputs.actions[Action.FIRE].heldDuration >= 2000;
    this.damage = this.isFull ? this.fullDamage : this.partialDamage;
    this.speed = this.isFull ? 300 : 400;
    this.width = this.isFull ? 30 : 20;
    this.height = this.isFull ? 30 : 20;
  }

  update(deltaTime) {
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
  damage = 25;
  width = 5;
  height = 5;
  speed = 500;

  constructor(source, angle) {
    super(source.game, angle);
    this.source = source;
    this.x = this.source.x;
    this.y = this.source.y;
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
  }
}
