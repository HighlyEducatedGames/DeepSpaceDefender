import { getRandomYwithMargin, getRandomInterval } from '../utilities.js';

class Enemy {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
    this.speed = null;
    this.attackInterval = null;
    this.damage = null;
    this.score = null;
    this.side = Math.random() < 0.5 ? 'left' : 'right';
    this.offScreenMargin = 100;
    this.vx = this.side === 'left' ? 1 : -1;
    this.canShoot = true;
    this.lastAttackTime = 0;
    this.maxHealth = null;
    this.health = this.maxHealth;
    this.verticalMargin = 50;
    this.markedForDeletion = false;
    this.image = null;
  }

  draw(ctx) {
    // Enemy
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);

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
    this.x += (this.speed * this.vx * deltaTime) / 1000;

    // Bounce back and forth on the x-axis
    if (this.x < this.width * 0.5 && this.vx < 0) this.vx = 1;
    if (this.x > this.game.width - this.width * 0.5 && this.vx > 0) this.vx = -1;

    // Attack Logic
    if (this.canShoot && this.game.timestamp - this.lastAttackTime >= this.attackInterval) {
      this.fireProjectile();
    }

    this.checkCollisions();

    // Arrow Indicator Logic
    const offscreen = this.x < 0 || this.x > this.game.canvas.width || this.y < 0 || this.y > this.game.canvas.height;
    if (offscreen && !this.arrowAdded) {
      this.game.addArrowIndicator(this);
      this.arrowAdded = true; // Prevent adding multiple arrows
    }
  }

  getSpawnPosition() {
    this.x =
      this.side === 'left'
        ? -this.width * 0.5 - this.offScreenMargin
        : this.game.width + this.width * 0.5 + this.offScreenMargin;
    this.y = getRandomYwithMargin(this.game, this.verticalMargin);
  }

  checkCollisions() {
    // Enemy collision with player
    if (this.game.checkCollision(this, this.game.player)) {
      // Only take damage from a stealth enemy if visible
      if (!(this instanceof StealthEnemy) || (this instanceof StealthEnemy && this.visible)) {
        this.game.player.takeDamage(this.damage);
        this.game.playCollision();
        this.markedForDeletion = true;
      }
    }
  }

  fireProjectile() {
    const angleToPlayer = this.game.player.getAngleToPlayer(this);
    this.game.projectiles.push(new EnemyProjectile(this.game, this.x, this.y, angleToPlayer));
    this.lastAttackTime = this.game.timestamp;
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) this.markedForDeletion = true;
  }
}

export class RegularEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.width = 50;
    this.height = 50;
    this.speed = 60;
    this.maxHealth = 10;
    this.damage = 10;
    this.score = this.maxHealth;
    this.attackInterval = getRandomInterval(3000, 5000);
    this.image = document.getElementById('enemy_image');

    super.getSpawnPosition();
  }
}

export class TankEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.width = 60;
    this.height = 60;
    this.speed = 40;
    this.maxHealth = 30;
    this.damage = 10;
    this.score = this.maxHealth;
    this.attackInterval = getRandomInterval(2000, 3000);
    this.image = document.getElementById('tank_enemy_image');

    super.getSpawnPosition();
  }
}

export class StealthEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.width = 50;
    this.height = 50;
    this.speed = 60;
    this.maxHealth = 20;
    this.damage = 10;
    this.score = this.maxHealth;
    this.attackInterval = getRandomInterval(1000, 2000);
    this.image = document.getElementById('stealth_enemy_image');

    // Stealth only properties
    this.visible = false;
    this.visibleStartTime = this.game.timestamp;
    this.opacity = 0;
    this.visibleDuration = 3000;
    this.invisibleDuration = 3000;

    super.getSpawnPosition();
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

  update(deltaTime) {
    super.update(deltaTime);
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
  constructor(game, x, y, angle) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 5;
    this.speed = 250;
    this.damage = 10;
    this.vx = Math.cos(angle);
    this.vy = Math.sin(angle);
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

    this.checkCollisions();
    if (this.game.outOfBounds(this)) this.markedForDeletion = true;
  }

  checkCollisions() {
    // Collision to player
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.takeDamage(this.damage);
      this.markedForDeletion = true;
    }

    // Collision to player bomb
    if (this.game.player.bomb && this.game.checkCollision(this, this.game.player.bomb)) {
      this.markedForDeletion = true;
    }
  }
}
