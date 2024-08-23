export const Actions = Object.freeze({
  DEBUG: 'debug',
  PAUSE: 'pause',
  BACK: 'back',
  RESTART: 'restart',
  FIRE: 'fire',
  BOOST: 'boost',
  BOMB: 'bomb',
  MISSILE: 'missile',
  MOVE_FORWARD: 'move_forward',
  MOVE_BACKWARD: 'move_backward',
  MOVE_LEFT: 'move_left',
  MOVE_RIGHT: 'move_right',
});

const Directions = Object.freeze({
  NEUTRAL: 'neutral',
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
});

class InputHandler {
  constructor() {
    this.keys = {};
    this.actions = {};
    this.gamepadIndex = null;
    this.gamepadButtons = {};
    this.gamepadAxes = {};
    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));
  }

  handleKeyDown({ key }) {
    if (!this.keys[key]) {
      this.keys[key] = new Key(key);
      this.triggerActionPress(key);
    } else {
      this.keys[key].isHeld = true;
      this.triggerActionHold(key);
    }
  }

  handleKeyUp({ key }) {
    if (this.keys[key]) {
      this.triggerActionRelease(key);
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

  pollGamepads() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[this.gamepadIndex];

    if (gamepad) {
      gamepad.buttons.forEach((button, index) => {
        this.handleGamepadButton(index, button);
      });

      gamepad.axes.forEach((axisValue, axisIndex) => {
        this.handleGamepadAxis(axisIndex, axisValue);
      });
    }
  }

  handleGamepadButton(buttonIndex, button) {
    const key = `gamepad_button${buttonIndex}`;

    if (button.pressed) {
      if (!this.gamepadButtons[key]) {
        this.gamepadButtons[key] = new Key(key);
        this.triggerActionPress(key);
      } else {
        this.gamepadButtons[key].isHeld = true;
        this.triggerActionHold(key);
      }
    } else if (this.gamepadButtons[key]) {
      this.triggerActionRelease(key);
      delete this.gamepadButtons[key];
    }
  }

  handleGamepadAxis(axisIndex, axisValue) {
    const threshold = 0.1; // Sensitivity threshold for detecting axis movement
    const key = `gamepad_axis${axisIndex}`;
    const direction =
      axisValue < -threshold ? Directions.NEGATIVE : axisValue > threshold ? Directions.POSITIVE : Directions.NEUTRAL;

    if (!this.gamepadAxes[key]) {
      this.gamepadAxes[key] = new AxesKey(direction, axisValue);
    }

    const previousDirection = this.gamepadAxes[key].direction;

    if (direction !== previousDirection) {
      if (direction === Directions.NEGATIVE || direction === Directions.POSITIVE) {
        this.triggerActionPress(key, direction);
      } else {
        this.triggerActionRelease(key, previousDirection);
      }
    }

    this.gamepadAxes[key].direction = direction;
    this.gamepadAxes[key].axisValue = axisValue;
  }

  initAction(actionName) {
    if (!this.actions[actionName]) {
      this.actions[actionName] = { keys: [], gamepadButtons: [], gamepadAxes: [] };
    }
  }

  bindActionToKeys(actionName, ...keys) {
    this.initAction(actionName);
    keys.forEach((key) => {
      for (let action in this.actions) {
        if (this.actions[action].keys.includes(key)) {
          throw new Error(`Key ${key} is already bound to action ${action}.`);
        }
      }
      this.actions[actionName].keys.push(key);
    });
  }

  bindActionToButtons(actionName, ...buttonIndexes) {
    this.initAction(actionName);
    buttonIndexes.forEach((buttonIndex) => {
      for (let action in this.actions) {
        const gamepadKey = `gamepad_button${buttonIndex}`;
        if (this.actions[action].gamepadButtons.includes(gamepadKey)) {
          throw new Error(`Gamepad button ${gamepadKey} is already bound to action ${action}.`);
        }
      }
      this.actions[actionName].gamepadButtons.push(`gamepad_button${buttonIndex}`);
    });
  }

  bindActionToAxis(actionName, axisIndex, axisDirection) {
    this.initAction(actionName);
    const gamepadAxis = `gamepad_axis${axisIndex}_${axisDirection}`;
    for (let action in this.actions) {
      if (this.actions[action].gamepadAxes.includes(gamepadAxis)) {
        throw new Error(`Gamepad axis ${gamepadAxis} is already bound to action ${action}.`);
      }
    }
    this.actions[actionName].gamepadAxes.push(gamepadAxis);
  }

  triggerActionPress(key, axisDirection = null) {
    for (let actionName in this.actions) {
      const action = this.actions[actionName];

      if (
        action.keys.includes(key) ||
        action.gamepadButtons.includes(key) ||
        action.gamepadAxes.includes(`${key}_${axisDirection}`)
      ) {
        if (action.onPress) action.onPress();
      }
    }
  }

  triggerActionHold(key, axisDirection = null) {
    for (let actionName in this.actions) {
      const action = this.actions[actionName];

      if (
        action.keys.includes(key) ||
        action.gamepadButtons.includes(key) ||
        action.gamepadAxes.includes(`${key}_${axisDirection}`)
      ) {
        if (action.onHold) {
          const duration = performance.now() - (this.keys[key]?.pressTime || this.gamepadButtons[key]?.pressTime);
          action.onHold(duration);
        }
      }
    }
  }

  triggerActionRelease(key, axisDirection = null) {
    for (let actionName in this.actions) {
      const action = this.actions[actionName];

      if (
        action.keys.includes(key) ||
        action.gamepadButtons.includes(key) ||
        action.gamepadAxes.includes(`${key}_${axisDirection}`)
      ) {
        if (action.onRelease) {
          const duration = performance.now() - (this.keys[key]?.pressTime || this.gamepadButtons[key]?.pressTime);
          action.onRelease(duration);
        }
      }
    }
  }

  onActionPress(actionName, callback) {
    if (!this.actions[actionName]) return;
    this.actions[actionName].onPress = callback;
  }

  onActionHold(actionName, callback) {
    if (!this.actions[actionName]) return;
    this.actions[actionName].onHold = callback;
  }

  onActionRelease(actionName, callback) {
    if (!this.actions[actionName]) return;
    this.actions[actionName].onRelease = callback;
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
}

class Key {
  constructor(key) {
    this.key = key;
    this.isPressed = true;
    this.pressTime = performance.now();
    this.isHeld = false;
  }
}

class AxesKey {
  constructor(direction, axisValue) {
    this.direction = direction;
    this.axisValue = axisValue;
  }
}

const inputHandler = new InputHandler();

inputHandler.bindActionToKeys(Actions.BACK, 'Escape');

inputHandler.bindActionToKeys(Actions.DEBUG, 'Delete');
inputHandler.bindActionToButtons(Actions.DEBUG, 16); // X-Box Button

inputHandler.bindActionToKeys(Actions.PAUSE, 'Pause');
inputHandler.bindActionToButtons(Actions.PAUSE, 9); // Start

inputHandler.bindActionToKeys(Actions.RESTART, 'r', 'R');
inputHandler.bindActionToButtons(Actions.RESTART, 8); // Menu

inputHandler.bindActionToKeys(Actions.FIRE, ' ');
inputHandler.bindActionToButtons(Actions.FIRE, 0); // A

inputHandler.bindActionToKeys(Actions.BOOST, 'x', 'X');
inputHandler.bindActionToButtons(Actions.BOOST, 2); // X

inputHandler.bindActionToKeys(Actions.BOMB, 'b', 'B');
inputHandler.bindActionToButtons(Actions.BOMB, 1, 4); // B - Left Bumper

inputHandler.bindActionToKeys(Actions.MISSILE, 'm', 'M');
inputHandler.bindActionToButtons(Actions.MISSILE, 3, 5); // Y - Right Bumper

inputHandler.bindActionToKeys(Actions.MOVE_FORWARD, 'ArrowUp', 'w', 'W');
inputHandler.bindActionToButtons(Actions.MOVE_FORWARD, 7); // Right Trigger

inputHandler.bindActionToKeys(Actions.MOVE_BACKWARD, 'ArrowDown', 's', 'S');
inputHandler.bindActionToButtons(Actions.MOVE_BACKWARD, 6); // Left Trigger

inputHandler.bindActionToKeys(Actions.MOVE_LEFT, 'ArrowLeft', 'a', 'A');
inputHandler.bindActionToButtons(Actions.MOVE_LEFT, 14); // Dpad LEFT
inputHandler.bindActionToAxis(Actions.MOVE_LEFT, 0, Directions.NEGATIVE);

inputHandler.bindActionToKeys(Actions.MOVE_RIGHT, 'ArrowRight', 'd', 'D');
inputHandler.bindActionToButtons(Actions.MOVE_RIGHT, 15); // Dpad RIGHT
inputHandler.bindActionToAxis(Actions.MOVE_RIGHT, 0, Directions.POSITIVE);

export default inputHandler;
