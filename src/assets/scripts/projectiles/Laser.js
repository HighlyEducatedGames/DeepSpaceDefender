import ShockWave from '../effects/ShockWave.js';

export default class Laser {
  active = false;
  startX = 0;
  startY = 0;
  endX = 0;
  endY = 0;
  width = 3;
  length = 300;
  particlesPerTick = 50;
  sounds = {
    hit: document.getElementById('laser_hit_sound'),
    fire: document.getElementById('laser_fire_sound'),
    charge: document.getElementById('laser_charge_sound'),
  };

  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
  }

  draw(ctx) {
    // DEBUG - Laser region
    if (this.game.debug) {
      // Update position of the laser so that the laser is drawn correctly on initial fire
      this.updatePosition();
      ctx.save();
      ctx.strokeStyle = `white`;
      ctx.lineWidth = this.width;
      ctx.beginPath();
      ctx.moveTo(this.startX, this.startY);
      ctx.lineTo(this.endX, this.endY);
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.game.player.x, this.game.player.y, this.length + this.game.player.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  update() {
    if (this.active) {
      if (this.sounds.fire.paused) {
        this.sounds.fire.loop = true;
        this.sounds.fire.play();
      }
      this.updatePosition();
      this.createParticles();
    } else {
      if (!this.sounds.fire.paused) {
        this.sounds.fire.pause();
        this.sounds.fire.currentTime = 0;
      }
    }
  }

  updatePosition() {
    const player = this.game.player;
    this.startX = player.x + Math.cos(player.rotation) * player.width * 0.5;
    this.startY = player.y + Math.sin(player.rotation) * player.height * 0.5;
    this.endX = player.x + Math.cos(player.rotation) * (player.width * 0.5 + this.length);
    this.endY = player.y + Math.sin(player.rotation) * (player.height * 0.5 + this.length);
  }

  createParticles() {
    for (let i = 0; i < this.particlesPerTick; i++) {
      const t = i / (this.particlesPerTick - 1);
      const x = this.startX + t * (this.endX - this.startX);
      const y = this.startY + t * (this.endY - this.startY);
      this.game.particles.push(new LaserParticle(this.game, this, x, y));
    }
  }
}

class LaserParticle {
  speed = 5;
  radius = 1;
  maxLife = 30;
  life = this.maxLife;
  vx = Math.random() * 2 - 1;
  vy = Math.random() * 2 - 1;
  distance = 0;
  enemyDamage = 0.005;
  bossDamage = 0.09;
  markedForDeletion = false;

  constructor(game, laser, x, y) {
    this.game = game;
    this.laser = laser;
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.life / this.maxLife})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime) {
    this.distance += (this.speed * deltaTime) / 1000;
    this.x += this.vx * this.distance;
    this.y += this.vy * this.distance;
    this.life--;

    if (this.life <= 0) this.markedForDeletion = true;

    // Wrap around the canvas
    if (this.x < 0) this.x = this.game.width;
    if (this.x > this.game.width) this.x = 0;
    if (this.y < 0) this.y = this.game.height;
    if (this.y > this.game.height) this.y = 0;
  }

  checkCollisions() {
    // Enemies
    this.game.enemies.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)) {
        enemy.takeDamage(this.enemyDamage);
        this.markedForDeletion = true;
        this.laser.sounds.hit.play();
        if (enemy.markedForDeletion) {
          this.game.effects.push(new ShockWave(this.game, enemy.x, enemy.y));
        }
      }
    });

    // Boss
    if (this.game.boss) {
      if (this.game.checkCollision(this, this.game.boss)) {
        this.game.boss.takeDamage(this.bossDamage);
        this.markedForDeletion = true;
        this.laser.sounds.hit.play();
      }
    }
  }
}
