export default class Missile {
  width = 20;
  height = 20;
  directionX = 0;
  directionY = 0;
  speed = 300;
  damage = 50;
  maxDistance = 3000;
  markedForDeletion = false;
  image = document.getElementById('missile_image');
  sound = document.getElementById('missile_sound');

  constructor(game, target) {
    /** @type {import('../Game.js').default} */
    this.game = game;
    this.target = target;
    this.x = this.game.player.x;
    this.y = this.game.player.y;
  }

  draw(ctx) {
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

  update(deltaTime) {
    if (this.target) {
      // Move the missile towards the target
      const angleToTarget = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      this.x += (Math.cos(angleToTarget) * this.speed * deltaTime) / 1000 || 0;
      this.y += (Math.sin(angleToTarget) * this.speed * deltaTime) / 1000 || 0;
    } else {
      this.markedForDeletion = true;
    }
  }

  checkCollisions() {
    // Check for collision with target
    if (this.game.checkCollision(this, this.target)) {
      this.target.takeDamage(this.damage);
      this.game.playCollision();
      this.markedForDeletion = true;
    }
  }
}
