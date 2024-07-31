class Boss {
  constructor(game) {
    this.game = game;
    this.image = new Image();
    this.image.src = 'assets/images/boss.png';
    this.music = new Audio('assets/audio/boss_music.mp3');
  }

  startMusic() {
    if (!this.music.paused) {
      this.game.stopBackgroundMusic();
      this.music.play();
    }
  }

  stopMusic() {
    this.music.pause();
    this.music.currentTime = 0;
  }
}

export default Boss;
