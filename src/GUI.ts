import { Action } from './InputHandler';

export default class GUI {
  game: Game;
  images: { [key: string]: HTMLImageElement };

  boostBarWidth = 200;
  boostBarHeight = 20;
  boostBarX: number;
  boostBarY = 20;

  healthBarWidth = 200;
  healthBarHeight = 20;
  healthBarX: number;
  healthBarY = this.boostBarY + this.boostBarHeight + 5;

  chargeBarWidth = 200;
  chargeBarHeight = 20;
  chargeBarX: number;
  chargeBarY = 20;

  shieldBarWidth = 200;
  shieldBarHeight = 20;
  shieldBarX: number;
  shieldBarY = this.chargeBarY + this.chargeBarHeight + 5;

  constructor(game: Game) {
    this.game = game;
    this.images = {
      bomb: this.game.getImage('bomb_powerup_image'),
      missile: this.game.getImage('missile_powerup_image'),
    };

    this.boostBarX = this.game.width * 0.5 - this.boostBarWidth * 0.5 - 250;
    this.healthBarX = this.boostBarX;
    this.chargeBarX = this.game.width * 0.5 - this.chargeBarWidth * 0.5 + 420;
    this.shieldBarX = this.chargeBarX;
  }

  draw(ctx: CTX) {
    this.drawText(ctx);
    this.drawBoostBar(ctx);
    this.drawHealthBar(ctx);
    this.drawChargeBar(ctx);
    this.drawShieldBar(ctx);
    this.drawInventories(ctx);
    this.drawPowerCooldowns(ctx);
  }

  drawText(ctx: CTX) {
    ctx.fillStyle = 'white';
    ctx.font = '15px "Press Start 2P", cursive';
    ctx.fillText('Score: ' + this.game.score, 10, 25);
    ctx.fillText('Level: ' + this.game.level, 10, 50);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillText('Time: ' + Math.floor(this.game.countdown), this.game.width * 0.5, 25);
    ctx.restore();

    ctx.font = '10px "Press Start 2P", cursive';
    ctx.fillText('Booster', this.boostBarX - ctx.measureText('Booster').width - 10, this.boostBarY + 15);
    ctx.fillText('Health', this.healthBarX - ctx.measureText('Health').width - 10, this.healthBarY + 15);
    ctx.fillText('Blaster', this.chargeBarX - ctx.measureText('Blaster').width - 10, this.chargeBarY + 15);
    ctx.fillText('Shield', this.shieldBarX - ctx.measureText('Shield').width - 10, this.shieldBarY + 15);
  }

