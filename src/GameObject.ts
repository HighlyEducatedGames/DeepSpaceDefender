import Game from './Game';

export abstract class GameObject {
  game: Game;
  abstract x: number;
  abstract y: number;
  abstract radius: number;
  vx = 0;
  vy = 0;
  abstract speed: number;
  markedForDeletion = false;

  protected constructor(game: Game) {
    this.game = game;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract update(deltaTime: number): void;
  abstract checkCollisions(): void;
}

export abstract class Projectile extends GameObject {
  abstract damage: number;
  protected constructor(game: Game) {
    super(game);
  }
}

export abstract class FriendlyProjectile extends Projectile {
  protected constructor(game: Game) {
    super(game);
  }

  checkCollisions() {
    // Check collision to all enemies
    this.game.enemies.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)) {
        enemy.takeDamage(this.damage);
        this.markedForDeletion = true;
      }
    });

    // Check collision to boss
    if (this.game.boss) {
      if (this.game.checkCollision(this, this.game.boss)) {
        this.game.boss.takeDamage(this.damage);
        this.markedForDeletion = true;
      }
    }

    // Check collision to enemy projectiles
    this.game.projectiles
      .filter((projectile) => projectile instanceof EnemyProjectile)
      .forEach((projectile) => {
        if (this.game.checkCollision(this, projectile)) {
          this.markedForDeletion = true;
          projectile.markedForDeletion = true;
        }
      });
  }
}

export abstract class EnemyProjectile extends Projectile {
  protected constructor(game: Game) {
    super(game);
  }

  checkCollisions() {
    // Check collision to player
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.takeDamage(this.damage);
      this.markedForDeletion = true;
    }
  }
}

export abstract class BossCreature extends GameObject {
  abstract speed: number;
  abstract maxHealth: number;
  abstract health: number;
  abstract points: number;
  abstract image: HTMLImageElement;
  abstract music: HTMLAudioElement;
  abstract damage: number;
  abstract phase: number;
  abstract playerCollisionRadius: number;
  allowCollision = true;
  collisionTimer = 0;
  collisionCooldown = 3000;

  protected constructor(game: Game) {
    super(game);
  }

  takeDamage(damage: number) {
    this.health -= damage;
    if (this.health <= 0) {
      this.game.addScore(this.points);
      this.markedForDeletion = true;
      this.onDeath();
      this.game.nextLevel();
    }
  }

  update(deltaTime: number) {
    if (!this.allowCollision) {
      this.collisionTimer += deltaTime;
      if (this.collisionTimer >= this.collisionCooldown) {
        this.collisionTimer = 0;
        this.allowCollision = true;
      }
    }
  }

  checkCollisions() {
    // Check collisions with player
    if (this.allowCollision) {
      const playerCollisionObject = { x: this.x, y: this.y, radius: this.playerCollisionRadius };
      if (this.game.checkCollision(playerCollisionObject, this.game.player)) {
        this.allowCollision = false;
        this.game.player.takeDamage(this.damage);
        this.game.playCollision();
        this.onPlayerCollision();
      }
    }
  }

  abstract cleanup(): void;
  abstract onPlayerCollision(): void;
  abstract onDeath(): void;
}

export abstract class Effect {
  game: Game;
  abstract x: number;
  abstract y: number;
  abstract particles: Particle[];
  markedForDeletion = false;

  protected constructor(game: Game) {
    this.game = game;
  }

  abstract draw(ctx: CTX): void;
  abstract update(deltaTime: number): void;
  abstract cleanup(): void;
}

export abstract class Particle {
  game: Game;
  abstract x: number;
  abstract y: number;
  markedForDeletion = false;

  protected constructor(game: Game) {
    this.game = game;
  }

  abstract draw(ctx: CTX): void;
  abstract update(deltaTime: number): void;
}
