export default class MusicController {
  constructor(game) {
    this.game = game;
    this.currentTrack = null;

    this.tracks = {
      background: new Audio('assets/audio/background-music.mp3'),
      gameOver: new Audio('assets/audio/gameOverMusic.mp3'),
    };
  }

  setTrack(track) {
    if (!(track instanceof Audio)) return;
    if (this.currentTrack === track) return;
    this.stop();
    this.currentTrack = track;
    this.currentTrack.currentTrack = 0;
  }

  play() {
    if (!this.currentTrack) return;
    this.currentTrack.play();
  }

  pause() {
    if (!this.currentTrack) return;
    this.currentTrack.pause();
  }

  stop() {
    if (!this.currentTrack) return;
    this.currentTrack.pause();
    this.currentTrack.currentTime = 0;
  }

  restart() {
    this.stop();
    this.play();
  }

  update() {}
}
