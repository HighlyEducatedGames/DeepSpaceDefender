import { BossCreature, EnemyProjectile } from '../GameObject';
import BossExplosion from '../effects/BossExplosion';

export default class Boss extends BossCreature {
  x: number;
  y: number;
  radius = 50;
  playerCollisionRadius = this.radius;
  width = 100;
  height = 100;
  speed = 50;
  maxHealth = 1000;
  health = this.maxHealth;
  points = this.maxHealth;
  image = this.game.getImage('boss_image');
  music = this.game.getAudio('boss_music');
  damage = 10;
  attackInterval = 2000;
  attackTimer = this.attackInterval;
  canAttack = false;
  phase = 1;
  healthBarWidth = this.width;
  healthBarHeight = 10;
  healthBarX: number;
  healthBarY: number;

  constructor(game: Game) {
    super(game);

    const { x, y } = this.game.getOffScreenRandomSide(this, 20);
    this.x = x;
    this.y = y;
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y + this.height * 0.5 + 5;

    setTimeout(() => {
      this.canAttack = true;
    }, 5000);
  }

  draw(ctx: CTX) {
    // Boss image
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);

    // Health Bar
    const healthRatio = this.health / this.maxHealth;
    ctx.fillStyle = 'rgba(187,27,27,0.85)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * healthRatio, this.healthBarHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime: number) {
    super.update(deltaTime);

    // Movement
    const angleToPlayer = this.game.player.getAngleToPlayer(this);
    this.vx = Math.cos(angleToPlayer);
    this.vy = Math.sin(angleToPlayer);
    this.x += (this.vx * this.speed * deltaTime) / 1000;
    this.y += (this.vy * this.speed * deltaTime) / 1000;

    // Health bar follows boss
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y - this.height * 0.5 + this.height + 5;

    // Phase Transitions
    if (this.phase === 1 && this.health < this.maxHealth * 0.6) {
      this.phase = 2;
      this.speed = 70;
    } else if (this.phase === 2 && this.health < this.maxHealth * 0.2) {
      this.phase = 3;
      this.attackInterval = 1000;
    }

    // Attack Logic
    this.attackTimer += deltaTime;
    if (this.canAttack && this.attackTimer >= this.attackInterval) {
      this.attackTimer = 0;
      switch (this.phase) {
        case 1:
          this.attackPattern1();
          break;
        case 2:
          this.attackPattern2();
          break;
        case 3:
          this.attackPattern3();
          break;
      }
    }
  }

  // Single projectile attack
  attackPattern1() {
    const options: BossProjectileOptions = {
      radius: 20,
      angle: this.game.player.getAngleToPlayer(this),
      speed: 250,
    };
    this.game.projectiles.push(new BossProjectile(this, options));
  }

  // Spread shot attack - 5x @ 30 deg
  attackPattern2() {
    for (let i = -2; i <= 2; i++) {
      let angle = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x) + (i * Math.PI) / 12;
      const options: BossProjectileOptions = {
        radius: 25,
        angle: angle,
        speed: 275,
      };
      this.game.projectiles.push(new BossProjectile(this, options));
    }
  }

  // 360 attack - 10x @ 36deg
  attackPattern3() {
    const numberOfProjectiles = 10;
    const angleIncrement = (2 * Math.PI) / numberOfProjectiles;
    // Get the player angle so one projectile is pointed directly at the player
    const angleToPlayer = this.game.player.getAngleToPlayer(this);
    for (let i = 0; i < numberOfProjectiles; i++) {
      let angle = i * angleIncrement + angleToPlayer;
      const options: BossProjectileOptions = {
        radius: 20,
        angle: angle,
        speed: 350,
      };
      this.game.projectiles.push(new BossProjectile(this, options));
    }
  }

  cleanup() {}

  onPlayerCollision() {}

  onDeath() {
    this.game.effects.push(new BossExplosion(this.game, this.x, this.y));
    this.game.projectiles.forEach((projectile) => {
      if (projectile instanceof BossProjectile) projectile.markedForDeletion = true;
    });
  }
}

interface BossProjectileOptions {
  radius: number;
  angle: number;
  speed: number;
}

class BossProjectile extends EnemyProjectile {
  boss: Boss;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  speed: number;
  damage = 10;
  image = this.game.getImage('boss_projectile_sprite_sheet');
  spriteWidth = 30;
  spriteHeight = 30;
  maxFrames = 8;
  staggerFrames = 5;

  constructor(boss: Boss, { radius, speed, angle }: BossProjectileOptions) {
    super(boss.game);
    this.boss = boss;
    this.x = this.boss.x;
    this.y = this.boss.y;
    this.radius = radius;
    this.width = this.radius * 2;
    this.height = this.radius * 2;
    this.speed = speed;
    this.vx = Math.cos(angle);
    this.vy = Math.sin(angle);
  }

  draw(ctx: CTX) {
    const frameX = Math.floor(this.game.frame / this.staggerFrames) % (this.maxFrames - 1);
    ctx.drawImage(
      this.image,
      frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x - this.radius,
      this.y - this.radius,
      this.radius * 2,
      this.radius * 2,
    );

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime: number) {
    // Movement
    this.x += (this.vx * this.speed * deltaTime) / 1000;
    this.y += (this.vy * this.speed * deltaTime) / 1000;

    // Remove if projectile outside the canvas boundaries
    if (this.game.outOfBounds(this)) this.markedForDeletion = true;
  }
}
