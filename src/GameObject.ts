export abstract class GameObject {
  game: Game;
  abstract x: number;
  abstract y: number;
  abstract width: number;
  abstract height: number;
  abstract radius: number;
  markedForDeletion = false;

  constructor(game: Game) {
    this.game = game;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract update(deltaTime: number): void;
  abstract checkCollisions(): void;
}

export abstract class Projectile extends GameObject {
  abstract damage: number;
  abstract speed: number;

  constructor(game: Game) {
    super(game);
  }
}

export abstract class FriendlyProjectile extends Projectile {
  constructor(game: Game) {
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
      // if (this.game.checkCollision(this, this.game.boss)) {
      // this.game.boss.takeDamage(this.damage); // TODO
      // this.markedForDeletion = true;
      // }
    }
  }
}

export abstract class EnemyProjectile extends Projectile {
  constructor(game: Game) {
    super(game);
  }

  checkCollisions() {
    // Check collision to player
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.player.takeDamage(this.damage);
      this.markedForDeletion = true;
    }

    // Check collision to bomb
    if (this.game.player.bomb) {
      if (this.game.checkCollision(this, this.game.player.bomb)) {
        this.markedForDeletion = true;
      }
    }
  }
}
