import Asteroid from '../hazards/Asteroid';
import Explosion from '../effects/Explosion';
import { BossCreature, EnemyProjectile } from '../GameObject';

export default class CyberDragon extends BossCreature {
  x: number;
  y: number;
  radius = 125;
  playerCollisionRadius = 65;
  width = 250;
  height = 250;
  speed = 50;
  maxHealth = 3000;
  health = this.maxHealth;
  points = this.maxHealth;
  image = this.game.getImage('cyber_dragon_image');
  music = this.game.getAudio('boss_music');
  sounds = {
    laserCharging: this.game.getAudio('laser_charging_sound'),
    spiralShot: this.game.getAudio('spiral_shot_sound'),
  };
  damage = 10;
  canAttack = false;
  phase = 1;
  healthBarWidth = this.width;
  healthBarHeight = 10;
  healthBarX: number;
  healthBarY: number;

  laserAttackInterval = 2000;
  laserAttackTimer = this.laserAttackInterval;
  laserCharging = false;
  laserChargeTimer = 0;
  laserChargeDuration = 3500;
  laserChargeRadius = 5;
  laserReady = false;

  asteroidInterval = 600;
  asteroidTimer = this.asteroidInterval;

  spiralShotInterval = 9000;
  spiralShotTimer = this.spiralShotInterval;
  spiralShotActive = false;
  spiralShotAngle = 0;
  spiralShotAnglePitch = 0.1;
  spiralShotDuration = 5000;
  spiralShotFireTimer = 0;
  spiralShotFireInterval = 100;

  constructor(game: Game) {
    super(game);

    const { x, y } = this.game.getOffScreenRandomSide(this, 20);
    this.x = x;
    this.y = y;
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y + this.height * 0.5 + 10;

    setTimeout(() => {
      this.canAttack = true;
    }, 5000);
  }

  draw(ctx: CTX) {
    // Dragon
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);

    // Health Bar
    const healthRatio = this.health / this.maxHealth;
    ctx.fillStyle = 'rgba(187,27,27,0.85)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * healthRatio, this.healthBarHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

