class Bomb {
  constructor(game) {
    this.game = game;
    this.x = this.game.player.x;
    this.y = this.game.player.y;
    this.radius = 300;
    this.damage = 150;
    this.bombFlashTime = performance.now();
    this.timeSinceBomb = 0;
    this.markedForDeletion = false;

    this.sound = new Audio('assets/audio/bombSound.mp3');

    // Play bomb sound as soon as it is spawned
    this.sound.cloneNode().play();
  }

  draw(ctx) {
    // Flash for 1 second
    const flashPeriod = 200; // Flash every 200ms
    const flashDuration = 100; // Duration of each flash
    if (this.timeSinceBomb % flashPeriod < flashDuration) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update() {
    this.timeSinceBomb = performance.now() - this.bombFlashTime;
    // Bomb only lasts for 1 second
    if (this.timeSinceBomb >= 1000) {
      this.markedForDeletion = true;
    }

    // Follow the player
    this.x = this.game.player.x;
    this.y = this.game.player.y;

    this.checkCollisions();
  }

  checkCollisions() {
    // Check Enemies
    // Check projectiles
    // Check spiral projections
    // Check bosses
  }
}

export default Bomb;
