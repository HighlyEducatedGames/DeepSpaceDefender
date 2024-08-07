import Game from './assets/scripts/Game.js';

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1200;
  canvas.height = 700;

  const game = new Game(canvas);
  let now = 0;

  function loop(timestamp = 0) {
    now = performance.now(); // First to accurately calculate tick time
    let deltaTime = timestamp - game.timestamp;
    game.timestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.controls.update(); // Update all player inputs
    game.handleMainGameControls();

    if (!game.menu.isOpen) {
      // Main game play render
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

    const delay = Math.max(0, game.targetFrameDuration - (now - game.timestamp));
    setTimeout(() => {
      requestAnimationFrame(loop);
    }, delay);

    game.tickMs = performance.now() - now; // Last to accurately calculate tick time
  }

  loop();
});
