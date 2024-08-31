import BossExplosion from '../effects/BossExplosion';
import Explosion from '../effects/Explosion.js';
import { BossCreature, Particle } from '../GameObject';

export default class BiomechLeviathan extends BossCreature {
  x: number;
  y: number;
  radius = 100;
  width = 200;
  height = 200;
  speed = 40;
  maxHealth = 2000;
  health = this.maxHealth;
  points = this.maxHealth;
  damage = 10;
  image = this.game.getImage('biomech_leviathan_image');
  music = this.game.getAudio('boss_music');
  sounds = {
    tractorBeam: this.game.getAudio('biomech_tractor_beam_sound'),
    emp: this.game.getAudio('biomech_emp_sound'),
    eat: this.game.getAudio('biomech_eat_sound'),
    splat: this.game.getAudio('biomech_splat_sound'),
    noFire: this.game.getAudio('no_fire_sound'),
  };
  attackTimer = 0;
  attackInterval = 1500;
  canAttack = false;
  phase = 1;
  healthBarWidth = this.width;
  healthBarHeight = 10;
  maxInkClouds = 3;
  inkClouds: InkCloud[] = [];
  healthBarX: number;
  healthBarY: number;
  playerCollisionRadius = 65;
  empBlast: EmpBlast | null = null;
  empTimer = 0;
  empCooldown = 5000;
  empActive = false;
  tractorBeam: TractorBeam | null = null;
  tractorBeamTimer = 0;
  tractorBeamCooldown = 5000;

  constructor(game: Game) {
    super(game);
    const { x, y } = this.game.getOffScreenRandomSide(this, 20);
    this.x = x;
    this.y = y;
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y + this.height * 0.5 + 10;
  }

  draw(ctx: CTX) {
    // Leviathan
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.drawImage(this.image, -this.width * 0.5, -this.height * 0.5, this.width, this.height);
    ctx.restore();

    // Health Bar
    const healthRatio = this.health / this.maxHealth;

    ctx.fillStyle = 'rgba(187,27,27,0.85)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * healthRatio, this.healthBarHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

    // Tractor Beam
    if (this.tractorBeam) this.tractorBeam.draw(ctx);

    // Ink Clouds
    this.inkClouds.forEach((cloud) => cloud.draw(ctx));

    // EMP Blast
    if (this.empBlast) this.empBlast.draw(ctx);

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
    const distanceToPlayer = this.game.player.getDistanceToPlayer(this);
    // Snap to player if close to avoid bouncing
    const snapThreshold = 2; // Increase this if bouncing continues
    if (distanceToPlayer < snapThreshold) {
      this.x = this.game.player.x;
      this.y = this.game.player.y;
    } else {
      // Move toward player
      const angleToPlayer = this.game.player.getAngleToPlayer(this);
      this.vx = Math.cos(angleToPlayer);
      this.vy = Math.sin(angleToPlayer);
      this.x += (this.vx * this.speed * deltaTime) / 1000;
      this.y += (this.vy * this.speed * deltaTime) / 1000;
    }

    // Ink Clouds
    this.inkClouds.forEach((cloud) => cloud.update(deltaTime));

    // EMP Blast
    if (this.empBlast) this.empBlast.update();

    // Phase Transitions
    if (this.health < this.maxHealth * 0.6) {
      this.phase = 2;
    } else if (this.health < this.maxHealth * 0.3) {
      this.phase = 3;
    }

    // Attack logic
    switch (this.phase) {
      case 1:
        this.spawnTractorBeam(deltaTime);
        // this.spawnInkCloud();
        break;
      case 2:
        // this.spawnInkCloud();
        break;
      case 3:
        // this.spawnEmpBlast();
        break;
    }
  }

  spawnTractorBeam(deltaTime: number) {
    if (this.tractorBeam) return;
    this.tractorBeamTimer += deltaTime;
    if (this.tractorBeamTimer >= this.tractorBeamCooldown) {
      this.tractorBeamTimer = 0;
      this.tractorBeam = new TractorBeam(this);
    }
  }

