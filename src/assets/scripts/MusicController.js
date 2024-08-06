export default class MusicController {
  constructor(game) {
    this.game = game;
    this.active = null;

    this.tracks = {
      background: new Audio('assets/audio/background-music.mp3'),
      gameOver: new Audio('assets/audio/gameOverMusic.mp3'),
    };
  }

  startMusic(music) {
    if (music) music.play();
  }

  pauseMusic(music) {
    if (music) music.pause();
  }

  stopMusic(music) {
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
  }

  update() {
    // const isBossLevel = this.level % 5 === 0;
    /*if (this.boss && this.boss.music.paused) {
      this.stopMusic(this.music.background);
      this.startMusic(this.boss.music);
    } else if (this.music.background.paused) {
      if (this.boss) this.stopMusic(this.boss.music);
      this.startMusic(this.music.background);
    }*/
    /*if (this.menu.isOpen) {
      this.pauseMusic(this.music.background);
    } else {
      this.startMusic(this.music.background);
    }*/
  }
}
