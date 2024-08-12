/* global PAGE_LOADING */
import Game from './assets/scripts/Game.js';

window.addEventListener('load', () => {
  PAGE_LOADING = false;
  document.getElementById('loadingCanvas').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  document.getElementById('menu-container').style.display = 'block';
  document.getElementById('menu').style.display = 'block';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1280;
  canvas.height = 720;

  const game = new Game(canvas);

  function animate(timestamp = 0) {
    const deltaTime = timestamp - game.timestamp;
    game.timestamp = timestamp;

    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player inputs
    game.controls.update();
    game.handleGameControls();

    if (!game.menu.isOpen) {
      // Playing the game
      game.render(ctx, deltaTime);
    } else {
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

      if (game.debug) game.GUI.drawDebug(ctx);
    }

    requestAnimationFrame(animate);

    // Store the tick time for debug text
    game.tickMs = performance.now() - game.timestamp;
  }

  animate();
});