  spawnInkCloud() {
    if (this.inkClouds.length >= this.maxInkClouds) return;
    this.inkClouds.push(new InkCloud(this));
  }

  spawnEmpBlast() {
    /*  if (this.game.timestamp - this.lastEmpTime < this.empCooldown) return;
    this.empActive = true;
    const empBlast = new EmpBlast(this.game, this);
    this.lastEmpTime = this.game.timestamp;*/
  }

  onPlayerCollision() {
    this.sounds.eat.play().catch(() => {});
  }

  onDeath() {
    this.game.effects.push(new BossExplosion(this.game, this.x, this.y));
  }
}

class TractorBeam {
  game: Game;
  biomech: BiomechLeviathan;
  x: number;
  y: number;
  beamWidth = 20;
  timer = 0;
  duration = 5000;
  strength = 0.2;
  markedForDeletion = false;

  constructor(biomech: BiomechLeviathan) {
    this.game = biomech.game;
    this.biomech = biomech;
    this.x = this.biomech.x;
    this.y = this.biomech.y;
  }

  draw(ctx: CTX) {
    const gradient = ctx.createLinearGradient(this.game.player.x, this.game.player.y, this.x, this.y);
    gradient.addColorStop(0, 'rgba(255, 255, 0, 0.5)'); // Yellow at the player end
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)'); // Transparent at the biomech boss end

    const angle = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
    const playerX1 = this.game.player.x + Math.cos(angle + Math.PI * 0.5) * this.beamWidth * 0.5;
    const playerY1 = this.game.player.y + Math.sin(angle + Math.PI * 0.5) * this.beamWidth * 0.5;
    const playerX2 = this.game.player.x + Math.cos(angle - Math.PI * 0.5) * this.beamWidth * 0.5;
    const playerY2 = this.game.player.y + Math.sin(angle - Math.PI * 0.5) * this.beamWidth * 0.5;

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y); // Start at biomech boss
    ctx.lineTo(playerX1, playerY1); // Draw to one side of the player
    ctx.lineTo(playerX2, playerY2); // Draw to the other side of the player
    ctx.closePath();
    ctx.fill();
  }

  update(deltaTime: number) {
    this.x = this.biomech.x;
    this.y = this.biomech.y;

    this.timer += deltaTime;
    if (this.timer >= this.duration) {
      this.markedForDeletion = true;
    }
  }
}

class InkCloud {
  game: Game;
  biomech: BiomechLeviathan;
  spawnDistance = 300;
  angle = Math.random() * 2 * Math.PI;
  x: number;
  y: number;
  damage = 10;
  radius = 10;
  initialRadius = this.radius;
  maxRadius = 200;
  growthRate = 20;
  active = true;
  cloudActive = false;
  cloudX = 0;
  cloudY = 0;
  cloudRadius = 150;
  cloudTimer = 0;
  cloudDuration = 5000;
  lifespan = 5000;
  timer = 0;
  markedForDeletion = false;

  constructor(biomech: BiomechLeviathan) {
    this.game = biomech.game;
    this.biomech = biomech;
    this.x = biomech.x + this.spawnDistance * Math.cos(this.angle);
    this.y = biomech.y + this.spawnDistance * Math.sin(this.angle);
  }

