export default class ParticleBomb {
  constructor(game) {
    this.game = game;
    this.particles = [];
    this.sound = document.getElementById('particle_bomb_sound');
  }

  activate() {
    this.createParticles();
    this.game.cloneSound(this.sound);
  }

  createParticles() {
    const numParticles = 20;
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const particle = {
        x: this.game.player.x,
        y: this.game.player.y,
        radius: 5,
        speed: 500,
        directionX: Math.cos(angle),
        directionY: Math.sin(angle),
        alpha: 1,
        fadeRate: 0.02,
        damage: 10,
      };
      this.particles.push(particle);
    }
  }

  draw(ctx) {
    this.particles.forEach((particle) => {
      ctx.fillStyle = `rgba(255, 165, 0, ${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  update(deltaTime) {
    this.updateParticles(deltaTime);
    this.checkCollisions();
  }

  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += (particle.speed * particle.directionX * deltaTime) / 1000;
      particle.y += (particle.speed * particle.directionY * deltaTime) / 1000;
      particle.alpha -= particle.fadeRate;
      if (particle.alpha <= 0) particle.markedForDeletion = true;
    }
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
  }

  checkCollisions() {
    this.particles.forEach((particle) => {
      // Collision with enemies
      this.game.enemies.enemies.forEach((enemy) => {
        if (this.game.checkCollision(particle, enemy)) {
          this.game.playCollision();
          enemy.takeDamage(particle.damage);
          if (enemy.markedForDeletion) this.game.addScore(enemy.score);
          particle.markedForDeletion = true;
        }
      });

      // Collision with boss
      if (this.game.boss) {
        if (this.game.checkCollision(particle, this.game.boss)) {
          this.game.playCollision();
          this.game.boss.takeDamage(particle.damage);
          particle.markedForDeletion = true;
        }
      }

      // Collision with other projectiles
      this.game.projectiles.forEach((projectile) => {
        if (this.game.checkCollision(particle, projectile)) {
          particle.markedForDeletion = true;
          projectile.markedForDeletion = true;
        }
      });
    });
  }
}
