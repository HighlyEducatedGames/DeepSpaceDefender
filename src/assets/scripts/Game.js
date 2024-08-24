/* global menuBack */
import GUI from './GUI.js';
import Menu from './Menu.js';
import MusicController from './MusicController.js';
import PowerUpController from './powerUps/PowerUpController.js';
import EnemyController from './enemies/EnemyController.js';
import Player from './Player.js';
import Coin from './Coin.js';
import Star from './Star.js';
import Ally from './Ally.js';
import Boss from './bosses/Boss.js';
import BiomechLeviathan from './bosses/BiomechLeviathan.js';
import TemporalSerpent from './bosses/TemporalSerpent.js';
import CyberDragon from './bosses/CyberDragon.js';
import { WormholeController } from './hazards/WormholeController.js';
import { ArrowIndicator } from './HUD.js';
import inputHandler, { Action } from './InputHandler.js';

export default class Game {
  debug = false;
  topMargin = 90;
  inputs = inputHandler;
  player = null;
  projectiles = [];
  particles = [];
  effects = [];
  targetFPS = 60;
  targetFrameDuration = 1000 / this.targetFPS;
  timestamp = 0;
  tickMs = null;
  numStars = 50;
  parallaxLayers = 3;
  stars = [];
  boss = null;
  level = 0;
  score = 0;
  isGameOver = false;
  levelStartTime = 0;
  levelDuration = 30000;
  maxCoins = 5;
  ally = null;
  allySpawnTime = 0;
  allyInterval = 60000;
  arrowIndicators = [];
  frame = 0;
  paused = true;
  images = {
    title: document.getElementById('title_screen_image'),
  };
  sounds = {
    collision: document.getElementById('collision_sound'),
  };

  // DEBUG FLAGS
  doEnemies = true;
  doPowerUps = true;
  doAlly = true;
  doBoss = false;
  doWormholes = false;

  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
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
    this.allySpawnTime = 0;
    this.effects = [];
    this.startLevel(1);
  }

  // Set any properties here that change on a new level
  startLevel(level) {
    this.level = level;
    this.levelStartTime = this.timestamp;
    this.levelDuration = 30000;
    this.maxCoins = 5;
    this.arrowIndicators = [];
    this.crateStars();

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
      const bosses = [Boss, BiomechLeviathan, CyberDragon, TemporalSerpent];
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
  render(ctx, deltaTime) {
    this.update(deltaTime);
    this.checkCollisions();
    this.cleanup();
    this.draw(ctx);
  }

  update(deltaTime) {
    if (!this.isGameOver) {
      this.levelUpdate(deltaTime);
      this.player.update(deltaTime);
      this.stars.forEach((star) => star.update(deltaTime));
      this.coins.forEach((coin) => coin.update(deltaTime));
      // HERE
      this.projectiles.forEach((projectile) => projectile.update(deltaTime));
      this.particles.forEach((particle) => particle.update(deltaTime));
      this.wormholes.update(deltaTime);
      if (this.boss) this.boss.update(deltaTime);
      this.enemies.update(deltaTime);
      this.effects.forEach((effect) => effect.update(deltaTime));
      this.powerUps.update(deltaTime);
      if (this.ally) this.ally.update(deltaTime);
      this.arrowIndicators.forEach((arrow) => arrow.update(deltaTime));
    }
  }

  checkCollisions() {
    this.coins.forEach((coin) => coin.checkCollisions());
    this.player.checkCollisions();
    this.projectiles.forEach((projectile) => projectile.checkCollisions());
    this.particles.forEach((particle) => particle.checkCollisions());
    this.powerUps.powerUps.forEach((powerUp) => powerUp.checkCollisions());
  }

  cleanup() {
    this.coins = this.coins.filter((coin) => !coin.markedForDeletion);
    // HERE
    this.projectiles = this.projectiles.filter((projectile) => !projectile.markedForDeletion);
    this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
    if (this.boss && this.boss.markedForDeletion) this.boss = null;
    if (this.ally && this.ally.markedForDeletion) {
      this.ally = null;
      this.allySpawnTime = 0;
    }
    this.effects = this.effects.filter((effect) => !effect.markedForDeletion);
    this.arrowIndicators = this.arrowIndicators.filter((arrow) => !arrow.markedForDeletion);
  }

  draw(ctx) {
    this.stars.forEach((star) => star.draw(ctx));
    this.projectiles.forEach((projectile) => projectile.draw(ctx));
    this.particles.forEach((particle) => particle.draw(ctx));
    this.coins.forEach((coin) => coin.draw(ctx));
    this.wormholes.draw(ctx);
    if (this.boss) this.boss.draw(ctx);
    this.enemies.draw(ctx);
    this.effects.forEach((effect) => effect.draw(ctx));
    this.powerUps.draw(ctx);
    if (this.ally) this.ally.draw(ctx);
    this.arrowIndicators.forEach((arrow) => arrow.draw(ctx));
    this.player.draw(ctx);
    this.GUI.draw(ctx);

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

  crateStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(new Star(this));
    }
  }

  checkCollision(object1, object2) {
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (object1.radius || object1.width * 0.5) + (object2.radius || object2.width * 0.5);
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

  levelUpdate(deltaTime) {
    if (!this.boss) {
      // Countdown if not a boss level
      const elapsedTime = this.timestamp - this.levelStartTime;
      this.countdown = Math.max(0, (this.levelDuration - elapsedTime) / 1000);

      // Advance to next level if time over
      if (elapsedTime >= this.levelDuration) {
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
    if (this.allySpawnTime > this.allyInterval) {
      this.allySpawnTime = 0;
      this.spawnAlly();
    } else {
      this.allySpawnTime += deltaTime;
    }
  }

  spawnAlly() {
    if (this.doAlly && !this.ally) this.ally = new Ally(this);
  }

  outOfBounds(object, extraMargin = 0) {
    const radius = (object.radius || object.width * 0.5) + extraMargin;
    return (
      object.x + radius < 0 ||
      object.x - radius > this.width ||
      object.y + radius < 0 ||
      object.y - radius > this.height
    );
  }

  addScore(score) {
    if (typeof score !== 'number' || score === Infinity) return;
    this.score += score;
  }

  playCollision() {
    this.cloneSound(this.sounds.collision);
  }

  cloneSound(sound) {
    if (!(sound instanceof Audio)) return;
    const clone = sound.cloneNode();
    clone.volume = this.music.fxVol;
    clone.play();
  }

  getRandomY(margin = 0) {
    return Math.random() * (this.height - this.topMargin - margin * 2) + this.topMargin + margin;
  }

  addArrowIndicator(target) {
    this.arrowIndicators.push(new ArrowIndicator(this, target));
  }
}
