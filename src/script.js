/* global loaded */
import Game from './assets/scripts/Game.js';

// Show the loading page for a period of time before initializing the game
// Either all the assets load in this time and we wait out the duration, or the loading time is longer and we switch once ready
const initTime = performance.now();
const wait = 1000;
window.addEventListener('load', () => {
  const diff = performance.now() - initTime;
  setTimeout(() => {
    loaded();
    initGame();
  }, wait - diff);
});

function initGame() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1280;
  canvas.height = 720;

  const game = new Game(canvas);

  function animate(timestamp = 0) {
    const deltaTime = timestamp - game.timestamp;
    game.timestamp = timestamp;
    game.frame++;

    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player inputs
    game.controls.update();

    if (!game.menu.isOpen) {
      // Playing the game
      game.render(ctx, deltaTime);
    } else {
      // Draw title screen
      ctx.drawImage(game.images.title, 0, 0, canvas.width, canvas.height);

      if (game.paused) {
        // Draw PAUSED text
        ctx.fillStyle = 'white';
        ctx.font = '40px "Press Start 2P", cursive';
        const text = 'PAUSED';
        const textWidth = ctx.measureText(text).width;
        const x = (canvas.width - textWidth) * 0.5;
        const y = canvas.height / 3;
        ctx.fillText(text, x, y);
      }

      if (game.debug) game.GUI.drawDebug(ctx);
    }

    requestAnimationFrame(animate);

    // Store the tick time for debug text
    game.tickMs = performance.now() - game.timestamp;
  }

  animate();
}
