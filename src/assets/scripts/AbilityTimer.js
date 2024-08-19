export default class AbilityTimer {
  constructor(game, duration, image) {
    this.game = game;
    this.duration = duration;
    this.image = document.getElementById(image);
    this.active = false;
    this.timer = 0;
    this.startTime = 0;
  }

  activate() {
    this.active = true;
    this.timer = 0;
    this.startTime = this.game.timestamp;
  }

  update(deltaTime) {
    if (this.active) {
      if (this.timer >= this.duration) {
        this.active = false;
      } else {
        this.timer += deltaTime;
      }
    }
  }
}
