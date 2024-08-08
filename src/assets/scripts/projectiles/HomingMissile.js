export default class HomingMissile {
  constructor(game, target) {
    this.game = game;
    this.target = target;
    this.x = this.game.player.x;
    this.y = this.game.player.y;
    this.width = 20;
    this.height = 20;
    this.directionX = 0;
    this.directionY = 0;
    this.speed = 300;
    this.collisionRadius = null;
    this.damage = 50;
    this.traveledDistance = 0;
    this.maxDistance = 3000;
    this.markedForDeletion = false;

    this.image = new Image();
    this.image.src = 'assets/images/homing_missile.png';
    this.sound = new Audio('assets/audio/homing_missile_sound.mp3');

    this.findTarget();
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

    this.checkCollisions();
  }

  checkCollisions() {
    // Check for collision with target
    if (this.game.checkCollision(this, this.target)) {
      this.target.takeDamage(this.damage);
      this.game.player.sounds.collision.cloneNode().play();
      this.markedForDeletion = true;
    }
  }

  findTarget() {
    const enemies = this.game.enemies;
    // TODO: // Find nearest target ??//
    const randomIndex = Math.floor(Math.random() * enemies.length);
    this.target = this.boss ? this.boss : enemies[randomIndex];

    // TODO: make sure its the head trageted with the serpent head
    // projectileCollisionRadius: 125, // 250 diameter / 2 is set in cyberdragon creation
    // if (this.target) {
    //   if (this.target instanceof CyberDragon) this.collisionRadius = cyberDragon.projectileCollisionRadius;
    //   else if (this.target instanceof BiomechLeviathan)
    //     this.collisionRadius = biomechLeviathan.projectileCollisionRadius;
    //   else if (this.target instanceof TemporalSerpent) this.collisionRadius = temporalSerpent.playerCollisionRadius;
    //   else this.collisionRadius = Math.max(this.target.width, this.target.height) / 2;
    // }
  }
}
