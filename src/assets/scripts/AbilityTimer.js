export default class AbilityTimer {
  active = false;
  timer = 0;
  startTime = 0;

  constructor(game, duration, image) {
    /** @type {import('./Game.js').default} */
    this.game = game;
    this.duration = duration;
    this.image = document.getElementById(image);
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
