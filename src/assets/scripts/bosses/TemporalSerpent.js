import { getRandomDirection, getOffScreenRandomSide } from '../utilities.js';

export default class TemporalSerpent {
  constructor(game) {
    /** @type {import('../Game.js').default} */
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
    this.detachedSegments = [];
    this.segmentAddInterval = 200;
    this.lastSegmentAddTime = 0;
    this.lastBombDamageTime = 0;
    this.direction = getRandomDirection();
    this.projectileCollisionRadius = 100;
    this.playerCollisionRadius = 120;
    this.maxSegments = 3000;
    this.healthBarWidth = 200;
    this.healthBarHeight = 20;
    this.healthBarX = (this.game.width - this.healthBarWidth) * 0.5;
    this.healthBarY = this.game.height - this.healthBarHeight - 30;
    this.projectiles = [];
    this.hazardZones = [];
    this.directionChangeInterval = 1500;
    this.followPlayerInterval = 2500;
    this.lastDirectionChangeTime = performance.now();
    this.lastFollowPlayerTime = performance.now();
    this.images = {
      base: document.getElementById('temporal_serpent_image'),
      head: document.getElementById('temporal_serpent_head_image'),
      segment: document.getElementById('temporal_serpent_segment_image'),
    };
    this.sounds = {
      hazard: document.getElementById('hazard_sound'),
    };

    getOffScreenRandomSide(this, 100);
  }

