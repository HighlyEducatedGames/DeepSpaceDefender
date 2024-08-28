import { FriendlyProjectile, GameObject } from '../GameObject';

export default class Missile extends FriendlyProjectile {
  target: GameObject;
  x: number;
  y: number;
  width = 20;
  height = 20;
  radius = this.width * 0.5;
  damage = 50;
  speed = 300;
  directionX = 0;
  directionY = 0;
  maxDistance = 3000;
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
      // Move the missile towards the target
      const angleToTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      this.x += (Math.cos(angleToTarget) * this.speed * deltaTime) / 1000 || 0;
      this.y += (Math.sin(angleToTarget) * this.speed * deltaTime) / 1000 || 0;
    } else {
      this.markedForDeletion = true;
    }
  }
}
