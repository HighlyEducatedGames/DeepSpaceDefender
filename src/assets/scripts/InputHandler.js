export const Action = Object.freeze({
  DEBUG: 0,
  PAUSE: 1,
  BACK: 2,
  RESET: 3,
  FIRE: 4,
  BOOST: 5,
  BOMB: 6,
  MISSILE: 7,
  MOVE_FORWARD: 8,
  MOVE_BACKWARD: 9,
  MOVE_LEFT: 10,
  MOVE_RIGHT: 11,
});

const Direction = Object.freeze({
  NEUTRAL: 0,
  POSITIVE: 1,
  NEGATIVE: 2,
});

class ActionKey {
  keys = [];
  gamepadButtons = [];
  gamepadAxes = [];
  isPressed = false;
  justPressed = false;
  heldDuration = 0;
  justReleased = false;

  constructor(actionName) {
    this.name = actionName;
  }

  press() {
    if (!this.isPressed) {
      this.isPressed = true;
      this.justPressed = true;
      this.justReleased = false;
      this.heldDuration = 0;
    }
  }

  hold(deltaTime) {
    if (this.isPressed) {
      this.heldDuration += deltaTime;
    }
  }

  release() {
    if (this.isPressed) {
      this.isPressed = false;
      this.justReleased = true;
    }
  }

  update(deltaTime) {
    if (this.justReleased) this.justReleased = false;
    if (this.justPressed && this.heldDuration > 0) this.justPressed = false;
    if (this.isPressed) this.hold(deltaTime);
  }
}

