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
type ActionType = keyof typeof Action;

const Direction = Object.freeze({
  NEUTRAL: 0,
  POSITIVE: 1,
  NEGATIVE: 2,
});

class ActionKey {
  name: string;
  keys: string[] = [];
  gamepadButtons: string[] = [];
  gamepadAxes: string[] = [];
  isPressed = false;
  justPressed = false;
  heldDuration = 0;
  justReleased = false;
  _justReleasedFlag = false;

  constructor(actionName: string) {
    this.name = actionName;
  }

  press() {
    if (!this.isPressed) {
      this.isPressed = true;
      this.justPressed = true;
      this.justReleased = false;
      this._justReleasedFlag = false;
      this.heldDuration = 0;
    }
  }

  hold(deltaTime: number) {
    if (this.isPressed) {
      this.heldDuration += deltaTime;
    }
  }

  release() {
    if (this.isPressed) {
      this.isPressed = false;
      this.justReleased = true;
      this._justReleasedFlag = true;
    }
  }

  update(deltaTime: number) {
    if (this.justPressed && this.heldDuration > 0) this.justPressed = false;

    // Ensure justReleased has been seen for at least one game tick by using a flag
    if (this.justReleased && !this._justReleasedFlag) {
      this.justReleased = false;
    } else if (this.justReleased) {
      this._justReleasedFlag = false;
    }

    if (this.isPressed) this.hold(deltaTime);
  }
}

type CheatCode = {
  code: string[];
  index: number;
  enabled: boolean;
};

