class Asteroid {
  constructor() {
    this.damage = 10;
    this.speed = 200;
    this.sizes = [
      { width: 75, height: 75 },
      { width: 50, height: 50 },
      { width: 30, height: 30 },
    ];
    this.image = new Image();
    this.image.src = 'assets/images/asteroid.png';
  }
}

export default Asteroid;
