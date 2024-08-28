export default class Asteroid {
  sizes = [
    { width: 75, height: 75 },
    { width: 50, height: 50 },
    { width: 30, height: 30 },
  ];
  y = -this.sizes[0].height;
  size = this.sizes[Math.floor(Math.random() * this.sizes.length)];
  width = this.size.width;
  height = this.size.height;
  damage = 10;
  speed = 200;
  markedForDeletion = false;
  image = document.getElementById('asteroid_image');

  constructor(game) {
    /** @type {import('../Game.ts').default} */
    this.game = game;
    this.x = Math.random() * this.game.width;
  }

  draw(ctx) {
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

  update(deltaTime) {
    // Movement
    this.y += (this.speed * deltaTime) / 1000;

    // Remove asteroids that go off-screen
    if (this.y + this.height * 0.5 > this.game.height + 100) this.markedForDeletion = true;
  }

  checkCollisions() {
    // Check collision with player
    if (this.game.checkCollision(this.game.player, this)) {
      this.game.player.sounds.collision.cloneNode().play();
      this.game.player.takeDamage(this.damage);
      this.markedForDeletion = true;
    }

    // Check player projectiles to asteroid
    this.game.player.projectiles.forEach((projectile) => {
      if (this.game.checkCollision(projectile, this)) {
        this.markedForDeletion = true;
        projectile.markedForDeletion = true;
        // this.game.player.sounds.collision.cloneNode().play(); // TODO sounds here?
        // TODO make larger, charged projectiles, pass through enemy projectiles
        // TODO: Maybe not with asteroids
      }
    });

    // Check collision with bomb
    const bomb = this.game.player.bomb;
    if (bomb) {
      if (this.game.checkCollision(bomb, this)) this.markedForDeletion = true;
    }
  }
}
