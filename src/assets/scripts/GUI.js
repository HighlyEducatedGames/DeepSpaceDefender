class GUI {
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
    }

    draw(ctx) {
        this.drawScoreLevelTime(ctx);
        this.drawBoostBar(ctx);
        this.drawHealthBar(ctx);
        this.drawChargeBar(ctx);
        this.drawShieldBar(ctx);
        this.drawInventories(ctx);
    }

    drawScoreLevelTime(ctx) {
        ctx.font = '15px "Press Start 2P", cursive';
        ctx.fillStyle = 'white';
        ctx.fillText('Score: ' + this.game.score, 10, 20);
        ctx.fillText('Level: ' + this.game.level, 10, 50);
        ctx.fillText('Time: ' + Math.floor(this.game.countdown), this.game.canvas.width * 0.5 - 30, 20);
    }

    drawBoostBar(ctx) {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.boostBarX, this.boostBarY, this.boostBarWidth, this.boostBarHeight);

        const currentTime = performance.now();
        let boostProgress;
        if (this.game.player.isBoostReady()) {
            boostProgress = 1;
        } else {
            boostProgress = Math.max(0, (currentTime - this.game.player.boostCooldownEndTime + (boostPowerUpActive ? 500 : 7000)) / (boostPowerUpActive ? 500 : 7000)); // TODO boostPowerUpActive
        }

        ctx.fillStyle = 'green';
        ctx.fillRect(this.boostBarX, this.boostBarY, this.boostBarWidth * boostProgress, this.boostBarHeight);
        ctx.strokeStyle = 'gray';

        if (this.game.powerUps.boost.isActive) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.boostBarX - 3, this.boostBarY - 3, this.boostBarWidth + 6, this.boostBarHeight + 6);
        }
    }

    drawHealthBar(ctx) {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);

        const healthRatio = this.game.player.health / this.game.player.maxHealth;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.healthBarX, this.healthBarY, this.healthBarWidth * healthRatio, this.healthBarHeight);

        ctx.strokeStyle = 'gray';
        ctx.strokeRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight);
    }

    drawChargeBar(ctx) {
        const isCharging = false; // TODO get from player
        const spacebarPressedTime = 0; // TODO get from keys??
        const flamethrowerActive = false; // TODO get from flamethrower class??

        ctx.fillStyle = 'gray';
        ctx.fillRect(this.chargeBarX, this.chargeBarY, this.chargeBarWidth, this.chargeBarHeight);

        if (isCharging) {
            const currentTime = performance.now();
            const chargeDuration = (currentTime - spacebarPressedTime) / 1000;
            const chargeProgress = Math.min(chargeDuration / 2, 1);

            if (flamethrowerActive) {
                const gradient = ctx.createLinearGradient(this.chargeBarX, this.chargeBarY, this.chargeBarX + this.chargeBarWidth, this.chargeBarY);
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
        }
    }

    drawShieldBar(ctx) {
        const shieldActive = false; // TODO get from player??
        const shieldPowerUpExpirationTime = 0; // TODO get from player??

        ctx.fillStyle = 'gray';
        ctx.fillRect(this.shieldBarX, this.shieldBarY, this.shieldBarWidth, this.shieldBarHeight);

        if (shieldActive) {
            const currentTime = performance.now();
            const shieldProgress = Math.max(0, (shieldPowerUpExpirationTime - currentTime) / 15000);
            ctx.fillStyle = 'cyan';
            ctx.fillRect(this.shieldBarX, this.shieldBarY, this.shieldBarWidth * shieldProgress, this.shieldBarHeight);
        }

        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.shieldBarX, this.shieldBarY, this.shieldBarWidth, this.shieldBarHeight);
    }

    drawInventories(ctx, player, bombs, homingMissilesInventory) {
        const livesIconX = this.healthBarX + this.healthBarWidth + 10;
        ctx.drawImage(this.game.player.images.idle, livesIconX, this.healthBarY, 20, 20);
        ctx.fillStyle = 'white';
        ctx.font = '15px "Press Start 2P", cursive';
        ctx.fillText(':' + this.game.player.lives, livesIconX + 25, this.healthBarY + 18);

        // const bombIconX = this.chargeBarX + this.chargeBarWidth + 10; // TODO once bombs are established
        // ctx.drawImage(bombPowerUpImage, bombIconX, this.chargeBarY, 20, 20);
        // ctx.fillText(': ' + bombs, bombIconX + 25, this.chargeBarY + 15);

        // const missileIconX = this.shieldBarX + this.shieldBarWidth + 10; // TODO once missiles are established
        // ctx.drawImage(homingMissilePowerUpImage, missileIconX, this.shieldBarY, 20, 20);
        // ctx.fillText(': ' + homingMissilesInventory, missileIconX + 25, this.shieldBarY + 15);
    }
}

export default GUI;
