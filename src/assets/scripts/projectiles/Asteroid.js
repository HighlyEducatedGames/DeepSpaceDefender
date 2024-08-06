export default class Asteroid {
  constructor(game) {
    this.game = game;
    this.sizes = [
      { width: 75, height: 75 },
      { width: 50, height: 50 },
      { width: 30, height: 30 },
    ];
    this.x = Math.random() * this.game.canvas.width;
    this.y = -this.sizes[0].height;
    this.size = this.sizes[Math.floor(Math.random() * this.sizes.length)];
    this.width = this.size.width;
    this.height = this.size.height;
    this.damage = 10;
    this.speed = 200;
    this.markedForDeletion = false;

    this.image = new Image();
    this.image.src = 'assets/images/asteroid.png';
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
    if (this.y + this.height * 0.5 > this.game.canvas.height + 100) this.markedForDeletion = true;

    this.checkCollisions();
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

    // Check collision with bomb // TODO -- remove asteroid
    const bomb = this.game.player.getBomb();
    if (bomb) {
      if (this.game.checkCollision(bomb, this)) this.markedForDeletion = true;
    }
  }
}
