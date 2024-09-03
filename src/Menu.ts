export default class Menu {
  game: Game;
  menu = document.getElementById('menu-container') as HTMLElement;
  musicVolumeSlider = document.getElementById('musicVolume') as HTMLInputElement;
  fxVolumeSlider = document.getElementById('fxVolume') as HTMLInputElement;
  testSound: HTMLAudioElement;
  isOpen = true;

  constructor(game: Game) {
    this.game = game;
    this.musicVolumeSlider.value = this.game.music.musicVol.toString();
    this.fxVolumeSlider.value = this.game.music.fxVol.toString();
    this.testSound = this.game.getAudio('fire_sound');
    this.init();
  }

  init() {
    this.musicVolumeSlider.addEventListener('input', () => {
      this.game.music.setMusicVolume(parseFloat(this.musicVolumeSlider.value));
    });

    let soundEffectTimeout: NodeJS.Timeout;
    this.fxVolumeSlider.addEventListener('input', () => {
      this.game.music.setFxVolume(parseFloat(this.fxVolumeSlider.value));
      if (soundEffectTimeout) clearTimeout(soundEffectTimeout);
      soundEffectTimeout = setTimeout(() => this.playTestSound(), 500);
    });
  }

  playTestSound() {
    this.testSound.currentTime = 0;
    this.testSound.play().catch(() => {});
  }

  showMenu() {
    this.game.music.pause();
    this.menu.style.display = 'block';
    this.isOpen = true;
  }

  hideMenu() {
    this.game.music.play();
    this.menu.style.display = 'none';
    this.isOpen = false;
  }
}