  draw(ctx: CTX) {
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.beginPath();
    let points = 36; // Number of points to define the splat perimeter
    for (let i = 0; i < points; i++) {
      let angle = (i / points) * 2 * Math.PI;
      let randomFactor = (Math.random() - 0.5) * 0.2; // Adjust for more or less irregularity
      let radius = this.radius + randomFactor * this.radius;
      let x = this.x + Math.cos(angle) * radius;
      let y = this.y + Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    if (this.cloudActive) {
      ctx.fillStyle = 'rgba(64, 64, 64, 0.9)'; // Lower opacity for the cloud
      ctx.beginPath();
      let points = 36; // Number of points to define the splat perimeter
      for (let i = 0; i < points; i++) {
        let angle = (i / points) * 2 * Math.PI;
        let randomFactor = (Math.random() - 0.5) * 0.2; // Adjust for more or less irregularity
        let radius = this.cloudRadius + randomFactor * this.cloudRadius;
        let x = this.cloudX + Math.cos(angle) * radius;
        let y = this.cloudY + Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.strokeStyle = 'grey'; // Grey outline
      ctx.lineWidth = 2; // Thickness of the outline
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        let angle = (i / points) * 2 * Math.PI;
        let randomFactor = (Math.random() - 0.5) * 0.2; // Adjust for more or less irregularity
        let radius = this.cloudRadius + randomFactor * this.cloudRadius;
        let x = this.cloudX + Math.cos(angle) * radius;
        let y = this.cloudY + Math.sin(angle) * radius;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  update(deltaTime: number) {
    // Grow the ink blob
    this.timer += deltaTime;
    const elapsedTime = this.timer / 1000;
    this.radius = Math.min(this.initialRadius + this.growthRate * elapsedTime, this.maxRadius);

    // Cloud Timer
    if (this.cloudActive) {
      this.cloudTimer += deltaTime;
      if (this.cloudTimer >= this.cloudDuration) {
        this.cloudActive = false; // TODO mark anything for deletion??
      }
    }

    if (this.timer >= this.lifespan) {
      this.markedForDeletion = true;
    }
  }

  checkCollisions() {
    // Check collision to the player
    // Check if ink blob hits the player
    const dx = this.x - this.game.player.x;
    const dy = this.y - this.game.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.radius + this.game.player.radius) this.onPlayerCollision();
  }

  onPlayerCollision() {
    this.cloudActive = true;
    this.cloudX = this.game.player.x;
    this.cloudY = this.game.player.y;
    this.cloudTimer = 0;
    this.active = false;

    this.game.player.takeDamage(this.damage);
    this.biomech.sounds.splat.play().catch(() => {});
  }
}

class EmpBlast {
  game: Game;
  biomech: BiomechLeviathan;
  x: number;
  y: number;
  radius = 200;
  timer = 0;
  duration = 2000;
  pulseTime = 0;
  pulseScale = 0;
  sparkFrequency = 0.5;

  constructor(biomech: BiomechLeviathan) {
    this.game = biomech.game;
    this.biomech = biomech;
    this.x = this.biomech.x;
    this.y = this.biomech.y;
  }

  draw(ctx: CTX) {
    // Blast
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * this.pulseScale, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    this.pulseTime += 0.1; // Adjust the speed of the pulsing
    this.pulseScale = 1 + Math.sin(this.pulseTime) * 0.1; // Adjust the range of the pulsing

    // Generate spark particles
    if (Math.random() < this.sparkFrequency) {
      this.game.particles.push(new EmpSparkParticle(this.game, this.x, this.y));
    }

    // Update the EMP blast's position to follow the biomech Leviathan
    this.x = this.biomech.x;
    this.y = this.biomech.y;

    // Re-enable player controls after the EMP blast ends
    // setTimeout(() => {
    //   empBlast.active = false;
    //   empBlastActive = false;
    //   empDisableFire = false;
    // }, empBlast.duration);
  }

  checkCollisions() {
    // Destroy projectiles within the EMP blast radius
    // projectiles = projectiles.filter((projectile) => {
    //   const dx = projectile.x - empBlast.x;
    //   const dy = projectile.y - empBlast.y;
    //   const distance = Math.sqrt(dx * dx + dy * dy);
    //   return distance > empBlast.radius;
    // });
  }
}

class EmpSparkParticle extends Particle {
  x: number;
  y: number;
  size = Math.random() * 5 + 2;
  color = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.5})`;
  velocity = {
    x: (Math.random() - 0.5) * 10,
    y: (Math.random() - 0.5) * 10,
  };
  alpha = 1;

  constructor(game: Game, x: number, y: number) {
    super(game);
    this.x = x;
    this.y = y;
  }

  draw(ctx: CTX) {
    if (this.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.02;

    if (this.alpha <= 0) this.markedForDeletion = true;
  }
}
