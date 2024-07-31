class Ally {
  constructor(game) {
    this.game = game;
    this.x = null;
    this.y = null;
    this.width = 50;
    this.height = 50;
    this.speed = 1200;
    this.rotation = 0;

    this.spawnTime = performance.now();
    this.duration = 15000; // 15 seconds
    this.interval = 60000; // 60 seconds
    this.warningTime = 3000; // 3 seconds before arrival
    this.rotationAngle = 0; // Initial angle for circular pattern
    this.orbitRadius = 100; // Radius of the circular orbit

    this.image = new Image();
    this.image.src = 'assets/images/ally.png';
    this.sounds = {
      warning: new Audio('assets/audio/allySound.mp3'),
      overAndOut: new Audio('assets/audio/allyOver.mp3'),
      circularOrbit: new Audio('assets/audio/circularOrbitSound.mp3'),
      followPlayer: new Audio('assets/audio/followPlayerSound.mp3'),
    };

    this.enteringSide = this.chooseSideToEnterFrom();
    this.pattern = this.selectedPattern();
    this.active = true;
    this.entering = true;
    this.exiting = false;

    // Play sound on spawn
    if (this.pattern === 'circularOrbit') {
      this.sounds.circularOrbit.currentTime = 0;
      this.sounds.circularOrbit.play();
    } else if (this.pattern === 'followPlayer') {
      this.sounds.followPlayer.currentTime = 0;
      this.sounds.followPlayer.play();
    }
  }

  chooseSideToEnterFrom() {
    const side = Math.floor(Math.random() * 4);

    switch (side) {
      case 0: // Enter from the left
        this.x = -100;
        this.y = Math.random() * this.game.canvas.height;
        break;
      case 1: // Enter from the right
        this.x = this.game.canvas.width + 100;
        this.y = Math.random() * this.game.canvas.height;
        break;
      case 2: // Enter from the top
        this.x = Math.random() * this.game.canvas.width;
        this.y = -100;
        break;
      case 3: // Enter from the bottom
        this.x = Math.random() * this.game.canvas.width;
        this.y = this.game.canvas.height + 100;
        break;
    }

    return side;
  }

  selectedPattern() {
    const patterns = ['circularOrbit', 'followPlayer']; // List of possible patterns
    return patterns[Math.floor(Math.random() * patterns.length)]; // Randomly select a pattern
  }

  draw(ctx) {
    if (this.active) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation); // Rotate the ally
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    }
  }

  update(deltaTime, timestamp) {
    const distanceToPlayer = Math.sqrt((this.game.player.x - this.x) ** 2 + (this.game.player.y - this.y) ** 2);
    const angleToPlayer = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);

    if (this.entering) {
      // Move the ally onto the screen
      const entrySpeed = (this.speed * deltaTime) / 1000;
      switch (this.enteringSide) {
        case 0: // Enter from the left
          this.x += entrySpeed;
          if (this.x >= 50) this.entering = false;
          break;
        case 1: // Enter from the right
          this.x -= entrySpeed;
          if (this.x <= this.game.canvas.width - 50) this.entering = false;
          break;
        case 2: // Enter from the top
          this.y += entrySpeed;
          if (this.y >= 50) this.entering = false;
          break;
        case 3: // Enter from the bottom
          this.y -= entrySpeed;
          if (this.y <= this.game.canvas.height - 50) this.entering = false;
          break;
      }
    } else if (!this.exiting) {
      if (distanceToPlayer > this.orbitRadius + 10) {
        // Move ally towards the player before starting the circular orbit
        this.x += (Math.cos(angleToPlayer) * this.speed * deltaTime) / 1000;
        this.y += (Math.sin(angleToPlayer) * this.speed * deltaTime) / 1000;
      } else {
        switch (this.pattern) {
          case 'circularOrbit':
            // New circular orbit pattern
            this.rotationAngle += (2 * Math.PI * deltaTime) / 5000; // Full rotation every 5 seconds
            this.x = this.game.player.x + Math.cos(this.rotationAngle) * this.orbitRadius;
            this.y = this.game.player.y + Math.sin(this.rotationAngle) * this.orbitRadius;
            break;
          case 'followPlayer':
            // Existing follow player pattern
            if (distanceToPlayer > 75) {
              this.x += (Math.cos(angleToPlayer) * this.speed * deltaTime) / 1000;
              this.y += (Math.sin(angleToPlayer) * this.speed * deltaTime) / 1000;
            }
            break;
        }
      }
      // TODO: projectiles

      // Check if the ally's duration has ended
      if (timestamp > this.spawnTime + this.duration) {
        this.exiting = true;
        this.sounds.overAndOut.play();
      }
    } else {
      // Move the ally of off the screen
      let exitSpeed = (this.speed * deltaTime) / 1000;
      switch (this.enteringSide) {
        case 0: // Exit left
          this.x += exitSpeed;
          if (this.x > this.game.canvas.width + this.width) {
            this.active = false;
          }
          break;
        case 1: // Exit right
          this.x -= exitSpeed;
          if (this.x < -this.width) {
            this.active = false;
          }
          break;
        case 2: // Exit top
          this.y += exitSpeed;
          if (this.y > this.game.canvas.height + this.height) {
            this.active = false;
          }
          break;
        case 3: // Exit bottom
          this.y -= exitSpeed;
          if (this.y < -this.height) {
            this.active = false;
          }
          break;
      }
    }
  }
}

export default Ally;

// TODO: delete allys that are not active
