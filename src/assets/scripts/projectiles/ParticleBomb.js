export default class ParticleBomb {
  constructor(game) {
    this.game = game;
    this.particles = [];
    this.active = false;
    this.expirationTime = 0;
  }

  activate() {
    this.active = true;
    console.log("ParticleBomb activated.");
    this.expirationTime = this.game.timestamp + 5000; // Set bomb active for 5 seconds
    this.createParticles();
    const particleBombFireSoundClone = this.game.cloneSound(this.game.sounds.particleBombFire);
    particleBombFireSoundClone.play();
  }

  createParticles() {
    console.log("Creating particles for ParticleBomb.");
    const numParticles = 20;
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const particle = {
        x: this.game.player.x,
        y: this.game.player.y,
        size: 5,
        speed: 300,
        directionX: Math.cos(angle),
        directionY: Math.sin(angle),
        alpha: 1,
        fadeRate: 0.03
      };
      this.particles.push(particle);
    }
  }

  update(deltaTime) {
    if (this.active) {
      if (this.game.timestamp > this.expirationTime) {
        this.active = false;
        console.log("ParticleBomb expired.");
      }
      this.updateParticles(deltaTime);
    }
  }

  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += (particle.speed * particle.directionX * deltaTime) / 1000;
      particle.y += (particle.speed * particle.directionY * deltaTime) / 1000;
      particle.alpha -= particle.fadeRate;
      if (particle.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    this.particles.forEach((particle) => {
      ctx.fillStyle = `rgba(255, 165, 0, ${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  checkCollisions() {
    this.particles.forEach((particle) => {
      // Check damage to enemies, bosses, etc., similar to your previous code
    });
  }
}
