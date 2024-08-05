class Coin {
  constructor(game) {
    this.game = game;
    this.x = Math.random() * (this.game.canvas.width - 20) + 40;
    this.y = Math.random() * (this.game.canvas.height - 20 - this.game.topMargin) + this.game.topMargin;
    this.width = 20;
    this.height = 20;
    this.points = 20;
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
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update() {
    // Check collision with player
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.score += this.points;

      // Increase player's health by 2, but do not exceed the maximum health
      this.game.player.health = Math.min(this.game.player.health + 2, this.game.player.maxHealth);

      this.sound.cloneNode().play();
      this.markedForDeletion = true;
    }

    this.bobbingAngle += this.bobbingSpeed * 0.01;
    this.y += Math.sin(this.bobbingAngle) * this.bobbingAmplitude;
  }
}

export default Coin;
