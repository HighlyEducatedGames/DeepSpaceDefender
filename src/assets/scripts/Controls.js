class Controls {
  constructor(game) {
    this.game = game;
    this.keys = [];
    this.gamepadIndex = null;
    this.prevGamepadState = {};
    this.usingGamepad = false;

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      this.usingGamepad = false;
      this.handleKeyDown(e);
    });
    window.addEventListener('keyup', (e) => {
      this.usingGamepad = false;
      this.handleKeyUp(e);
    });

    // Gamepad connection listeners
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadIndex = e.gamepad.index;
      this.prevGamepadState[this.gamepadIndex] = {
        buttons: [],
        axes: [],
      };
    });

    window.addEventListener('gamepaddisconnected', () => {
      delete this.prevGamepadState[this.gamepadIndex];
      this.gamepadIndex = null;
    });
  }

  isPressed(key) {
    return this.keys.indexOf(key) > -1;
  }

  handleGamepadInput() {
    if (this.gamepadIndex === null) {
      this.usingGamepad = false;
      return;
    }

    const gamepad = navigator.getGamepads()[this.gamepadIndex];
    if (!gamepad) {
      this.usingGamepad = false;
      return;
    }

    const buttons = gamepad.buttons.map((button) => button.pressed);
    const leftTrigger = gamepad.buttons[6].value > 0.1; // Adjusted to > 0.1 to detect any press
    const rightTrigger = gamepad.buttons[7].value > 0.1; // Adjusted to > 0.1 to detect any press
    const leftStickX = gamepad.axes[0];
    const dpadLeft = buttons[14];
    const dpadRight = buttons[15];
    const leftBumper = buttons[4]; // LB button
    const rightBumper = buttons[5]; // RB button

    // Fire button (A button)
    if (buttons[0] && !this.wasGamepadPressed(0)) {
      this.handleKeyDown({ key: ' ' });
    } else if (!buttons[0] && this.wasGamepadPressed(0)) {
      this.handleKeyUp({ key: ' ' });
    }

    // Bomb button (B button)
    if (buttons[1] && !this.wasGamepadPressed(1)) {
      this.handleKeyDown({ key: 'b' });
    } else if (!buttons[1] && this.wasGamepadPressed(1)) {
      this.handleKeyUp({ key: 'b' });
    } else if (buttons[1] && this.game.gameOver) {
      this.game.restartGame();
    }

    // Boost button (X button)
    if (buttons[2] && !this.wasGamepadPressed(2)) {
      this.handleKeyDown({ key: 'x' });
    } else if (!buttons[2] && this.wasGamepadPressed(2)) {
      this.handleKeyUp({ key: 'x' });
    }

    // Homing Missile button (Y button)
    if (buttons[3] && !this.wasGamepadPressed(3)) {
      this.handleKeyDown({ key: 'h' });
    } else if (!buttons[3] && this.wasGamepadPressed(3)) {
      this.handleKeyUp({ key: 'h' });
    }

    // Bomb button (LB button)
    if (leftBumper && !this.wasGamepadPressed(4)) {
      this.handleKeyDown({ key: 'b' });
    } else if (!leftBumper && this.wasGamepadPressed(4)) {
      this.handleKeyUp({ key: 'b' });
    }

    // Homing Missile button (RB button)
    if (rightBumper && !this.wasGamepadPressed(5)) {
      this.handleKeyDown({ key: 'h' });
    } else if (!rightBumper && this.wasGamepadPressed(5)) {
      this.handleKeyUp({ key: 'h' });
    }

    // Thrust (Right Trigger)
    if (rightTrigger) {
      if (!this.isPressed('ArrowUp')) {
        this.handleKeyDown({ key: 'ArrowUp' });
      }
    } else {
      if (this.isPressed('ArrowUp')) {
        this.handleKeyUp({ key: 'ArrowUp' });
      }
    }

    // Reverse (Left Trigger)
    if (leftTrigger) {
      if (!this.isPressed('ArrowDown')) {
        this.handleKeyDown({ key: 'ArrowDown' });
      }
    } else {
      if (this.isPressed('ArrowDown')) {
        this.handleKeyUp({ key: 'ArrowDown' });
      }
    }

    // Refresh button (Menu button)
    if (buttons[8] && !this.wasGamepadPressed(8)) {
      location.reload(); // Refresh the browser
    }

    // Pause button (Start button)
    if (buttons[9] && !this.wasGamepadPressed(9)) {
      this.handleKeyDown({ key: 'm' });
    } else if (!buttons[9] && this.wasGamepadPressed(9)) {
      this.handleKeyUp({ key: 'm' });
    }

    // Rotate left (Left Stick or D-pad left)
    if (leftStickX < -0.5 || dpadLeft) {
      this.handleKeyDown({ key: 'ArrowLeft' });
    } else {
      this.handleKeyUp({ key: 'ArrowLeft' });
    }

    // Rotate right (Left Stick or D-pad right)
    if (leftStickX > 0.5 || dpadRight) {
      this.handleKeyDown({ key: 'ArrowRight' });
    } else {
      this.handleKeyUp({ key: 'ArrowRight' });
    }

    // Determine if the gamepad is being used by comparing
    // the previous gamepad array state and the current gamepad array state
    if (
      !this.arraysEqual(this.prevGamepadState[this.gamepadIndex].buttons, buttons) ||
      !this.arraysEqual(this.prevGamepadState[this.gamepadIndex].axes, [leftStickX])
    ) {
      this.usingGamepad = true;
    }

    // Save the current state for the next frame
    this.prevGamepadState[this.gamepadIndex].buttons = buttons;
    this.prevGamepadState[this.gamepadIndex].axes = [leftStickX];
  }

  wasGamepadPressed(index) {
    return this.prevGamepadState[this.gamepadIndex].buttons[index];
  }

  handleKeyDown(e) {
    if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
  }

  handleKeyUp(e) {
    const index = this.keys.indexOf(e.key);
    if (index > -1) this.keys.splice(index, 1);
  }

  // Check if 2 arrays contain the same data, not by reference, but by values
  arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
}

export default Controls;
