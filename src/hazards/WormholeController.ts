import { GameObject } from '../GameObject';

export default class WormholeController {
  game: Game;
  wormholes: Wormhole[] = [];
  spawnTimer = 0;
  spawnInterval = 20000;

  constructor(game: Game) {
    this.game = game;
  }

  draw(ctx: CTX) {
    this.wormholes.forEach((wormhole) => wormhole.draw(ctx));
  }

  update(deltaTime: number) {
    if (!this.game.doWormholes) return;

    this.spawnTimer += deltaTime;
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawn();
    }

    this.wormholes.forEach((wormhole) => wormhole.update(deltaTime));
  }

  cleanup() {
    this.wormholes = this.wormholes.filter((wormhole) => !wormhole.markedForDeletion);
  }

  spawn() {
    if (this.game.level < 8) return;
    if (this.isActive()) return;
    this.wormholes.push(new Wormhole(this.game, [0, 0, 255], [255, 0, 0]));
    this.wormholes.push(new Wormhole(this.game, [0, 0, 255], [255, 0, 0]));
  }

  isActive() {
    return this.wormholes.length > 0;
  }

  reset() {
    this.wormholes = [];
    this.spawnTimer = 0;
  }

  init() {
    this.reset();
  }
}

class Wormhole {
  game: Game;
  entry = { x: 0, y: 0, opacity: 0 };
  exit = { x: 0, y: 0, opacity: 0 };
  radius = 37.5;
  lifetime = 10000;
  fadeDuration = 2000;
  teleportCooldown = 1000;
  playerLastTeleportTime = 0;
  lastEnemyTeleportTimes = new Map();
  margin = 50;
  color1: number[];
  color2: number[];
  quadrants: { xMin: number; yMin: number; xMax: number; yMax: number }[] = [];
  markedForDeletion = false;

  constructor(game: Game, color1: number[], color2: number[]) {
    this.game = game;
    this.color1 = color1;
    this.color2 = color2;

    this.getLocations();
  }

  getLocations() {
    const canvasWidth = this.game.width;
    const canvasHeight = this.game.height;
    const topMargin = this.game.topMargin + this.margin + this.radius;
    const margin = this.margin + this.radius;
    const spawnCenterX = canvasWidth * 0.5;
    const spawnCenterY = topMargin + (canvasHeight - topMargin - margin) * 0.5;

    this.quadrants = [
      {
        xMin: margin,
        xMax: spawnCenterX - this.radius,
        yMin: topMargin,
        yMax: spawnCenterY - this.radius,
      }, // Top-left quadrant
      {
        xMin: spawnCenterX + this.radius,
        xMax: canvasWidth - margin,
        yMin: topMargin,
        yMax: spawnCenterY - this.radius,
      }, // Top-right quadrant
      {
        xMin: margin,
        xMax: spawnCenterX - this.radius,
        yMin: spawnCenterY + this.radius,
        yMax: canvasHeight - margin,
      }, // Bottom-left quadrant
      {
        xMin: spawnCenterX + this.radius,
        xMax: canvasWidth - margin,
        yMin: spawnCenterY + this.radius,
        yMax: canvasHeight - margin,
      }, // Bottom-right quadrant
    ];

    const entryIndex = Math.floor(Math.random() * this.quadrants.length);
    const entryQuadrant = this.quadrants[entryIndex];
    const remainingQuadrants = this.quadrants.filter((_, index) => index !== entryIndex);
    const exitQuadrant = remainingQuadrants[Math.floor(Math.random() * remainingQuadrants.length)];

    this.entry = {
      x: Math.random() * (entryQuadrant.xMax - entryQuadrant.xMin) + entryQuadrant.xMin,
      y: Math.random() * (entryQuadrant.yMax - entryQuadrant.yMin) + entryQuadrant.yMin,
      opacity: 1,
    };

    this.exit = {
      x: Math.random() * (exitQuadrant.xMax - exitQuadrant.xMin) + exitQuadrant.xMin,
      y: Math.random() * (exitQuadrant.yMax - exitQuadrant.yMin) + exitQuadrant.yMin,
      opacity: 1,
    };
  }

