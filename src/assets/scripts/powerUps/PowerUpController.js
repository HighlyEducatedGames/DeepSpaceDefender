import powerUps from './PowerUp.js';

export default class PowerUpController {
  constructor(game) {
    this.game = game;
    this.powerUps = powerUps;
    this.activePowerUps = [];
    this.maxPowerUps = 5;
    this.spawnTime = 0;
    this.spawnInterval = 5000;
  }

  draw(ctx) {
    this.activePowerUps.forEach((powerUp) => powerUp.draw(ctx));
  }

  update(deltaTime) {
    if (!this.game.doPowerUps) return;

    if (this.spawnTime > this.spawnInterval) {
      this.spawnTime = 0;
      this.spawn();
    } else {
      this.spawnTime += deltaTime;
    }

    this.activePowerUps.forEach((powerUp) => powerUp.update(deltaTime));
    this.activePowerUps = this.activePowerUps.filter((powerUp) => !powerUp.markedForDeletion);
  }

  reset() {
    this.activePowerUps = [];
  }

  init() {
    this.reset();
  }

  spawn() {
    if (this.activePowerUps.length < this.maxPowerUps) {
      const index = Math.floor(Math.random() * this.powerUps.length);
      const powerUp = new this.powerUps[index](this.game);
      this.activePowerUps.push(powerUp);
    }
  }
}
