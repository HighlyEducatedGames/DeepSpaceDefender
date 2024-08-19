export default class MusicController {
  constructor(game) {
    /** @type {import('./Game.js').default} */
    this.game = game;
    this.currentTrack = null;
    this.musicVol = parseFloat(localStorage.getItem('music_vol') || '0.5');
    this.fxVol = parseFloat(localStorage.getItem('fx_vol') || '0.5');
    this.tracks = {
      background: document.getElementById('background_music'),
      gameOver: document.getElementById('game_over_music'),
    };
    this.setMusicVolume(this.musicVol);
    this.setFxVolume(this.fxVol);
  }

  setTrack(track) {
    if (!(track instanceof Audio)) return;
    if (this.currentTrack === track) return;
    this.stop();
    this.currentTrack = track;
    this.currentTrack.currentTrack = 0;
    this.currentTrack.volume = this.musicVol;
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

  setMusicVolume(value) {
    if (!value) return;
    this.musicVol = value;
    localStorage.setItem('music_vol', this.musicVol);
    const elements = document.getElementById('audio-sources').children;
    const filtered = Array.from(elements).filter((x) => x.getAttribute('id').includes('music'));
    filtered.forEach((audio) => (audio.volume = value));
  }

  setFxVolume(value) {
    if (!value) return;
    this.fxVol = value;
    localStorage.setItem('fx_vol', this.fxVol);
    const elements = document.getElementById('audio-sources').children;
    const filtered = Array.from(elements).filter((x) => x.getAttribute('id').includes('sound'));
    filtered.forEach((audio) => (audio.volume = value));
  }
}
