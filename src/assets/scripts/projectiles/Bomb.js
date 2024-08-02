class Bomb {
  constructor(game) {
    this.game = game;
    this.x;
    this.y;
    this.radius = 300;
    this.active = false;
    this.damage = 150;

    this.sound = new Audio('assets/audio/bombSound.mp3');
  }
}

export default Bomb;
