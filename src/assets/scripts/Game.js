/* global menuBack */
import Controls from './controls/Controls.js';
import GUI from './GUI.js';
import Menu from './Menu.js';
import MusicController from './MusicController.js';
import PowerUpManager from './powerUps/PowerUpController.js';
import EnemyController from './enemies/EnemyController.js';
import Player from './Player.js';
import Coin from './Coin.js';
import Star from './Star.js';
import Ally from './Ally.js';
import Boss from './bosses/Boss.js';
import BiomechLeviathan from './bosses/BiomechLeviathan.js';
import TemporalSerpent from './bosses/TemporalSerpent.js';
import CyberDragon from './bosses/CyberDragon.js';
import { Wormholes } from './hazards/Wormhole.js';
import { ArrowIndicator } from './HUD.js';


export default class Game {
  constructor(canvas) {
    this.debug = false;
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.topMargin = 90;
    this.controls = new Controls(this);
    this.player = new Player(this);
    this.music = new MusicController(this);
    this.menu = new Menu(this);
    this.GUI = new GUI(this);
    this.powerUps = new PowerUpManager(this);
    this.enemies = new EnemyController(this);
    this.wormholes = new Wormholes(this);
    this.targetFPS = 60;
    this.targetFrameDuration = 1000 / this.targetFPS;
    this.timestamp = 0;
    this.tickMs = null;
    this.numStars = 50;
    this.parallaxLayers = 3;
    this.stars = [];
    this.effects = [];
    this.boss = null;
    this.level = 0;
    this.score = 0;
    this.isGameOver = false;
    this.levelStartTime = 0;
    this.levelDuration = 30000;
    this.maxCoins = 5;
    this.ally = null;
    this.allySpawnTime = 0;
    this.allyInterval = 60000;
    this.images = {
      title: document.getElementById('title_screen_image'),
    };
    this.sounds = {
      collision: document.getElementById('collision_sound'),
    };
    this.arrowIndicators = [];

    // DEBUG FLAGS
    this.doAlly = false;
    this.doEnemies = true;
    this.doBoss = false;
    this.doWormholes = false;
    this.doPowerUps = false;

    this.crateStars();
    this.resetGame();
  }

  // Set any properties here that needs to be reset on game over or game reset
  resetGame(showMenu = true) {
    if (showMenu) this.menu.showMenu();
    this.isGameOver = false;
    this.score = 0;
    this.player = new Player(this);
    this.ally = null;
    this.allyNextSpawnTime = 0;
    this.powerUps.removeAll();
    this.startLevel(1);
    this.arrowIndicators = [];
  }

  // Set any properties here that change on a new level
  startLevel(level) {
    this.level = level;
    this.levelStartTime = this.timestamp;
    this.levelDuration = 30000;
    this.effects = [];
    this.maxCoins = 5;
    this.arrowIndicators = [];

    // Add new coins to this level
    this.coins = [];
    for (let i = 0; i < this.maxCoins; i++) {
      this.coins.push(new Coin(this));
    }

    // Reset and spawn non-boss enemies
    if (this.doEnemies) this.enemies.init();

    // Reset and restart wormholes
    if (this.doWormholes) this.wormholes.init();

    // Initialize boss if boss level
    if (this.level % 5 === 0 && this.doBoss) {
      const bosses = [Boss, BiomechLeviathan, CyberDragon, TemporalSerpent];
      const bossIndex = Math.floor((level - 5) / 5) % bosses.length;
      this.boss = new bosses[bossIndex](this);
      this.music.setTrack(this.boss.music);
    } else {
      if (this.boss) this.boss = null;
      this.music.setTrack(this.music.tracks.background);
    }

    // Infinite time on boss levels
    this.countdown = this.boss ? Infinity : this.levelDuration / 1000;
  }

  addArrowIndicator(target) {
    const arrow = new ArrowIndicator(this, target);
    this.arrowIndicators.push(arrow);
  }

  handleGameControls() {
    // Toggle debug mode
    if (this.controls.keys.debug.justPressed()) {
      this.debug = !this.debug;
      this.controls.codes.invincibility.enabled = this.debug;
      this.controls.codes.unlimitedAmmo.enabled = this.debug;
      this.controls.codes.unlimitedBoost.enabled = this.debug;
    }

    // Toggle pause menu
    if (this.controls.keys.pause.justPressed()) {
      this.menu.toggleMenu();
    }

    // Back out of a menu option to main menu with Escape
    if (this.controls.keys.esc.justPressed() && this.menu.isOpen) {
      menuBack();
    }

    // Restart game
    if (this.controls.keys.restart.justPressed() || (this.isGameOver && this.controls.keys.bomb.justPressed())) {
      this.resetGame(false);
    }
  }

  crateStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push(new Star(this));
    }
  }

  // Main game loop
  render(ctx, deltaTime) {
    this.draw(ctx);
    this.update(deltaTime);
    this.deleteOldObjects();
    this.music.update();
  }

  draw(ctx) {
    this.stars.forEach((star) => star.draw(ctx));
    this.coins.forEach((coin) => coin.draw(ctx));
    this.wormholes.draw(ctx);
    if (this.boss) this.boss.draw(ctx);
    this.enemies.draw(ctx);
    this.effects.forEach((effect) => effect.draw(ctx));
    this.powerUps.draw(ctx);
    if (this.ally) this.ally.draw(ctx);
    this.player.draw(ctx);
    this.GUI.draw(ctx);
    this.arrowIndicators.forEach(arrow => arrow.draw(ctx));

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


  update(deltaTime) {
    if (!this.isGameOver) {
      this.stars.forEach((star) => star.update(deltaTime));
      this.coins.forEach((coin) => coin.update(deltaTime));
      this.wormholes.update(deltaTime);
      if (this.boss) this.boss.update(deltaTime);
      this.enemies.update(deltaTime);
      this.effects.forEach((effect) => effect.update(deltaTime));
      this.powerUps.update(deltaTime);
      if (this.ally) this.ally.update(deltaTime);
      this.player.update(deltaTime);
      this.levelUpdate(deltaTime);
      this.arrowIndicators.forEach(arrow => arrow.update());
    }
  }

  deleteOldObjects() {
    this.coins = this.coins.filter((coin) => !coin.markedForDeletion);
    if (this.boss && this.boss.markedForDeletion) this.boss = null;
    if (this.ally && this.ally.markedForDeletion && this.ally.projectiles.length === 0) {
      this.ally = null;
      this.allyNextSpawnTime = 0;
    }
    this.effects = this.effects.filter((effect) => !effect.markedForDeletion);
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

  levelUpdate(deltaTime) {
    if (!this.boss) {
      // Countdown if not a boss level
      const elapsedTime = this.timestamp - this.levelStartTime;
      this.countdown = Math.max(0, ((this.levelDuration - elapsedTime) / 1000).toFixed(1));

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
    this.sounds.collision.play();
  }

  cloneSound(sound) {
    if (!(sound instanceof Audio)) return;
    const clone = sound.cloneNode();
    clone.volume = this.music.fxVol;
    clone.play();
  }
}
