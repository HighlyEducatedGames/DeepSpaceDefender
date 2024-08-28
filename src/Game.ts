import GUI from './GUI';
import Menu from './Menu';
import MusicController from './MusicController';
import PowerUpController from './powerUps/PowerUpController';
import EnemyController from './enemies/EnemyController';
import Player from './Player';
import Coin from './Coin';
import Star from './Star';
import Ally from './Ally';
import Boss from './bosses/Boss';
import BiomechLeviathan from './bosses/BiomechLeviathan';
// import TemporalSerpent from './bosses/TemporalSerpent.js';
// import CyberDragon from './bosses/CyberDragon.js';
import { WormholeController } from './hazards/WormholeController.js';
import InputHandler, { Action } from './InputHandler';
import { Effect, GameObject, Particle, Projectile } from './GameObject';
import { Enemy } from './enemies/BasicEnemies';

export default class Game {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  player: Player;
  inputs: InputHandler;
  music: MusicController;
  menu: Menu;
  GUI: GUI;
  powerUps: PowerUpController;
  enemies: EnemyController;
  wormholes: WormholeController;
  debug = false;
  topMargin = 90;
  projectiles: Projectile[] = [];
  particles: Particle[] = [];
  effects: Effect[] = [];
  targetFPS = 60;
  targetFrameDuration = 1000 / this.targetFPS;
  tickMs = 0;
  numStars = 50;
  parallaxLayers = 3;
  stars: Star[] = [];
  coins: Coin[] = [];
  boss: Bosses | null = null;
  level = 0;
  score = 0;
  isGameOver = false;
  levelTimer = 0;
  levelDuration = 30000;
  countdown = 0;
  maxCoins = 5;
  ally: Ally | null = null;
  allySpawnTimer = 0;
  allyInterval = 60000;
  frame = 0;
  paused = true;
  images = { title: this.getImage('title_screen_image') };
  sounds = { collision: this.getAudio('collision_sound') };

  // DEBUG FLAGS
  doEnemies = true;
  doPowerUps = true;
  doAlly = true;
  doBoss = true;
  doWormholes = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.player = new Player(this);
    this.inputs = new InputHandler(this);
    this.music = new MusicController(this);
    this.menu = new Menu(this);
    this.GUI = new GUI(this);
    this.powerUps = new PowerUpController(this);
    this.enemies = new EnemyController(this);
    this.wormholes = new WormholeController(this);

