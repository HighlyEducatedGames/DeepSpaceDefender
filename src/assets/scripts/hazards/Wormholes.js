// // wormhole logic
// const WORMHOLE_PAIRS = [
//   { entry: { x: 100, y: 100, radius: 37.5 }, exit: { x: 700, y: 500, radius: 37.5 } },
//   { entry: { x: 400, y: 300, radius: 37.5 }, exit: { x: 200, y: 700, radius: 37.5 } },
// ];

// const WORMHOLE_LIFETIME = 10000; // 10 seconds
// const WORMHOLE_COOLDOWN = 10000; // 10 seconds
// const WORMHOLE_FADE_DURATION = 2000; // 2 seconds for fade in/out
// const TELEPORT_COOLDOWN = 1000; // 1 second cooldown

// let lastPlayerTeleportTime = 0;
// let lastEnemyTeleportTimes = new Map();
// let wormholes = [];
// let wormholeActive = false;
// let wormholeSpawnTime = 0;

// function isValidSpawnPosition(x, y, radius, canvasWidth, canvasHeight) {
//   const margin = 150;
//   return (
//     x > margin + radius &&
//     x < canvasWidth - margin - radius &&
//     y > margin + radius &&
//     y < canvasHeight - margin - radius
//   );
// }

// function initWormholes(level) {
//   if (level <= 7) return;

//   wormholes = []; // Clear any existing wormholes
//   wormholeActive = true;
//   wormholeSpawnTime = performance.now();

//   const canvasWidth = canvas.width;
//   const canvasHeight = canvas.height;

//   const quadrants = [
//     { xMin: 0, xMax: canvasWidth / 2, yMin: 0, yMax: canvasHeight / 2 }, // Top-left quadrant
//     { xMin: canvasWidth / 2, xMax: canvasWidth, yMin: 0, yMax: canvasHeight / 2 }, // Top-right quadrant
//     { xMin: 0, xMax: canvasWidth / 2, yMin: canvasHeight / 2, yMax: canvasHeight }, // Bottom-left quadrant
//     { xMin: canvasWidth / 2, xMax: canvasWidth, yMin: canvasHeight / 2, yMax: canvasHeight }, // Bottom-right quadrant
//   ];

//   WORMHOLE_PAIRS.forEach((pair, index) => {
//     let entry, exit;

//     const entryQuadrant = quadrants[index % 4];
//     const exitQuadrant = quadrants[(index + 1) % 4];

//     do {
//       entry = {
//         x: Math.random() * (entryQuadrant.xMax - entryQuadrant.xMin) + entryQuadrant.xMin,
//         y: Math.random() * (entryQuadrant.yMax - entryQuadrant.yMin) + entryQuadrant.yMin,
//         radius: pair.entry.radius,
//         opacity: 0,
//       };
//     } while (!isValidSpawnPosition(entry.x, entry.y, entry.radius, canvasWidth, canvasHeight));

//     do {
//       exit = {
//         x: Math.random() * (exitQuadrant.xMax - exitQuadrant.xMin) + exitQuadrant.xMin,
//         y: Math.random() * (exitQuadrant.yMax - exitQuadrant.yMin) + exitQuadrant.yMin,
//         radius: pair.exit.radius,
//         opacity: 0,
//       };
//     } while (!isValidSpawnPosition(exit.x, exit.y, exit.radius, canvasWidth, canvasHeight));

//     wormholes.push({ entry, exit });
//   });
// }

// function updateWormholes(timestamp) {
//   if (!wormholeActive && performance.now() - wormholeSpawnTime > WORMHOLE_COOLDOWN) {
//     initWormholes(level); // Respawn wormholes
//   } else if (wormholeActive && performance.now() - wormholeSpawnTime > WORMHOLE_LIFETIME) {
//     wormholeActive = false;
//     wormholeSpawnTime = performance.now();
//     wormholes = [];
//   }

