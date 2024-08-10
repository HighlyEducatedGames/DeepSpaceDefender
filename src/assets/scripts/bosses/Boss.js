import { getOffScreenRandomSide } from '../utilities.js';
import Explosion from '../effects/Explosion.js';

export default class Boss {
  constructor(game) {
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
    this.projectiles = [];

    this.healthBarWidth = this.width;
    this.healthBarHeight = 10;
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y - this.height * 0.5 + this.height + 5;

    this.markedForDeletion = false;

    this.image = new Image();
    this.image.src = 'assets/images/boss.png';
    this.music = new Audio('assets/audio/boss_music.mp3');

    getOffScreenRandomSide(this, 20);

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

    this.checkCollisions();
  }

  checkCollisions() {
    // Check player projectiles to boss
    this.game.player.projectiles.forEach((projectile) => {
      if (this.game.checkCollision(projectile, this)) {
        this.takeDamage(projectile.damage);
        projectile.markedForDeletion = true;
      }
    });

    // Check boss projectiles to player
    this.projectiles.forEach((projectile) => {
      if (this.game.checkCollision(projectile, this.game.player)) {
        this.game.player.takeDamage(projectile.damage);
        projectile.markedForDeletion = true;
      }
    });

    // Check player projectiles to boss projectiles
    this.projectiles.forEach((bossProjectile) => {
      this.game.player.projectiles.forEach((playerProjectile) => {
        if (this.game.checkCollision(bossProjectile, playerProjectile)) {
          bossProjectile.markedForDeletion = true;
          playerProjectile.markedForDeletion = true;
          // TODO make larger, charged projectiles, pass through enemy projectiles
        }
      });
    });

    // Check boss to player
    if (this.game.checkCollision(this, this.game.player)) {
      // TODO what to do on collision
    }
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.game.player.addScore(this.score);
      this.game.effects.push(new Explosion(this.game, this.x, this.y));
      this.markedForDeletion = true;
      this.game.nextLevel();
    }
  }

  // Single projectile attack
  attackPattern1() {
    this.projectiles.push(new BossProjectile(this, 20, this.game.player.getAngleToPlayer(this), 250));
  }

  // Spread shot attack
  attackPattern2() {
    for (let i = -2; i <= 2; i++) {
      let angle = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x) + (i * Math.PI) / 12;
      this.projectiles.push(new BossProjectile(this, 25, angle, 275));
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
      this.projectiles.push(new BossProjectile(this, 20, angle, 350));
    }
  }
}

class BossProjectile {
  constructor(boss, radius, angle, speed) {
    this.boss = boss;
    this.game = this.boss.game;
    this.x = this.boss.x;
    this.y = this.boss.y;
    this.radius = radius;
    this.speed = speed;
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
    this.damage = 10;
    this.markedForDeletion = false;

    this.image = new Image();
    this.image.src = 'assets/images/boss_projectile.png';
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);

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
  }
}
