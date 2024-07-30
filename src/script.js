import Player from './assets/scripts/Player.js';
import GUI from './assets/scripts/GUI.js';
import Star from './assets/scripts/Star.js';
import Coin from './assets/scripts/Coin.js';

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = [];
    this.isMenuOpen = false;
    this.gameOver = false;
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
    this.GUI = new GUI(this);
    this.projectiles = [];

    this.stars = [];
    for (let i = 0; i < 150; i++) {
      this.stars.push(new Star(this));
    }

    this.coins = [];
    this.topMargin = 120;
    for (let i = 0; i < 5; i++) {
      this.coins.push(new Coin(this));
    }

    this.titleScreenImage = new Image();
    this.titleScreenImage.src = 'assets/images/title_screen.png';

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
    });

    window.addEventListener('keyup', (e) => {
      const index = this.keys.indexOf(e.key);
      if (index > -1) this.keys.splice(index, 1);
    });

    // Gamepad listeners
  }

  render(ctx, deltaTime) {
    /* DRAW */
    this.stars.forEach((star) => star.draw(ctx)); // Draw stars before other elements
    this.coins.forEach((coin) => coin.draw(ctx));
    this.player.draw(ctx);
    this.GUI.draw(ctx); // Draw the GUI last so it is always on top

    /* UPDATE */
    this.stars.forEach((star) => star.update());
    this.player.update(deltaTime);
  }
}

let lastTimestamp = 0; // milliseconds

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1200;
  canvas.height = 700;

  const game = new Game(canvas);

  function loop(timestamp) {
    let deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!game.isMenuOpen) {
      game.render(ctx, deltaTime);
    } else {
      // TODO: Loop through all sounds and pause

      // Draw title screen
      ctx.drawImage(game.titleScreenImage, 0, 0, canvas.width, canvas.height);

      // Draw PAUSED text
      ctx.fillStyle = 'white';
      ctx.font = '40px "Press Start 2P", cursive';
      const text = 'PAUSED';
      const textWidth = ctx.measureText(text).width;
      const x = (canvas.width - textWidth) * 0.5;
      const y = canvas.height / 3;
      ctx.fillText(text, x, y);
    }
    requestAnimationFrame(loop);
  }

  loop();
});
