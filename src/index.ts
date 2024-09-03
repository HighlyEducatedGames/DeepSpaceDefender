import Game from './Game';

// Show the loading page for a period of time before initializing the game
// Either all the assets load in this time, and we wait out the duration, or the loading time is longer and we switch once ready
const initTime = performance.now();
const wait = 2000;
window.addEventListener('load', () => {
  const diff = performance.now() - initTime;
  setTimeout(() => {
    loaded();
    initGame();
  }, wait - diff);
});

function initGame() {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CTX;
  canvas.width = 1280;
  canvas.height = 720;

  const game = new Game(canvas);
  let isFocused = true;
  let lastTimestamp = 0;

  function animate(timestamp = 0) {
    if (!isFocused) return; // Stop the animation if the tab is not focused
    const start = performance.now();
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateGame(game, ctx, deltaTime);
    requestAnimationFrame(animate);
    game.tickMs = performance.now() - start;
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      isFocused = false;
      game.music.pause();
      game.music.stopAllFx();
    } else {
      lastTimestamp = performance.now(); // Reset timestamp to prevent large deltaTime
      isFocused = true;
      game.music.play();
      requestAnimationFrame(animate); // Restart the animation loop
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange);

  animate();
}

function updateGame(game: Game, ctx: CTX, deltaTime: number) {
  // Update current user inputs
  game.inputs.update(deltaTime);
  game.handleGameControls();

  if (game.paused) {
    drawPausedScreen(game, ctx);
  } else {
    game.frame++;
    game.render(ctx, deltaTime);
  }

  if (game.debug) game.GUI.drawDebug(ctx);
}

function drawPausedScreen(game: Game, ctx: CTX) {
  ctx.drawImage(game.images.title, 0, 0, game.width, game.height);

  if (game.frame > 0) {
    ctx.fillStyle = 'white';
    ctx.font = '40px "Press Start 2P", cursive';
    const text = 'PAUSED';
    const textWidth = ctx.measureText(text).width;
    const x = (ctx.canvas.width - textWidth) * 0.5;
    const y = ctx.canvas.height / 3;
    ctx.fillText(text, x, y);
  }
}
