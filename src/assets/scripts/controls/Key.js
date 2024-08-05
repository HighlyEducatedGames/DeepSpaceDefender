class Key {
  constructor(name) {
    this.name = name;
    this.isPressed = false;
    this.frame = 0;
    this.pressedAt = null;
    this.pressedDuration = 0;
  }

  justPressed() {
    return this.isPressed && this.frame === 1;
  }
}

export default Key;
