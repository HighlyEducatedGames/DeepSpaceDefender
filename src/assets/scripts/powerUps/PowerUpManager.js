import powerUps from './PowerUp.js';

export default class PowerUpManager {
  constructor(game) {
    this.game = game;
    this.powerUps = powerUps;
    this.activePowerUps = [];
  }

  draw(ctx) {
    this.activePowerUps.forEach((powerUp) => powerUp.draw(ctx));
  }

  update() {
    this.activePowerUps.forEach((powerUp, index) => {
      if (powerUp.markedForDeletion) this.activePowerUps.splice(index, 1);
    });
  }

  removeAll() {
    this.activePowerUps = [];
  }
}
