import { getRandomDirection, spawnOffScreenRandomSide } from '../utilities.js';

class TemporalSerpent {
  constructor(game) {
    this.game = game;
    this.x = 250;
    this.y = 250;
    this.speed = 400;
    this.health = 2000;
    this.maxHealth = 2000;
    this.lastAttackTime = 0;
    this.attackInterval = 3000;
    this.canAttack = true;
    this.phase = 1;
    this.phaseTransitioned = [false, false, false];
    this.segments = [{ x: this.x, y: this.y, radius: 30 }];
    this.segmentAddInterval = 200;
    this.lastSegmentAddTime = 0;
    this.lastBombDamageTime = 0;
    this.direction = getRandomDirection();
    this.projectileCollisionRadius = 100;
    this.playerCollisionRadius = 120;
    this.maxSegments = 3000;
    this.healthBarWidth = 200;
    this.healthBarHeight = 20;
    this.healthBarX = (this.game.canvas.width - this.healthBarWidth) * 0.5;
    this.healthBarY = this.game.canvas.height - this.healthBarHeight - 30;
    this.projectiles = [];

    this.directionChangeInterval = 1500;
    this.followPlayerInterval = 2500;
    this.lastDirectionChangeTime = performance.now();
    this.lastFollowPlayerTime = performance.now();

    this.images = {
      base: new Image(),
      head: new Image(),
      segment: new Image(),
    };
    this.images.base.src = 'assets/images/temporal_serpent.png';
    this.images.head.src = 'assets/images/serpentHead.png';
    this.images.segment.src = 'assets/images/serpentSegment.png';

    this.sounds = {
      hazard: new Audio('assets/audio/hazardZone.mp3'),
    };

    spawnOffScreenRandomSide(this, 100);
  }

  draw(ctx) {
    // Serpent segments
    /*this.segments.forEach((segment, index) => {
      // Skip the head segment
      if (index !== 0) {
        if (
          segment.x > 0 &&
          segment.x < this.game.canvas.width &&
          segment.y > 0 &&
          segment.y < this.game.canvas.height
        ) {
          ctx.drawImage(
            this.images.segment,
            segment.x - segment.radius,
            segment.y - segment.radius,
            segment.radius * 2,
            segment.radius * 2,
          );
        }
      }
    });*/

    // Serpent head
    const head = this.segments[0];
    if (head.x > 0 && head.x < this.game.canvas.width && head.y > 0 && head.y < this.game.canvas.height) {
      ctx.drawImage(this.images.head, head.x - head.radius, head.y - head.radius, head.radius * 2, head.radius * 2);

      // DEBUG - Hitbox
      if (this.game.debug) {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(head.x, head.y, head.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Health Bar
    const healthRatio = this.health / this.maxHealth;

    ctx.fillStyle = 'rgba(187,27,27,0.85)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * healthRatio, this.healthBarHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

    ctx.save();
    ctx.font = '10px "Press Start 2P", cursive';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Temporal Serpent', this.game.canvas.width * 0.5, this.healthBarY + this.healthBarHeight + 20);
    ctx.restore();
  }

  update() {}

  getDirectionTowardsPlayer() {
    const dx = this.game.player.x - this.x;
    const dy = this.game.player.y - this.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }
}

export default TemporalSerpent;
