export class ArrowIndicator {
  constructor(game, target) {
    this.game = game;
    this.target = target;
    this.size = 20; // Size of the arrow
    this.circleRadius = 25; // Radius of the circle behind the arrow
    this.imageSize = 25; // Size of the target image inside the circle
    this.color = 'red'; // Color of the arrow and circle
    this.margin = 10; // Margin from the edge of the canvas
    this.targetImage = target.image; // Assuming target has an `image` property
    this.bobOffset = 0; // Initial offset for bobbing
    this.bobSpeed = 2; // Speed of the bobbing effect
    this.bobAmplitude = 5; // Amplitude of the bobbing effect
    this.flashSpeed = 500; // Speed of the flashing effect in milliseconds
    this.markedForDeletion = false;
  }

  draw(ctx) {
    const canvasWidth = this.game.canvas.width;
    const canvasHeight = this.game.canvas.height;

    // Determine if the target is offscreen
    const isOffScreen =
      this.target &&
      (this.target.x < 0 || this.target.x > canvasWidth || this.target.y < 0 || this.target.y > canvasHeight);

    if (!isOffScreen) return;

    // Update the bobbing effect
    this.bobOffset = Math.sin(Date.now() * 0.002 * this.bobSpeed) * this.bobAmplitude;

    // Determine the position for the arrow
    let arrowX = this.target.x;
    let arrowY = this.target.y;

    // Clamp X position to the canvas edges
    if (this.target.x < this.margin) {
      arrowX = this.margin;
    } else if (this.target.x > canvasWidth - this.margin) {
      arrowX = canvasWidth - this.margin;
    }

    // Clamp Y position to the canvas edges
    if (this.target.y < this.margin) {
      arrowY = this.margin;
    } else if (this.target.y > canvasHeight - this.margin) {
      arrowY = canvasHeight - this.margin;
    }

    // Calculate the angle to the target from the center of the canvas
    const dx = this.target.x - canvasWidth / 2;
    const dy = this.target.y - canvasHeight / 2;
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
      this.targetImage,
      circleX - this.imageSize / 2,
      circleY - this.imageSize / 2,
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
      ctx.moveTo(-this.size / 2, -this.size / 2);
      ctx.lineTo(this.size / 2, 0);
      ctx.lineTo(-this.size / 2, this.size / 2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  update() {
    // Check if the target is on screen
    const targetOnScreen =
      this.target &&
      this.target.x > 0 &&
      this.target.x < this.game.canvas.width &&
      this.target.y > 0 &&
      this.target.y < this.game.canvas.height;

    // Check if the target is marked for deletion or if the target no longer exists
    const targetKilled = !this.target || this.target.markedForDeletion;

    // Remove the arrow if the target is on screen, marked for deletion, or doesn't exist
    if (targetOnScreen || targetKilled) {
      this.markedForDeletion = true;
    }
  }
}
