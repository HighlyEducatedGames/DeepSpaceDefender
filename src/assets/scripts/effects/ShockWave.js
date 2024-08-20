export default class ShockWave {
  constructor(game, x, y, doSound = true) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.x = x;
    this.y = y;
    this.doSound = doSound;
    this.numParticles = 80;
    this.colors = ['#cccccc', '#999999', '#666666', '#333333'];
    this.particles = [];
    this.shockWave = new EllipticalShockWave(this, x, y);
    this.markedForDeletion = false;
    this.sound = document.getElementById('explosion_sound');

    for (let i = 0; i < this.numParticles; i++) {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.particles.push(new ShockWaveParticle(this, color));
    }

    if (this.doSound) {
      this.sound.currentTime = 0;
      this.sound.play();
    }
  }

  draw(ctx) {
    this.particles.forEach((particle) => particle.draw(ctx));
    this.shockWave.draw(ctx);
  }

  update(deltaTime) {
    this.particles.forEach((particle) => particle.update(deltaTime));
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
    this.shockWave.update(deltaTime);
    if (this.particles.length === 0 && this.shockWave.alpha <= 0) {
      this.markedForDeletion = true;
    }
  }
}

class ShockWaveParticle {
  constructor(shockwave, color) {
    this.shockwave = shockwave;
    this.game = this.shockwave.game;
    this.x = this.shockwave.x + (Math.random() - 0.5) * 10; // Slightly randomize initial x position
    this.y = this.shockwave.y + (Math.random() - 0.5) * 10; // Slightly randomize initial y position
    this.color = color;
    this.radius = Math.random() * 2 + 1; // Smaller particles (radius between 1 and 3)
    this.alpha = 1; // Initial opacity
    this.life = 0.7; // 0.7 seconds
    this.dx = (Math.random() - 0.5) * 4 + (Math.random() - 0.5) * 2; // Less correlated horizontal velocity
    this.dy = (Math.random() - 0.5) * 4 + (Math.random() - 0.5) * 2; // Less correlated vertical velocity
    this.gravity = 0.01; // Reduced gravity to keep particles more level
    this.friction = 0.98;
    this.markedForDeletion = false;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.hexToRgb(this.color)}, ${this.alpha})`;
    ctx.fill();
  }

  update(deltaTime) {
    this.dy += this.gravity;
    this.x += this.dx;
    this.y += this.dy;
    this.dx *= this.friction;
    this.dy *= this.friction;

    this.alpha -= deltaTime / (this.life * 1000); // Fade out over the life span
    if (this.alpha <= 0 || this.radius <= 0.2) {
      this.markedForDeletion = true;
    }
  }

  // Helper function to convert hex color to RGB
  hexToRgb(hex) {
    let bigint = parseInt(hex.substring(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return `${r},${g},${b}`;
  }
}

class EllipticalShockWave {
  constructor(shockwave, x, y) {
    this.shockwave = shockwave;
    this.game = this.shockwave.game;
    this.x = x;
    this.y = y;
    this.radiusX = 0;
    this.radiusY = 0;
    this.alpha = 1;
    this.growthRateX = 6;
    this.growthRateY = 3;
    this.fadeRate = 0.07; // Faster fade for 0.7-second duration
  }

  draw(ctx) {
    if (this.alpha > 0) {
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  update(deltaTime) {
    this.radiusX += this.growthRateX;
    this.radiusY += this.growthRateY;
    this.alpha -= this.fadeRate;
  }
}
