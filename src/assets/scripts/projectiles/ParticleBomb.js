export default class ParticleBomb {
  numParticles = 20;
  sound = document.getElementById('particle_bomb_sound');

  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
  }

  fire() {
    this.createParticles();
    this.game.cloneSound(this.sound);
  }

  createParticles() {
    for (let i = 0; i < this.numParticles; i++) {
      const angle = (i / this.numParticles) * Math.PI * 2;
      const particle = new ParticleBombParticle(this.game, angle);
      this.game.particles.push(particle);
    }
  }
}

class ParticleBombParticle {
  radius = 5;
  speed = 500;
  alpha = 1;
  fadeRate = 0.02;
  damage = 10;

  constructor(game, angle) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.x = this.game.player.x;
    this.y = this.game.player.y;
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(255, 165, 0, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime) {
    this.x += (this.speed * this.directionX * deltaTime) / 1000;
    this.y += (this.speed * this.directionY * deltaTime) / 1000;
    this.alpha -= this.fadeRate;
    if (this.alpha <= 0) this.markedForDeletion = true;
  }

  checkCollisions() {
    // Collision with enemies
    this.game.enemies.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)) {
        this.game.playCollision();
        enemy.takeDamage(this.damage);
        if (enemy.markedForDeletion) this.game.addScore(enemy.score);
        this.markedForDeletion = true;
      }
    });

    // Collision with boss
    if (this.game.boss) {
      if (this.game.checkCollision(this, this.game.boss)) {
        this.game.playCollision();
        this.game.boss.takeDamage(this.damage);
        this.markedForDeletion = true;
      }
    }

    // Collision with other projectiles
    this.game.projectiles.forEach((projectile) => {
      if (this.game.checkCollision(this, projectile)) {
        this.markedForDeletion = true;
        projectile.markedForDeletion = true;
      }
    });
  }
}
