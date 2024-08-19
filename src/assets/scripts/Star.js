export default class Star {
  constructor(game) {
    /** @type {import('./Game.js').default} */
    this.game = game;
    this.x = Math.random() * this.game.width;
    this.y = Math.random() * this.game.height;
    this.radius = Math.random() * 0.7 + 0.3;
    this.directionX = -1;
    this.directionY = 0;
    this.layer = Math.floor(Math.random() * this.game.parallaxLayers);
    this.speed = (this.layer + 1) * 90;
  }

  draw(ctx) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime) {
    this.x += (this.speed * this.directionX * deltaTime) / 1000;
    this.y += (this.speed * this.directionY * deltaTime) / 1000;

    // If star moves off the left edge, reset it to the right edge
    if (this.x <= 0) {
      this.x = this.game.width;
      this.y = Math.random() * this.game.height;
    }
  }
}
