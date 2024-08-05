class Enemy {
  constructor(game) {
    this.game = game;
    this.verticalMargin = 50;
    this.side = Math.random() < 0.5 ? 'left' : 'right';
    this.width = 50;
    this.height = 50;
    this.x = null;
    this.y = null;
    this.speed = 1.5; // 50 + level * 10 // TODO dynamic speed
    this.velocityX = this.side === 'left' ? 1 : -1;
    this.lastShotTime = 0;
    this.canShoot = false;
    this.markedForDeletion = false;
    this.damage = 0;
    this.score = 10;

    this.image = new Image();
    this.image.src = 'assets/images/enemy.png';

    this.calculateStartPosition();

    setTimeout(() => {
      this.canShoot = true;
    }, 2000);
  }

  calculateStartPosition() {
    this.x = this.side === 'left' ? -this.width * 0.5 : this.game.canvas.width + this.width * 0.5;
    this.y = Math.random() * (this.game.canvas.height - 2 * this.verticalMargin - this.height) + this.verticalMargin;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update() {
    this.x += this.speed * this.velocityX;

    // Bounce back and forth on the x-axis
    if (this.x < this.width * 0.5 && this.velocityX < 0) this.velocityX = 1;
    if (this.x > this.game.canvas.width - this.width * 0.5 && this.velocityX > 0) this.velocityX = -1;

    // Collision with player projectiles
    this.game.player.projectiles.forEach((projectile) => {
      if (this.game.checkCollision(projectile, this)) this.markedForDeletion = true;
    });

    // Collision with player
    if (this.game.checkCollision(this.game.player, this)) {
      this.game.player.takeDamage(this.damage);
      this.game.player.sounds.collision.cloneNode().play();
    }
  }

  fire() {} // TODO
}

export class RegularEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.damage = 10;
    this.shootInterval = Math.random() * 2000 + 3000;
    this.respawnTime = 7000;
  }
}

export class TankEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.damage = 10;
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
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.damage = 10;
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
    if (this.visible) {
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
    const currentTime = performance.now();
    const elapsedTime = currentTime - this.visibleStartTime;

    if (this.visible) {
      if (elapsedTime < 1000) {
        this.opacity = elapsedTime / 1000; // Gradually increase opacity
      } else if (elapsedTime >= this.visibleDuration) {
        this.visible = false;
        this.visibleStartTime = currentTime;
        this.opacity = 1; // Fully opaque
      }
    } else {
      if (elapsedTime < 1000) {
        this.opacity = 1 - elapsedTime / 1000; // Gradually decrease opacity
      } else if (elapsedTime >= this.invisibleDuration) {
        this.visible = true;
        this.visibleStartTime = currentTime;
        this.opacity = 0; // Fully invisible
      }
    }
  }

  fire() {
    // TODO
    /*// Add visibility check for stealth enemy before shooting
    if (
      (enemy.type !== 'stealthEnemy' || enemy.visible) &&
      enemy.canShoot &&
      timestamp - enemy.lastShotTime > enemy.shootInterval
    ) {
      let projectile = {
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        width: 5,
        height: 5,
        speed: 300,
        directionX: (player.x - enemy.x) / Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2),
        directionY: (player.y - enemy.y) / Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2),
        fromPlayer: false,
      };
      projectiles.push(projectile);
      enemy.lastShotTime = timestamp;
    }*/
  }
}
