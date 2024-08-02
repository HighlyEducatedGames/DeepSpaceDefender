import { getRandomDirection, spawnOffScreenRandomSide } from '../utilities.js';

class TemporalSerpent {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 200;
    this.height = 200;
    this.speed = 400;
    this.health = 2000;
    this.maxHealth = 2000;
    this.lastAttackTime = 0;
    this.attackInterval = 3000;
    this.canAttack = true;
    this.phase = 1;
    this.phaseTransitioned = [false, false, false];
    this.alive = true;
    this.segments = [{ x: this.x, y: this.y, radius: 30 }];
    this.segmentAddInterval = 200;
    this.lastSegmentAddTime = 0;
    this.lastBombDamageTime = 0;
    this.direction = getRandomDirection();
    this.projectileCollisionRadius = 100;
    this.playerCollisionRadius = 120;
    this.maxSegments = 3000;
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
    if (!this.alive) return;

    // Serpent segments
    this.segments.forEach((segment, index) => {
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
    });

    // Serpent head
    const head = this.segments[0];
    if (head.x > 0 && head.x < this.game.canvas.width && head.y > 0 && head.y < this.game.canvas.height) {
      ctx.drawImage(this.images.head, head.x - head.radius, head.y - head.radius, head.radius * 2, head.radius * 2);
    }

    // Health Bar
    const barWidth = 200;
    const barHeight = 20;
    const barX = (this.game.canvas.width - barWidth) * 0.5;
    const barY = this.game.canvas.height - barHeight - 30;
    const healthRatio = this.health / this.maxHealth;

    ctx.fillStyle = 'red';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = 'green';
    ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.font = '10px "Press Start 2P", cursive';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    ctx.fillText('Temporal Serpent', this.game.canvas.width * 0.5, barY + barHeight + 20);
  }

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
