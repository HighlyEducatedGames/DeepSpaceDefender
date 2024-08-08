import { spawnOffScreenRandomSide } from '../utilities.js';

export default class BiomechLeviathan {
  constructor(game) {
    this.game = game;
    this.x = 250;
    this.y = 250;
    this.width = 200;
    this.height = 200;
    this.speed = 40;
    this.maxHealth = 2000;
    this.health = this.maxHealth;
    this.lastAttackTime = 0;
    this.attackInterval = 1500;
    this.canAttack = true;
    this.phase = 1;
    this.playerCollisionRadius = 65;
    this.projectiles = [];
    this.healthBarWidth = this.width;
    this.healthBarHeight = 10;
    this.healthBarX = this.x - this.width * 0.5;
    this.healthBarY = this.y + this.height * 0.5 + 10;
    this.damage = 0.1;
    this.inkClouds = [];
    this.lastEmpTime = 0;
    this.empCooldown = 5000;
    this.empActive = false;
    this.lastTractorBeamTime = 0;
    this.tractorBeam = null;
    this.tractorBeamCooldown = null;
    this.tractorBeamActive = false;
    this.markedForDeletion = false;

    this.image = new Image();
    this.image.src = 'assets/images/biomech_leviathan.png';

    this.sounds = {
      tractorBeam: new Audio('assets/audio/tractorBeamSound.mp3'),
      emp: new Audio('assets/audio/empSound.mp3'),
      eat: new Audio('assets/audio/biomechEat.mp3'),
      splat: new Audio('assets/audio/splatSound.mp3'),
      noFire: new Audio('assets/audio/nofire.mp3'),
    };

    this.music = new Audio('assets/audio/boss_music.mp3');

    spawnOffScreenRandomSide(this, 100);
  }

  draw(ctx) {
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

  update(deltaTime) {
    const angleToPlayer = this.game.player.getAngleToPlayer(this);
    this.x += (Math.cos(angleToPlayer) * this.speed * deltaTime) / 1000;
    this.y += (Math.sin(angleToPlayer) * this.speed * deltaTime) / 1000;

    // Health values to change phases at
    const phases = {
      1: 1.0,
      2: 0.6,
      3: 0.3,
    };

    // Phase Transitions
    const nextTransition = phases[this.phase + 1];
    if (nextTransition !== undefined && this.health <= this.maxHealth * nextTransition) {
      this.phase++;
    }

    // Attack logic
    switch (this.phase) {
      case 1:
        this.spawnTractorBeam();
        break;
      case 2:
        this.spawnInkCloud();
        break;
      case 3:
        this.spawnEmpBlast();
        break;
    }

    this.checkCollisions();
  }

  checkCollisions() {
    // Collision with player projectiles
    this.game.player.projectiles.forEach((projectile) => {
      if (this.game.checkCollision(projectile, this)) {
        this.health -= projectile.damage;
        if (this.health <= 0) this.markedForDeletion = true;
        projectile.markedForDeletion = true;
      }
    });

    // Collision with player
    if (this.game.checkCollision(this.game.player, { x: this.x, y: this.y, radius: this.playerCollisionRadius })) {
      this.game.player.takeDamage(this.damage);
      this.game.player.sounds.collision.cloneNode().play();
    }

    // Bomb stops tractor beam and puts it on cooldown for 5 seconds // TODO
    // Stop the tractor beam and start the cooldown
  }

  spawnInkCloud() {
    if (this.inkClouds.length >= 3) return;
    this.inkClouds.push(new InkCloud(this.game, this));
  }

  spawnEmpBlast() {
    if (this.game.timestamp - this.lastEmpTime < this.empCooldown) return;
    this.empActive = true;
    const empBlast = new EmpBlast(this.game, this);
    this.lastEmpTime = this.game.timestamp;
  }

  spawnTractorBeam() {
    if (this.game.timestamp - this.lastTractorBeamTime < this.tractorBeamCooldownempCooldown) return;
    this.tractorBeamActive = true;
    const tractorBeam = new TractorBeam(this.game, this);
    this.lastTractorBeamTime = this.game.timestamp;
  }

  getTractorBeam() {
    return this.tractorBeam;
  }
}

class TractorBeam {
  constructor(game, biomech) {
    this.game = game;
    this.biomech = biomech;
    this.beamWidth = 20;
    this.x = this.biomech.x;
    this.y = this.biomech.y;
    this.cycleDuration = 10000; // Total duration of one cycle (5 seconds active, 5 seconds inactive)
    this.activeDuration = 5000; // Duration the tractor beam is active
    this.markedForDeletion = false;
  }

  draw(ctx) {
    const gradient = ctx.createLinearGradient(this.game.player.x, this.game.player.y, this.startX, this.startY);
    gradient.addColorStop(0, 'rgba(255, 255, 0, 0.5)'); // Yellow at the player end
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)'); // Transparent at the biomech boss end

    const dx = this.game.player.x - this.x;
    const dy = this.game.player.y - this.y;
    const angle = Math.atan2(dy, dx);

    const playerX1 = this.game.player.x + Math.cos(angle + Math.PI * 0.5) * this.beamWidth * 0.5;
    const playerY1 = this.game.player.y + Math.sin(angle + Math.PI * 0.5) * this.beamWidth * 0.5;
    const playerX2 = this.game.player.x + Math.cos(angle - Math.PI * 0.5) * this.beamWidth * 0.5;
    const playerY2 = this.game.player.y + Math.sin(angle - Math.PI * 0.5) * this.beamWidth * 0.5;

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY); // Start at biomech boss
    ctx.lineTo(playerX1, playerY1); // Draw to one side of the player
    ctx.lineTo(playerX2, playerY2); // Draw to the other side of the player
    ctx.closePath();
    ctx.fill();
  }

  update() {
    const timeInCycle = this.game.timestamp % this.cycleDuration;
    if (timeInCycle < this.activeDuration) {
      this.startX = this.biomech.x;
      this.startY = this.biomech.y;
      this.endX = this.game.player.x;
      this.endY = this.game.player.y;
      this.biomech.sounds.emp.cloneNode().play();
    } else {
      this.markedForDeletion = true;
    }
  }
}

class InkCloud {
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
      this.cloudStartTime = performance.now();
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
