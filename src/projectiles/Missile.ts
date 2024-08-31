import { FriendlyProjectile, GameObject } from '../GameObject';

export default class Missile extends FriendlyProjectile {
  target: GameObject;
  x: number;
  y: number;
  radius = 10;
  width = 20;
  height = 20;
  damage = 50;
  speed = 300;
  image = this.game.getImage('missile_image');
  sound = this.game.getAudio('missile_sound');

  constructor(game: Game, target: GameObject) {
    super(game);
    this.target = target;
    this.x = this.game.player.x;
    this.y = this.game.player.y;
  }

  draw(ctx: CTX) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const angleToTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);
    ctx.rotate(angleToTarget);
    ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime: number) {
    if (this.target) {
      const angleToTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      this.vx = Math.cos(angleToTarget);
      this.vy = Math.sin(angleToTarget);

      // Move the missile towards the target
      this.x += (this.vx * this.speed * deltaTime) / 1000;
      this.y += (this.vy * this.speed * deltaTime) / 1000;
    } else {
      this.markedForDeletion = true;
    }
  }
}
