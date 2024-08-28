import { BehaviorTree, SequenceNode, SelectorNode, ActionNode } from './BehaviorTree.js';

class Enemy {
  x = null;
  y = null;
  width = null;
  height = null;
  speed = null;
  attackTimer = 0;
  attackInterval = null;
  damage = null;
  score = null;
  side = Math.random() < 0.5 ? 'left' : 'right';
  offScreenMargin = 100;
  vx = this.side === 'left' ? 1 : -1;
  canShoot = true;
  maxHealth = null;
  health = this.maxHealth;
  margin = 50;
  markedForDeletion = false;
  image = null;
  behaviorTree = this.createBehaviorTree();
  arrowAdded = false;

  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
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

  checkPlayerDistance() {
    const distance = Math.hypot(this.x - this.game.player.x, this.y - this.game.player.y);

    // Example: if the enemy is a stealth type, they might have a smaller detection range
    const detectionRange = this instanceof StealthEnemy ? 150 : 200;

    // Only attack if within detection range
    return distance < detectionRange;
  }

  attackPlayer() {
    if (this.canShoot && this.attackTimer >= this.attackInterval) {
      this.attackTimer = 0;
      this.fireProjectile();
      return true;
    }
    return false;
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

    // Acrue deltaTime for attacks
    this.attackTimer += deltaTime;

    // Update the behavior tree
    this.behaviorTree.tick(this, deltaTime);

    // Arrow Indicator Logic
    const offscreen = this.game.outOfBounds(this);
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
    // Predict player's position based on their velocity
    const playerFutureX = this.game.player.x + this.game.player.velocity.x * 0.5;
    const playerFutureY = this.game.player.y + this.game.player.velocity.y * 0.5;
    const angleToPlayer = Math.atan2(playerFutureY - this.y, playerFutureX - this.x);

    this.game.projectiles.push(new EnemyProjectile(this.game, this.x, this.y, angleToPlayer));
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) this.markedForDeletion = true;
  }
}

export class RegularEnemy extends Enemy {
  width = 50;
  height = 50;
  speed = 60;
  maxHealth = 10;
  damage = 10;
  score = this.maxHealth;
  attackInterval = this.game.getRandomInterval(3000, 5000);
  image = document.getElementById('enemy_image');

  constructor(game) {
    super(game);
    super.getSpawnPosition();
  }
}

export class TankEnemy extends Enemy {
  width = 60;
  height = 60;
  speed = 40;
  maxHealth = 30;
  damage = 10;
  score = this.maxHealth;
  attackInterval = this.game.getRandomInterval(2000, 3000);
  image = document.getElementById('tank_enemy_image');

  constructor(game) {
    super(game);
    super.getSpawnPosition();
  }
}

export class StealthEnemy extends Enemy {
  width = 50;
  height = 50;
  speed = 60;
  maxHealth = 20;
  damage = 10;
  score = this.maxHealth;
  attackInterval = this.game.getRandomInterval(1000, 2000);
  image = document.getElementById('stealth_enemy_image');
  // Stealth only properties
  visible = false;
  visibleTimer = 0;
  visibleDuration = 3000;
  invisibleDuration = 3000;
  opacity = 0;

  constructor(game) {
    super(game);
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

    this.visibleTimer += deltaTime;

    if (this.visible) {
      if (this.visibleTimer < 1000) {
        this.opacity = this.visibleTimer / 1000;
      } else if (this.visibleTimer < this.visibleDuration) {
        this.opacity = 1;
      } else if (this.visibleTimer >= this.visibleDuration) {
        this.visible = false;
        this.visibleTimer = 0;
        this.opacity = 1;
      }
    } else {
      if (this.visibleTimer < 1000) {
        this.opacity = 1 - this.visibleTimer / 1000;
      } else if (this.visibleTimer < this.invisibleDuration) {
        this.opacity = 0;
      } else if (this.visibleTimer >= this.invisibleDuration) {
        this.visible = true;
        this.visibleTimer = 0;
        this.opacity = 0;
      }
    }
  }
}

class EnemyProjectile {
  width = 5;
  height = 5;
  speed = 250;
  damage = 10;

  constructor(game, x, y, angle) {
    this.game = game;
    this.x = x;
    this.y = y;
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
