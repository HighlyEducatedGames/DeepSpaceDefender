import { GameObject } from './GameObject';

export default class Star extends GameObject {
  x: number;
  y: number;
  radius = Math.random() * 0.7 + 0.3;
  dx = -1;
  dy = 0;
  speed: number;
  layer: number;

  constructor(game: Game) {
    super(game);
    this.x = Math.random() * this.game.width;
    this.y = Math.random() * this.game.height;
    this.layer = Math.floor(Math.random() * this.game.parallaxLayers);
    this.speed = (this.layer + 1) * 90;
  }

  draw(ctx: CTX) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime: number) {
    this.x += (this.dx * this.speed * deltaTime) / 1000;
    this.y += (this.dy * this.speed * deltaTime) / 1000;

    // If star moves off the left edge, reset it to the right edge
    if (this.x <= -this.radius) {
      this.x = this.game.width + this.radius;
      this.y = Math.random() * this.game.height;
    }
  }

  checkCollisions() {}
}
