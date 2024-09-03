export default class AbilityTimer {
  game: Game;
  duration: number;
  image: HTMLImageElement;
  active = false;
  timer = 0;

  constructor(game: Game, duration: number, image: string) {
    this.game = game;
    this.duration = duration;
    this.image = this.game.getImage(image);
  }

  activate() {
    this.active = true;
    this.timer = 0;
  }

  update(deltaTime: number) {
    if (this.active) {
      this.timer += deltaTime;
      if (this.timer >= this.duration) this.active = false;
    }
  }
}