  drawBoostBar(ctx: CTX) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.boostBarX, this.boostBarY, this.boostBarWidth, this.boostBarHeight);

    const boostPowerUpActive = this.game.player.abilities.boost.active;

    let boostProgress;
    if (this.game.player.isBoostReady() || this.game.inputs.codes.unlimitedBoost.enabled) {
      boostProgress = 1;
    } else {
      const cooldown = boostPowerUpActive ? 500 : 7000;
      const elapsedCooldown = Math.max(0, cooldown - this.game.player.boostCooldownTimer);
      boostProgress = elapsedCooldown / cooldown;
    }

    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(this.boostBarX, this.boostBarY, this.boostBarWidth * boostProgress, this.boostBarHeight);

    ctx.strokeStyle = 'gray';
    ctx.strokeRect(this.boostBarX, this.boostBarY, this.boostBarWidth, this.boostBarHeight);

    if (boostPowerUpActive) {
      ctx.save();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.boostBarX - 3, this.boostBarY - 3, this.boostBarWidth + 6, this.boostBarHeight + 6);
      ctx.restore();
    }
  }

  drawHealthBar(ctx: CTX) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

    const healthRatio = this.game.player.health / this.game.player.maxHealth;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * healthRatio, this.healthBarHeight);

    ctx.strokeStyle = 'gray';
    ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);
  }

  drawChargeBar(ctx: CTX) {
    const isCharging = this.game.player.isCharging;
    const spacebarHeldTime = this.game.inputs.actions[Action.FIRE].heldDuration;
    const flamethrowerActive = false; // TODO get from flamethrower class??

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.chargeBarX, this.chargeBarY, this.chargeBarWidth, this.chargeBarHeight);

    ctx.strokeStyle = 'gray';
    ctx.strokeRect(this.chargeBarX, this.chargeBarY, this.chargeBarWidth, this.chargeBarHeight);

    if (isCharging) {
      const chargeDuration = spacebarHeldTime / 1000;
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

      if (this.game.player.abilities.reverse.active) {
        ctx.save();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 5;
        ctx.strokeRect(this.chargeBarX - 2.5, this.chargeBarY - 2.5, this.chargeBarWidth + 5, this.chargeBarHeight + 5);
        ctx.restore();
      }

      if (this.game.player.abilities.projectile.active) {
        ctx.save();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.chargeBarX, this.chargeBarY, this.chargeBarWidth, this.chargeBarHeight);
        ctx.restore();
      }
    }
  }

  drawShieldBar(ctx: CTX) {
    const powerUp = this.game.player.abilities.shield;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(this.shieldBarX, this.shieldBarY, this.shieldBarWidth, this.shieldBarHeight);

    if (powerUp.active) {
      const shieldProgress = Math.max(0, powerUp.timer / powerUp.duration);
      ctx.fillStyle = 'cyan';
      ctx.fillRect(
        this.shieldBarX,
        this.shieldBarY,
        this.shieldBarWidth - this.shieldBarWidth * shieldProgress,
        this.shieldBarHeight,
      );
    }

    ctx.strokeStyle = 'gray';
    ctx.strokeRect(this.shieldBarX, this.shieldBarY, this.shieldBarWidth, this.shieldBarHeight);
  }

  drawInventories(ctx: CTX) {
    const livesIconX = this.healthBarX + this.healthBarWidth + 10;
    ctx.drawImage(this.game.player.images.idle, livesIconX, this.healthBarY, 20, 20);
    ctx.fillStyle = 'white';
    ctx.font = '15px "Press Start 2P", cursive';
    ctx.fillText(':' + this.game.player.lives, livesIconX + 25, this.healthBarY + 18);

    const colonText = ':';
    const colonTextWidth = ctx.measureText(colonText).width;
    const fullInventoryColor = 'gold';

    const bombIconX = this.chargeBarX + this.chargeBarWidth + 10;
    ctx.drawImage(this.images.bomb, bombIconX, this.chargeBarY, 20, 20);
    ctx.fillStyle = 'white';
    ctx.fillText(colonText, bombIconX + 25, this.chargeBarY + 18);
    ctx.fillStyle = this.game.player.bombs === this.game.player.maxBombs ? fullInventoryColor : 'white';
    ctx.fillText(this.game.player.bombs.toString(), bombIconX + 25 + colonTextWidth, this.chargeBarY + 18);

    const missileIconX = this.shieldBarX + this.shieldBarWidth + 10;
    ctx.drawImage(this.images.missile, missileIconX, this.shieldBarY, 20, 20);
    ctx.fillStyle = 'white';
    ctx.fillText(colonText, missileIconX + 25, this.shieldBarY + 18);
    ctx.fillStyle = this.game.player.missiles === this.game.player.maxMissiles ? fullInventoryColor : 'white';
    ctx.fillText(this.game.player.missiles.toString(), missileIconX + 25 + colonTextWidth, this.shieldBarY + 18);
  }

  drawPowerCooldowns(ctx: CTX) {
    const arr = Object.values(this.game.player.abilities);
    const size = 30;
    const startX = this.game.width - size - 10;
    const startY = this.game.height - size - 10;

    for (let i = 0; i < arr.length; i++) {
      const xPos = startX - (size + 10) * i;
      const yPos = startY;

      // Set the opacity based on whether the power is active or not
      ctx.globalAlpha = arr[i].active ? 1 : 0.3;

      // Draw the border
      ctx.strokeStyle = 'white';
      ctx.strokeRect(xPos, yPos, size, size);

      // Draw the power image if it exists
      if (arr[i].image) ctx.drawImage(arr[i].image, xPos, yPos, size, size);

      // If the power is active, draw the cooldown effect
      if (arr[i].active) {
        const filled = (arr[i].timer / arr[i].duration) * size;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(xPos, yPos, size, size);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(xPos, yPos + filled, size, size - filled);
      }
    }

    // Reset the globalAlpha back to full opacity after drawing
    ctx.globalAlpha = 1;
  }

  drawDebug(ctx: CTX) {
    ctx.fillStyle = 'white';
    ctx.font = '10px "Press Start 2P", cursive';
    const ms = Math.floor(this.game.tickMs * 10) / 10;
    const percent = Math.floor((this.game.tickMs / this.game.targetFrameDuration) * 100);

    const line3 = `Boss Phase: ${this.game.boss ? this.game.boss.phase : 0}`;
    const line2 = `E: ${this.getEntities()} P: ${this.game.projectiles.length} T: ${this.game.particles.length}`;
    const line1Part1 = `Tick: ${ms.toFixed(1)}ms - `;
    const line1Part2 = `${percent}%`;
    const line1Part1Width = ctx.measureText(line1Part1).width;

    ctx.fillText(line3, 10, this.game.height - 40);
    ctx.fillText(line2, 10, this.game.height - 25);
    ctx.fillText(line1Part1, 10, this.game.height - 10);

    let color;
    if (percent < 50) {
      color = 'white';
    } else if (percent < 80) {
      color = 'yellow';
    } else {
      color = 'red';
    }

    ctx.fillStyle = color;
    ctx.fillText(line1Part2, 10 + line1Part1Width, this.game.height - 10);
  }

  getEntities() {
    let entities = 1; // Include player
    entities += this.game.coins.length;
    if (this.game.ally) entities++;
    if (this.game.boss) entities++;
    if (this.game.player.bomb) entities++;
    entities += this.game.enemies.enemies.length;
    entities += this.game.wormholes.wormholes.length * 2;
    entities += this.game.arrowIndicators.length;
    entities += this.game.powerUps.powerUps.length;
    entities += this.game.effects.length;
    return entities;
  }
}
