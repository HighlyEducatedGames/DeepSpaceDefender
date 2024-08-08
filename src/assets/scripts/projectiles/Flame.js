class Flame {
  constructor(game) {
    this.game = game;
    this.particles = [];
    this.markedForDeletion = false;
  }

  draw(ctx) {
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  update() {
    this.particles.push(new FlameParticle(this.game, this.player.x));

    this.particles.forEach((particle) => particle.update());
    this.particles.forEach((particle, index) => {
      if (particle.markedForDeletion) this.particles.splice(index, 1);
    });
    if (this.particles.length === 0) this.markedForDeletion = true;

    // HANDLE FLAME SOUNDS
    // if (flamethrowerActive) {
    //   if (timestamp > flamethrowerExpirationTime) {
    //     flamethrowerActive = false;
    //     flameSound.pause();
    //     flameSound.currentTime = 0;
    //   } else if (keys[' '] && !gameOver) {
    //     createFlameParticle();

    //     if (flameSound.paused) {
    //       flameSound.loop = true;
    //       flameSound.play();
    //     }
    //   } else {
    //     if (!flameSound.paused) {
    //       flameSound.pause();
    //       flameSound.currentTime = 0;
    //     }
    //   }
    // } else {
    //   if (!flameSound.paused) {
    //     flameSound.pause();
    //     flameSound.currentTime = 0;
    //   }
    // }
  }
}

class FlameParticle {
  constructor(game) {
    this.game = game;
    this.x = this.game.player.x + Math.cos(this.game.player.rotation) * this.game.player.width * 0.5;
    this.y = this.game.player.y + Math.sin(this.game.player.rotation) * this.game.player.height * 0.5;
    this.size = Math.random() * 20 + 10;
    this.color = `rgba(${255}, ${Math.random() * 150}, 0, 1)`;
    this.velocity = {
      x: Math.cos(this.game.player.rotation) * 10 + (Math.random() - 0.5) * 2,
      y: Math.sin(this.game.player.rotation) * 10 + (Math.random() - 0.5) * 2,
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
    this.size *= 0.96;
    this.alpha -= 0.02;

    // Wrap around the canvas
    if (this.x < 0) {
      this.x = this.game.canvas.width;
    } else if (this.x > this.game.canvas.width) {
      this.x = 0;
    }

    if (this.y < 0) {
      this.y = this.game.canvas.height;
    } else if (this.y > this.game.canvas.height) {
      this.y = 0;
    }

    if (this.size < 0.5 || this.alpha <= 0) this.markedForDeletion = true;

    this.checkCollisions();
  }

  checkCollisions() {
    // flameParticles.forEach((particle) => {
    //   // Check damage to regular enemies
    //   enemies.forEach((enemy, enemyIndex) => {
    //     const dx = particle.x - (enemy.x + enemy.width / 2);
    //     const dy = particle.y - (enemy.y + enemy.height / 2);
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //     if (distance < enemy.width / 2) {
    //       enemy.health -= 1; // Adjust the damage value as needed
    //       // Play torch sound on collision
    //       if (torchSound) {
    //         if (torchSound.paused) {
    //           torchSound.play();
    //         } else {
    //           torchSound.currentTime = 0; // Reset sound if it's already playing
    //           torchSound.play();
    //         }
    //       }
    //       if (enemy.health <= 0) {
    //         // Handle enemy death
    //         score += 10; // Increase score or any other logic
    //         createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    //       }
    //     }
    //   });
    //   // Check damage to projectiles
    //   projectiles.forEach((projectile, index) => {
    //     const dx = particle.x - (projectile.x + projectile.width / 2);
    //     const dy = particle.y - (projectile.y + projectile.height / 2);
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //     if (distance < projectile.width / 2) {
    //       // Remove the projectile
    //       projectiles.splice(index, 1);
    //     }
    //   });
    //   // Check damage to boss
    //   if (boss) {
    //     const dx = particle.x - (boss.x + boss.width / 2);
    //     const dy = particle.y - (boss.y + boss.height / 2);
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //     if (distance < boss.width / 2) {
    //       boss.health -= 0.1; // Slow but constant damage to the boss
    //       if (boss.health <= 0) {
    //         // Handle boss death
    //         score += 1000; // Increase score or any other logic
    //         createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2); // Create explosion at boss's position
    //         explosionSound.play();
    //         boss = null; // Remove the boss
    //       }
    //     }
    //   }
    //   // Check damage to Cyber Dragon
    //   if (cyberDragon) {
    //     const dx = particle.x - (cyberDragon.x + cyberDragon.width / 2);
    //     const dy = particle.y - (cyberDragon.y + cyberDragon.height / 2);
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //     if (distance < cyberDragon.width / 2) {
    //       cyberDragon.health -= 0.1; // Slow but constant damage to the Cyber Dragon
    //       if (cyberDragon.health <= 0) {
    //         // Handle Cyber Dragon death
    //         createExplosion(cyberDragon.x + cyberDragon.width / 2, cyberDragon.y + cyberDragon.height / 2);
    //         explosionSound.play();
    //         score += 3000; // Increase score or any other logic
    //         cyberDragon = null; // Remove the Cyber Dragon
    //       }
    //     }
    //   }
    //   // Check damage to Biomech
    //   if (biomechLeviathan) {
    //     const dx = particle.x - (biomechLeviathan.x + biomechLeviathan.width / 2);
    //     const dy = particle.y - (biomechLeviathan.y + biomechLeviathan.height / 2);
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //     if (distance < biomechLeviathan.width / 2) {
    //       biomechLeviathan.health -= 0.1; // Slow but constant damage to the Biomech
    //       if (biomechLeviathan.health <= 0) {
    //         // Handle Biomech death
    //         score += 2000; // Increase score or any other logic
    //         createExplosion(
    //           biomechLeviathan.x + biomechLeviathan.width / 2,
    //           biomechLeviathan.y + biomechLeviathan.height / 2,
    //         );
    //         explosionSound.play();
    //         biomechLeviathan = null; // Remove the Biomech
    //       }
    //     }
    //   }
    //   // Check damage to Temporal Serpent head only
    //   if (temporalSerpent) {
    //     const head = temporalSerpent.segments[0];
    //     const dx = particle.x - (head.x + head.radius);
    //     const dy = particle.y - (head.y + head.radius);
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //     if (distance < head.radius) {
    //       temporalSerpent.health -= 0.2; // Slow but constant damage to the Temporal Serpent
    //       if (temporalSerpent.health <= 0) {
    //         // Handle Temporal Serpent death
    //         score += 3000; // Increase score or any other logic
    //         createExplosion(head.x + head.width / 2, head.y + head.height / 2);
    //         explosionSound.play();
    //         temporalSerpent = null; // Remove the Temporal Serpent
    //       }
    //     }
    //   }
    //   // Check damage to hazardous zones
    //   hazardousZones.forEach((zone, zoneIndex) => {
    //     const dx = particle.x - zone.x;
    //     const dy = particle.y - zone.y;
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //     if (distance < zone.radius) {
    //       // Remove the hazardous zone
    //       hazardousZones.splice(zoneIndex, 1);
    //     }
    //   });
    //   // Check damage to hazard particles
    //   hazardParticles.forEach((hazardParticle, hazardIndex) => {
    //     const dx = particle.x - hazardParticle.x;
    //     const dy = particle.y - hazardParticle.y;
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //     if (distance < hazardParticle.size) {
    //       // Remove the hazard particle
    //       hazardParticles.splice(hazardIndex, 1);
    //     }
    //   });
    // });
  }
}
