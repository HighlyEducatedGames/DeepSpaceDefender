import { GameObject } from './GameObject';

export default class Coin extends GameObject {
  x: number;
  y: number;
  width = 20;
  height = 20;
  radius = this.width * 0.5;
  margin = 50;
  points = 20;
  healthRestored = 3;
  bobbingSpeed = 6;
  bobbingAmplitude = 0.9;
  bobbingAngle = Math.random() * Math.PI * 2;
  image = this.game.getImage('coin_image');
  sound = this.game.getAudio('coin_sound');

  constructor(game: Game) {
    super(game);
    this.x = Math.random() * (this.game.width - this.margin * 2) + this.margin;
    this.y = this.game.getRandomY(this.margin);
  }

  draw(ctx: CTX) {
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
    // Collision with player
    if (this.game.checkCollision(this, this.game.player)) {
      this.game.addScore(this.points);
      this.game.player.addHealth(this.healthRestored);
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}