    this.crateStars();
    this.resetGame();
  }

  // Set any properties here that needs to be reset on game over or game reset
  resetGame() {
    this.isGameOver = false;
    this.score = 0;
    this.player = new Player(this);
    this.ally = null;
    this.allySpawnTimer = 0;
    this.effects = [];
    this.startLevel(1);
  }

  // Set any properties here that change on a new level
  startLevel(level: number) {
    this.level = level;
    this.levelTimer = 0;
    this.levelDuration = 30000;
    this.maxCoins = 5;

    // Add new coins to this level
    this.coins = [];
    for (let i = 0; i < this.maxCoins; i++) {
      this.coins.push(new Coin(this));
    }

    // Reset and spawn non-boss enemies
    if (this.doEnemies) this.enemies.init();

    // Reset and restart wormholes
    if (this.doWormholes) this.wormholes.init();

    // Reset and restart powerUps
    if (this.doPowerUps) this.powerUps.init();

    // Initialize boss if boss level
    if (this.level % 5 === 0 && this.doBoss) {
      const bosses = [Boss, BiomechLeviathan /* CyberDragon, TemporalSerpent*/];
      const bossIndex = Math.floor((level - 5) / 5) % bosses.length;
      this.boss = new bosses[bossIndex](this);
      this.music.setTrack(this.boss.music);
      this.music.play();
    } else {
      if (this.boss) this.boss = null;
      this.music.setTrack(this.music.tracks.background);
    }

    // Infinite time on boss levels
    this.countdown = this.boss ? Infinity : this.levelDuration / 1000;
  }

  // Main game loop
  render(ctx: CTX, deltaTime: number) {
    this.update(deltaTime);
    this.checkCollisions();
    this.cleanup();
    this.draw(ctx);
  }

  update(deltaTime: number) {
    if (!this.isGameOver) {
      this.levelUpdate(deltaTime);
      this.player.update(deltaTime);
      this.stars.forEach((star) => star.update(deltaTime));
      this.coins.forEach((coin) => coin.update());
      this.powerUps.update(deltaTime);
      this.enemies.update(deltaTime);
      if (this.boss) this.boss.update(deltaTime);
      if (this.ally) this.ally.update(deltaTime);
      this.projectiles.forEach((projectile) => projectile.update(deltaTime));
      this.particles.forEach((particle) => particle.update(deltaTime));
      this.effects.forEach((effect) => effect.update(deltaTime));
      // this.wormholes.update(deltaTime);
    }
  }

  checkCollisions() {
    this.player.checkCollisions();
    this.coins.forEach((coin) => coin.checkCollisions());
    this.powerUps.checkCollisions();
    this.enemies.checkCollisions();
    if (this.boss) this.boss.checkCollisions();
    if (this.ally) this.ally.checkCollisions();
    this.projectiles.forEach((projectile) => projectile.checkCollisions());
  }

  cleanup() {
    this.coins = this.coins.filter((coin) => !coin.markedForDeletion);
    this.powerUps.cleanup();
    this.enemies.cleanup();
    if (this.boss && this.boss.markedForDeletion) this.boss = null;
    this.cleanupAlly();
    this.projectiles = this.projectiles.filter((projectile) => !projectile.markedForDeletion);
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
    this.effects.forEach((effect) => effect.cleanup());
  }

  draw(ctx: CTX) {
    this.stars.forEach((star) => star.draw(ctx));
    this.coins.forEach((coin) => coin.draw(ctx));
    this.powerUps.draw(ctx);
    this.projectiles.forEach((projectile) => projectile.draw(ctx));
    this.particles.forEach((particle) => particle.draw(ctx));
    this.effects.forEach((effect) => effect.draw(ctx));
    this.enemies.draw(ctx);
    if (this.boss) this.boss.draw(ctx);
    if (this.ally) this.ally.draw(ctx);
    this.player.draw(ctx);
    this.GUI.draw(ctx);
    // this.wormholes.draw(ctx);

    // Game over text
    if (this.isGameOver) {
      const centerX = this.width * 0.5;
      const centerY = this.height * 0.5;
      ctx.save();
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.font = '40px Arial';
      ctx.fillText('Game Over', centerX, centerY);
      ctx.font = '20px Arial';
      ctx.fillText('Score: ' + this.score, centerX, centerY + 40);
      ctx.fillText('Level: ' + this.level, centerX, centerY + 70);
      ctx.fillText('Press B to Restart', centerX, centerY + 100);
      ctx.restore();
    }

    // DEBUG - Vertical Margin
    if (this.debug) {
      ctx.strokeStyle = 'gray';
      ctx.moveTo(0, this.topMargin);
      ctx.lineTo(this.width, this.topMargin);
      ctx.stroke();
    }
  }

  handleGameControls() {
    // Toggle debug mode
    if (this.inputs.justPressed(Action.DEBUG)) {
      this.debug = !this.debug;
      this.inputs.codes.invincibility.enabled = this.debug;
      this.inputs.codes.unlimitedAmmo.enabled = this.debug;
      this.inputs.codes.unlimitedBoost.enabled = this.debug;
    }

    // Toggle game paused
    if (this.inputs.justPressed(Action.PAUSE)) {
      this.paused = !this.paused;
      this.paused ? this.menu.showMenu() : this.menu.hideMenu();
    }

    // Back to main menu in pause menu
    if (this.inputs.justPressed(Action.BACK)) {
      if (this.paused) menuBack();
    }

    // Reset game
    if (this.inputs.justPressed(Action.RESET)) {
      this.resetGame();
    }
  }

  levelUpdate(deltaTime: number) {
    if (!this.boss) {
      // Countdown if not a boss level
      this.levelTimer += deltaTime;
      this.countdown = Math.max(0, (this.levelDuration - this.levelTimer) / 1000);

      // Advance to next level if time over
      if (this.levelTimer >= this.levelDuration) {
        this.nextLevel();
        return;
      }

      // Advance to next level if all level objectives met
      const clearedObjectives = this.coins.length === 0 && this.enemies.getLength() === 0;
      if (clearedObjectives) {
        // Give points to player for completing the level with time to spare
        this.addScore(Math.floor(this.countdown) * 5);
        this.nextLevel();
      }
    }

    // Ally Spawning
    this.allySpawnTimer += deltaTime;
    if (this.allySpawnTimer >= this.allyInterval) {
      this.allySpawnTimer = 0;
      this.spawnAlly();
    }
  }

  crateStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(new Star(this));
    }
  }

  checkCollision(object1: GameObject, object2: GameObject) {
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < object1.radius + object2.radius;
  }

  gameOver() {
    this.isGameOver = true;
    this.music.setTrack(this.music.tracks.gameOver);
  }

  nextLevel() {
    this.startLevel(this.level + 1);
  }

  prevLevel() {
    if (this.level > 1) this.startLevel(this.level - 1);
  }

  spawnAlly() {
    if (this.doAlly && !this.ally) this.ally = new Ally(this);
  }

  cleanupAlly() {
    if (this.ally && this.ally.markedForDeletion) {
      this.ally = null;
      this.allySpawnTimer = 0;
    }
  }

  outOfBounds(object: GameObject, extraMargin = 0) {
    const radius = object.radius + extraMargin;
    return (
      object.x + radius < 0 ||
      object.x - radius > this.width ||
      object.y + radius < 0 ||
      object.y - radius > this.height
    );
  }

  addScore(score: number) {
    this.score += score;
  }

  playCollision() {
    this.cloneSound(this.sounds.collision);
  }

  cloneSound(sound: HTMLAudioElement) {
    if (!sound.src) return;
    const clone = sound.cloneNode() as HTMLAudioElement;
    clone.volume = this.music.fxVol;
    clone.play().catch(() => {});
  }

  getRandomY(margin = 0) {
    return Math.random() * (this.height - this.topMargin - margin * 2) + this.topMargin + margin;
  }

  getRandomDirection() {
    const directions = ['right', 'down', 'left', 'up'];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  getRandomInterval(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  getOffScreenRandomSide(object: GameObject, extraMargin = 0) {
    const side = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
    let x, y;

    switch (side) {
      case 0: // left
        x = -object.width * 0.5 - extraMargin;
        y = Math.random() * object.game.height;
        break;
      case 1: // right
        x = object.game.width + object.height * 0.5 + extraMargin;
        y = Math.random() * object.game.height;
        break;
      case 2: // top
        x = Math.random() * object.game.width;
        y = -object.height * 0.5 - extraMargin;
        break;
      case 3: // bottom
        x = Math.random() * object.game.width;
        y = object.game.height + object.height * 0.5 + extraMargin;
        break;
    }
    return { x, y, side };
  }

  getImage(id: string): HTMLImageElement {
    const element = document.getElementById(id);
    if (element && element instanceof HTMLImageElement) return element;
    console.warn(`Missing image with the id of '${id}'`);
    return document.getElementById('404_image') as HTMLImageElement;
  }

  getAudio(id: string): HTMLAudioElement {
    const element = document.getElementById(id);
    if (element && element instanceof HTMLAudioElement) return element;
    console.warn(`Missing audio with the id of '${id}'`);
    return new Audio();
  }
}
