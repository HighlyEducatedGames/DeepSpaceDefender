import { GameObject } from '../GameObject';

interface PowerUpOptions {
  width: number;
  height: number;
  speed: number;
  image: string;
}

export abstract class PowerUp extends GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  speed: number;
  image: HTMLImageElement;
  margin = 50;
  sound = this.game.getAudio('powerup_sound');
  abstract onPlayerCollision(): void;

  constructor(game: Game, { width, height, speed, image }: PowerUpOptions) {
    super(game);
    this.width = width;
    this.height = height;
    this.radius = this.width * 0.5;
    this.speed = speed;
    this.image = this.game.getImage(image);

    const side = Math.random() < 0.5 ? 'left' : 'right';
    this.x = side === 'left' ? -this.width * 0.5 : this.game.width + this.width * 0.5;
    this.y = this.game.getRandomY(this.margin);
    this.vx = side === 'left' ? 1 : -1;
    this.vy = 0;
  }

  draw(ctx: CTX) {
    ctx.drawImage(this.image, this.x - this.width * 0.5, this.y - this.height * 0.5, this.width, this.height);

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  update(deltaTime: number) {
    this.x += (this.speed * this.vx * deltaTime) / 1000;

    //Sin Wave
    this.y += Math.sin(this.x / 50) * 1.5;

    if (this.y - this.radius < 0 || this.y + this.radius > this.game.height) {
      this.y = Math.max(this.radius, Math.min(this.y, this.game.height - this.radius));
    }

    if (this.game.outOfBounds(this, this.radius)) this.markedForDeletion = true;
  }

  checkCollisions() {
    // Check collision to player
    if (this.game.checkCollision(this, this.game.player)) {
      this.onPlayerCollision();
      this.game.cloneSound(this.sound);
      this.markedForDeletion = true;
    }
  }
}

class BombPowerUp extends PowerUp {
  constructor(game: Game) {
    super(game, { width: 30, height: 30, speed: 75, image: 'bomb_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.addBomb(1);
  }
}

class HomingMissilePowerUp extends PowerUp {
  constructor(game: Game) {
    super(game, { width: 30, height: 30, speed: 75, image: 'missile_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.addMissile(1);
  }
}

class ProjectilePowerUp extends PowerUp {
  constructor(game: Game) {
    super(game, { width: 20, height: 20, speed: 75, image: 'powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.projectile.activate();
  }
}

class BoostPowerUp extends PowerUp {
  constructor(game: Game) {
    super(game, { width: 30, height: 30, speed: 100, image: 'boost_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.boost.activate();
    // Reset cooldown when you get the powerup, so you can use boost right away
    this.game.player.boostCooldownTimer = 0;
  }
}

class ShieldPowerUp extends PowerUp {
  constructor(game: Game) {
    super(game, { width: 30, height: 30, speed: 50, image: 'shield_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.shield.activate();
  }
}

class ReversePowerUp extends PowerUp {
  constructor(game: Game) {
    super(game, { width: 30, height: 30, speed: 150, image: 'reverse_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.reverse.activate();
  }
}

class FlameThrowerPowerUp extends PowerUp {
  constructor(game: Game) {
    super(game, { width: 30, height: 30, speed: 100, image: 'flame_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.flame.activate();
  }
}

class LaserPowerUp extends PowerUp {
  constructor(game: Game) {
    super(game, { width: 30, height: 30, speed: 100, image: 'laser_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.laser.activate();
  }
}

class ParticleBombPowerUp extends PowerUp {
  constructor(game: Game) {
    super(game, { width: 30, height: 30, speed: 100, image: 'particle_bomb_powerup_image' });
  }

  onPlayerCollision() {
    this.game.player.abilities.particleBomb.activate();
  }
}

export default {
  bomb: BombPowerUp,
  missile: HomingMissilePowerUp,
  projectile: ProjectilePowerUp,
  boost: BoostPowerUp,
  shield: ShieldPowerUp,
  reverse: ReversePowerUp,
  flame: FlameThrowerPowerUp,
  laser: LaserPowerUp,
  particleBomb: ParticleBombPowerUp,
};
