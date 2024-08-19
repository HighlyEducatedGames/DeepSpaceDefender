import PowerUps from './PowerUp.js';

export default class PowerUpController {
  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.powerUps = [];
    this.maxPowerUps = 5;
    this.spawnTime = 0;
    this.spawnInterval = 5000;
  }

  draw(ctx) {
    this.powerUps.forEach((powerUp) => powerUp.draw(ctx));
  }

  update(deltaTime) {
    if (!this.game.doPowerUps) return;

    if (this.spawnTime > this.spawnInterval) {
      this.spawnTime = 0;
      this.spawn();
    } else {
      this.spawnTime += deltaTime;
    }

    this.powerUps.forEach((powerUp) => powerUp.update(deltaTime));
    this.powerUps = this.powerUps.filter((powerUp) => !powerUp.markedForDeletion);
  }

  reset() {
    this.powerUps = [];
  }

  init() {
    this.reset();
  }

  spawn() {
    if (this.powerUps.length < this.maxPowerUps) {
      // Randomly spawn a powerup from the array
      const powerUpArray = Object.values(PowerUps);
      const index = Math.floor(Math.random() * powerUpArray.length);
      const powerUp = new powerUpArray[index](this.game);
      this.powerUps.push(powerUp);
    }
  }
}
