const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('.score');
const highScoreBoard = document.querySelector('.high-score');
const moles = document.querySelectorAll('.mole');
const timerDisplay = document.querySelector('.timer');
const finalScore = document.querySelector('.final-score');
const gameOver = document.querySelector('.game-over');
const hitSound = document.getElementById('hitSound');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

let lastHole, timeUp = false, score = 0, countdown, timeLeft = 60;
let highScore = localStorage.getItem("whackHigh") || 0;
highScoreBoard.textContent = `🏆 ${highScore}`;

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole() {
  const index = Math.floor(Math.random() * holes.length);
  const hole = holes[index];
  if (hole === lastHole) return randomHole();
  lastHole = hole;
  return hole;
}

function peep() {
  const time = randomTime(400, 800);
  const hole = randomHole();
  hole.classList.add('up');
  setTimeout(() => {
    hole.classList.remove('up');
    if (!timeUp) peep();
  }, time);
}

function startGame() {
  timeUp = false;
  score = 0;
  timeLeft = 60;
  scoreBoard.textContent = score;
  gameOver.classList.add('hidden');
  peep();
  countdown = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      timeUp = true;
      finalScore.textContent = score;
      gameOver.classList.remove('hidden');
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("whackHigh", highScore);
        highScoreBoard.textContent = `🏆 ${highScore}`;
      }
    }
  }, 1000);
}

function whack(e) {
  if (!e.isTrusted) return;
  score++;
  this.parentNode.classList.remove('up');
  scoreBoard.textContent = score;
  hitSound.currentTime = 0;
  hitSound.play();
}

moles.forEach(mole => mole.addEventListener('click', whack));

// Dark Mode Toggle
themeToggle.addEventListener('change', () => {
  const dark = themeToggle.checked;
  body.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  document.getElementById('modeLabel').textContent = dark ? 'Dark Mode' : 'Light Mode';
});

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark');
    themeToggle.checked = true;
    document.getElementById('modeLabel').textContent = 'Dark Mode';
  }
});