    // Laser Charge
    if (this.laserCharging) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y + 6, this.laserChargeRadius, 0, 2 * Math.PI);
      ctx.fill();
    }

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

  update(deltaTime: number) {
    super.update(deltaTime);

    // Movement
    const angleToPlayer = this.game.player.getAngleToPlayer(this);
    this.vx = Math.cos(angleToPlayer);
    this.vy = Math.sin(angleToPlayer);
    this.x += (this.vx * this.speed * deltaTime) / 1000;
    this.y += (this.vy * this.speed * deltaTime) / 1000;

    // Health bar follows boss
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y + this.height * 0.5 + 10;

    // Phase Transitions
    if (this.phase === 1 && this.health < this.maxHealth * 0.75) {
      this.phase = 2;
    } else if (this.phase === 2 && this.health < this.maxHealth * 0.5) {
      this.phase = 3;
    } else if (this.phase === 3 && this.health < this.maxHealth * 0.25) {
      this.phase = 4;
    }

    // Laser Charging
    if (this.laserCharging) {
      this.laserChargeTimer += deltaTime;
      this.laserChargeRadius = 5 + (this.laserChargeTimer / this.laserChargeDuration) * 20;

      if (this.laserChargeTimer >= this.laserChargeDuration) {
        this.laserReady = true;
        this.laserCharging = false;
        this.fireLaser();
        this.sounds.laserCharging.pause();
        this.sounds.laserCharging.currentTime = 0;
      }
    }

    // Attack logic
    if (this.canAttack) {
      switch (this.phase) {
        case 1:
          this.chargeLaser(deltaTime);
          break;
        case 2:
          this.chargeLaser(deltaTime);
          this.spawnAsteroid(deltaTime);
          break;
        case 3:
          this.fireSpiralProjectiles(deltaTime);
          break;
        case 4:
          this.chargeLaser(deltaTime);
          this.spawnAsteroid(deltaTime);
          this.fireSpiralProjectiles(deltaTime);
          break;
      }
    }
  }

  chargeLaser(deltaTime: number) {
    this.laserAttackTimer += deltaTime;
    if (this.laserAttackTimer >= this.laserAttackInterval) {
      if (!this.laserCharging) {
        this.laserCharging = true;
        this.laserChargeTimer = 0;
        this.laserChargeRadius = 5;
        this.sounds.laserCharging.currentTime = 0;
        this.sounds.laserCharging.play().catch(() => {});
      }
    }
  }

  fireLaser() {
    if (!this.laserReady) return;
    const angleToPlayer = this.game.player.getAngleToPlayer(this);
    this.game.projectiles.push(new Laser(this, angleToPlayer));
    this.laserReady = false;
  }

  spawnAsteroid(deltaTime: number) {
    this.asteroidTimer += deltaTime;
    if (this.asteroidTimer >= this.asteroidInterval) {
      this.asteroidTimer = 0;
      this.game.projectiles.push(new Asteroid(this.game));
    }
  }

  fireSpiralProjectiles(deltaTime: number) {
    this.spiralShotTimer += deltaTime;
    if (this.spiralShotTimer >= this.spiralShotInterval) {
      this.spiralShotTimer = 0;
      this.spiralShotActive = true;
      this.sounds.spiralShot.currentTime = 0;
      this.sounds.spiralShot.loop = true;
      this.sounds.spiralShot.play().catch(() => {});
    }

    if (this.spiralShotActive) {
      if (this.spiralShotTimer >= this.spiralShotDuration) {
        this.spiralShotTimer = 0;
        this.spiralShotActive = false;
        this.sounds.spiralShot.pause();
        this.sounds.spiralShot.currentTime = 0;
      } else {
        this.spiralShotFireTimer += deltaTime;
        if (this.spiralShotFireTimer >= this.spiralShotFireInterval) {
          const angle = this.spiralShotAngle;
          this.game.projectiles.push(new SpiralProjectile(this, angle));
          this.spiralShotAngle += this.spiralShotAnglePitch;
          this.spiralShotFireTimer = 0;
        }
      }
    }
  }

  cleanup() {}

  onPlayerCollision() {}

  onDeath() {
    this.game.effects.push(new Explosion(this.game, this.x, this.y));
    this.game.projectiles.forEach((projectile) => {
      if (projectile instanceof Laser || projectile instanceof Asteroid || projectile instanceof SpiralProjectile) {
        projectile.markedForDeletion = true;
      }
    });
  }
}

class Laser extends EnemyProjectile {
  dragon: CyberDragon;
  angle: number;
  x: number;
  y: number;
  radius = 10;
  width = 20;
  height = 50;
  vx: number;
  vy: number;
  speed = 1000;
  damage = 30;

  constructor(dragon: CyberDragon, angle: number) {
    super(dragon.game);
    this.dragon = dragon;
    this.angle = angle;
    this.x = this.dragon.x;
    this.y = this.dragon.y;
    this.vx = Math.cos(angle);
    this.vy = Math.sin(angle);
  }

  draw(ctx: CTX) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI);
    ctx.fillStyle = 'red';
    ctx.fillRect(-this.width * 0.5, -this.width * 0.5, this.height, this.width);
    ctx.restore();

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime: number) {
    // Movement
    this.x += (this.vx * this.speed * deltaTime) / 1000;
    this.y += (this.vy * this.speed * deltaTime) / 1000;

    if (this.game.outOfBounds(this, this.height)) this.markedForDeletion = true;
  }
}

class SpiralProjectile extends EnemyProjectile {
  dragon: CyberDragon;
  angle: number;
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  speed = 150;
  damage = 10;
  width = 10;
  height = 10;
  radius = this.width * 0.5;
  traveledDistance = 0;
  maxDistance = 800;

  constructor(dragon: CyberDragon, angle: number) {
    super(dragon.game);
    this.dragon = dragon;
    this.angle = angle;
    this.x = this.dragon.x;
    this.y = this.dragon.y;
    this.directionX = Math.cos(angle);
    this.directionY = Math.sin(angle);
  }

  draw(ctx: CTX) {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(deltaTime: number) {
    this.x += (this.directionX * this.speed * deltaTime) / 1000;
    this.y += (this.directionY * this.speed * deltaTime) / 1000;
    this.traveledDistance += (this.speed * deltaTime) / 1000;
    if (this.traveledDistance > this.maxDistance) this.markedForDeletion = true;
  }
}
