/* global menuBack */
import Player from './assets/scripts/Player.js';
import GUI from './assets/scripts/GUI.js';
import Star from './assets/scripts/Star.js';
import Coin from './assets/scripts/Coin.js';
import Controls from './assets/scripts/controls/Controls.js';
import Menu from './assets/scripts/Menu.js';

class Game {
  constructor(canvas) {
    this.debug = false;
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.controls = new Controls(this);
    this.GUI = new GUI(this);
    this.menu = new Menu(this);
    this.topMargin = 120;

    this.images = {
      title: new Image(),
    };
    this.images.title.src = 'assets/images/title_screen.png';

    this.music = {
      background: new Audio('assets/audio/background-music.mp3'),
      gameOver: new Audio('assets/audio/gameOverMusic.mp3'),
    };

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

    this.stopMusic(this.music.gameOver);
  }

  handleGeneralGameControls() {
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
    if (this.controls.keys.restart.justPressed() || (this.isGameOver && this.controls.keys.bombs.justPressed())) {
      this.resetGame(false);
    }
  }

  render(ctx, deltaTime) {
    const projectiles = [this.projectiles, this.player.projectiles];
    if (this.debug) console.debug('Projectiles: ', projectiles.flat().length);

    /* DRAW */
    this.stars.forEach((star) => star.draw(ctx)); // Draw stars before other elements
    this.coins.forEach((coin) => coin.draw(ctx));
    projectiles.forEach((projectileArray) => {
      projectileArray.forEach((projectile) => projectile.draw(ctx));
    });
    this.player.draw(ctx);
    this.GUI.draw(ctx); // Draw the GUI last so it is always on top

    /* UPDATE */
    if (!this.isGameOver) {
      this.stars.forEach((star) => star.update());
      projectiles.forEach((projectileArray) => {
        projectileArray.forEach((projectile) => projectile.update(deltaTime));
      });
      this.player.update(deltaTime);
      this.coins.forEach((coin) => coin.update());
    }

    /* DELETION */
    this.coins.forEach((coin, index) => {
      if (coin.markedForDeletion) this.coins.splice(index, 1);
    });
    for (let i = 0; i < projectiles.length; i++) {
      for (let j = 0; j < projectiles[i].length; j++) {
        if (projectiles[i][j].markedForDeletion) projectiles[i].splice(j, 1);
      }
    }
  }

  checkCollision(object1, object2) {
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < object1.width * 0.5 + object2.width * 0.5;
  }

  startMusic(music) {
    music.play();
  }

  pauseMusic(music) {
    music.pause();
  }

  stopMusic(music) {
    music.pause();
    music.currentTime = 0;
  }

  gameOver() {
    this.isGameOver = true;
    this.stopMusic(this.music.background);
    // Stop any boss music // TODO
    this.startMusic(this.music.gameOver);
  }
}

let lastTimestamp = 0; // milliseconds
const targetFPS = 60;
const targetFrameDuration = 1000 / targetFPS;

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1200;
  canvas.height = 700;

  const game = new Game(canvas);

  function loop(timestamp = 0) {
    let deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.controls.update(); // Update all player inputs
    game.handleGeneralGameControls();

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

    const delay = Math.max(0, targetFrameDuration - (performance.now() - timestamp));
    setTimeout(() => {
      requestAnimationFrame(loop);
    }, delay);
  }

  loop();
});
