class Enemy {
    constructor(game) {
        this.game = game;
    }

    attack() {
        this.game.player.health -= 5;
    }
}