export default class InputHandler {
  game: Game;
  keys: { [key: string]: boolean } = {};
  actions: { [key: string]: ActionKey } = {};
  gamepadIndex: number | null = null;
  gamepadButtons: { [key: string]: boolean } = {};
  gamepadAxes: { [key: string]: { direction: number; axisValue: number } } = {};
  gamepadAxesThreshold = 0.5;
  mapped = false;
  keyMap: { [key: string]: ActionKey } = {};
  buttonMap: { [key: string]: ActionKey } = {};
  axisMap: { [key: string]: ActionKey } = {};
  codes: { [key: string]: CheatCode } = {
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
  usingGamepad = {
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

  constructor(game: Game) {
    this.game = game;
    for (const action in Action) {
      const actionKey = action as ActionType;
      this.actions[Action[actionKey]] = new ActionKey(action);
      this.actions[Action[actionKey]].keys.forEach((key) => {
        this.keyMap[key] = this.actions[Action[actionKey]];
      });
    }
    updateMenuText(this.usingGamepad.value);
    this.bindPlayerInputs();
    this.addListeners();
  }

  // After all binds have been made, map the keys, buttons, and axis for easy lookups,
  // so we don't have to loop over the this.actions object in the triggerAction() method
  mapInputs() {
    for (const action in Action) {
      const actionKey = action as ActionType;

      this.actions[Action[actionKey]].keys.forEach((key) => {
        this.keyMap[key] = this.actions[Action[actionKey]];
      });

      this.actions[Action[actionKey]].gamepadButtons.forEach((button) => {
        this.buttonMap[button] = this.actions[Action[actionKey]];
      });

      this.actions[Action[actionKey]].gamepadAxes.forEach((axis) => {
        this.axisMap[axis] = this.actions[Action[actionKey]];
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

  handleKeyDown(e: KeyboardEvent) {
    const { key } = e;
    this.usingGamepad.value = false;
    if (!this.keys[key]) {
      this.keys[key] = true;
      this.triggerAction('press', key);
    }
    this.handleCodes(key);
    this.handleDebugMode(key);
  }

  handleDebugMode(key: string) {
    // Boss selector 1-9
    if (this.game.debug && /^[1-9]$/.test(key)) this.game.startLevel(parseInt(key) * 5);
    // Change level with PGUP/PGDOWN;
    if (this.game.debug && key === 'PageUp') this.game.nextLevel();
    if (this.game.debug && key === 'PageDown') this.game.prevLevel();
  }

  handleKeyUp(e: KeyboardEvent) {
    const { key } = e;
    if (this.keys[key]) {
      this.triggerAction('release', key);
      delete this.keys[key];
    }
  }

  handleGamepadConnected(e: GamepadEvent) {
    const { gamepad } = e;
    this.usingGamepad.value = true;
    this.gamepadIndex = gamepad.index;
    this.playHaptic(200);
  }

  handleGamepadDisconnected(e: GamepadEvent) {
    const { gamepad } = e;
    if (this.gamepadIndex === gamepad.index) {
      this.usingGamepad.value = false;
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

  handleGamepadButton(index: number, button: GamepadButton) {
    const key = `gamepad_button_${index}`;

    if (button.pressed) {
      if (!this.gamepadButtons[key]) {
        this.gamepadButtons[key] = true;
        this.usingGamepad.value = true;
        this.triggerAction('press', key);
      }
    } else if (this.gamepadButtons[key]) {
      this.triggerAction('release', key);
      delete this.gamepadButtons[key];
    }
  }

  handleGamepadAxis(index: number, axisValue: number) {
    let direction: number = Direction.NEUTRAL;
    if (axisValue < -this.gamepadAxesThreshold) {
      direction = Direction.NEGATIVE;
    } else if (axisValue > this.gamepadAxesThreshold) {
      direction = Direction.POSITIVE;
    }

    const axisKey = this.gamepadAxes[index] || {};
    const previousDirection = axisKey.direction;

    if (direction !== previousDirection) {
      if (direction === Direction.NEGATIVE || direction === Direction.POSITIVE) {
        this.usingGamepad.value = true;
        this.triggerAction('press', `gamepad_axis_${index}_${direction}`);
      } else {
        this.triggerAction('release', `gamepad_axis_${index}_${previousDirection}`);
      }
    }

    axisKey.direction = direction;
    axisKey.axisValue = axisValue;
    this.gamepadAxes[index] = axisKey;
  }

  bindKeys(actionName: number, ...keys: string[]) {
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

  bindButtons(actionName: number, ...buttonIndexes: number[]) {
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

  bindAxis(actionName: number, axisIndex: number, axisDirection: number) {
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

  triggerAction(actionType: string, key: string) {
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

  update(deltaTime: number) {
    this.pollGamepad();
    for (const action in this.actions) {
      this.actions[action].update(deltaTime);
    }
  }

  isPressed(actionName: number) {
    const action = this.actions[actionName];
    if (!action) return false;
    return action.isPressed;
  }

  justPressed(actionName: number) {
    const action = this.actions[actionName];
    if (!action) return false;
    return action.justPressed;
  }

  justReleased(actionName: number) {
    const action = this.actions[actionName];
    if (!action) return false;
    return action.justReleased;
  }

  heldDuration(actionName: number) {
    const action = this.actions[actionName];
    if (!action) return null;
    return action.heldDuration;
  }

  // Controller rumble if available
  playHaptic(duration: number, magnitude = 1) {
    if (!this.gamepadIndex) return;
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[this.gamepadIndex];
    if (!gamepad || !gamepad.vibrationActuator) return;
    if (!gamepad.vibrationActuator.effects?.includes('dual-rumble')) return;

    gamepad.vibrationActuator
      .playEffect('dual-rumble', {
        startDelay: 0,
        duration,
        weakMagnitude: Math.min(magnitude, 1),
        strongMagnitude: Math.min(magnitude, 1),
      })
      .catch(() => {});
  }

  handleCodes(input: string) {
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

  bindPlayerInputs() {
    this.bindKeys(Action.BACK, 'Escape');

    this.bindKeys(Action.DEBUG, 'Delete');
    this.bindButtons(Action.DEBUG, 16); // X-Box Button

    this.bindKeys(Action.PAUSE, 'Pause');
    this.bindButtons(Action.PAUSE, 9); // Start

    this.bindKeys(Action.RESET, 'r', 'R');
    this.bindButtons(Action.RESET, 8); // Menu

    this.bindKeys(Action.FIRE, ' ');
    this.bindButtons(Action.FIRE, 0); // A

    this.bindKeys(Action.BOOST, 'x', 'X');
    this.bindButtons(Action.BOOST, 2); // X

    this.bindKeys(Action.BOMB, 'b', 'B');
    this.bindButtons(Action.BOMB, 1, 4); // B - Left Bumper

    this.bindKeys(Action.MISSILE, 'm', 'M');
    this.bindButtons(Action.MISSILE, 3, 5); // Y - Right Bumper

    this.bindKeys(Action.MOVE_FORWARD, 'ArrowUp', 'w', 'W');
    this.bindButtons(Action.MOVE_FORWARD, 7, 12); // Right Trigger - Dpad UP

    this.bindKeys(Action.MOVE_BACKWARD, 'ArrowDown', 's', 'S');
    this.bindButtons(Action.MOVE_BACKWARD, 6, 13); // Left Trigger - Dpad DOWN

    this.bindKeys(Action.MOVE_LEFT, 'ArrowLeft', 'a', 'A');
    this.bindButtons(Action.MOVE_LEFT, 14); // Dpad LEFT
    this.bindAxis(Action.MOVE_LEFT, 0, Direction.NEGATIVE); // Left Joystick - Left

    this.bindKeys(Action.MOVE_RIGHT, 'ArrowRight', 'd', 'D');
    this.bindButtons(Action.MOVE_RIGHT, 15); // Dpad RIGHT
    this.bindAxis(Action.MOVE_RIGHT, 0, Direction.POSITIVE); // Left Joystick - Right

    // Map inputs only after binding all keys, buttons, and axis
    this.mapInputs();
  }
}

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
