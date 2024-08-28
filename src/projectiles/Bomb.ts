import { EnemyProjectile, FriendlyProjectile } from '../GameObject';

export default class Bomb extends FriendlyProjectile {
  x: number;
  y: number;
  width = 0;
  height = 0;
  radius = 300;
  damage = 150;
  speed = 0;
  timer = 0;
  duration = 1000;
  flashTimer = 0;
  flashPeriod = 200;
  flashDuration = 100;
  hitBoss = false;
  sound = this.game.getAudio('bomb_sound');

  constructor(game: Game) {
    super(game);
    this.x = this.game.player.x;
    this.y = this.game.player.y;

    // Play bomb sound as soon as it is spawned
    this.sound.play().catch(() => {});
  }

  draw(ctx: CTX) {
    if (this.flashTimer < this.flashDuration) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime: number) {
    if (this.timer >= this.duration) {
      this.timer = 0;
      this.markedForDeletion = true;
    } else {
      this.timer += deltaTime;
    }

    // Flash timer
    if (this.flashTimer >= this.flashPeriod) {
      this.flashTimer = 0;
    } else {
      this.flashTimer += deltaTime;
    }

    // Follow the player
    this.x = this.game.player.x;
    this.y = this.game.player.y;
  }

  checkCollisions() {
    // Check collision to all enemies
    this.game.enemies.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)) {
        enemy.takeDamage(this.damage);
      }
    });

    // Check collision to boss
    if (this.game.boss && !this.hitBoss) {
      if (this.game.checkCollision(this, this.game.boss)) {
        this.game.boss.takeDamage(this.damage);
        this.hitBoss = true;
      }
    }
  }
}
