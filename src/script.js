/* global menuBack */
import Player from './assets/scripts/Player.js';
import GUI from './assets/scripts/GUI.js';
import Star from './assets/scripts/Star.js';
import Coin from './assets/scripts/Coin.js';
import Controls from './assets/scripts/controls/Controls.js';
import Menu from './assets/scripts/Menu.js';
import { RegularEnemy, StealthEnemy, TankEnemy } from './assets/scripts/enemies/BasicEnemies.js';
import BiomechLeviathan from './assets/scripts/bosses/BiomechLeviathan.js';
import MusicController from './assets/scripts/MusicController.js';
import Boss from './assets/scripts/bosses/Boss.js';
import CyberDragon from './assets/scripts/bosses/CyberDragon.js';
import TemporalSerpent from './assets/scripts/bosses/TemporalSerpent.js';

class Game {
  constructor(canvas) {
    this.debug = false;
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.controls = new Controls(this);
    this.GUI = new GUI(this);
    this.menu = new Menu(this);
    this.music = new MusicController(this);
    this.topMargin = 120;
    this.boss = new CyberDragon(this);
    this.tickMs = null;
    this.targetFPS = 60;
    this.targetFrameDuration = 1000 / this.targetFPS;

    this.images = {
      title: new Image(),
    };
    this.images.title.src = 'assets/images/title_screen.png';

    // Instantiate resettable properties
    this.resetGame();
    console.log(this);
  }

  // Put any property instantiation here that needs to be reset on game over or reset
  resetGame(showMenu = true) {
    if (showMenu) this.menu.showMenu();
    this.isGameOver = false;
    this.score = 0;
    this.level = 1;
    this.levelStartTime = 0;
    this.levelDuration = 30000;
    this.countdown = this.levelDuration / 1000;
    this.effects = [];
    this.powerUps = {
      boost: { isActive: false },
    };
    this.isUnlimitedBoostActivated = false;

    this.player = new Player(this);
    this.projectiles = [];

    const numStars = 50;
    const starLayers = 3;
    this.stars = [];
    for (let i = 0; i < numStars; i++) {
      this.stars.push(new Star(this, starLayers));
    }

    this.coins = [];
    for (let i = 0; i < 5; i++) {
      this.coins.push(new Coin(this));
    }

    this.enemies = []; // TODO: enemy manager and limiting enemies as a conditional to not have too many on screen
    // TODO use overlapping logic to prevent enemy overlaps
    this.maxEnemies = 0;
    this.maxTankEnemies = 0;
    this.maxStealthEnemies = 0;
    for (let i = 0; i < this.maxEnemies; i++) {
      this.enemies.push(new RegularEnemy(this));
    }
    for (let i = 0; i < this.maxStealthEnemies; i++) {
      // if (level % 5 === 0 || level <= 10) return;// TODO: Only spawn if over level 10 and not on a boss level
      this.enemies.push(new StealthEnemy(this));
    }
    for (let i = 0; i < this.maxTankEnemies; i++) {
      // if (level % 5 === 0 || level <= 5) return; // TODO: Only spawn if iver level 5 and not on boss level
      this.enemies.push(new TankEnemy(this));
    }
  }

  startLevel(level) {
    this.level = level;
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

    // Back out of menu option to main menu with Escape
    if (this.controls.keys.esc.justPressed() && this.menu.isOpen) {
      menuBack();
    }

    // Restart game
    if (this.controls.keys.restart.justPressed() || (this.isGameOver && this.controls.keys.bomb.justPressed())) {
      this.resetGame(false);
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
    this.music.update();
    this.deleteOldObjects();
  }

  draw(ctx) {
    this.stars.forEach((star) => star.draw(ctx)); // Draw stars before other elements
    this.coins.forEach((coin) => coin.draw(ctx));
    this.projectiles.forEach((projectileArray) => {
      projectileArray.forEach((projectile) => projectile.draw(ctx));
    });
    this.enemies.forEach((enemy) => enemy.draw(ctx));
    if (this.boss) this.boss.draw(ctx);
    this.player.draw(ctx);
    this.GUI.draw(ctx); // Draw the GUI last so it is always on top
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
      this.player.update(deltaTime);
      this.effects.forEach((effect) => effect.update(deltaTime));
    }
  }

  deleteOldObjects() {
    /* DELETE OLD OBJECTS */
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
    // this.stopMusic(this.music.background);
    // if (this.boss && this.boss.music) this.stopMusic(this.boss.music);
    // this.startMusic(this.music.gameOver);
  }

  nextLevel() {
    this.startLevel(this.level + 1);
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

let lastTimestamp = 0; // milliseconds
let now = null;

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1200;
  canvas.height = 700;

  const game = new Game(canvas);

  function loop(timestamp = 0) {
    now = performance.now(); // First to accurately calculate tick time
    let deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.controls.update(); // Update all player inputs
    game.handleMainGameControls();

    if (!game.menu.isOpen) {
      game.render(ctx, deltaTime);
    } else {
      // TODO: Loop through all sounds and pause, but background is already getting paused in the menu class

      // Draw title screen
      ctx.drawImage(game.images.title, 0, 0, canvas.width, canvas.height);

      // Draw PAUSED text
      ctx.fillStyle = 'white';
      ctx.font = '40px "Press Start 2P", cursive';
      const text = 'PAUSED';
      const textWidth = ctx.measureText(text).width;
      const x = (canvas.width - textWidth) * 0.5;
      const y = canvas.height / 3;
      ctx.fillText(text, x, y);
    }

    const delay = Math.max(0, game.targetFrameDuration - (performance.now() - timestamp));
    setTimeout(() => {
      requestAnimationFrame(loop);
    }, delay);

    game.tickMs = performance.now() - now; // Last to accurately calculate tick time
  }

  loop();
});
