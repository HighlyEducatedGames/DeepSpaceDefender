export function getOffScreenRandomSide(object, extraMargin = 0) {
  const side = Math.floor(Math.random() * 4);
  let x, y;

  switch (side) {
    case 0: // left
      x = -object.width * 0.5 - extraMargin;
      y = Math.random() * object.game.height;
      break;
    case 1: // right
      x = object.game.width + object.height * 0.5 + extraMargin;
      y = Math.random() * object.game.height;
      break;
    case 2: // top
      x = Math.random() * object.game.width;
      y = -object.height * 0.5 - extraMargin;
      break;
    case 3: // bottom
      x = Math.random() * object.game.width;
      y = object.game.height + object.height * 0.5 + extraMargin;
      break;
  }
  return { x, y, side };
}

export function getRandomDirection() {
  const directions = ['right', 'down', 'left', 'up'];
  return directions[Math.floor(Math.random() * directions.length)];
}

export function getRandomInterval(min, max) {
  return Math.random() * (max - min) + min;
}
