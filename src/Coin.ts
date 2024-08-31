import { GameObject } from './GameObject';

export default class Coin extends GameObject {
  x: number;
  y: number;
  radius = 10;
  dx = 0;
  dy = 0;
  speed = 70;
  width = 20;
  height = 20;
  margin = 50;
  points = 20;
  healthRestored = 3;
  angle = Math.random() * Math.PI * 2;
  amplitude = 0.03;
  image = this.game.getImage('coin_image');
  sound = this.game.getAudio('coin_sound');

  constructor(game: Game) {
    super(game);
    this.x = this.game.getRandomX(this.margin);
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

  update(deltaTime: number) {
    // Oscillate vertically
    this.angle += this.amplitude;
    this.dy = Math.sin(this.angle);
    this.y += (this.dy * this.speed * deltaTime) / 1000;
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
