export default class Coin {
  constructor(game) {
    /** @type {import('./Game.js').default} */
    this.game = game;
    this.margin = 50;
    this.x = Math.random() * (this.game.width - this.margin * 2) + this.margin;
    this.y = this.game.getRandomY(this.margin);
    this.width = 20;
    this.height = 20;
    this.radius = this.width * 0.5;
    this.points = 20;
    this.healthRestored = 3;
    this.bobbingSpeed = 6;
    this.bobbingAmplitude = 0.9;
    this.bobbingAngle = Math.random() * Math.PI * 2;
    this.markedForDeletion = false;
    this.image = document.getElementById('coin_image');
    this.sound = document.getElementById('coin_sound');
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
    // Oscillate vertically
    this.bobbingAngle += this.bobbingSpeed * 0.01;
    this.y += Math.sin(this.bobbingAngle) * this.bobbingAmplitude;
  }

  checkCollisions() {
    if (this.markedForDeletion) return;

    // Collision with player
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.addScore(this.points);
      this.game.player.addHealth(this.healthRestored);
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}
