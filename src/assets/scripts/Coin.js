class Coin {
  constructor(game) {
    this.game = game;
    this.x = Math.random() * (this.game.canvas.width - 20);
    this.y = Math.random() * (this.game.canvas.height - 20 - this.game.topMargin) + this.game.topMargin;
    this.width = 20;
    this.height = 20;
    this.points = 20;
    this.offsetY = 0;
    this.bobbingSpeed = 6;
    this.bobbingAmplitude = 15;
    this.bobbingAngle = Math.random() * Math.PI * 2;

    this.image = new Image();
    this.image.src = 'assets/images/coin.png';
    this.sound = new Audio('assets/audio/coin.mp3');
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y + this.offsetY, this.width, this.height);
  }

  update() {
    const playerCircle = { x: this.game.player.x, y: this.game.player.y, radius: this.game.player.width / 2 };
    const coinCircle = { x: this.x + this.width / 2, y: this.y + this.height / 2, radius: this.width / 2 };

    // Check collision with player
    if (this.game.checkCollision(playerCircle, coinCircle)) {
      this.game.score += this.points;
      // coins.splice(coinIndex, 1); // TODO: delete coin - mark for deletion??

      // Increase player's health by 2, but do not exceed the maximum health
      this.game.player.health = Math.min(this.game.player.health + 2, this.game.player.maxHealth);

      this.sound.cloneNode().play(); // TODO: ask task why are we cloning the sound
    }

    this.bobbingAngle += this.bobbingSpeed * 0.01; // Update the bobbing angle
    this.offsetY = Math.sin(this.bobbingAngle) * this.bobbingAmplitude; // Calculate the vertical offset
  }
}

export default Coin;
