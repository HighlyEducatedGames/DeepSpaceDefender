import { spawnOffScreenRandomSide } from '../utilities.js';

class BiomechLeviathan {
  constructor(game) {
    this.game = game;
    this.x = 250;
    this.y = 250;
    this.width = 200;
    this.height = 200;
    this.speed = 40;
    this.maxHealth = 2000;
    this.health = this.maxHealth;
    this.lastAttackTime = 0;
    this.attackInterval = 1500;
    this.canAttack = true;
    this.phase = 1;
    this.phaseTransitioned = [false, false, false];
    this.playerCollisionRadius = 65;
    this.projectiles = [];
    this.healthBarWidth = this.width;
    this.healthBarHeight = 10;
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y + this.height * 0.5 + 10;
    this.damage = 0.1;
    this.markedForDeletion = false;

    this.image = new Image();
    this.image.src = 'assets/images/biomech_leviathan.png';

    this.sounds = {
      tractorBeam: new Audio('assets/audio/tractorBeamSound.mp3'),
      emp: new Audio('assets/audio/empSound.mp3'),
      eat: new Audio('assets/audio/biomechEat.mp3'),
      splat: new Audio('assets/audio/splatSound.mp3'),
      noFire: new Audio('assets/audio/nofire.mp3'),
    };

    this.music = new Audio('assets/audio/boss_music.mp3');

    // spawnOffScreenRandomSide(this, 100);
  }

  draw(ctx) {
    // Leviathan
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
    ctx.restore();

    // Health Bar
    const healthRatio = this.health / this.maxHealth;

    ctx.fillStyle = 'rgba(187,27,27,0.85)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * healthRatio, this.healthBarHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'orange';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.playerCollisionRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update() {
    this.checkCollisions();
  }

  checkCollisions() {
    // Collision with player projectiles
    this.game.player.projectiles.forEach((projectile) => {
      if (this.game.checkCollision(projectile, this)) {
        this.health -= projectile.damage;
        if (this.health <= 0) this.markedForDeletion = true;
        projectile.markedForDeletion = true;
      }
    });

    // Collision with player
    if (this.game.checkCollision(this.game.player, { x: this.x, y: this.y, radius: this.playerCollisionRadius })) {
      this.game.player.takeDamage(this.damage);
      this.game.player.sounds.collision.cloneNode().play();
    }

    // Bomb stops tractor beam and puts it on cooldown for 5 seconds // TODO
    // Stop the tractor beam and start the cooldown
  }
}

export default BiomechLeviathan;
