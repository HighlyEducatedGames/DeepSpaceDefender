import { BossCreature, EnemyProjectile } from '../GameObject';
import BossExplosion from '../effects/BossExplosion';

export default class Boss extends BossCreature {
  x: number;
  y: number;
  width = 100;
  height = 100;
  radius = this.width * 0.5;
  speed = 50;
  maxHealth = 1000;
  health = this.maxHealth;
  points = this.maxHealth;
  image: HTMLImageElement;
  music: HTMLAudioElement;
  attackTimer = 0;
  attackInterval = 2000;
  canShoot = false;
  phase = 1;
  phaseTransitioned = [false, false, false];
  healthBarWidth = this.width;
  healthBarHeight = 10;
  healthBarX: number;
  healthBarY: number;

  constructor(game: Game) {
    super(game);
    this.image = this.game.getImage('boss_image');
    this.music = this.game.getAudio('boss_music');

    const { x, y } = this.game.getOffScreenRandomSide(this, 20);
    this.x = x;
    this.y = y;
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y - this.height * 0.5 + this.height + 5;

    setTimeout(() => {
      this.canShoot = true;
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
    // Movement
    const distanceToPlayer = this.game.player.getDistanceToPlayer(this);
    // Snap to player if close to avoid bouncing
    const snapThreshold = 2; // Increase this if bouncing continues
    if (distanceToPlayer < snapThreshold) {
      this.x = this.game.player.x;
      this.y = this.game.player.y;
    } else {
      // Move toward player
      const angleToPlayer = this.game.player.getAngleToPlayer(this);
      this.x += (Math.cos(angleToPlayer) * (this.speed * deltaTime)) / 1000;
      this.y += (Math.sin(angleToPlayer) * (this.speed * deltaTime)) / 1000;
    }

    // Health bar follows boss
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y - this.height * 0.5 + this.height + 5;

    // Phase Transitions
    if (this.health < this.maxHealth * 0.6 && this.phase === 1 && !this.phaseTransitioned[1]) {
      this.phase = 2;
      this.phaseTransitioned[1] = true;
      this.speed += 20;
    } else if (this.health < this.maxHealth * 0.2 && this.phase === 2 && !this.phaseTransitioned[2]) {
      this.phase = 3;
      this.phaseTransitioned[2] = true;
      this.attackInterval = 1000;
    }

    // Attack Logic
    this.attackTimer += deltaTime;
    if (this.canShoot && this.attackTimer >= this.attackInterval) {
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

  // Spread shot attack
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

  // 360 attack
  attackPattern3() {
    const numberOfProjectiles = 10;
    const angleIncrement = (2 * Math.PI) / numberOfProjectiles;
    // Get the player angle so the first projectile is pointed at player
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

  // Play effects on death
  onDeath() {
    this.game.effects.push(new BossExplosion(this.game, this.x, this.y));
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
  directionX: number;
  directionY: number;
  image: HTMLImageElement;
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
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
    this.image = this.game.getImage('boss_projectile_sprite_sheet');
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
    this.x += (this.speed * this.directionX * deltaTime) / 1000;
    this.y += (this.speed * this.directionY * deltaTime) / 1000;

    // Remove if projectile outside the canvas boundaries
    if (this.game.outOfBounds(this)) {
      this.markedForDeletion = true;
    }
  }
}
