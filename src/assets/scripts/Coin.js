class Coin {
    constructor(game) {
        this.game = game;
        this.x = Math.random() * (this.game.canvas.width - 20);
        this.y = Math.random() * (this.game.canvas.height - 20 - this.game.topMargin) + this.game.topMargin;
        this.width = 20;
        this.height = 20;
        this.image = new Image();
        this.image.src = 'assets/images/coin.png';
        this.sound = new Audio("assets/audio/coin.mp3");
    }

    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
    }
}

export default Coin;
