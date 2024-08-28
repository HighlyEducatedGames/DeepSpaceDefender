export default class MusicController {
  game: Game;
  currentTrack: HTMLAudioElement | null = null;
  musicVol = parseFloat(localStorage.getItem('music_vol') || '0.5');
  fxVol = parseFloat(localStorage.getItem('fx_vol') || '0.5');
  tracks: { [key: string]: HTMLAudioElement };

  constructor(game: Game) {
    this.game = game;
    this.setMusicVolume(this.musicVol);
    this.setFxVolume(this.fxVol);
    this.tracks = {
      background: this.game.getAudio('background_music'),
      gameOver: this.game.getAudio('game_over_music'),
    };
  }

  setTrack(track: HTMLAudioElement) {
    if (this.currentTrack === track) return;
    this.stop();
    this.currentTrack = track;
    this.currentTrack.currentTime = 0;
    this.currentTrack.volume = this.musicVol;
  }

  play() {
    if (!this.currentTrack) return;
    this.currentTrack.play().catch(() => {});
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

  setMusicVolume(value: number) {
    if (!value) return;
    this.musicVol = value;
    localStorage.setItem('music_vol', this.musicVol.toString());
    const elements = document.getElementById('audio-sources')?.children as HTMLCollection;
    const filtered = Array.from(elements).filter((x) => x.getAttribute('id')?.includes('music')) as HTMLAudioElement[];
    filtered.forEach((audio) => (audio.volume = value));
  }

  setFxVolume(value: number) {
    if (!value) return;
    this.fxVol = value;
    localStorage.setItem('fx_vol', this.fxVol.toString());
    const elements = document.getElementById('audio-sources')?.children as HTMLCollection;
    const filtered = Array.from(elements).filter((x) => x.getAttribute('id')?.includes('sound')) as HTMLAudioElement[];
    filtered.forEach((audio) => (audio.volume = value));
  }

  stopAllFx() {
    const elements = document.getElementById('audio-sources')?.children as HTMLCollection;
    const filtered = Array.from(elements).filter((x) => x.getAttribute('id')?.includes('sound')) as HTMLAudioElement[];
    filtered.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}
