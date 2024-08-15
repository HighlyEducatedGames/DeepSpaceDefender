import powerUps from './PowerUp.js';

export default class PowerUpController {
  constructor(game) {
    this.game = game;
    this.powerUpBuilders = powerUps;
    this.flyingPowerUps = [];
    this.maxPowerUps = 5;
    this.spawnTime = 0;
    this.spawnInterval = 5000;

    this.powers = {
      projectile: new Power(this.game, 15000),
      shield: new Power(this.game, 15000),
      boost: new Power(this.game, 10000),
      reverse: new Power(this.game, 10000),
      flame: new Power(this.game, 10000),
      laser: new Power(this.game, 10000),
      particle: new Power(this.game, 10000),
    };
  }

  draw(ctx) {
    this.flyingPowerUps.forEach((powerUp) => powerUp.draw(ctx));
  }

  update(deltaTime) {
    if (!this.game.doPowerUps) return;

    if (this.spawnTime > this.spawnInterval) {
      this.spawnTime = 0;
      this.spawn();
    } else {
      this.spawnTime += deltaTime;
    }

    this.flyingPowerUps.forEach((powerUp) => powerUp.update(deltaTime));
    this.flyingPowerUps = this.flyingPowerUps.filter((powerUp) => !powerUp.markedForDeletion);

    for (const key in this.powers) {
      this.powers[key].update(deltaTime);
    }
  }

  reset() {
    this.flyingPowerUps = [];
  }

  init() {
    this.reset();
  }

  spawn() {
    if (this.flyingPowerUps.length < this.maxPowerUps) {
      const index = Math.floor(Math.random() * this.powerUpBuilders.length);
      const powerUp = new this.powerUpBuilders[index](this.game);
      this.flyingPowerUps.push(powerUp);
    }
  }
}

class Power {
  constructor(game, duration) {
    this.game = game;
    this.active = false;
    this.timer = 0;
    this.duration = duration;
  }

  activate() {
    this.active = true;
    this.timer = 0;
  }

  update(deltaTime) {
    if (this.active) {
      if (this.timer >= this.duration) {
        this.active = false;
      } else {
        this.timer += deltaTime;
      }
    }
  }
}
