export default {
  up: {
    keyboard: ['ArrowUp', 'w', 'W'],
    controller: {
      buttons: [7], // Right Trigger
    },
  },
  down: {
    keyboard: ['ArrowDown', 's', 'S'],
    controller: {
      buttons: [6], // Left Trigger
    },
  },
  left: {
    keyboard: ['ArrowLeft', 'a', 'A'],
    controller: {
      buttons: [14], // Dpad LEFT
      axis: [],
    },
  },
  right: {
    keyboard: ['ArrowRight', 'd', 'D'],
    controller: {
      buttons: [15], // Dpad RIGHT
      axis: [],
    },
  },
  fire: {
    keyboard: [' '],
    controller: {
      buttons: [0], // A
    },
  },
  boost: {
    keyboard: ['x', 'X'],
    controller: {
      buttons: [2], // X
    },
  },
  bomb: {
    keyboard: ['b', 'B'],
    controller: {
      buttons: [1, 4], // B - Left Bumper
    },
  },
  missile: {
    keyboard: ['h', 'H'],
    controller: {
      buttons: [3, 5], // Y - Right Bumper
    },
  },
  pause: {
    keyboard: ['m', 'M', 'Pause'],
    controller: {
      buttons: [9], // Start
    },
  },
  restart: {
    keyboard: ['r', 'R'],
    controller: {
      buttons: [8], // Menu
    },
  },
  debug: {
    keyboard: ['Delete'],
    controller: {
      buttons: [16], // X-Box button
    },
  },
  esc: {
    keyboard: ['Escape'],
  },
};

// X-Box Controller Buttons
// 0 = A
// 1 = B
// 2 = X
// 3 = Y
// 4 = Left Bumper
// 5 = Right Bumper
// 6 = Left Trigger
// 7 = Right Trigger
// 8 = Menu
// 9 = Start
// 10 = Left Stick
// 11 = Right Stick
// 12 = Dpad UP
// 13 = Dpad DOWN
// 14 = Dpad LEFT
// 15 = Dpad RIGHT
// 16 = X-Box button
