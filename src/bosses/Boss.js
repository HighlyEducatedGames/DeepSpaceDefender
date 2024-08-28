import Explosion from '../effects/Explosion.js';
import BossExplosion from '../effects/BossExplosion.js';

export default class Boss {
  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 100;
    this.height = 100;
    this.speed = 50;
    this.maxHealth = 1000;
    this.health = this.maxHealth;
    this.score = 1000;
    this.lastAttackTime = Date.now();
    this.shootInterval = 2000;
    this.canShoot = false;
    this.phase = 1;
    this.phaseTransitioned = [false, false, false];
    this.healthBarWidth = this.width;
    this.healthBarHeight = 10;
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y - this.height * 0.5 + this.height + 5;
    this.markedForDeletion = false;
    this.image = document.getElementById('boss_image');
    this.music = document.getElementById('boss_music');

    const { x, y } = this.game.getOffScreenRandomSide(this, 20);
    this.x = x;
    this.y = y;

    setTimeout(() => {
      this.canShoot = true;
    }, 5000);
  }

  draw(ctx) {
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
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime) {
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
      this.shootInterval = 1000;
    }

    // Attack Logic
    if (this.canShoot && Date.now() - this.lastAttackTime > this.shootInterval) {
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
      this.lastAttackTime = Date.now();
    }
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.game.addScore(this.score);
      this.game.effects.push(new BossExplosion(this.game, this.x, this.y));
      this.markedForDeletion = true;
      this.game.nextLevel();
    }
  }

  // Single projectile attack
  attackPattern1() {
    this.game.projectiles.push(new BossProjectile(this, 20, this.game.player.getAngleToPlayer(this), 250));
  }

  // Spread shot attack
  attackPattern2() {
    for (let i = -2; i <= 2; i++) {
      let angle = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x) + (i * Math.PI) / 12;
      this.game.projectiles.push(new BossProjectile(this, 25, angle, 275));
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
      this.game.projectiles.push(new BossProjectile(this, 20, angle, 350));
    }
  }
}

class BossProjectile {
  constructor(boss, radius, angle, speed) {
    this.boss = boss;
    /** @type {import('../Game.js').default} */
    this.game = this.boss.game;
    this.x = this.boss.x;
    this.y = this.boss.y;
    this.radius = radius;
    this.speed = speed;
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
    this.damage = 10;
    this.markedForDeletion = false;
    this.image = document.getElementById('boss_projectile_sprite_sheet');
    this.spriteWidth = 30;
    this.spriteHeight = 30;
    this.maxFrames = 8;
    this.staggerFrames = 5;
  }

  draw(ctx) {
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

  update(deltaTime) {
    // Movement
    this.x += (this.speed * this.directionX * deltaTime) / 1000;
    this.y += (this.speed * this.directionY * deltaTime) / 1000;

    // Remove if projectile outside the canvas boundaries
    if (this.game.outOfBounds(this)) {
      this.markedForDeletion = true;
    }

    // Collides with player
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.takeDamage(this.damage);
      this.markedForDeletion = true;
    }

    // Collision to other projectiles
    this.game.projectiles.forEach((projectile) => {
      if (projectile === this) return;
      if (this.game.checkCollision(this, projectile)) {
        this.markedForDeletion = true;
        projectile.markedForDeletion = true;
      }
    });
  }
}
