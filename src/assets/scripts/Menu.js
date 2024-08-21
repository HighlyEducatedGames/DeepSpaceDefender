export default class Menu {
  constructor(game) {
    /** @type {import('./Game.js').default} */
    this.game = game;
    this.menu = document.getElementById('menu-container');
    this.musicVolumeSlider = document.getElementById('musicVolume');
    this.fxVolumeSlider = document.getElementById('fxVolume');
    this.testSound = document.getElementById('fire_sound');
    this.isOpen = true;
    this.musicVolumeSlider.value = this.game.music.musicVol;
    this.fxVolumeSlider.value = this.game.music.fxVol;

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

  showMenu(gameStart = false) {
    this.game.music.pause();
    this.menu.style.display = 'block';
    this.isOpen = true;
    if (!gameStart) this.game.paused = true;
  }

  hideMenu() {
    this.game.music.play();
    this.menu.style.display = 'none';
    this.isOpen = false;
    this.game.paused = false;
  }

  toggleMenu() {
    this.isOpen ? this.hideMenu() : this.showMenu();
  }
}
