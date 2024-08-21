class Star {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 1 + 0.5;
    this.speed = Math.random() * 150 + 50;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  update(deltaTime) {
    this.x -= (this.speed * deltaTime) / 1000;
    if (this.x < 0) {
      this.x = canvas.width;
      this.y = Math.random() * canvas.height;
    }
  }
}

class Player {
  constructor() {
    this.height = 50;
    this.width = 50;
    this.margin = 20;
    this.x = -this.width * 0.5;
    this.y = Math.random() * (canvas.height - this.margin * 2 - this.height) + this.margin + this.height * 0.5;
    this.image = new Image();
    this.image.src = 'assets/images/player_thrust.png';
    this.speed = 150;
  }
  draw(ctx) {
    ctx.drawImage(this.image, this.x - this.width * 0.5 - 4, this.y - this.height * 0.5, this.width, this.height);
  }
  update(deltaTime) {
    this.x += (this.speed * deltaTime) / 1000;
    if (this.x > canvas.width + this.width * 0.5) {
      this.x = -this.width * 0.5 - (Math.random() * 300 + 300);
      this.y = Math.random() * (canvas.height - this.margin * 2 - this.height) + this.margin + this.height * 0.5;
    }
  }
}

const canvas = document.getElementById('loadingCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 640;
canvas.height = 360;

let lastTime = 0;
let PAGE_LOADING = true;
const stars = [];
for (let i = 0; i < 50; i++) {
  stars.push(new Star());
}
const particles = [];

const player = new Player();

ctx.fillStyle = 'white';
ctx.font = '20px "Press Start 2P", cursive';
ctx.textAlign = 'center';

function animate(timestamp = 0) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach((star) => star.draw(ctx));
  stars.forEach((star) => star.update(deltaTime));
  particles.forEach((particle) => particle.draw(ctx));
  particles.forEach((particle) => particle.update(deltaTime));
  ctx.fillText('Loading...', canvas.width * 0.5, 40);
  player.draw(ctx);
  player.update(deltaTime);
  if (PAGE_LOADING) requestAnimationFrame(animate);
}

animate();

function loaded() {
  PAGE_LOADING = false;
  document.getElementById('loadingCanvas').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  document.getElementById('menu-container').style.display = 'flex';
  document.getElementById('menu').style.display = 'block';
  document.getElementById('controller').style.display = 'block';
}
