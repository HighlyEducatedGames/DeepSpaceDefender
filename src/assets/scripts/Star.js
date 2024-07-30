class Star {
  constructor(game) {
    this.game = game;
    this.x = Math.random() * this.game.canvas.width;
    this.y = Math.random() * this.game.canvas.height;
    this.radius = Math.random() * 2;
    this.speed = Math.random() * this.radius * 0.25; // Make larger stars move faster
  }

  draw(ctx) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    // Parallax
    this.x -= this.speed;
    if (this.x + this.radius * 2 < 0) {
      this.x = this.game.canvas.width + this.radius;
      this.y = Math.random() * this.game.canvas.height;
    }
  }
}

export default Star;
