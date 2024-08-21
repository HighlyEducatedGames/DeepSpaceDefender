import { getRandomInterval } from '../utilities.js';
import { BehaviorTree, SequenceNode, SelectorNode, ActionNode } from './BehaviorTree.js';

class Enemy {
  constructor(game) {
    /** @type {import('../Game.js').default} */
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
    this.margin = 50;
    this.markedForDeletion = false;
    this.image = null;
    this.behaviorTree = this.createBehaviorTree();
  }

  createBehaviorTree() {
    return new BehaviorTree(
      new SelectorNode([
        new SequenceNode([
          new ActionNode(this.patrol.bind(this)),
          new ActionNode(this.checkPlayerDistance.bind(this)),
          new ActionNode(this.attackPlayer.bind(this)),
        ]),
        new ActionNode(this.retreat.bind(this)),
      ]),
    );
  }

  patrol(enemy, ticks) {
    if (!this.patrolTarget) {
      this.patrolTarget = this.getNewPatrolPoint();
    }

    const distanceToTarget = Math.hypot(this.patrolTarget.x - this.x, this.patrolTarget.y - this.y);

    // Move towards the patrol target
    if (distanceToTarget > 5) {
      const angleToTarget = Math.atan2(this.patrolTarget.y - this.y, this.patrolTarget.x - this.x);
      this.vx = Math.cos(angleToTarget);
      this.vy = Math.sin(angleToTarget);
      this.x += (this.speed * this.vx * ticks) / 1000;
      this.y += (this.speed * this.vy * ticks) / 1000;
    } else {
      this.patrolTarget = this.getNewPatrolPoint();
    }

    // Return true to keep patrolling
    return true;
  }

  getNewPatrolPoint() {
    const patrolAreaWidth = this.game.width * 0.6;
    const patrolAreaHeight = this.game.height * 0.6;
    const patrolX = Math.random() * patrolAreaWidth + (this.game.width - patrolAreaWidth) / 2;
    const patrolY = Math.random() * patrolAreaHeight + (this.game.height - patrolAreaHeight) / 2;
    return { x: patrolX, y: patrolY };
  }

  checkPlayerDistance(enemy) {
    const distance = Math.hypot(this.x - this.game.player.x, this.y - this.game.player.y);

    // Example: if the enemy is a stealth type, they might have a smaller detection range
    const detectionRange = this instanceof StealthEnemy ? 150 : 200;

    // Only attack if within detection range
    return distance < detectionRange;
  }

  attackPlayer(enemy, ticks) {
    // Predict player's position based on their velocity
    const playerFutureX = this.game.player.x + this.game.player.vx * 0.5;
    const playerFutureY = this.game.player.y + this.game.player.vy * 0.5;
    const angleToPlayer = Math.atan2(playerFutureY - this.y, playerFutureX - this.x);

    const cooldown = 700; // Cooldown period in milliseconds

    if (this.canShoot && this.game.timestamp - this.lastAttackTime >= cooldown) {
      this.fireProjectile(angleToPlayer);
      this.lastAttackTime = this.game.timestamp;
      return true;
    }
    return false;
  }

  fireProjectile(angle) {
    this.game.projectiles.push(new EnemyProjectile(this.game, this.x, this.y, angle));
  }

  retreat(enemy, ticks) {
    if (!this.retreatTarget) {
      this.retreatTarget = this.getRetreatPoint();
    }

    const distanceToTarget = Math.hypot(this.retreatTarget.x - this.x, this.retreatTarget.y - this.y);

    if (distanceToTarget > 5) {
      const angleToTarget = Math.atan2(this.retreatTarget.y - this.y, this.retreatTarget.x - this.x);

      // Calculate acceleration towards the target
      const acceleration = 0.1; // Increase this value to accelerate faster
      this.vx += Math.cos(angleToTarget) * acceleration;
      this.vy += Math.sin(angleToTarget) * acceleration;

      // Cap the speed at a maximum retreat speed
      const maxRetreatSpeed = this.speed * 2; // Increase this multiplier to allow faster retreat
      const currentSpeed = Math.hypot(this.vx, this.vy);

      if (currentSpeed > maxRetreatSpeed) {
        // Normalize velocity and apply max speed
        this.vx = (this.vx / currentSpeed) * maxRetreatSpeed;
        this.vy = (this.vy / currentSpeed) * maxRetreatSpeed;
      }

      // Update position
      this.x += (this.vx * ticks) / 1000;
      this.y += (this.vy * ticks) / 1000;
    } else {
      // Recalculate the retreat target if the entity reaches the target point
      this.retreatTarget = this.getRetreatPoint();
    }

    return true;
  }

  getRetreatPoint() {
    // Move towards the edge of the screen furthest from the player
    const furthestX = this.x < this.game.width / 2 ? this.game.width : 0;
    const furthestY = this.y < this.game.height / 2 ? this.game.height : 0;
    return { x: furthestX, y: furthestY };
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

    // Update the behavior tree
    this.behaviorTree.tick(this, deltaTime);
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
    this.y = this.game.getRandomY(this.margin);
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
      this.game.playCollision();
      this.game.player.takeDamage(this.damage);
      this.markedForDeletion = true;
    }

    // Collision to player bomb
    if (this.game.player.bomb && this.game.checkCollision(this, this.game.player.bomb)) {
      this.markedForDeletion = true;
    }
  }
}