  draw(ctx) {
    // Serpent segments
    /*this.segments.forEach((segment, index) => {
      // Skip the head segment
      if (index !== 0) {
        if (
          segment.x > 0 &&
          segment.x < this.game.width &&
          segment.y > 0 &&
          segment.y < this.game.height
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

    // detachedSegments.forEach((segment) => {
    //   ctx.drawImage(
    //     serpentSegment,
    //     segment.x - segment.radius,
    //     segment.y - segment.radius,
    //     segment.radius * 2,
    //     segment.radius * 2,
    //   );
    // });

    // Serpent head
    const head = this.segments[0];
    if (head.x > 0 && head.x < this.game.width && head.y > 0 && head.y < this.game.height) {
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
    ctx.fillText('Temporal Serpent', this.game.width * 0.5, this.healthBarY + this.healthBarHeight + 20);
    ctx.restore();
  }

  update() {
    //   if (!temporalSerpent || !temporalSerpent.alive) return;

    // const head = temporalSerpent.segments[0];
    // const moveDistance = (temporalSerpent.speed * deltaTime) / 1000;

    // // Change direction at random intervals
    // if (timestamp - lastDirectionChangeTime > DIRECTION_CHANGE_INTERVAL) {
    //   temporalSerpent.direction = getRandomDirection();
    //   lastDirectionChangeTime = timestamp;
    // }

    // // Change direction towards the player at specific intervals
    // if (timestamp - lastFollowPlayerTime > FOLLOW_PLAYER_INTERVAL) {
    //   temporalSerpent.direction = getDirectionTowardsPlayer(player, head);
    //   lastFollowPlayerTime = timestamp;
    // }

    // // Move the head based on the current direction
    // switch (temporalSerpent.direction) {
    //   case 'right':
    //     head.x += moveDistance;
    //     if (head.x >= canvas.width - head.radius) {
    //       head.x = canvas.width - head.radius;
    //       temporalSerpent.direction = 'down';
    //     }
    //     break;
    //   case 'down':
    //     head.y += moveDistance;
    //     if (head.y >= canvas.height - head.radius) {
    //       head.y = canvas.height - head.radius;
    //       temporalSerpent.direction = 'left';
    //     }
    //     break;
    //   case 'left':
    //     head.x -= moveDistance;
    //     if (head.x <= head.radius) {
    //       head.x = head.radius;
    //       temporalSerpent.direction = 'up';
    //     }
    //     break;
    //   case 'up':
    //     head.y -= moveDistance;
    //     if (head.y <= head.radius) {
    //       head.y = head.radius;
    //       temporalSerpent.direction = 'right';
    //     }
    //     break;
    // }

    // // Leave a hazardous zone behind the last segment at a specified interval
    // const interval = 500; // Change this value to adjust the interval
    // if (temporalSerpent.segments.length > 0 && temporalSerpent.segments.length % interval === 0) {
    //   const lastSegment = temporalSerpent.segments[temporalSerpent.segments.length - 1];
    //   hazardousZones.push({
    //     x: lastSegment.x,
    //     y: lastSegment.y,
    //     radius: HAZARD_RADIUS,
    //     spawnTime: timestamp,
    //   });

    //   // Remove old hazardous zones
    //   hazardousZones = hazardousZones.filter((zone) => timestamp - zone.spawnTime < HAZARD_DURATION);
    // }

    // // Add new segment to the tail at the increased interval
    // const increasedSegmentInterval = temporalSerpent.segmentAddInterval * 3;

    // if (timestamp - temporalSerpent.lastSegmentAddTime > increasedSegmentInterval) {
    //   const newSegment = { x: head.x, y: head.y, radius: head.radius };
    //   temporalSerpent.segments.push(newSegment);
    //   temporalSerpent.lastSegmentAddTime = timestamp;

    //   if (temporalSerpent.segments.length > temporalSerpent.maxSegments) {
    //     temporalSerpent.segments.shift();
    //   }
    // }

    // // Update segments to follow the previous segment with increased spacing
    // const segmentSpacing = 30;
    // for (let i = temporalSerpent.segments.length - 1; i > 0; i--) {
    //   const segment = temporalSerpent.segments[i];
    //   const previousSegment = temporalSerpent.segments[i - 1];
    //   const distance = Math.sqrt(Math.pow(previousSegment.x - segment.x, 2) + Math.pow(previousSegment.y - segment.y, 2));

    //   if (distance > segmentSpacing) {
    //     segment.x = previousSegment.x;
    //     segment.y = previousSegment.y;
    //   }
    // }

    // // Phase transitions
    // if (temporalSerpent.health <= temporalSerpent.maxHealth * 0.75 && !temporalSerpent.phaseTransitioned[0]) {
    //   temporalSerpent.phase = 2;
    //   temporalSerpent.phaseTransitioned[0] = true;
    // } else if (temporalSerpent.health <= temporalSerpent.maxHealth * 0.5 && !temporalSerpent.phaseTransitioned[1]) {
    //   temporalSerpent.phase = 3;
    //   temporalSerpent.phaseTransitioned[1] = true;
    // } else if (temporalSerpent.health <= temporalSerpent.maxHealth * 0.25 && !temporalSerpent.phaseTransitioned[2]) {
    //   temporalSerpent.phase = 4;
    //   temporalSerpent.phaseTransitioned[2] = true;
    // }

    // // Attack logic
    // if (temporalSerpent.canAttack && timestamp - temporalSerpent.lastAttackTime > temporalSerpent.attackInterval) {
    //   switch (temporalSerpent.phase) {
    //     case 1:
    //       attackPhase1();
    //       break;
    //     case 2:
    //       attackPhase4();
    //       break;
    //     case 3:
    //       attackPhase3();
    //       break;
    //     case 4:
    //       attackPhase2();
    //       break;
    //   }
    //   temporalSerpent.lastAttackTime = timestamp;
    // }
    // handleSerpentBombImpact(temporalSerpent, deltaTime, timestamp);

    // function updateDetachedSegments(deltaTime) {
    //   detachedSegments.forEach((segment, index) => {
    //     if (segment.travelDirection) {
    //       const travelDistance = segment.speed * (deltaTime / 1000);
    //       segment.x += segment.travelDirection.x * travelDistance;
    //       segment.y += segment.travelDirection.y * travelDistance;
    //       segment.travelDistance -= travelDistance;

    //       if (segment.travelDistance <= 0) {
    //         segment.explode = true;
    //         segment.explosionTime = performance.now();
    //         delete segment.travelDirection; // Remove travelDirection to stop further movement
    //       }
    //     }
    //   });
    // }

    this.hazardZones.forEach((zone, index) => {
      if (zone.isMarkedForDeletion) this.hazardZones.splice(index, 1);
    });
    this.checkCollisions();
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

  checkCollisions() {
    // BOMD // TODO
    // Temporarily make the serpent leave the screen
    // Return the serpent after 5 seconds
  }

  attackPhase1() {
    if (this.segments.length === 0) return;
    const lastSegement = this.segments[this.segments.length - 1];
    this.hazardZones.push(new Hazard(this.game, lastSegement.x, lastSegement.y));
  }

  attackPhase2() {
    // if (temporalSerpent.segments.length < 10) return; // Ensure there are enough segments for the attack
    // const segmentsToFire = [];
    // const numSegments = 1; // Number of segments to detach and fire at the player per attack
    // // Select a random segment to detach and fire
    // for (let i = 0; i < numSegments; i++) {
    //   const randomIndex = Math.floor(Math.random() * temporalSerpent.segments.length);
    //   const segment = temporalSerpent.segments[randomIndex];
    //   segmentsToFire.push(segment);
    //   // Remove the segment from the serpent
    //   temporalSerpent.segments.splice(randomIndex, 1);
    // }
    // // Detach selected segments and set them up to travel towards the player and explode
    // segmentsToFire.forEach((segment) => {
    //   const dx = player.x - segment.x;
    //   const dy = player.y - segment.y;
    //   const distance = Math.sqrt(dx * dx + dy * dy);
    //   const travelDuration = 3000; // Time in milliseconds for the segment to travel before exploding
    //   segment.travelDirection = { x: dx / distance, y: dy / distance };
    //   segment.travelDistance = 600; // Distance in pixels to travel towards the player
    //   // Increase the segment speed by reducing the travel duration
    //   const increasedSpeedFactor = 4; // Increase speed by this factor
    //   const newTravelDuration = travelDuration / increasedSpeedFactor; // Reduce travel duration to increase speed
    //   segment.speed = segment.travelDistance / (newTravelDuration / 1000); // New speed based on increased factor
    //   segment.startX = segment.x;
    //   segment.startY = segment.y;
    //   segment.explode = true;
    //   segment.explosionTime = performance.now() + newTravelDuration; // Update explosion time based on new travel duration
    //   // Add the detached segment to a global array for detached segments
    //   detachedSegments.push(segment);
    // });
  }

  attackPhase3() {
    this.activateEnergyBarrier();
  }

  attackPhase4() {
    // // Check if there are enough segments to perform the attack
    // if (temporalSerpent.segments.length < 10) return; // Adjust this number based on desired difficulty
    // const segmentsToExplode = [];
    // const numSegments = 2; // Number of segments to detach and explode
    // // Select random segments to detach
    // for (let i = 0; i < numSegments; i++) {
    //   const randomIndex = Math.floor(Math.random() * temporalSerpent.segments.length);
    //   const segment = temporalSerpent.segments[randomIndex];
    //   segmentsToExplode.push(segment);
    //   // Remove the segment from the serpent
    //   temporalSerpent.segments.splice(randomIndex, 1);
    // }
    // // Detach selected segments and set them up for explosion
    // segmentsToExplode.forEach((segment) => {
    //   const stayDuration = 2000; // Time in milliseconds to stay before exploding
    //   const explosionDelay = stayDuration + 1500; // Time in milliseconds before the segment explodes
    //   // Mark the segment for explosion
    //   segment.explode = true;
    //   segment.explosionTime = performance.now() + explosionDelay;
    //   // Add the detached segment to a global array for detached segments
    //   detachedSegments.push(segment);
    // });
  }

  // Function to handle the explosion of detached segments
  handleSegmentExplosions(timestamp) {
    //   if (!temporalSerpent || !temporalSerpent.alive) return;
    //   const segmentsToRemove = [];
    //   detachedSegments.forEach((segment, index) => {
    //     if (timestamp >= segment.explosionTime) {
    //       // Perform the explosion effect
    //       createExplosion(segment.x, segment.y);
    //       // Play the explosion sound
    //       explosionSound.play();
    //       // Check for damage to the player
    //       const explosionRadius = 250; // Adjust radius as needed
    //       const distanceToPlayer = Math.sqrt(Math.pow(player.x - segment.x, 2) + Math.pow(player.y - segment.y, 2));
    //       if (distanceToPlayer <= explosionRadius) {
    //         if (!isInvincible && !shieldActive) {
    //           player.health -= 20; // Adjust damage as needed
    //           const collisionSoundClone = collisionSound.cloneNode();
    //           collisionSoundClone.volume = collisionSound.volume;
    //           collisionSoundClone.play();
    //           if (player.health <= 0) {
    //             player.lives--;
    //             player.health = PLAYER_MAX_HEALTH;
    //             lifeLostSound.play();
    //             if (player.lives <= 0) {
    //             }
    //           }
    //         }
    //       }
    //       // Mark segment for removal
    //       segmentsToRemove.push(index);
    //     }
    //   });
    //   // Remove exploded segments from the detached segments array
    //   for (let i = segmentsToRemove.length - 1; i >= 0; i--) {
    //     detachedSegments.splice(segmentsToRemove[i], 1);
    //   }
  }

  makeTemporalSerpentLeaveScreen(duration) {
    // if (temporalSerpent) {
    //   const offScreenMargin = 100;
    //   temporalSerpent.x = -offScreenMargin;
    //   temporalSerpent.y = -offScreenMargin;
    //   setTimeout(() => {
    //     if (temporalSerpent && temporalSerpent.alive) {
    //       const position = getRandomBorderPosition();
    //       temporalSerpent.x = position.x;
    //       temporalSerpent.y = position.y;
    //     }
    //   }, duration);
    // }
  }

  clearSerpentSegments() {
    // if (temporalSerpent) {
    //   // Clear the active segments of the Temporal Serpent
    //   temporalSerpent.segments = [];
    //   // Optionally, reset other properties if needed
    //   temporalSerpent.alive = false;
    //   temporalSerpent.health = temporalSerpent.maxHealth;
    //   temporalSerpent.phase = 1;
    //   temporalSerpent.phaseTransitioned = [false, false, false];
    // }
    // // Clear the detached segments
    // detachedSegments.length = 0; // This is a more efficient way to clear an array
    // // Clear hazardous zones
    // hazardousZones.length = 0;
  }
}

class Hazard {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.duration = 250;
    this.damage = 1;
    this.radius = 15;
    this.damageRate = 1000;
    this.coolDownActive = false;
    this.coolDownTimer = 0;
    this.particles = [];
    this.maxParticles = 1;
    this.markedForDeletion = false;
    this.spawnTime = this.game.timestamp;
    this.markedForDeletion = false;

    this.createParticles();
  }

  draw(ctx) {
    // Zone
    ctx.fillStyle = 'rgba(255, 69, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Particles
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  update() {
    this.hazardousZones.forEach((zone) => {
      if (this.game.timestamp - zone.spawnTime < this.duration) zone.markedForDeletion = true;
    });

    this.particles.forEach((particle) => particle.update());
    if (this.particles.length <= 0) this.markedForDeletion = true;

    this.checkCollisions();
  }

  checkCollisions() {
    // Check player is in hazardaous zone // TODO
    // if (hazardCooldownActive && timestamp < hazardCooldownTimer) {
    //   return;
    // }
    // let damageApplied = false;
    // let playerIsInHazard = false;
    // hazardParticles.forEach((particle) => {
    //   const dx = player.x - particle.x;
    //   const dy = player.y - particle.y;
    //   const distance = Math.sqrt(dx * dx + dy * dy);
    //   if (distance < particle.size + player.width / 2) {
    //     playerIsInHazard = true;
    //     if (!isInvincible && !shieldActive && !damageApplied) {
    //       player.health -= HAZARD_DAMAGE;
    //       damageApplied = true;
    //       if (player.health <= 0) {
    //         player.lives--;
    //         player.health = PLAYER_MAX_HEALTH;
    //         if (player.lives <= 0) {
    //         }
    //       }
    //     }
    //   }
    // });
    // if (damageApplied) {
    //   hazardCooldownActive = true;
    //   hazardCooldownTimer = timestamp + HAZARD_DAMAGE_RATE;
    // } else {
    //   hazardCooldownActive = false;
    // }
    // if (playerIsInHazard && !isPlayerInHazardZone) {
    //   hazardSound.play();
    //   isPlayerInHazardZone = true;
    // } else if (!playerIsInHazard && isPlayerInHazardZone) {
    //   hazardSound.pause();
    //   isPlayerInHazardZone = false;
    // }
  }

  createParticles() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(new HazardParticle(this.x, this.y));
    }
  }
}

class HazardParticle {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.size = null;
    this.alpha = null;
    this.decay = null;
    this.dx = null;
    this.dy = null;

    this.reset();
  }

  draw(ctx) {
    if (this.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 0, 1)'; // Green color
      ctx.fill();
      ctx.restore();
    }
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.alpha -= this.decay;
    if (this.alpha <= 0) this.reset();
  }

  reset() {
    this.size = Math.random() * 10 + 5;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.01;
    this.dx = (Math.random() - 0.5) * 1;
    this.dy = (Math.random() - 0.5) * 1;
  }
}

class EnergyBarrier {
  constructor(game) {
    this.game = game;
    this.duration = 5000;
    this.cooldown = 10000;
    this.endTime = 0;
    this.coolDownEndTime = 0;
  }

  draw(ctx) {}

  update() {}
}

// function activateEnergyBarrier() {
//   if (performance.now() >= energyBarrierCooldownEndTime) {
//     energyBarrierActive = true;
//     energyBarrierEndTime = performance.now() + energyBarrierDuration;
//     energyBarrierCooldownEndTime = performance.now() + energyBarrierCooldown;
//   }
// }

// function updateEnergyBarrier() {
//   if (energyBarrierActive && performance.now() >= energyBarrierEndTime) {
//     energyBarrierActive = false;
//   }
// }

// function handleProjectileReflection(projectile) {
//   if (energyBarrierActive) {
//     // Calculate the reflection direction (simply invert the direction here)
//     projectile.directionX = -projectile.directionX;
//     projectile.directionY = -projectile.directionY;

//     // Change the projectile to an enemy projectile
//     projectile.fromPlayer = false;
//     projectile.fromBoss = true;

//     // Increase the size of the projectile
//     projectile.width *= 5;
//     projectile.height *= 5;

//     // Optionally, you can change the color or other properties of the projectile to indicate it has been reflected
//     projectile.color = 'red'; // Example: change color to indicate it's an enemy projectile
//   }
// }

// let energyBarrierRadius = 50; // Define the radius of the energy barrier

// function drawEnergyBarrier(ctx) {
//   if (energyBarrierActive && temporalSerpent && temporalSerpent.alive) {
//     const headX = temporalSerpent.segments[0].x;
//     const headY = temporalSerpent.segments[0].y;

//     ctx.save();
//     ctx.strokeStyle = 'purple'; // Change color to cyan for a more energetic look
//     ctx.lineWidth = 5;

//     // Add glow effect
//     ctx.shadowBlur = 20;
//     ctx.shadowColor = 'yellow';

//     ctx.beginPath();
//     ctx.arc(headX, headY, energyBarrierRadius, 0, 2 * Math.PI);
//     ctx.stroke();
//     ctx.restore();
//   }
// }
