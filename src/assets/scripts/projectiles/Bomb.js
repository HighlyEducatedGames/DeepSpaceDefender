export default class Bomb {
  constructor(game) {
    this.game = game;
    this.x = this.game.player.x;
    this.y = this.game.player.y;
    this.radius = 300;
    this.damage = 150;
    this.timer = 0;
    this.duration = 1000;
    this.flashTimer = 0;
    this.flashPeriod = 200;
    this.flashDuration = 100;
    this.hitBoss = false;
    this.markedForDeletion = false;
    this.sound = document.getElementById('bomb_sound');

    // Play bomb sound as soon as it is spawned
    this.sound.play();
  }

  draw(ctx) {
    if (this.flashTimer < this.flashDuration) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime) {
    if (this.timer >= this.duration) {
      this.timer = 0;
      this.markedForDeletion = true;
    } else {
      this.timer += deltaTime;
    }

    // Flash timer
    if (this.flashTimer >= this.flashPeriod) {
      this.flashTimer = 0;
    } else {
      this.flashTimer += deltaTime;
    }

    // Follow the player
    this.x = this.game.player.x;
    this.y = this.game.player.y;

    this.checkCollisions();
  }

  checkCollisions() {
    // Check Enemies
    this.game.enemies.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)) {
        enemy.takeDamage(this.damage);
      }
    });

    // Check boss
    if (this.game.boss && !this.hitBoss) {
      if (this.game.checkCollision(this, this.game.boss)) {
        this.hitBoss = true;
        this.game.boss.takeDamage(this.damage);
      }
    }
  }
}
