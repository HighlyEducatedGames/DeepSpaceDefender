/* global updateMenuText */

import mappings from './mappings.js';
import Key from './Key.js';

export default class Controls {
  constructor(game) {
    this.game = game;
    this.keys = {};
    this.keyboardMap = {};
    this.controllerButtonMap = {};
    this.gamepadIndex = null;
    this.prevGamepadState = {
      buttons: [],
      axis: [],
    };
    this.triggerThreshold = 0.1;
    this.stickThreshold = 0.5;
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

    for (const key in mappings) {
      if (mappings[key].keyboard)
        mappings[key].keyboard.forEach((keyName) => {
          this.keyboardMap[keyName] = key;
          this.keys[key] = new Key(key);
        });

      if (mappings[key].controller && mappings[key].controller.buttons) {
        mappings[key].controller.buttons.forEach((buttonIndex) => {
          this.controllerButtonMap[buttonIndex] = key;
        });
      }
    }

    updateMenuText(this.usingGamepad.value);

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      this.usingGamepad.value = false;
      const keyName = this.keyboardMap[e.key];
      if (keyName) {
        const key = this.keys[keyName];
        if (!key.isPressed) {
          this.pressKey(key);
        } else {
          this.holdKey(key);
        }
      }

      this.handleCodes(e.key);
      this.handleKeyDown(e.key);
    });

    window.addEventListener('keyup', (e) => {
      this.usingGamepad.value = false;
      const keyName = this.keyboardMap[e.key];
      if (keyName) {
        const key = this.keys[keyName];
        this.releaseKey(key);
      }
      this.handleKeyUp(e.key);
    });

    // Gamepad connection listeners
    window.addEventListener('gamepadconnected', (e) => {
      this.usingGamepad.value = true;
      this.gamepadIndex = e.gamepad.index;
      this.playHaptic(200);
      this.prevGamepadState.buttons = navigator.getGamepads()[this.gamepadIndex].buttons;
      this.prevGamepadState.axis = navigator.getGamepads()[this.gamepadIndex].axes;
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.usingGamepad.value = false;
      this.gamepadIndex = null;
    });
  }

  pressKey(key) {
    key.isPressed = true;
    key.frame = 0;
    key.pressedDuration = 0;
    key.pressedAt = Date.now();
  }

  holdKey(key) {
    key.pressedDuration = Date.now() - key.pressedAt;
  }

  releaseKey(key) {
    key.isPressed = false;
  }

  update() {
    this.handleGamepadInput();
    for (const keyName in this.keys) {
      if (this.keys[keyName].isPressed) this.keys[keyName].frame++;
    }
  }

  handleKeyDown(key) {
    // Boss selector if in degug mode
    if (this.game.debug && /[1-9]/.test(key)) {
      this.game.startLevel(parseInt(key) * 5);
    }
  }

  handleKeyUp() {}

  handleGamepadInput() {
    if (this.gamepadIndex === null) return;
    const gamePad = navigator.getGamepads()[this.gamepadIndex];
    if (!gamePad) return;
    const buttons = gamePad.buttons;
    const axis = gamePad.axes;

    buttons.forEach((button, index) => {
      const keyName = this.controllerButtonMap[index];
      if (!keyName) return;
      const key = this.keys[keyName];

      // button.value is a binary 0|1 for buttons or a range 0-1 for triggers
      if (button.value > this.triggerThreshold) {
        if (!key.isPressed) {
          this.pressKey(key);
        } else {
          this.holdKey(key);
        }
      } else if (key.isPressed) {
        this.releaseKey(key);
      }
    });

    const leftKey = this.keys.left;
    const rightKey = this.keys.right;

    if (Math.abs(axis[0]) > this.stickThreshold) {
      if (axis[0] < 0) {
        if (!leftKey.isPressed) this.pressKey(leftKey);
        else this.holdKey(leftKey);
      }
      if (axis[0] > 0) {
        if (!rightKey.isPressed) this.pressKey(rightKey);
        else this.holdKey(rightKey);
      }
    } else {
      // TODO make this not override dpad inputs
      if (leftKey.isPressed) this.releaseKey(leftKey);
      if (rightKey.isPressed) this.releaseKey(rightKey);
    }

    // Determine if the gamepad is being used by comparing
    // the previous gamepad array state and the current gamepad array state
    if (
      !this.arraysEqual(this.prevGamepadState.buttons, buttons) ||
      !this.arraysEqual(this.prevGamepadState.axis, axis)
    ) {
      this.usingGamepad.value = true;
    }

    // Save the current state for the next frame
    this.prevGamepadState.buttons = buttons;
    this.prevGamepadState.axis = axis;
  }

  // Check if 2 arrays contain the same data, not by reference, but by values
  arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  // Controller rumble if available
  playHaptic(duration, magnitude = 1) {
    const gamePad = navigator.getGamepads()[this.gamepadIndex];
    if (!gamePad) return;
    if (!gamePad.vibrationActuator) return;
    if (!gamePad.vibrationActuator.effects.includes('dual-rumble')) return;
    gamePad.vibrationActuator.playEffect('dual-rumble', {
      startDelay: 0,
      duration,
      weakMagnitude: Math.min(magnitude, 1),
      strongMagnitude: Math.min(magnitude, 1),
    });
  }

  handleCodes(input) {
    // Check for codes
    for (const key in this.codes) {
      const code = this.codes[key];
      if (input.key === code.code[code.index]) {
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
}
