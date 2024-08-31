import { EnemyProjectile } from '../GameObject.js';

export default class Asteroid extends EnemyProjectile {
  sizes = [
    { width: 75, height: 75 },
    { width: 50, height: 50 },
    { width: 30, height: 30 },
  ];
  x = Math.random() * this.game.width;
  y = -this.sizes[0].height;
  size = this.sizes[Math.floor(Math.random() * this.sizes.length)];
  width = this.size.width;
  radius = this.width * 0.5;
  height = this.size.height;
  damage = 10;
  speed = 200;
  markedForDeletion = false;
  image = this.game.getImage('asteroid_image');

  constructor(game: Game) {
    super(game);
  }

  draw(ctx: CTX) {
    // Tail
    const tailLength = 5;
    const tailOpacity = 0.1;
    for (let i = 0; i < tailLength; i++) {
      ctx.fillStyle = `rgba(173, 216, 230, ${tailOpacity * (1 - i / tailLength)})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y - i * 10, this.width * 0.5 + i * 2, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Asteroid
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime: number) {
    // Movement
    this.y += (this.speed * deltaTime) / 1000;

    // Remove asteroids that go off-screen
    if (this.y + this.height * 0.5 > this.game.height + 100) this.markedForDeletion = true;
  }
}
