import Player from './assets/scripts/Player.js';
import GUI from './assets/scripts/GUI.js';
import Star from './assets/scripts/Star.js';
import Coin from './assets/scripts/Coin.js';
import Controls from './assets/scripts/Controls.js';

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = new Controls(this);
    this.GUI = new GUI(this);
    this.titleScreenImage = new Image();
    this.titleScreenImage.src = 'assets/images/title_screen.png';

    // Instantiate resettable properties
    this.resetGame();
    console.log(this);
  }

  // Put any property instantiation here that needs to be reset on game over or reset
  resetGame() {
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
    this.projectiles = [];

    const numStars = 50;
    const starLayers = 3;
    this.stars = [];
    for (let i = 0; i < numStars; i++) {
      this.stars.push(new Star(this, starLayers));
    }

    this.coins = [];
    this.topMargin = 120;
    for (let i = 0; i < 5; i++) {
      this.coins.push(new Coin(this));
    }
  }

  render(ctx, deltaTime) {
    this.keys.handleGamepadInput();

    /* DRAW */
    this.stars.forEach((star) => star.draw(ctx)); // Draw stars before other elements
    this.coins.forEach((coin) => coin.draw(ctx));
    this.player.draw(ctx);
    this.GUI.draw(ctx); // Draw the GUI last so it is always on top

    /* UPDATE */
    this.stars.forEach((star) => star.update());
    this.player.update(deltaTime);
    this.coins.forEach((coin) => coin.update());
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

    const delay = Math.max(0, targetFrameDuration - (performance.now() - timestamp));
    setTimeout(() => {
      requestAnimationFrame(loop);
    }, delay);
  }

  loop();
});
