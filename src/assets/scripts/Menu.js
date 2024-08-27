export default class Menu {
  menu = document.getElementById('menu-container');
  musicVolumeSlider = document.getElementById('musicVolume');
  fxVolumeSlider = document.getElementById('fxVolume');
  testSound = document.getElementById('fire_sound');
  isOpen = true;

  constructor(game) {
    /** @type {import('./Game.js').default} */
    this.game = game;
    this.musicVolumeSlider.value = this.game.music.musicVol;
    this.fxVolumeSlider.value = this.game.music.fxVol;
    this.init();
  }

  init() {
    this.musicVolumeSlider.addEventListener('input', () => {
      this.game.music.setMusicVolume(this.musicVolumeSlider.value);
    });

    let soundEffectTimeout;
    this.fxVolumeSlider.addEventListener('input', () => {
      this.game.music.setFxVolume(this.fxVolumeSlider.value);
      if (soundEffectTimeout) clearTimeout(soundEffectTimeout);
      soundEffectTimeout = setTimeout(() => this.playTestSound(), 500);
    });
  }

  playTestSound() {
    this.testSound.currentTime = 0;
    this.testSound.play();
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
