/* global menuBack, updateMenuText */

class Controls {
  constructor(game) {
    this.game = game;
    this.keys = {};
    this.gamepadIndex = null;
    this.prevGamepadState = {};
    this.usingGamepad = {
      _value: false,
      get value() {
        return this._value;
      },
      set value(newValue) {
        if (this._value !== newValue) {
          this._value = newValue;
          updateMenuText(newValue);
        }
      },
    };
    this.codes = {
      invincibility: {
        code: ['i', 'd', 'd', 'q', 'd'],
        index: 0,
        enabled: false,
      },
      unlimitedAmmo: {
        code: ['i', 'd', 'f', 'a'],
        index: 0,
        enabled: false,
      },
      unlimitedBoost: {
        code: ['i', 'd', 'b', 'o', 'o', 's', 't'],
        index: 0,
        enabled: false,
      },
    };

    updateMenuText(this.usingGamepad.value);

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      this.usingGamepad.value = false;
      this.handleKeyDown(e);
    });
    window.addEventListener('keyup', (e) => {
      this.usingGamepad.value = false;
      this.handleKeyUp(e);
    });

    // Gamepad connection listeners
    window.addEventListener('gamepadconnected', (e) => {
      this.usingGamepad.value = true;
      this.gamepadIndex = e.gamepad.index;
      this.prevGamepadState[this.gamepadIndex] = {
        buttons: [],
        axes: [],
      };
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.usingGamepad.value = false;
      delete this.prevGamepadState[this.gamepadIndex];
      this.gamepadIndex = null;
    });
  }

  isPressed(key) {
    return this.keys[key];
  }

  justPressed(key) {
    return this.keys[key] && this.keys[key].firstFrame;
  }

  handleGamepadInput() {
    if (this.gamepadIndex === null) {
      this.usingGamepad.value = false;
      return;
    }

    const gamepad = navigator.getGamepads()[this.gamepadIndex];
    if (!gamepad) {
      this.usingGamepad.value = false;
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
      this.game.resetGame();
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
      this.game.resetGame();
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
      this.usingGamepad.value = true;
    }

    // Save the current state for the next frame
    this.prevGamepadState[this.gamepadIndex].buttons = buttons;
    this.prevGamepadState[this.gamepadIndex].axes = [leftStickX];
  }

  wasGamepadPressed(index) {
    return this.prevGamepadState[this.gamepadIndex].buttons[index];
  }

  update() {
    // Set any existing keys with true to false signifying the inout is no longer on the first frame discovered
    /*for (const key in this.keys) {
      if (this.keys[key].firstFrame) this.keys[key].firstFrame = false;
    }*/
  }

  handleKeyDown(e) {
    // Track keys
    if (this.keys[e.key]) {
      if (this.keys[e.key].firstFrame) this.keys[e.key] = { firstFrame: false };
    } else {
      this.keys[e.key] = { firstFrame: true };
    }

    // Toggle debug mode
    if (this.isPressed('Delete')) {
      this.game.debug = !this.game.debug;
      this.codes.invincibility.enabled = this.game.debug;
    }

    // Menu
    if (this.isPressed('m') || this.isPressed('M')) {
      this.game.menu.toggleMenu();
    }

    // Back out of menu option to main menu with Escape
    if (this.isPressed('Escape') && this.game.menu.isOpen) {
      menuBack();
    }

    // Restart game if game over
    if (this.game.gameOver && (this.isPressed('b') || this.isPressed('B'))) {
      this.game.resetGame();
    }

    // Check for codes
    for (const key in this.codes) {
      const code = this.codes[key];
      if (e.key === code.code[code.index]) {
        code.index++;
        if (code.index === code.code.length) {
          code.enabled = !code.enabled;
          code.index = 0;
        }
      } else {
        code.index = 0;
      }
    }
  }

  handleKeyUp(e) {
    // Track keys
    if (this.keys[e.key]) delete this.keys[e.key];
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
