export function spawnOffScreenRandomSide(object, extraMargin = 0) {
  const side = Math.floor(Math.random() * 4);

  switch (side) {
    case 0: // Enter from left
      object.x = -object.width * 0.5 - extraMargin;
      object.y = Math.random() * object.game.canvas.height;
      break;
    case 1: // Enter from right
      object.x = object.game.canvas.width + object.height * 0.5 + extraMargin;
      object.y = Math.random() * object.game.canvas.height;
      break;
    case 2: // Enter from top
      object.x = Math.random() * object.game.canvas.width;
      object.y = -object.height * 0.5 - extraMargin;
      break;
    case 3: // Enter from bottom
      object.x = Math.random() * object.game.canvas.width;
      object.y = object.game.canvas.height + object.height * 0.5 + extraMargin;
      break;
  }

  return side;
}

export function getRandomDirection() {
  const directions = ['right', 'down', 'left', 'up'];
  return directions[Math.floor(Math.random() * directions.length)];
}

export function getRandomYwithMargin(game, margin) {
  return Math.random() * (game.canvas.height - game.topMargin - margin * 2) + game.topMargin + margin;
}

export function getRandomInterval(min, max) {
  return Math.random() * (max - min) + min;
}

