import BossExplosion from '../effects/BossExplosion';
import Explosion from '../effects/Explosion.js';
import { BossCreature } from '../GameObject';

export default class BiomechLeviathan extends BossCreature {
  x: number;
  y: number;
  width = 200;
  height = 200;
  radius = this.width * 0.5;
  speed = 40;
  maxHealth = 2000;
  health = this.maxHealth;
  points = this.maxHealth;
  image: HTMLImageElement;
  music: HTMLAudioElement;
  sounds: { [key: string]: HTMLAudioElement };
  attackTimer = 0;
  attackInterval = 1500;
  canAttack = false;
  phase = 1;
  healthBarWidth = this.width;
  healthBarHeight = 10;
  inkClouds = [];
  healthBarX: number;
  healthBarY: number;
  playerCollisionRadius = 65;
  empTimer = 0;
  empCooldown = 5000;
  empActive = false;
  tractorBeam: TractorBeam | null = null;
  tractorBeamTimer = 0;
  tractorBeamCooldown = 5000;
  collisionTimer = 0;
  collisionCooldown = 3000;

  constructor(game: Game) {
    super(game);
    this.image = this.game.getImage('biomech_leviathan_image');
    this.sounds = {
      tractorBeam: this.game.getAudio('biomech_tractor_beam_sound'),
      emp: this.game.getAudio('biomech_emp_sound'),
      eat: this.game.getAudio('biomech_eat_sound'),
      splat: this.game.getAudio('biomech_splat_sound'),
      noFire: this.game.getAudio('no_fire_sound'),
    };
    this.music = this.game.getAudio('boss_music');

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
    const angleToPlayer = this.game.player.getAngleToPlayer(this);
    this.x += (Math.cos(angleToPlayer) * this.speed * deltaTime) / 1000;
    this.y += (Math.sin(angleToPlayer) * this.speed * deltaTime) / 1000;

    // Update health bar to follow boss
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y + this.height * 0.5 + 10;

    // Tractor Beam
    if (this.tractorBeam) {
      this.tractorBeam.update(deltaTime);
      if (this.tractorBeam.markedForDeletion) this.tractorBeam = null;
    }

    // Health values to change phases at
    const phases = {
      1: 1.0,
      2: 0.6,
      3: 0.3,
    };

    // Phase Transitions
    const nextTransition = phases[(this.phase + 1) as keyof typeof phases];
    if (nextTransition !== undefined && this.health <= this.maxHealth * nextTransition) {
      this.phase++;
    }

    // Attack logic
    switch (this.phase) {
      case 1:
        this.spawnTractorBeam(deltaTime);
        break;
      case 2:
        // this.spawnInkCloud();
        break;
      case 3:
        // this.spawnEmpBlast();
        break;
    }
  }

  /*checkCollisions(deltaTime: number) {
    this.lastCollisionTime += deltaTime;
    if (this.lastCollisionTime >= this.collisionCooldown) {
      // Collision with player
      if (this.game.checkCollision(this.game.player, { x: this.x, y: this.y, radius: this.playerCollisionRadius })) {
        this.game.player.takeDamage(this.damage);
        this.game.playCollision();
        this.sounds.eat.play();
        this.lastCollisionTime = 0;
      }
    }
  }*/

  /*spawnInkCloud() {
    if (this.inkClouds.length >= 3) return;
    this.inkClouds.push(new InkCloud(this.game, this));
  }

  spawnEmpBlast() {
    if (this.game.timestamp - this.lastEmpTime < this.empCooldown) return;
    this.empActive = true;
    const empBlast = new EmpBlast(this.game, this);
    this.lastEmpTime = this.game.timestamp;
  }
*/

  spawnTractorBeam(deltaTime: number) {
    if (this.tractorBeam) return;
    this.tractorBeamTimer += deltaTime;
    if (this.tractorBeamTimer >= this.tractorBeamCooldown) {
      this.tractorBeamTimer = 0;
      this.tractorBeam = new TractorBeam(this);
    }
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

/*class InkCloud {
  constructor(game, biomech) {
    this.game = game;
    this.biomech = biomech;
    this.spawnDistance = 300;
    this.angle = Math.random() * 2 * Math.PI;
    this.x = biomech.x + this.spawnDistance * Math.cos(this.angle);
    this.y = biomech.y + this.spawnDistance * Math.sin(this.angle);
    this.radius = 10;
    this.maxRadius = 200;
    this.growthRate = 20;
    this.cloudActive = false;
    this.cloudX = 0;
    this.cloudY = 0;
    this.cloudRadius = 0;
    this.cloudDuration = 5000;
    this.cloudStartTime = 0;
    this.startTime = this.game.timestamp;
    this.lifespan = 5000;
    this.markedForDeletion = false;
  }

  draw(ctx) {
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

        if (this.game.timestamp > this.cloudStartTime + this.cloudDuration) {
          this.cloudActive = false;
        }
      }
    }
  }

  update() {
    // Grow the ink blob
    const elapsedTime = (this.game.timestamp - this.startTime) / 1000;
    this.radius = Math.min(this.initialRadius + this.growthRate * elapsedTime, this.maxRadius);

    // Check if ink blob hits the player
    const dx = this.x - this.game.player.x;
    const dy = this.y - this.game.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < this.radius + this.game.player.width / 2) {
      // Ink blob hits the player
      this.cloudActive = true;
      this.cloudX = this.game.player.x;
      this.cloudY = this.game.player.y;
      this.cloudRadius = 150; // Radius of the cloud obscuring vision
      this.cloudStartTime = this.game.timestamp;
      this.active = false;
      if (!this.game.player.shieldActive) {
        // Check if the shield is not active
        this.game.player.takeDamage(10);
      }

      this.biomech.sounds.splat.cloneNode().play();
    } else if (this.game.timestamp - this.startTime > this.lifespan) {
      // Remove ink cloud if it exceeds its lifespan
      this.markedForDeletion = true;
    }
  }
}

class EmpBlast {
  constructor(game, biomech) {
    this.game = game;
    this.biomech = biomech;
    this.particles = [];
    this.x = this.biomech.x;
    this.y = this.biomech.y;
    this.radius = 200;
    this.duration = 2000;
    this.endTime = this.game.timestamp + this.duration;
    this.pulseTime = 0;
    this.pulseScale = 0;
    this.sparkFrequency = 0.5;

    this.biomech.empActive = true;
    // TODO: empDisableFire = true;
  }

  draw(ctx) {
    // Blast
    ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * this.pulseScale, 0, 2 * Math.PI);
    ctx.fill();

    // Particles
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  update() {
    this.pulseTime += 0.1; // Adjust the speed of the pulsing
    this.pulseScale = 1 + Math.sin(this.pulseTime) * 0.1; // Adjust the range of the pulsing

    // Generate spark particles
    if (Math.random() < this.sparkFrequency) {
      this.particles.push(new EmpSparkParticle(this.game, this.x, this.y));
    }

    this.particles.forEach((particle, index) => {
      if (particle.markedForDeletion) this.particles.splice(index, 1);
    });
    this.particles.forEach((particle) => particle.update());

    this.checkCollisions();

    // Update the EMP blast's position to follow the biomech Leviathan
    // if (biomechLeviathan) {
    //   empBlast.x = biomechLeviathan.x;
    //   empBlast.y = biomechLeviathan.y;
    // }

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

class EmpSparkParticle {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 2;
    this.color = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.5})`;
    this.velocity = {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
    };
    this.alpha = 1;
    this.markedForDeletion = false;
  }

  draw(ctx) {
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
*/
