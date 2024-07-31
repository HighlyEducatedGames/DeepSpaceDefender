class Star {
  constructor(game, starLayers) {
    this.game = game;
    this.x = Math.random() * this.game.canvas.width;
    this.y = Math.random() * this.game.canvas.height;
    this.radius = Math.random() * 0.7 + 0.3;
    this.layer = Math.floor(Math.random() * starLayers);
    this.speed = (this.layer + 1) * 2;
  }

  draw(ctx) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    // Parallax
    this.x -= this.speed; // Move star to the left

    // If star moves off the left edge, reset it to the right edge
    if (this.x < 0) {
      this.x = this.game.canvas.width;
      this.y = Math.random() * this.game.canvas.height;
    }
  }
}

export default Star;
