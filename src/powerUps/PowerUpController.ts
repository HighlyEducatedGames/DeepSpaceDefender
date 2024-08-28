import PowerUps, { PowerUp } from './PowerUp';
import { GameObject } from '../GameObject';
import powerUp from './PowerUp';

export default class PowerUpController {
  game: Game;
  powerUps: PowerUp[] = [];
  maxPowerUps = 5;
  spawnTimer = 0;
  spawnInterval = 5000;

  constructor(game: Game) {
    this.game = game;
  }

  draw(ctx: CTX) {
    this.powerUps.forEach((powerUp) => powerUp.draw(ctx));
  }

  update(deltaTime: number) {
    if (!this.game.doPowerUps) return;

    this.spawnTimer += deltaTime;
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawn();
    }

    this.powerUps.forEach((powerUp) => powerUp.update(deltaTime));
  }

  checkCollisions() {
    this.powerUps.forEach((powerUp) => powerUp.checkCollisions());
  }

  cleanup() {
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