class InputHandler {
  keys = {};
  actions = {};
  gamepadIndex = null;
  gamepadButtons = {};
  gamepadAxes = {};
  gamepadAxesThreshold = 0.5;
  mapped = false;
  keyMap = {};
  buttonMap = {};
  axisMap = {};
  codes = {
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

  constructor() {
    for (const action in Action) {
      this.actions[Action[action]] = new ActionKey(action);
      this.actions[Action[action]].keys.forEach((key) => {
        this.keyMap[key] = this.actions[Action[action]];
      });
    }
    this.addListeners();
  }

  // After all binds have been made, map the keys, buttons, and axis for easy lookups,
  // so we don't have to loop over the this.actions object in the triggerAction() method
  mapInputs() {
    for (const action in Action) {
      this.actions[Action[action]].keys.forEach((key) => {
        this.keyMap[key] = this.actions[Action[action]];
      });

      this.actions[Action[action]].gamepadButtons.forEach((button) => {
        this.buttonMap[button] = this.actions[Action[action]];
      });

      this.actions[Action[action]].gamepadAxes.forEach((axis) => {
        this.axisMap[axis] = this.actions[Action[action]];
      });
    }

    this.mapped = true;
  }

  addListeners() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));
  }

  handleKeyDown({ key }) {
    if (!this.keys[key]) {
      this.keys[key] = true;
      this.triggerAction('press', key);
      this.handleCodes(key);
    }
  }

  handleKeyUp({ key }) {
    if (this.keys[key]) {
      this.triggerAction('release', key);
      delete this.keys[key];
    }
  }

  handleGamepadConnected({ gamepad }) {
    this.gamepadIndex = gamepad.index;
    this.playHaptic(200);
  }

  handleGamepadDisconnected({ gamepad }) {
    if (this.gamepadIndex === gamepad.index) {
      this.gamepadIndex = null;
      this.gamepadButtons = {};
      this.gamepadAxes = {};
    }
  }

  pollGamepad() {
    if (this.gamepadIndex === null) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[this.gamepadIndex];
    if (!gamepad) return;

    const { buttons, axes } = gamepad;

    buttons.forEach((button, index) => {
      this.handleGamepadButton(index, button);
    });

    axes.forEach((axisValue, index) => {
      this.handleGamepadAxis(index, axisValue);
    });
  }

  handleGamepadButton(index, button) {
    const key = `gamepad_button_${index}`;

    if (button.pressed) {
      if (!this.gamepadButtons[key]) {
        this.gamepadButtons[key] = true;
        this.triggerAction('press', key);
      }
    } else if (this.gamepadButtons[key]) {
      this.triggerAction('release', key);
      delete this.gamepadButtons[key];
    }
  }

  handleGamepadAxis(index, axisValue) {
    let direction = Direction.NEUTRAL;
    if (axisValue < -this.gamepadAxesThreshold) {
      direction = Direction.NEGATIVE;
    } else if (axisValue > this.gamepadAxesThreshold) {
      direction = Direction.POSITIVE;
    }

    const axisKey = this.gamepadAxes[index] || {};
    const previousDirection = axisKey.direction;

    if (direction !== previousDirection) {
      if (direction === Direction.NEGATIVE || direction === Direction.POSITIVE) {
        this.triggerAction('press', `gamepad_axis_${index}_${direction}`);
      } else {
        this.triggerAction('release', `gamepad_axis_${index}_${previousDirection}`);
      }
    }

    axisKey.direction = direction;
    axisKey.axisValue = axisValue;
    this.gamepadAxes[index] = axisKey;
  }

  bindKeys(actionName, ...keys) {
    if (this.mapped) throw new Error('Binding keys is not allowed after the mapInputs() method has run.');
    if (!this.actions[actionName]) return;
    keys.forEach((key) => {
      for (let action in this.actions) {
        if (this.actions[action].keys.includes(key)) {
          throw new Error(`Key ${key} is already bound to action ${action}.`);
        }
      }
      this.actions[actionName].keys.push(key);
    });
  }

  bindButtons(actionName, ...buttonIndexes) {
    if (this.mapped) throw new Error('Binding buttons is not allowed after the mapInputs() method has run.');
    if (!this.actions[actionName]) return;
    buttonIndexes.forEach((buttonIndex) => {
      const gamepadKey = `gamepad_button_${buttonIndex}`;
      for (let action in this.actions) {
        if (this.actions[action].gamepadButtons.includes(gamepadKey)) {
          throw new Error(`Gamepad button ${gamepadKey} is already bound to action ${action}.`);
        }
      }
      this.actions[actionName].gamepadButtons.push(gamepadKey);
    });
  }

  bindAxis(actionName, axisIndex, axisDirection) {
    if (this.mapped) throw new Error('Binding axis is not allowed after the mapInputs() method has run.');
    if (!this.actions[actionName]) return;
    const gamepadAxis = `gamepad_axis_${axisIndex}_${axisDirection}`;
    for (let action in this.actions) {
      if (this.actions[action].gamepadAxes.includes(gamepadAxis)) {
        throw new Error(`Gamepad axis ${gamepadAxis} is already bound to action ${action}.`);
      }
    }
    this.actions[actionName].gamepadAxes.push(gamepadAxis);
  }

  triggerAction(actionType, key) {
    const boundKey = this.keyMap[key];
    const boundButton = this.buttonMap[key];
    const boundAxis = this.axisMap[key];
    const action = boundKey || boundButton || boundAxis;

    if (action) {
      switch (actionType) {
        case 'press':
          action.press();
          break;
        case 'release':
          action.release();
          break;
      }
    }
  }

  update(deltaTime) {
    this.pollGamepad();
    for (const action in this.actions) {
      this.actions[action].update(deltaTime);
    }
  }

  isPressed(actionName) {
    const action = this.actions[actionName];
    if (!action) return false;
    return action.isPressed;
  }

  justPressed(actionName) {
    const action = this.actions[actionName];
    if (!action) return false;
    return action.justPressed;
  }

  justReleased(actionName) {
    const action = this.actions[actionName];
    if (!action) return false;
    return action.justReleased;
  }

  heldDuration(actionName) {
    const action = this.actions[actionName];
    if (!action) return null;
    return action.heldDuration;
  }

  // Controller rumble if available
  playHaptic(duration, magnitude = 1) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[this.gamepadIndex];
    if (!gamepad || !gamepad.vibrationActuator) return;
    if (!gamepad.vibrationActuator.effects.includes('dual-rumble')) return;

    gamepad.vibrationActuator
      .playEffect('dual-rumble', {
        startDelay: 0,
        duration,
        weakMagnitude: Math.min(magnitude, 1),
        strongMagnitude: Math.min(magnitude, 1),
      })
      .catch(() => {});
  }

  handleCodes(input) {
    for (const key in this.codes) {
      const code = this.codes[key];
      if (input === code.code[code.index]) {
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

const inputHandler = new InputHandler();

inputHandler.bindKeys(Action.BACK, 'Escape');

inputHandler.bindKeys(Action.DEBUG, 'Delete');
inputHandler.bindButtons(Action.DEBUG, 16); // X-Box Button

inputHandler.bindKeys(Action.PAUSE, 'Pause');
inputHandler.bindButtons(Action.PAUSE, 9); // Start

inputHandler.bindKeys(Action.RESET, 'r', 'R');
inputHandler.bindButtons(Action.RESET, 8); // Menu

inputHandler.bindKeys(Action.FIRE, ' ');
inputHandler.bindButtons(Action.FIRE, 0); // A

inputHandler.bindKeys(Action.BOOST, 'x', 'X');
inputHandler.bindButtons(Action.BOOST, 2); // X

inputHandler.bindKeys(Action.BOMB, 'b', 'B');
inputHandler.bindButtons(Action.BOMB, 1, 4); // B - Left Bumper

inputHandler.bindKeys(Action.MISSILE, 'm', 'M');
inputHandler.bindButtons(Action.MISSILE, 3, 5); // Y - Right Bumper

inputHandler.bindKeys(Action.MOVE_FORWARD, 'ArrowUp', 'w', 'W');
inputHandler.bindButtons(Action.MOVE_FORWARD, 7, 12); // Right Trigger - Dpad UP

inputHandler.bindKeys(Action.MOVE_BACKWARD, 'ArrowDown', 's', 'S');
inputHandler.bindButtons(Action.MOVE_BACKWARD, 6, 13); // Left Trigger - Dpad DOWN

inputHandler.bindKeys(Action.MOVE_LEFT, 'ArrowLeft', 'a', 'A');
inputHandler.bindButtons(Action.MOVE_LEFT, 14); // Dpad LEFT
inputHandler.bindAxis(Action.MOVE_LEFT, 0, Direction.NEGATIVE);

inputHandler.bindKeys(Action.MOVE_RIGHT, 'ArrowRight', 'd', 'D');
inputHandler.bindButtons(Action.MOVE_RIGHT, 15); // Dpad RIGHT
inputHandler.bindAxis(Action.MOVE_RIGHT, 0, Direction.POSITIVE);

// Map inputs only after binding all keys, buttons, and axis
inputHandler.mapInputs();
export default inputHandler;

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
