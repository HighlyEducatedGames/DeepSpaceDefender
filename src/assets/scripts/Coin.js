export default class Coin {
  constructor(game) {
    this.game = game;
    this.margin = 50;
    this.x = Math.random() * (this.game.canvas.width - this.margin * 2) + this.margin;
    this.y = Math.random() * (game.canvas.height - game.topMargin - this.margin * 2) + game.topMargin + this.margin;
    this.width = 20;
    this.height = 20;
    this.radius = this.width * 0.5;
    this.points = 20;
    this.healthRestored = 3;
    this.bobbingSpeed = 6;
    this.bobbingAmplitude = 0.9;
    this.bobbingAngle = Math.random() * Math.PI * 2;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = 'assets/images/coin.png';
    this.sound = new Audio('assets/audio/coin.mp3');
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update() {
    // Check collision with player
    if (this.game.checkCollision(this, this.game.player)) {
      // Add to player score
      this.game.addScore(this.points);

      // Increase player's health
      this.game.player.addHealth(this.healthRestored);

      // Play coin pickup sound
      this.sound.cloneNode().play();
      this.markedForDeletion = true;
    }

    // Oscillate vertically
    this.bobbingAngle += this.bobbingSpeed * 0.01;
    this.y += Math.sin(this.bobbingAngle) * this.bobbingAmplitude;
  }
}
