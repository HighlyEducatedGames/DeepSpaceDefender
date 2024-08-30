import { FriendlyProjectile, GameObject } from './GameObject';

export default class Ally extends GameObject {
  x: number;
  y: number;
  width = 50;
  height = 50;
  radius = this.width * 0.5;
  enteringSide: Side;
  exitingSide: Side;
  offset = 4;
  speed = 150;
  rotation = 0;
  warning = true;
  warningDuration = 3000;
  entryDistance = 50;
  pattern = this.selectedPattern();
  orbitRadius = 100;
  orbitFullRotationDuration = 5000;
  orbitRotationDirection = Math.random() < 0.5 ? -1 : 1;
  entering = true;
  movedToPlayer = false;
  arrivedAtTarget = false;
  exiting = false;
  exitTime = 0;
  exitDuration = 15000;
  nextAttackTime = 0;
  attackInterval = 200;
  targetX = 0;
  targetY = 0;
  followMargin = 15;
  targetSpeedMultiplier = 1;
  targetSnapDistance = 10;
  image: HTMLImageElement;
  sounds: { [key: string]: HTMLAudioElement };

  constructor(game: Game) {
    super(game);
    this.image = this.game.getImage('ally_image');
    this.sounds = {
      warning: this.game.getAudio('ally_sound'),
      overAndOut: this.game.getAudio('ally_over_sound'),
      circularOrbit: this.game.getAudio('ally_circular_orbit_sound'),
      followPlayer: this.game.getAudio('ally_follow_player_sound'),
    };
    // Get spawning location and side
    const { x, y, side } = this.game.getOffScreenRandomSide(this);
    this.x = x;
    this.y = y;
    this.enteringSide = side;
    this.exitingSide = this.game.getRandomSide();

    // Play warning sound immediately
    this.sounds.warning.play().catch(() => {});
    setTimeout(() => {
      this.warned();
    }, this.warningDuration);
  }

