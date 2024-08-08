/* global menuBack */
import Controls from './controls/Controls.js';
import GUI from './GUI.js';
import Menu from './Menu.js';
import MusicController from './MusicController.js';
import PowerUpManager from './powerUps/PowerUpManager.js';
import Player from './Player.js';
import Coin from './Coin.js';
import Star from './Star.js';
import Boss from './bosses/Boss.js';
import BiomechLeviathan from './bosses/BiomechLeviathan.js';
import TemporalSerpent from './bosses/TemporalSerpent.js';
import CyberDragon from './bosses/CyberDragon.js';
import Ally from './Ally.js';

export default class Game {
  constructor(canvas) {
    this.debug = false;
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.controls = new Controls(this);
    this.GUI = new GUI(this);
    this.menu = new Menu(this);
    this.music = new MusicController(this);
    this.powerUps = new PowerUpManager(this);
    this.topMargin = 120;
    this.boss = null;
    this.tickMs = null;
    this.targetFPS = 60;
    this.targetFrameDuration = 1000 / this.targetFPS;
    this.timestamp = 0;

    this.images = {
      title: new Image(),
    };
    this.images.title.src = 'assets/images/title_screen.png';

    this.crateStars();
    this.resetGame();
    console.log(this);
  }

  // Set any properties here that needs to be reset on game over or game reset
  resetGame(showMenu = true) {
    if (showMenu) this.menu.showMenu();
    this.isGameOver = false;
    this.score = 0;
    this.player = new Player(this);

    this.startLevel(1);
  }

  // Set any properties here that reset on a new level
  startLevel(level) {
    this.level = level;
    this.levelStartTime = performance.now();
    this.levelDuration = 30000;
    this.effects = [];
    this.enemies = []; // TODO: enemy manager and limiting enemies as a conditional to not have too many on screen
    this.projectiles = [];
    this.player.stopPlayerMovement();

    // Reset Ally
    this.ally = null;
    this.allySpawnTime = 0;
    this.allyInterval = 60000;
    this.allyWarningTime = 3000;

    // Add new coins to this level
    this.coins = [];
    for (let i = 0; i < 5; i++) {
      this.coins.push(new Coin(this));
    }

    // Initialize boss if boss level
    if (this.level % 5 === 0) {
      const bosses = [Boss, BiomechLeviathan, CyberDragon, TemporalSerpent];
      const bossIndex = Math.floor((level - 5) / 5) % bosses.length;
      this.boss = bosses[bossIndex];
      this.music.setTrack(this.boss.music);
    } else {
      if (this.boss) this.boss = null;
      this.music.setTrack(this.music.tracks.background);
    }

    // Infinite time on boss levels
    this.countdown = this.boss ? Infinity : this.levelDuration / 1000; // TODO: why not just use seconds??

    // // TODO use overlapping logic to prevent enemy overlaps
    // this.maxEnemies = 0;
    // this.maxTankEnemies = 0;
    // this.maxStealthEnemies = 0;
    // for (let i = 0; i < this.maxEnemies; i++) {
    //   this.enemies.push(new RegularEnemy(this));
    // }
    // for (let i = 0; i < this.maxStealthEnemies; i++) {
    //   // if (level % 5 === 0 || level <= 10) return;// TODO: Only spawn if over level 10 and not on a boss level
    //   this.enemies.push(new StealthEnemy(this));
    // }
    // for (let i = 0; i < this.maxTankEnemies; i++) {
    //   // if (level % 5 === 0 || level <= 5) return; // TODO: Only spawn if iver level 5 and not on boss level
    //   this.enemies.push(new TankEnemy(this));
    // }

    // this.powerUps = {
    //   boost: { isActive: false },
    // };
    // this.isUnlimitedBoostActivated = false;

    // Clear existing timeouts
    // enemyRespawnTimeouts.forEach((timeout) => clearTimeout(timeout));
    // enemyRespawnTimeouts = [];

    // // Clear Tractor beam
    // if (tractorBeam) {
    //   tractorBeam.active = false;
    //   tractorBeam.startX = 0;
    //   tractorBeam.startY = 0;
    //   tractorBeam.endX = 0;
    //   tractorBeam.endY = 0;
    //   tractorBeam.strength = 0;
    //   tractorBeam = null;
    // }
    // tractorBeamCooldown = false;

    // // Clear serpent segments
    // clearSerpentSegments();
    // resetPowerUpTimers();
    // initWormholes(level);
  }

