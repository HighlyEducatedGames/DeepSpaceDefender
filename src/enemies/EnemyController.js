import { RegularEnemy, StealthEnemy, TankEnemy } from './BasicEnemies.js';

export default class EnemyController {
  enemies = [];
  types = {
    regular: {
      max: 6,
      numToSpawn: 0,
      spawnTime: 0,
      interval: 7000,
      obj: RegularEnemy,
    },
    tank: {
      max: 3,
      numToSpawn: 0,
      spawnTime: 0,
      interval: 5000,
      obj: TankEnemy,
    },
    stealth: {
      max: 4,
      numToSpawn: 0,
      spawnTime: 0,
      interval: 7000,
      obj: StealthEnemy,
    },
  };

  constructor(game) {
    /** @type {import('../Game.js').default} */
    this.game = game;
  }

  draw(ctx) {
    this.enemies.forEach((enemy) => enemy.draw(ctx));
  }

  update(deltaTime) {
    if (!this.game.doEnemies) return;
    if (this.game.boss) return;

    // Update existing enemies
    this.enemies.forEach((enemy) => enemy.update(deltaTime));
    this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);

    // Spawn any new enemies on an interval
    for (const key in this.types) {
      const type = this.types[key];
      type.spawnTime += deltaTime;
      if (type.spawnTime > type.interval) {
        type.spawnTime = 0;
        this.spawnEnemy(type);
      }
    }
  }

  reset() {
    this.enemies = [];
  }

  init() {
    // Clear all old enemies
    this.reset();

    // Dynamically set number of enemies that can spawn this level
    this.types.regular.numToSpawn = Math.min(this.game.level, this.types.regular.max);
    this.types.tank.numToSpawn =
      this.game.level >= 3 ? Math.min(Math.ceil(this.game.level * 0.3), this.types.tank.max) : 0;
    this.types.stealth.numToSpawn =
      this.game.level >= 6 ? Math.min(Math.ceil(this.game.level * 0.2), this.types.stealth.max) : 0;

    // Attempt to spawn a single regular enemy right when the level starts
    this.spawnEnemy(this.types.regular);
  }

  spawnEnemy(type) {
    if (this.game.boss) return;
    const currentEnemies = this.enemies.filter((enemy) => enemy instanceof type.obj).length;
    if (currentEnemies >= type.numToSpawn) return;
    this.enemies.push(new type.obj(this.game));
  }

  getLength() {
    return this.enemies.length;
  }
}
