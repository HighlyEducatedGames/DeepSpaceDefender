export default class GUI {
  constructor(game) {
    this.game = game;

    this.boostBarWidth = 200;
    this.boostBarHeight = 20;
    this.boostBarX = this.game.canvas.width * 0.5 - this.boostBarWidth * 0.5 - 250;
    this.boostBarY = 20;

    this.healthBarWidth = 200;
    this.healthBarHeight = 20;
    this.healthBarX = this.boostBarX;
    this.healthBarY = this.boostBarY + this.boostBarHeight + 5;

    this.chargeBarWidth = 200;
    this.chargeBarHeight = 20;
    this.chargeBarX = this.game.canvas.width * 0.5 - this.chargeBarWidth * 0.5 + 350;
    this.chargeBarY = 20;

    this.shieldBarWidth = 200;
    this.shieldBarHeight = 20;
    this.shieldBarX = this.chargeBarX;
    this.shieldBarY = this.chargeBarY + this.chargeBarHeight + 5;

    this.images = {
      bomb: new Image(),
      missile: new Image(),
    };
    this.images.bomb.src = 'assets/images/bombPowerUp.png';
    this.images.missile.src = 'assets/images/homingMissilePowerUp.png';
  }

  draw(ctx) {
    this.drawText(ctx);
    this.drawBoostBar(ctx);
    this.drawHealthBar(ctx);
    this.drawChargeBar(ctx);
    this.drawShieldBar(ctx);
    this.drawInventories(ctx);
    if (this.game.debug) this.drawDebug(ctx);
  }

  drawText(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '15px "Press Start 2P", cursive';
    ctx.fillText('Score: ' + this.game.score, 10, 20);
    ctx.fillText('Level: ' + this.game.level, 10, 50);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillText('Time: ' + Math.floor(this.game.countdown), this.game.canvas.width * 0.5, 20);
    ctx.restore();

    ctx.font = '10px "Press Start 2P", cursive';
    ctx.fillText('Booster', this.boostBarX - ctx.measureText('Booster').width - 10, this.boostBarY + 15);
    ctx.fillText('Health', this.healthBarX - ctx.measureText('Health').width - 10, this.healthBarY + 15);
    ctx.fillText('Blaster', this.chargeBarX - ctx.measureText('Blaster').width - 10, this.chargeBarY + 15);
    ctx.fillText('Shield', this.shieldBarX - ctx.measureText('Shield').width - 10, this.shieldBarY + 15);
  }

  drawBoostBar(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.boostBarX, this.boostBarY, this.boostBarWidth, this.boostBarHeight);

    const currentTime = performance.now();
    let boostProgress;
    if (this.game.player.isBoostReady()) {
      boostProgress = 1;
    } else {
      const boostPowerUpActive = this.game.powerUps.boost.isActive;
      boostProgress = Math.max(
        0,
        (currentTime - this.game.player.boostCooldownEndTime + (boostPowerUpActive ? 500 : 7000)) /
          (boostPowerUpActive ? 500 : 7000),
      );
    }

    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(this.boostBarX, this.boostBarY, this.boostBarWidth * boostProgress, this.boostBarHeight);

    ctx.strokeStyle = 'gray';
    ctx.strokeRect(this.boostBarX, this.boostBarY, this.boostBarWidth, this.boostBarHeight);

    // if (this.game.powerUps.boost.isActive) { // TODO once powerups are addded
    //   ctx.strokeStyle = 'white';
    //   ctx.lineWidth = 3;
    //   ctx.strokeRect(this.boostBarX - 3, this.boostBarY - 3, this.boostBarWidth + 6, this.boostBarHeight + 6);
    // }
  }

  drawHealthBar(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

    const healthRatio = this.game.player.health / this.game.player.maxHealth;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * healthRatio, this.healthBarHeight);

    ctx.strokeStyle = 'gray';
    ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);
  }

  drawChargeBar(ctx) {
    const isCharging = this.game.player.isCharging;
    const spacebarHeldTime = this.game.player.spacebarHeldTime;
    const flamethrowerActive = false; // TODO get from flamethrower class??

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.chargeBarX, this.chargeBarY, this.chargeBarWidth, this.chargeBarHeight);

    ctx.strokeStyle = 'gray';
    ctx.strokeRect(this.chargeBarX, this.chargeBarY, this.chargeBarWidth, this.chargeBarHeight);

    if (isCharging) {
      const currentTime = performance.now();
      const chargeDuration = (currentTime - spacebarHeldTime) / 1000;
      const chargeProgress = Math.min(chargeDuration / 2, 1);

      if (flamethrowerActive) {
        const gradient = ctx.createLinearGradient(
          this.chargeBarX,
          this.chargeBarY,
          this.chargeBarX + this.chargeBarWidth,
          this.chargeBarY,
        );
        gradient.addColorStop(0, 'orange');
        gradient.addColorStop(1, 'red');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = 'blue';
      }

      ctx.fillRect(this.chargeBarX, this.chargeBarY, this.chargeBarWidth * chargeProgress, this.chargeBarHeight);

      const halfwayMarkerX = this.chargeBarX + this.chargeBarWidth * 0.5;
      ctx.strokeStyle = 'yellow';
      ctx.beginPath();
      ctx.moveTo(halfwayMarkerX, this.chargeBarY);
      ctx.lineTo(halfwayMarkerX, this.chargeBarY + this.chargeBarHeight);
      ctx.stroke();

      // TODO
      // if (reversePowerUpActive) {
      //   ctx.strokeStyle = 'yellow';
      //   ctx.lineWidth = 5;
      //   ctx.strokeRect(chargeBarX - 2.5, chargeBarY - 2.5, chargeBarWidth + 5, chargeBarHeight + 5);
      // }

      // if (powerUpActive) {
      //   ctx.strokeStyle = 'blue';
      //   ctx.lineWidth = 3;
      //   ctx.strokeRect(chargeBarX, chargeBarY, chargeBarWidth, chargeBarHeight);
      // }
    }
  }

  drawShieldBar(ctx) {
    const shieldActive = false; // TODO get from player??
    const shieldPowerUpExpirationTime = 0; // TODO get from player??

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.shieldBarX, this.shieldBarY, this.shieldBarWidth, this.shieldBarHeight);

    if (shieldActive) {
      const currentTime = performance.now();
      const shieldProgress = Math.max(0, (shieldPowerUpExpirationTime - currentTime) / 15000);
      ctx.fillStyle = 'cyan';
      ctx.fillRect(this.shieldBarX, this.shieldBarY, this.shieldBarWidth * shieldProgress, this.shieldBarHeight);
    }

    ctx.strokeStyle = 'gray';
    ctx.strokeRect(this.shieldBarX, this.shieldBarY, this.shieldBarWidth, this.shieldBarHeight);
  }

  drawInventories(ctx) {
    const livesIconX = this.healthBarX + this.healthBarWidth + 10;
    ctx.drawImage(this.game.player.images.idle, livesIconX, this.healthBarY, 20, 20);
    ctx.fillStyle = 'white';
    ctx.font = '15px "Press Start 2P", cursive';
    ctx.fillText(':' + this.game.player.lives, livesIconX + 25, this.healthBarY + 18);

    const bombIconX = this.chargeBarX + this.chargeBarWidth + 10;
    ctx.drawImage(this.images.bomb, bombIconX, this.chargeBarY, 20, 20);
    ctx.fillText(':' + this.game.player.bombs, bombIconX + 25, this.chargeBarY + 18);

    const missileIconX = this.shieldBarX + this.shieldBarWidth + 10;
    ctx.drawImage(this.images.missile, missileIconX, this.shieldBarY, 20, 20);
    ctx.fillText(':' + this.game.player.missiles, missileIconX + 25, this.shieldBarY + 18);
  }

  drawDebug(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '10px "Press Start 2P", cursive';
    const ms = Math.floor(this.game.tickMs * 10) / 10;
    const percent = Math.floor((this.game.tickMs / this.game.targetFrameDuration) * 100);
    const counts = this.getCounts();

    const line4 = `Boss Phase: ${this.game.boss ? this.game.boss.phase : 0}`;
    const line3 = `Effects: ${this.game.effects.length}`;
    const line2 = `E: ${counts.entities} P: ${counts.projectiles} T: ${counts.particles}`;
    const line1Part1 = `Tick: ${ms.toFixed(1)}ms - `;
    const line1Part2 = `${percent}%`;
    const line1Part1Width = ctx.measureText(line1Part1).width;

    ctx.fillText(line4, 10, this.game.canvas.height - 55);
    ctx.fillText(line3, 10, this.game.canvas.height - 40);
    ctx.fillText(line2, 10, this.game.canvas.height - 25);
    ctx.fillText(line1Part1, 10, this.game.canvas.height - 10);

    let color;
    if (percent < 50) {
      color = 'white';
    } else if (percent < 80) {
      color = 'yellow';
    } else {
      color = 'red';
    }

    ctx.fillStyle = color;
    ctx.fillText(line1Part2, 10 + line1Part1Width, this.game.canvas.height - 10);
  }

  getCounts() {
    let entities = 0;
    let projectiles = 0;
    let particles = 0;

    entities += this.game.coins.length;

    if (this.game.ally) {
      entities++;
      projectiles += this.game.ally.projectiles.length;
    }

    return { entities, projectiles, particles };
  }
}