  handleMainGameControls() {
    // Toggle debug mode
    if (this.controls.keys.debug.justPressed()) {
      this.debug = !this.debug;
      this.controls.codes.invincibility.enabled = this.debug;
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
    const numStars = 50;
    const parallaxLayers = 3;
    this.stars = [];
    for (let i = 0; i < numStars; i++) {
      this.stars.push(new Star(this, parallaxLayers));
    }
  }

  render(ctx, deltaTime) {
    const bossProjectiles = this.boss ? this.boss.projectiles : [];
    this.projectiles = [this.player.projectiles, bossProjectiles];
    this.effects.forEach((effect) => {
      if (effect.particles) this.projectiles.push(effect.particles);
    });

    this.draw(ctx);
    this.update(deltaTime);
    this.deleteOldObjects();
    this.music.update();
  }

  draw(ctx) {
    this.stars.forEach((star) => star.draw(ctx));
    this.coins.forEach((coin) => coin.draw(ctx));
    this.projectiles.forEach((projectileArray) => {
      projectileArray.forEach((projectile) => projectile.draw(ctx));
    });
    this.enemies.forEach((enemy) => enemy.draw(ctx));
    if (this.boss) this.boss.draw(ctx);
    this.powerUps.draw(ctx);
    this.player.draw(ctx);
    this.GUI.draw(ctx);

    // Game over text
    if (this.game.isGameOver) {
      const centerX = this.game.canvas.width * 0.5;
      const centerY = this.game.canvas.height * 0.5;
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
  }

  update(deltaTime) {
    if (!this.isGameOver) {
      this.stars.forEach((star) => star.update(deltaTime));
      this.coins.forEach((coin) => coin.update(deltaTime));
      this.projectiles.forEach((projectileArray) => {
        projectileArray.forEach((projectile) => projectile.update(deltaTime));
      });
      this.enemies.forEach((enemy) => enemy.update(deltaTime));
      if (this.boss) this.boss.update(deltaTime);
      this.powerUps.update(deltaTime);
      this.player.update(deltaTime);
      this.effects.forEach((effect) => effect.update(deltaTime));

      this.levelUpdate();
    }
  }

  deleteOldObjects() {
    this.coins.forEach((coin, index) => {
      if (coin.markedForDeletion) this.coins.splice(index, 1);
    });
    for (let i = 0; i < this.projectiles.length; i++) {
      for (let j = 0; j < this.projectiles[i].length; j++) {
        if (this.projectiles[i][j].markedForDeletion) this.projectiles[i].splice(j, 1);
      }
    }
    this.enemies.forEach((enemy, index) => {
      if (enemy.markedForDeletion) this.enemies.splice(index, 1);
    });
    if (this.boss && this.boss.markedForDeletion) this.boss = null;
    this.effects.forEach((effect, index) => {
      if (effect.markedForDeletion) this.effects.splice(index, 1);
    });
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

  levelUpdate() {
    if (!this.boss) {
      // Countdown if not a boss level
      const elapsedTime = performance.now() - this.levelStartTime;
      this.countdown = Math.max(0, ((this.levelDuration - elapsedTime) / 1000).toFixed(1));

      // Advance to next level if time over, or if all coins collected and enemies killes
      if (elapsedTime >= this.levelDuration || (this.coins.length === 0 && this.enemies.length === 0)) {
        if (this.coins.length === 0 && this.enemies.length === 0) {
          // Give points to player for completing the level with time to spare
          this.player.addScore(Math.floor(this.countdown) * 5);
        }
        this.nextLevel();
      }
    }

    // Check if it's time to spawn the ally
    if (this.timestamp > this.allySpawnTime + this.allyInterval) {
      this.allySpawnTime = this.timestamp;
      const ally = new Ally(this);
      ally.sounds.warning.cloneNode().play();
      setTimeout(() => {
        this.ally = ally;
      }, this.allyWarningTime);
    }
  }

  outOfBounds(object, extraMargin = 0) {
    const radius = (object.radius || object.width * 0.5) + extraMargin;
    return (
      object.x + radius < 0 ||
      object.x - radius > this.canvas.width ||
      object.y + radius < 0 ||
      object.y - radius > this.canvas.height
    );
  }
}
