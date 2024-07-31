class TemporalSerpent {
  constructor() {
    this.images = {
      base: new Image(),
      head: new Image(),
      segment: new Image(),
    };
    this.images.base.src = 'assets/images/temporal_serpent.png';
    this.images.head.src = 'assets/images/serpentHead.png';
    this.images.segment.src = 'assets/images/serpentSegment.png';
  }
}

export default TemporalSerpent;
