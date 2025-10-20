const sounds = {
  dog: new Audio('sounds/dog.mp3'),
  car: new Audio('sounds/car.mp3'),
  drum: new Audio('sounds/drum.mp3'),
  bell: new Audio('sounds/bell.mp3'),
};

const cards = document.querySelectorAll('.card');
const playBtn = document.getElementById('play-sound');
const message = document.getElementById('message');
const scoreDisplay = document.getElementById('score');

let currentSound = null;
let score = 0;

function playRandomSound() {
  const keys = Object.keys(sounds);
  currentSound = keys[Math.floor(Math.random() * keys.length)];
  sounds[currentSound].play();
  message.textContent = "🎧 Escucha con atención...";
  message.style.color = "white";
}

cards.forEach(card => {
  card.addEventListener('click', () => {
    if (!currentSound) return;
    const selected = card.dataset.sound;
    if (selected === currentSound) {
      message.textContent = "✅ ¡Excelente!";
      message.style.color = "#00ff9d";
      score++;
      scoreDisplay.textContent = `Puntos: ${score}`;
      setTimeout(playRandomSound, 1500);
    } else {
      message.textContent = "❌ Intenta otra vez";
      message.style.color = "#ff4d4d";
    }
  });
});

playBtn.addEventListener('click', playRandomSound);