  draw(ctx: CTX) {
    if (!this.warning) {
      // Ally
      const xAdjustPos = Math.cos(this.rotation) * this.offset;
      const yAdjustPos = Math.sin(this.rotation) * this.offset;
      ctx.save();
      ctx.translate(this.x - xAdjustPos, this.y - yAdjustPos);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
      ctx.restore();

      // DEBUG - Hitbox
      if (this.game.debug) {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.orbitRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Target follow position
        if (!this.exiting && this.targetX && this.targetY) {
          ctx.fillStyle = 'yellow';
          ctx.beginPath();
          ctx.arc(this.targetX, this.targetY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  update(deltaTime: number) {
    if (this.warning) return;

    // Movement
    const distanceToPlayer = this.game.player.getDistanceToPlayer(this);
    const angleToPlayer = this.game.player.getAngleToPlayer(this);

    // Come into the game orthogonal to the canvas edges before moving to the player
    if (this.entering) {
      const entrySpeed = (this.speed * deltaTime) / 1000;
      this.rotation = angleToPlayer;
      switch (this.enteringSide) {
        case 'left':
          this.x += entrySpeed;
          if (this.x >= this.entryDistance) this.entering = false;
          this.rotation = 0;
          break;
        case 'right':
          this.x -= entrySpeed;
          if (this.x <= this.game.width - this.entryDistance) this.entering = false;
          this.rotation = Math.PI;
          break;
        case 'top':
          this.y += entrySpeed;
          if (this.y >= this.entryDistance) this.entering = false;
          this.rotation = Math.PI * 0.5;
          break;
        case 'bottom':
          this.y -= entrySpeed;
          if (this.y <= this.game.height - this.entryDistance) this.entering = false;
          this.rotation = Math.PI * 1.5;
          break;
      }
    } else if (!this.movedToPlayer) {
      // After we enter, move and point nose towards the player
      if (distanceToPlayer > this.orbitRadius) {
        this.x += (Math.cos(angleToPlayer) * this.speed * deltaTime) / 1000;
        this.y += (Math.sin(angleToPlayer) * this.speed * deltaTime) / 1000;
        this.rotation = angleToPlayer;
      } else {
        this.movedToPlayer = true;
        this.rotation += Math.PI;
      }
    } else if (this.exiting) {
      // Handle exit motion
      // Rotate to point orthogonal toward exit side
      let exitSpeed = (this.speed * deltaTime) / 1000;
      switch (this.exitingSide) {
        case 'left':
          this.x -= exitSpeed;
          this.rotation = Math.PI;
          break;
        case 'right':
          this.x += exitSpeed;
          this.rotation = 0;
          break;
        case 'top':
          this.y -= exitSpeed;
          this.rotation = Math.PI * 1.5;
          break;
        case 'bottom':
          this.y += exitSpeed;
          this.rotation = Math.PI * 0.5;
          break;
      }

      // Delete ally if exiting and out of bounds
      if (this.game.outOfBounds(this)) this.markedForDeletion = true;
    } else {
      // Employ movement patten once ally has made it to the player
      switch (this.pattern) {
        case 'circularOrbit':
          this.rotation += ((Math.PI * 2 * deltaTime) / this.orbitFullRotationDuration) * this.orbitRotationDirection;
          this.x = this.game.player.x + Math.cos(this.rotation) * this.orbitRadius;
          this.y = this.game.player.y + Math.sin(this.rotation) * this.orbitRadius;
          break;
        case 'followPlayer':
          {
            const player = this.game.player;

            // Determine the target position for the ally based on player position and rotation
            const distanceX = this.width * 0.5 + this.width * 0.5 + this.followMargin;
            const distanceY = this.height * 0.5 + this.height * 0.5 + this.followMargin;
            this.targetX = player.x + Math.cos(player.rotation + Math.PI) * distanceX;
            this.targetY = player.y + Math.sin(player.rotation + Math.PI) * distanceY;

            // Get distance and angle to target position
            const distanceToTarget = Math.hypot(this.x - this.targetX, this.y - this.targetY);
            const angleToTarget = Math.atan2(this.targetY - this.y, this.targetX - this.x);

            // Snap to target once close enough
            if (!this.arrivedAtTarget && distanceToTarget < this.targetSnapDistance) {
              this.arrivedAtTarget = true;
            }

            if (!this.arrivedAtTarget) {
              // Move ever quicker toward the target position
              this.x += (Math.cos(angleToTarget) * this.speed * this.targetSpeedMultiplier * deltaTime) / 1000;
              this.y += (Math.sin(angleToTarget) * this.speed * this.targetSpeedMultiplier * deltaTime) / 1000;
              this.targetSpeedMultiplier += 0.02;
            } else {
              // Snap to target location
              this.x = this.targetX;
              this.y = this.targetY;
            }
            // Always stay 180deg from player rotation
            this.rotation = player.rotation + Math.PI;
          }
          break;
      }
    }

    // Check if it's time for the ally to exit
    this.exitTime += deltaTime;
    if (this.exitTime > this.exitDuration) {
      this.exitTime = 0;
      this.exiting = true;
      this.sounds.overAndOut.play();
    }

    // Fire projectiles in the opposite direction of the player
    this.nextAttackTime += deltaTime;
    if (!this.markedForDeletion && this.movedToPlayer && !this.exiting && this.nextAttackTime > this.attackInterval) {
      this.nextAttackTime = 0;
      this.game.projectiles.push(new AllyProjectile(this));
    }
  }

  checkCollisions() {
    // No collisions to check
  }

  warned() {
    this.warning = false;
    // Play pattern sound once the warning time is over
    if (this.pattern === 'circularOrbit') this.sounds.circularOrbit.play();
    else if (this.pattern === 'followPlayer') this.sounds.followPlayer.play();
  }

  selectedPattern() {
    const patterns = ['circularOrbit', 'followPlayer'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }
}

class AllyProjectile extends FriendlyProjectile {
  ally: Ally;
  x: number;
  y: number;
  angle: number;
  speed = 250;
  width = 5;
  height = 5;
  damage = 25;
  radius = this.width * 0.5;
  offset: number;
  directionX: number;
  directionY: number;

  constructor(ally: Ally) {
    super(ally.game);
    this.ally = ally;
    this.offset = this.ally.width * 0.5;
    this.angle = this.ally.rotation;
    this.x = this.ally.x + Math.cos(this.angle) * this.offset;
    this.y = this.ally.y + Math.sin(this.angle) * this.offset;
    this.directionX = Math.cos(this.angle);
    this.directionY = Math.sin(this.angle);
  }

  draw(ctx: CTX) {
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime: number) {
    // Movement
    this.x += (this.directionX * this.speed * deltaTime) / 1000;
    this.y += (this.directionY * this.speed * deltaTime) / 1000;

    // Delete if out of bounds
    if (this.game.outOfBounds(this)) this.markedForDeletion = true;
  }
}
