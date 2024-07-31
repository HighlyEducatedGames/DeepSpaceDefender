class Coin {
  constructor(game) {
    this.game = game;
    this.x = Math.random() * (this.game.canvas.width - 20);
    this.y = Math.random() * (this.game.canvas.height - 20 - this.game.topMargin) + this.game.topMargin;
    this.width = 20;
    this.height = 20;
    this.offsetY = 0;
    this.bobbingSpeed = 6; // Adjust the speed of the bobbing
    this.bobbingAmplitude = 15; // Adjust the amplitude of the bobbing
    this.bobbingAngle = Math.random() * Math.PI * 2; // Random starting angle

    this.image = new Image();
    this.image.src = 'assets/images/coin.png';
    this.sound = new Audio('assets/audio/coin.mp3');
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y + this.offsetY, this.width, this.height);
  }

  update() {
    this.bobbingAngle += this.bobbingSpeed * 0.01; // Update the bobbing angle
    this.offsetY = Math.sin(this.bobbingAngle) * this.bobbingAmplitude; // Calculate the vertical offset
  }
}

export default Coin;
