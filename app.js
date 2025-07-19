const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('.score');
const highScoreBoard = document.querySelector('.high-score');
const missesBoard = document.querySelector('.misses');
const moles = document.querySelectorAll('.mole');
const timerDisplay = document.querySelector('.timer');
const finalScore = document.querySelector('.final-score');
const gameOver = document.querySelector('.game-over');
const countdownDiv = document.querySelector('.countdown');
const countdownText = document.getElementById('countdownText');
const pauseBtn = document.getElementById('pauseBtn');

const hitSound = document.getElementById('hitSound');
const bgMusic = document.getElementById('bgMusic');
const volumeSlider = document.getElementById('volumeSlider');
const toggleMusic = document.getElementById('toggleMusic');

const leaderboardList = document.getElementById('leaderboardList');
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

let lastHole;
let timeUp = false;
let score = 0;
let timeLeft = 60;
let countdown;
let gamePaused = false;
let misses = 0;
let gameTimer = null;

let highScore = localStorage.getItem("whackHigh") || 0;
highScoreBoard.textContent = `🏆 ${highScore}`;

// Leaderboard init
let leaderboard = JSON.parse(localStorage.getItem("whackLeaderboard")) || [];

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
  if (timeUp || gamePaused) return;

  const difficulty = document.getElementById('difficulty').value;
  let [min, max] = [400, 800];
  if (difficulty === 'easy') [min, max] = [600, 1000];
  if (difficulty === 'hard') [min, max] = [200, 600];

  const time = randomTime(min, max);
  const hole = randomHole();
  hole.classList.add('up');

  setTimeout(() => {
    if (hole.classList.contains('up')) {
      hole.classList.remove('up');
      misses++;
      missesBoard.textContent = `❌ ${misses}`;
    }
    if (!timeUp && !gamePaused) peep();
  }, time);
}

function startCountdown(seconds, callback) {
  countdownDiv.classList.remove('hidden');
  let count = seconds;
  countdownText.textContent = count;

  const interval = setInterval(() => {
    count--;
    countdownText.textContent = count;
    if (count <= 0) {
      clearInterval(interval);
      countdownDiv.classList.add('hidden');
      callback();
    }
  }, 1000);
}

function startGame() {
  if (gamePaused) resumeGame(); // if paused, resume
  else {
    gameOver.classList.add('hidden');
    score = 0;
    misses = 0;
    timeLeft = 60;
    scoreBoard.textContent = 0;
    missesBoard.textContent = `❌ 0`;
    timerDisplay.textContent = `⏱️ 60s`;
    timeUp = false;

    startCountdown(3, () => {
      peep();
      countdown = setInterval(() => {
        if (!gamePaused) {
          timeLeft--;
          timerDisplay.textContent = `⏱️ ${timeLeft}s`;

          if (timeLeft <= 0) {
            endGame();
          }
        }
      }, 1000);
    });
  }
}

function endGame() {
  timeUp = true;
  clearInterval(countdown);
  finalScore.textContent = score;
  gameOver.classList.remove('hidden');

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("whackHigh", highScore);
    highScoreBoard.textContent = `🏆 ${highScore}`;
  }

  updateLeaderboard(score);
}

function whack(e) {
  if (!e.isTrusted || timeUp || gamePaused) return;
  score++;
  this.parentNode.classList.remove('up');
  scoreBoard.textContent = score;
  hitSound.currentTime = 0;
  hitSound.play();
}

function pauseGame() {
  gamePaused = true;
  pauseBtn.textContent = "Resume";
}

function resumeGame() {
  gamePaused = false;
  pauseBtn.textContent = "Pause";
  peep(); // continue mole pop
}

pauseBtn.addEventListener('click', () => {
  if (!timeUp) {
    gamePaused ? resumeGame() : pauseGame();
  }
});

moles.forEach(mole => mole.addEventListener('click', whack));

// Theme Toggle
themeToggle.addEventListener('change', () => {
  const dark = themeToggle.checked;
  body.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  document.getElementById('modeLabel').textContent = dark ? 'Dark Mode' : 'Light Mode';
});

// Load Saved Theme
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark');
    themeToggle.checked = true;
    document.getElementById('modeLabel').textContent = 'Dark Mode';
  }

  renderLeaderboard();
});

// Music Controls
toggleMusic.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    toggleMusic.textContent = "🔈 Music On";
  } else {
    bgMusic.pause();
    toggleMusic.textContent = "🔇 Music Off";
  }
});

volumeSlider.addEventListener('input', () => {
  const volume = parseFloat(volumeSlider.value);
  bgMusic.volume = volume;
  hitSound.volume = volume;
});

// Leaderboard Functions
function updateLeaderboard(newScore) {
  leaderboard.push(newScore);
  leaderboard.sort((a, b) => b - a);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("whackLeaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard() {
  leaderboardList.innerHTML = "";
  leaderboard.forEach((score, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${score} points`;
    leaderboardList.appendChild(li);
  });
}

function resetLeaderboard() {
  leaderboard = [];
  localStorage.removeItem("whackLeaderboard");
  renderLeaderboard();
}
