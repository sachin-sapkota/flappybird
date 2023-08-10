const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const bird = {
  x: 100,
  y: canvas.height / 2,
  width: 50,
  height: 40,
  gravity: 0.5,
  velocity: 0,
  flap: -10,
};

const pipes = [];
const pipeGap = 200;
const pipeWidth = 60;

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isGameOver = false;

const collisionSound = new Audio('audio/audio_hit.ogg');
const gameOverSound = new Audio('audio/audio_die.ogg');
1;
function drawBird() {
  const birdImage = new Image();
  birdImage.src = 'images/bird.png';
  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
}

function drawPipe(x, height) {
  const pipeTopImage = new Image();
  pipeTopImage.src = 'images/pipe.png';
  const pipeBottomImage = new Image();
  pipeBottomImage.src = 'images/pipe.png';
  ctx.drawImage(pipeTopImage, x, 0, pipeWidth, height);
  ctx.drawImage(
    pipeBottomImage,
    x,
    height + pipeGap,
    pipeWidth,
    canvas.height - height - pipeGap
  );
}

function drawScore() {
  ctx.fillStyle = '#000';
  ctx.font = '24px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
}

function drawHighScore() {
  ctx.fillStyle = '#000';
  ctx.font = '24px Arial';
  ctx.fillText(`High Score: ${highScore}`, canvas.width - 180, 30);
}

function isColliding() {
  for (let i = 0; i < pipes.length; i++) {
    if (
      bird.x + bird.width > pipes[i].x &&
      bird.x < pipes[i].x + pipeWidth &&
      (bird.y < pipes[i].height ||
        bird.y + bird.height > pipes[i].height + pipeGap)
    ) {
      collisionSound.play();
      return true;
    }
  }

  return bird.y < 0 || bird.y + bird.height > canvas.height;
}

function update() {
  if (!isGameOver) {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y < 0) {
      bird.y = 0;
      bird.velocity = 0;
    }

    if (bird.y + bird.height > canvas.height) {
      bird.y = canvas.height - bird.height;
      bird.velocity = 0;
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= 5;

      if (pipes[i].x + pipeWidth < 0) {
        pipes.splice(i, 1);
      }

      if (pipes[i].x === bird.x) {
        score++;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem('highScore', highScore);
        }
      }
    }

    if (
      pipes.length === 0 ||
      pipes[pipes.length - 1].x + pipeWidth < canvas.width - 300
    ) {
      const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap));
      pipes.push({ x: canvas.width, height: pipeHeight });
    }

    if (isColliding()) {
      isGameOver = true;
      gameOverSound.play();
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < pipes.length; i++) {
    drawPipe(pipes[i].x, pipes[i].height);
  }

  drawBird();
  drawScore();
  drawHighScore();

  if (!isGameOver) {
    requestAnimationFrame(update);
  } else {
    ctx.fillStyle = '#000';
    ctx.font = '48px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
    ctx.fillText(
      `Your Score: ${score}`,
      canvas.width / 2 - 150,
      canvas.height / 2 + 50
    );

    ctx.fillStyle = '#333';
    ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 + 80, 120, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '24px Arial';
    ctx.fillText('Replay', canvas.width / 2 - 35, canvas.height / 2 + 105);
  }
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !isGameOver) {
    bird.velocity = bird.flap;
  }
});

document.addEventListener('click', () => {
  if (!isGameOver) {
    bird.velocity = bird.flap;
  }
});

document.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (
    isGameOver &&
    mouseX >= canvas.width / 2 - 60 &&
    mouseX <= canvas.width / 2 + 60 &&
    mouseY >= canvas.height / 2 + 80 &&
    mouseY <= canvas.height / 2 + 120
  ) {
    resetGame();
    update();
  }
});

function resetGame() {
  pipes.length = 0;
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  score = 0;
  isGameOver = false;
}

update();
