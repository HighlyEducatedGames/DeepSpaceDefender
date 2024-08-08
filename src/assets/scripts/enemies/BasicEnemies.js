import { getRandomYwithMargin } from '../utilities.js';

class Enemy {
  constructor(game) {
    this.game = game;
    this.margin = 50;
    this.side = Math.random() < 0.5 ? 'left' : 'right';
    this.width = 50;
    this.height = 50;
    this.x = this.side === 'left' ? -this.width * 0.5 : this.game.canvas.width + this.width * 0.5;
    this.y = getRandomYwithMargin(this.game, this.margin);
    this.speedMultiplier = this.game.level - 1 * 0.05;
    this.speed = 1.5 * this.speedMultiplier;
    this.vx = this.side === 'left' ? 1 : -1;
    this.canShoot = false;
    this.lastAttackTime = 0;
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.damage = 10;
    this.score = 10;
    this.projectiles = [];
    this.markedForDeletion = false;

    this.image = new Image();
    this.image.src = 'assets/images/enemy.png';

    this.getSpawnPosition();

    setTimeout(() => {
      this.canShoot = true;
    }, 2000);
  }

  draw(ctx) {
    // Enemy
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);

    // Projectiles
    this.projectiles.forEach((projectile) => projectile.draw(ctx));

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
    this.x += this.speed * this.vx;

    // Bounce back and forth on the x-axis
    if (this.x < this.width * 0.5 && this.vx < 0) this.vx = 1;
    if (this.x > this.game.canvas.width - this.width * 0.5 && this.vx > 0) this.vx = -1;

    // Projectiles
    this.projectiles.forEach((projectile) => projectile.update(deltaTime));
    this.projectiles = this.projectiles.filter((projectile) => !projectile.markedForDeletion);

    // TODO - Fire so

    this.checkCollisions();
  }

  getSpawnPosition() {
    this.x = this.side === 'left' ? -this.width * 0.5 : this.game.canvas.width + this.width * 0.5;
    this.y = getRandomYwithMargin(this.game, this.margin);
  }

  checkCollisions() {
    // Enemy collision with player projectiles
    this.game.player.projectiles.forEach((projectile) => {
      if (this.game.checkCollision(projectile, this)) {
        this.health -= projectile.damage;
        if (this.health <= 0) this.markedForDeletion = true;
        projectile.markedForDeletion = true;
      }
    });

    // Enemy collision with player
    if (this.game.checkCollision(this.game.player, this)) {
      // Only take damage from a stealth enemy if visible
      if (!(this instanceof StealthEnemy) || (this instanceof StealthEnemy && this.visible)) {
        this.game.player.takeDamage(this.damage);
        this.game.playCollision();
      }
    }
  }

  fire() {
    this.projectiles.push(new EnemyProjectile(this.game, this.x, this.y));
    this.lastAttackTime = this.game.timestamp;
  }
}

export class RegularEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.shootInterval = Math.random() * 2000 + 3000;
    this.respawnTime = 7000;
  }
}

export class TankEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.health = 30;
    this.speed = 0.6;
    this.width = 60;
    this.height = 60;
    this.shootInterval = Math.random() * 1000 + 2000;
    this.respawnTime = 5000;

    this.image = new Image();
    this.image.src = 'assets/images/enemy_tank.png';
  }
}

export class StealthEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.health = 20;
    this.visible = false;
    this.visibleStartTime = performance.now();
    this.opacity = 0;
    this.visibleDuration = 3000;
    this.invisibleDuration = 3000;
    this.shootInterval = Math.random() * 1000 + 1000;
    this.respawnTime = 7000;

    this.image = new Image();
    this.image.src = 'assets/images/stealth_enemy.png';
  }

  draw(ctx) {
    if (this.opacity > 0.2) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);
      ctx.restore();
    } else {
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update() {
    super.update();
    const currentTime = this.game.timestamp;
    const elapsedTime = currentTime - this.visibleStartTime;

    if (this.visible) {
      if (elapsedTime < 1000) {
        this.opacity = elapsedTime / 1000;
      } else if (elapsedTime < this.visibleDuration) {
        this.opacity = 1;
      } else if (elapsedTime >= this.visibleDuration) {
        this.visible = false;
        this.visibleStartTime = currentTime;
        this.opacity = 1;
      }
    } else {
      if (elapsedTime < 1000) {
        this.opacity = 1 - elapsedTime / 1000;
      } else if (elapsedTime < this.invisibleDuration) {
        this.opacity = 0;
      } else if (elapsedTime >= this.invisibleDuration) {
        this.visible = true;
        this.visibleStartTime = currentTime;
        this.opacity = 0;
      }
    }
  }
}

class EnemyProjectile {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 5;
    this.speed = 500;
    this.vx = 0;
    this.vy = 0;
  }

  draw(ctx) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime) {
    this.x += (this.speed * this.vx * deltaTime) / 1000;
    this.y += (this.speed * this.vy * deltaTime) / 1000;
    this.traveledDistance += (this.speed * deltaTime) / 1000;
    if (this.game.outOfBounds(this)) this.markedForDeletion = true;
  }
}
