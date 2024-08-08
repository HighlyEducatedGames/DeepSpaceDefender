export default class Menu {
  constructor(game) {
    this.game = game;
    this.menu = document.getElementById('menu-container');
    this.backgroundMusicVolumeSlider = document.getElementById('backgroundMusicVolume');
    this.soundEffectsVolumeSlider = document.getElementById('soundEffectsVolume');
    this.isOpen = true;
    this.bgVol = localStorage.getItem('bg_vol') || '0.5';
    this.fxVol = localStorage.getItem('fx_vol') || '0.5';

    this.backgroundMusicVolumeSlider.value = this.bgVol;
    this.soundEffectsVolumeSlider.value = this.fxVol;

    this.backgroundMusicVolumeSlider.addEventListener('input', () => {
      this.bgVol = this.backgroundMusicVolumeSlider.value;
      this.game.music.background.volume = this.bgVol;
      // bossMusic.volume = backgroundMusicVolumeSlider.value;
      localStorage.setItem('bg_vol', this.bgVol);
    });

    let soundEffectTimeout;
    this.soundEffectsVolumeSlider.addEventListener('input', () => {
      this.fxVol = this.soundEffectsVolumeSlider.value;
      // soundEffects.forEach((sound) => (sound.volume = volume));// TODO
      localStorage.setItem('fx_vol', this.fxVol);

      clearTimeout(soundEffectTimeout);
      soundEffectTimeout = setTimeout(this.playTestSound, 500); // Play test sound after 500ms
    });
  }

  playTestSound() {
    // TODO
    /*const testSound = document.getElementById('fireSound');// TODO
        testSound.currentTime = 0; // Reset the sound to the beginning
        testSound.play();*/
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

  toggleMenu() {
    if (this.isOpen) {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  }
}
