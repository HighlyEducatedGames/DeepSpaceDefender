export default class RegularProjectile {
  constructor(game, angleOffset) {
    this.game = game;
    this.angleOffset = angleOffset;
    this.x = this.game.player.x + (Math.cos(this.game.player.rotation + angleOffset) * this.game.player.width) / 2;
    this.y = this.game.player.y + (Math.sin(this.game.player.rotation + angleOffset) * this.game.player.height) / 2;
    this.width = 5;
    this.height = 5;
    this.speed = 500;
    this.directionX = Math.cos(this.game.player.rotation + angleOffset);
    this.directionY = Math.sin(this.game.player.rotation + angleOffset);
    this.damage = 10;
    this.maxDistance = 800;
    this.traveledDistance = 0;
    this.markedForDeletion = false;

    // this.setCharged();
    // this.setDirection();
  }

  setCharged() {
    /*if (this.chargeDuration >= 2) {
      this.width = 30;
      this.height = 30;
      this.speed = 300;
      this.damage = this.fullChargeDamage;
      this.isCharged = true;
    } else if (this.chargeDuration >= 1) {
      this.width = 20;
      this.height = 20;
      this.speed = 400;
      this.damage = this.partialChargeDamage;
    }*/
  }

  // setDirection() {
  /*    if (this.split) {
      this.directionX = Math.cos(this.angleOffset);
      this.directionY = Math.sin(this.angleOffset);
      this.damage = this.splitDamage;
    } else {*/
  // this.directionX = Math.cos(this.game.player.rotation + this.angleOffset);
  // this.directionY = Math.sin(this.game.player.rotation + this.angleOffset);
  // }
  // }

  draw(ctx) {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime) {
    this.x += (this.speed * this.directionX * deltaTime) / 1000;
    this.y += (this.speed * this.directionY * deltaTime) / 1000;
    this.traveledDistance += (this.speed * deltaTime) / 1000;

    if (this.traveledDistance > this.maxDistance) {
      this.markedForDeletion = true;
      return;
    }

    /*if (this.isCharged && !this.split && this.traveledDistance >= 300) {
      /!*this.splitChargedProjectile();
      this.markedForDeletion = true;
      return;*!/
    }*/

    // Screen wrap
    if (this.x < 0) this.x = this.game.canvas.width;
    if (this.x > this.game.canvas.width) this.x = 0;
    if (this.y < 0) this.y = this.game.canvas.height;
    if (this.y > this.game.canvas.height) this.y = 0;

    this.checkCollisions();
  }

  checkCollisions() {
    // Collision with enemies
    this.game.enemies.enemies.forEach((enemy) => {
      if (this.game.checkCollision(this, enemy)) {
        enemy.takeDamage(this.damage);
        this.markedForDeletion = true;
      }
    });
  }

  // TODO
  splitChargedProjectile() {
    /*const numberOfProjectiles = 8;
    const angleIncrement = (2 * Math.PI) / numberOfProjectiles;

    for (let i = 0; i < numberOfProjectiles; i++) {
      const angleOffset = i * angleIncrement;
      this.game.player.projectiles.push(new RegularProjectile(this.game, angleOffset, this.chargeDuration, true));
    }*/
  }
}

// function splitChargedProjectile(projectile) {
//   const numberOfProjectiles = 8;
//   const angleIncrement = (2 * Math.PI) / numberOfProjectiles;

//   for (let i = 0; i < numberOfProjectiles; i++) {
//     const angle = i * angleIncrement;
//     let splitProjectile = {
//       x: projectile.x,
//       y: projectile.y,
//       width: 5,
//       height: 5,
//       speed: 500,
//       directionX: Math.cos(angle),
//       directionY: Math.sin(angle),
//       fromPlayer: true,
//       isCharged: false,
//       maxDistance: 800,
//       traveledDistance: 0,
//       damage: SPLIT_PROJECTILE_DAMAGE,
//       split: true,
//     };
//     projectiles.push(splitProjectile);
//   }
// }