//   // Handle fade in/out
//   wormholes.forEach((wormhole) => {
//     const timeSinceSpawn = performance.now() - wormholeSpawnTime;
//     if (timeSinceSpawn < WORMHOLE_FADE_DURATION) {
//       wormhole.entry.opacity = timeSinceSpawn / WORMHOLE_FADE_DURATION;
//       wormhole.exit.opacity = timeSinceSpawn / WORMHOLE_FADE_DURATION;
//     } else if (performance.now() - wormholeSpawnTime > WORMHOLE_LIFETIME - WORMHOLE_FADE_DURATION) {
//       wormhole.entry.opacity = (WORMHOLE_LIFETIME - (performance.now() - wormholeSpawnTime)) / WORMHOLE_FADE_DURATION;
//       wormhole.exit.opacity = (WORMHOLE_LIFETIME - (performance.now() - wormholeSpawnTime)) / WORMHOLE_FADE_DURATION;
//     } else {
//       wormhole.entry.opacity = 1;
//       wormhole.exit.opacity = 1;
//     }
//   });
// }

// function drawWormholes() {
//   wormholes.forEach((wormhole) => {
//     // Draw entry wormhole with gradient and opacity
//     const entryGradient = ctx.createRadialGradient(
//       wormhole.entry.x,
//       wormhole.entry.y,
//       0,
//       wormhole.entry.x,
//       wormhole.entry.y,
//       wormhole.entry.radius,
//     );
//     entryGradient.addColorStop(0, `rgba(0, 0, 255, ${wormhole.entry.opacity})`);
//     entryGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

//     ctx.beginPath();
//     ctx.arc(wormhole.entry.x, wormhole.entry.y, wormhole.entry.radius, 0, 2 * Math.PI);
//     ctx.fillStyle = entryGradient;
//     ctx.fill();

//     // Draw entry wormhole stroke with gradient and opacity
//     const entryStrokeGradient = ctx.createRadialGradient(
//       wormhole.entry.x,
//       wormhole.entry.y,
//       wormhole.entry.radius,
//       wormhole.entry.x,
//       wormhole.entry.y,
//       wormhole.entry.radius + 5,
//     );
//     entryStrokeGradient.addColorStop(0, `rgba(255, 0, 0, ${wormhole.entry.opacity})`);
//     entryStrokeGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

//     ctx.strokeStyle = entryStrokeGradient;
//     ctx.lineWidth = 5;
//     ctx.stroke();

//     // Draw exit wormhole with gradient and opacity
//     const exitGradient = ctx.createRadialGradient(
//       wormhole.exit.x,
//       wormhole.exit.y,
//       0,
//       wormhole.exit.x,
//       wormhole.exit.y,
//       wormhole.exit.radius,
//     );
//     exitGradient.addColorStop(0, `rgba(255, 0, 0, ${wormhole.exit.opacity})`);
//     exitGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

//     ctx.beginPath();
//     ctx.arc(wormhole.exit.x, wormhole.exit.y, wormhole.exit.radius, 0, 2 * Math.PI);
//     ctx.fillStyle = exitGradient;
//     ctx.fill();

//     // Draw exit wormhole stroke with gradient and opacity
//     const exitStrokeGradient = ctx.createRadialGradient(
//       wormhole.exit.x,
//       wormhole.exit.y,
//       wormhole.exit.radius,
//       wormhole.exit.x,
//       wormhole.exit.y,
//       wormhole.exit.radius + 5,
//     );
//     exitStrokeGradient.addColorStop(0, `rgba(0, 0, 255, ${wormhole.exit.opacity})`);
//     exitStrokeGradient.addColorStop(1, 'rgba(0, 0, 255, 0)');

//     ctx.strokeStyle = exitStrokeGradient;
//     ctx.lineWidth = 5;
//     ctx.stroke();
//   });
// }

// const PROJECTILE_TELEPORT_COOLDOWN = 500; // Cooldown period in milliseconds

// function handleWormholeTeleportation() {
//   const currentTime = performance.now();
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