  draw(ctx: CTX) {
    ctx.save();

    // Draw entry wormhole with gradient and opacity
    const entryGradient = ctx.createRadialGradient(
      this.entry.x,
      this.entry.y,
      0,
      this.entry.x,
      this.entry.y,
      this.radius,
    );
    entryGradient.addColorStop(0, this.setOpacity(this.color1, this.entry.opacity));
    entryGradient.addColorStop(1, this.setOpacity(this.color1, 1));

    ctx.beginPath();
    ctx.arc(this.entry.x, this.entry.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = entryGradient;
    ctx.fill();

    // Draw entry wormhole stroke with gradient and opacity
    const entryStrokeGradient = ctx.createRadialGradient(
      this.entry.x,
      this.entry.y,
      this.radius,
      this.entry.x,
      this.entry.y,
      this.radius + 5,
    );
    entryStrokeGradient.addColorStop(0, this.setOpacity(this.color2, this.entry.opacity));
    entryStrokeGradient.addColorStop(1, this.setOpacity(this.color2, 1));

    ctx.strokeStyle = entryStrokeGradient;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw exit wormhole with gradient and opacity
    const exitGradient = ctx.createRadialGradient(this.exit.x, this.exit.y, 0, this.exit.x, this.exit.y, this.radius);
    exitGradient.addColorStop(0, this.setOpacity(this.color2, this.exit.opacity));
    exitGradient.addColorStop(1, this.setOpacity(this.color2, 1));

    ctx.beginPath();
    ctx.arc(this.exit.x, this.exit.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = exitGradient;
    ctx.fill();

    // Draw exit wormhole stroke with gradient and opacity
    const exitStrokeGradient = ctx.createRadialGradient(
      this.exit.x,
      this.exit.y,
      this.radius,
      this.exit.x,
      this.exit.y,
      this.radius + 5,
    );
    exitStrokeGradient.addColorStop(0, this.setOpacity(this.color1, this.exit.opacity));
    exitStrokeGradient.addColorStop(1, this.setOpacity(this.color1, 1));

    ctx.strokeStyle = exitStrokeGradient;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.restore();

    // DEBUG - Hitbox
    if (this.game.debug) {
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.entry.x, this.entry.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(this.exit.x, this.exit.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      this.quadrants.forEach((quad) => {
        ctx.strokeStyle = 'gray';
        ctx.strokeRect(quad.xMin, quad.yMin, quad.xMax - quad.xMin, quad.yMax - quad.yMin);
      });
    }
  }

  update(deltaTime: number) {
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) this.markedForDeletion = true;
  }

  setOpacity(numbers: number[], opacity: number) {
    numbers[3] = opacity;
    const [r, g, b, a] = numbers;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}

// function updateWormholes(timestamp) {
//   if (!wormholeActive && this.game.timestamp - wormholeSpawnTime > WORMHOLE_COOLDOWN) {
//     initWormholes(level); // Respawn wormholes
//   } else if (wormholeActive && this.game.timestamp - wormholeSpawnTime > WORMHOLE_LIFETIME) {
//     wormholeActive = false;
//     wormholeSpawnTime = this.game.timestamp;
//     wormholes = [];
//   }

//   // Handle fade in/out
//   wormholes.forEach((wormhole) => {
//     const timeSinceSpawn = this.game.timestamp - wormholeSpawnTime;
//     if (timeSinceSpawn < WORMHOLE_FADE_DURATION) {
//       wormhole.entry.opacity = timeSinceSpawn / WORMHOLE_FADE_DURATION;
//       wormhole.exit.opacity = timeSinceSpawn / WORMHOLE_FADE_DURATION;
//     } else if (this.game.timestamp - wormholeSpawnTime > WORMHOLE_LIFETIME - WORMHOLE_FADE_DURATION) {
//       wormhole.entry.opacity = (WORMHOLE_LIFETIME - (this.game.timestamp - wormholeSpawnTime)) / WORMHOLE_FADE_DURATION;
//       wormhole.exit.opacity = (WORMHOLE_LIFETIME - (this.game.timestamp - wormholeSpawnTime)) / WORMHOLE_FADE_DURATION;
//     } else {
//       wormhole.entry.opacity = 1;
//       wormhole.exit.opacity = 1;
//     }
//   });
// }

// const PROJECTILE_TELEPORT_COOLDOWN = 500; // Cooldown period in milliseconds

// function handleWormholeTeleportation() {
//   const currentTime = this.game.timestamp;
//   const teleportSound = document.getElementById('teleportSound');

//   // Check player entry
//   if (currentTime - lastPlayerTeleportTime > TELEPORT_COOLDOWN) {
//     wormholes.forEach((wormhole) => {
//       const playerDistanceToEntry = Math.sqrt((player.x - wormhole.entry.x) ** 2 + (player.y - wormhole.entry.y) ** 2);

//       const playerDistanceToExit = Math.sqrt((player.x - wormhole.exit.x) ** 2 + (player.y - wormhole.exit.y) ** 2);

//       if (playerDistanceToEntry < wormhole.entry.radius) {
//         player.x = wormhole.exit.x;
//         player.y = wormhole.exit.y;
//         lastPlayerTeleportTime = currentTime;
//         teleportSound.currentTime = 0; // Reset sound to the beginning
//         teleportSound.play();
//       } else if (playerDistanceToExit < wormhole.exit.radius) {
//         player.x = wormhole.entry.x;
//         player.y = wormhole.entry.y;
//         lastPlayerTeleportTime = currentTime;
//         teleportSound.currentTime = 0; // Reset sound to the beginning
//         teleportSound.play();
//       }
//     });
//   }

//   // Check enemies entry
//   enemies.forEach((enemy) => {
//     if (!lastEnemyTeleportTimes.has(enemy)) {
//       lastEnemyTeleportTimes.set(enemy, 0);
//     }

//     if (currentTime - lastEnemyTeleportTimes.get(enemy) > TELEPORT_COOLDOWN) {
//       wormholes.forEach((wormhole) => {
//         const enemyDistanceToEntry = Math.sqrt((enemy.x - wormhole.entry.x) ** 2 + (enemy.y - wormhole.entry.y) ** 2);

//         const enemyDistanceToExit = Math.sqrt((enemy.x - wormhole.exit.x) ** 2 + (enemy.y - wormhole.exit.y) ** 2);

//         if (enemyDistanceToEntry < wormhole.entry.radius) {
//           enemy.x = wormhole.exit.x;
//           enemy.y = wormhole.exit.y;
//           lastEnemyTeleportTimes.set(enemy, currentTime);
//         } else if (enemyDistanceToExit < wormhole.exit.radius) {
//           enemy.x = wormhole.entry.x;
//           enemy.y = wormhole.entry.y;
//           lastEnemyTeleportTimes.set(enemy, currentTime);
//         }
//       });
//     }
//   });

//   // Check player projectile entry
//   projectiles.forEach((projectile) => {
//     if (!projectile.lastTeleportTime) {
//       projectile.lastTeleportTime = 0;
//     }

//     if (currentTime - projectile.lastTeleportTime > PROJECTILE_TELEPORT_COOLDOWN) {
//       wormholes.forEach((wormhole) => {
//         const distanceToEntry = Math.sqrt(
//           (projectile.x - wormhole.entry.x) ** 2 + (projectile.y - wormhole.entry.y) ** 2,
//         );

//         const distanceToExit = Math.sqrt((projectile.x - wormhole.exit.x) ** 2 + (projectile.y - wormhole.exit.y) ** 2);

//         if (distanceToEntry < wormhole.entry.radius) {
//           projectile.x = wormhole.exit.x;
//           projectile.y = wormhole.exit.y;
//           projectile.lastTeleportTime = currentTime; // Update the last teleport time
//           // Optionally add some logic to slightly adjust the direction if necessary
//         } else if (distanceToExit < wormhole.exit.radius) {
//           projectile.x = wormhole.entry.x;
//           projectile.y = wormhole.entry.y;
//           projectile.lastTeleportTime = currentTime; // Update the last teleport time
//           // Optionally add some logic to slightly adjust the direction if necessary
//         }
//       });
//     }
//   });

//   // Check flamethrower particles entry
//   flameParticles.forEach((particle) => {
//     if (!particle.lastTeleportTime) {
//       particle.lastTeleportTime = 0;
//     }

//     if (currentTime - particle.lastTeleportTime > PROJECTILE_TELEPORT_COOLDOWN) {
//       wormholes.forEach((wormhole) => {
//         const distanceToEntry = Math.sqrt((particle.x - wormhole.entry.x) ** 2 + (particle.y - wormhole.entry.y) ** 2);

//         const distanceToExit = Math.sqrt((particle.x - wormhole.exit.x) ** 2 + (particle.y - wormhole.exit.y) ** 2);

//         if (distanceToEntry < wormhole.entry.radius) {
//           particle.x = wormhole.exit.x;
//           particle.y = wormhole.exit.y;
//           particle.lastTeleportTime = currentTime; // Update the last teleport time
//         } else if (distanceToExit < wormhole.exit.radius) {
//           particle.x = wormhole.entry.x;
//           particle.y = wormhole.entry.y;
//           particle.lastTeleportTime = currentTime; // Update the last teleport time
//         }
//       });
//     }
//   });
// }
