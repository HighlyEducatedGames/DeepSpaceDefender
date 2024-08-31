import { Enemy, RegularEnemy, StealthEnemy, TankEnemy } from './BasicEnemies';
import { ArrowIndicator } from '../hud/ArrowIndicator';

type EnemyType = {
  max: number;
  numToSpawn: number;
  spawnTime: number;
  interval: number;
  obj: new (game: Game) => Enemies;
};

export default class EnemyController {
  game: Game;
  enemies: Enemies[] = [];
  arrowIndicators: ArrowIndicator[] = [];
  types: Record<string, EnemyType> = {
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

  constructor(game: Game) {
    this.game = game;
  }

  draw(ctx: CTX) {
    this.enemies.forEach((enemy) => enemy.draw(ctx));
    this.arrowIndicators.forEach((arrow) => arrow.draw(ctx));
  }

  update(deltaTime: number) {
    if (!this.game.doEnemies) return;
    if (this.game.boss) return;

    // Update existing enemies
    this.enemies.forEach((enemy) => enemy.update(deltaTime));

    // Spawn any new enemies on an interval
    for (const key in this.types) {
      const type = this.types[key];
      type.spawnTime += deltaTime;
      if (type.spawnTime > type.interval) {
        type.spawnTime = 0;
        this.spawnEnemy(type);
      }
    }

    // Update arrow indicators
    this.arrowIndicators.forEach((arrow) => arrow.update());
  }

  checkCollisions() {
    this.enemies.forEach((enemy) => enemy.checkCollisions());
  }

  cleanup() {
    this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
    this.arrowIndicators = this.arrowIndicators.filter((arrow) => !arrow.markedForDeletion);
  }

  init() {
    this.enemies = [];
    this.arrowIndicators = [];

    // Dynamically set number of enemies that can spawn this level
    this.types.regular.numToSpawn = Math.min(this.game.level, this.types.regular.max);
    this.types.tank.numToSpawn =
      this.game.level >= 3 ? Math.min(Math.ceil(this.game.level * 0.3), this.types.tank.max) : 0;
    this.types.stealth.numToSpawn =
      this.game.level >= 6 ? Math.min(Math.ceil(this.game.level * 0.2), this.types.stealth.max) : 0;

    // Attempt to spawn a single regular enemy right when the level starts
    this.spawnEnemy(this.types.regular);
  }

  spawnEnemy(type: EnemyType) {
    if (this.game.boss) return;
    const currentEnemies = this.enemies.filter((enemy) => enemy instanceof type.obj).length;
    if (currentEnemies >= type.numToSpawn) return;
    this.enemies.push(new type.obj(this.game));
  }

  addArrowIndicator(target: Enemy) {
    this.arrowIndicators.push(new ArrowIndicator(this.game, target));
  }

  count() {
    return this.enemies.length;
  }
}
