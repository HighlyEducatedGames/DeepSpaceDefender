import { RegularEnemy, StealthEnemy, TankEnemy } from './BasicEnemies.js';

export default class EnemyController {
  constructor(game) {
    this.game = game;
    this.enemies = [];
    this.enemyRespawnTimeouts = [];
    this.maxRegularEnemies = 6;
    this.maxTankEnemies = 3;
    this.maxStealthEnemies = 4;
  }

  draw(ctx) {
    this.enemies.forEach((enemy) => enemy.draw(ctx));
  }

  update() {
    this.enemies.forEach((enemy) => enemy.update());
    this.respawnEnemies();
    this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
  }

  reset() {
    this.enemies = [];
  }

  init() {
    this.reset();

    let numRegularEnemies = Math.min(this.game.level, this.maxRegularEnemies);
    let numEnemyTanks = this.game.level >= 3 ? Math.min(Math.ceil(this.game.level * 0.3), this.maxTankEnemies) : 0;
    let numStealthEnemies =
      this.game.level >= 6 ? Math.min(Math.ceil(this.game.level * 0.2), this.maxStealthEnemies) : 0;

    for (let i = 0; i < numRegularEnemies; i++) {
      this.spawnEnemy(RegularEnemy, this.maxRegularEnemies);
    }

    for (let i = 0; i < numEnemyTanks; i++) {
      this.spawnEnemy(TankEnemy, this.maxTankEnemies);
    }

    for (let i = 0; i < numStealthEnemies; i++) {
      this.spawnEnemy(StealthEnemy, this.maxStealthEnemies);
    }
  }

  spawnEnemy(Enemy, maxEnemiesOfType) {
    if (this.game.boss) return;
    const currentEnemies = this.enemies.filter((enemy) => enemy instanceof Enemy).length;
    if (currentEnemies >= maxEnemiesOfType) return;
    this.enemies.push(new Enemy(this.game));
  }

  respawnEnemies() {
    // Respawn enemies after a timeout
    const toRespawn = this.enemies.filter((enemy) => enemy.markedForDeletion);
    toRespawn
      .filter((enemy) => enemy instanceof RegularEnemy)
      .forEach((enemy) => setTimeout(() => this.spawnEnemy(RegularEnemy, this.maxRegularEnemies), enemy.respawnTime));
    toRespawn
      .filter((enemy) => enemy instanceof TankEnemy)
      .forEach((enemy) => setTimeout(() => this.spawnEnemy(TankEnemy, this.maxTankEnemies), enemy.respawnTime));
    toRespawn
      .filter((enemy) => enemy instanceof StealthEnemy)
      .forEach((enemy) => setTimeout(() => this.spawnEnemy(StealthEnemy, this.maxStealthEnemies), enemy.respawnTime));
  }

  getLength() {
    return this.enemies.length;
  }
}
