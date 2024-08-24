export class ArrowIndicator {
  size = 20;
  circleRadius = 25;
  imageSize = 25;
  color = 'red';
  margin = 10;
  bobOffset = 0;
  bobSpeed = 2;
  bobAmplitude = 5;
  flashSpeed = 500;
  markedForDeletion = false;

  constructor(game, target) {
    /** @type {import('./Game.js').default} */
    this.game = game;
    this.target = target;
  }

  draw(ctx) {
    // Determine if the target is offscreen
    const isOffScreen = this.game.outOfBounds(this.target);
    if (!isOffScreen) return;

    // Update the bobbing effect
    this.bobOffset = Math.sin(Date.now() * 0.002 * this.bobSpeed) * this.bobAmplitude;

    // Determine the position for the arrow
    let arrowX = this.target.x;
    let arrowY = this.target.y;

    // Clamp X position to the canvas edges
    if (this.target.x < this.margin) {
      arrowX = this.margin;
    } else if (this.target.x > this.game.width - this.margin) {
      arrowX = this.game.width - this.margin;
    }

    // Clamp Y position to the canvas edges
    if (this.target.y < this.margin) {
      arrowY = this.margin;
    } else if (this.target.y > this.game.height - this.margin) {
      arrowY = this.game.height - this.margin;
    }

    // Calculate the angle to the target from the center of the canvas
    const dx = this.target.x - this.game.width * 0.5;
    const dy = this.target.y - this.game.height * 0.5;
    const angle = Math.atan2(dy, dx);

    // Determine the position for the circle behind the arrow, opposite the arrow direction
    const circleX = arrowX - Math.cos(angle) * (this.circleRadius + this.size);
    const circleY = arrowY - Math.sin(angle) * (this.circleRadius + this.size) + this.bobOffset;

    // Draw the stroked circle behind the arrow
    ctx.save();
    ctx.strokeStyle = this.color; // Use the arrow's color for the circle stroke
    ctx.lineWidth = 2; // Set the stroke width
    ctx.beginPath();
    ctx.arc(circleX, circleY, this.circleRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw the target image inside the circle
    ctx.drawImage(
      this.target.image,
      circleX - this.imageSize * 0.5,
      circleY - this.imageSize * 0.5,
      this.imageSize,
      this.imageSize,
    );

    // Flashing effect: only draw the arrow if the current time modulo flashSpeed is less than half flashSpeed
    if (Date.now() % this.flashSpeed < this.flashSpeed / 2) {
      // Draw the arrow on top, positioned correctly relative to the circle
      ctx.translate(arrowX, arrowY);
      ctx.rotate(angle);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(-this.size * 0.5, -this.size * 0.5);
      ctx.lineTo(this.size * 0.5, 0);
      ctx.lineTo(-this.size * 0.5, this.size * 0.5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  update() {
    // Check if the target is on screen
    const targetOnScreen = !this.game.outOfBounds(this.target);

    // Check if the target is marked for deletion or if the target no longer exists
    const targetKilled = !this.target || this.target.markedForDeletion;

    // Remove the arrow if the target is on screen, marked for deletion, or doesn't exist
    if (targetOnScreen || targetKilled) this.markedForDeletion = true;
  }
}
