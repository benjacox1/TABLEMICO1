/* =========================================================
   🎵 BIENVENIDA INTERACTIVA - TABLEMICO (Auto-play al cargar)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {

  /* === ELEMENTOS CLAVE === */
  const music = document.getElementById("bg-music");
  const enterBtn = document.getElementById("enter-btn");
  const balloons = [...document.querySelectorAll(".balloon")];
  const stars = document.querySelector(".stars");
  const muteBtn = document.getElementById("mute-btn");
  const toggleAnimationsBtn = document.getElementById("toggle-animations");
  const toggleBgBtn = document.getElementById("toggle-bg");
  const volumeSlider = document.getElementById("volume-slider");
  const confettiCanvas = document.getElementById("confettiCanvas");
  const myConfetti = confetti.create(confettiCanvas, { resize: true });

  /* === ESTADOS INICIALES === */
  let animationsEnabled = localStorage.getItem("animationsEnabled") !== "false";
  let musicMuted = localStorage.getItem("musicMuted") === "true";
  let musicVolume = parseFloat(localStorage.getItem("musicVolume")) || 0.2;

  music.volume = musicVolume;
  music.muted = musicMuted;
  volumeSlider.value = music.volume;
  updateMuteIcon();

  if (!animationsEnabled) {
    stars.style.display = "none";
    balloons.forEach(b => b.style.display = "none");
  }

  /* =========================================================
     🌈 FUNCIONES AUXILIARES
     ========================================================= */
  function lanzarConfeti(options = { particleCount: 150, spread: 100, origin: { y: 0.6 } }) {
    if (animationsEnabled) myConfetti(options);
  }

  function updateMuteIcon() {
    muteBtn.innerHTML = music.muted || music.volume === 0
      ? '<i class="bi bi-volume-mute"></i>'
      : (music.volume < 0.5 ? '<i class="bi bi-volume-down"></i>' : '<i class="bi bi-volume-up"></i>');
  }

  function reproducirVozBienvenida() {
    if (sessionStorage.getItem("vozBienvenida")) return;
    if (typeof responsiveVoice !== "undefined") {
      responsiveVoice.speak(
        "Hola, bienvenidos a Tablemico. Nos da mucho gusto que estés por acá.",
        "Spanish Latin American Female"
      );
    } else if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(
        "Hola, bienvenidos a Tablemico. Nos da mucho gusto que estés por acá."
      );
      u.lang = 'es-ES';
      speechSynthesis.speak(u);
    }
    sessionStorage.setItem("vozBienvenida", "true");
  }

  function irAlInicio() {
    document.body.classList.add("fade-out");
    lanzarConfeti();
  // Nota: Los archivos JS estáticos no procesan etiquetas Django. Usar ruta absoluta a static.
  new Audio("/static/sounds/happy.mp3").play().catch(()=>{});
    setTimeout(() => window.location.href = "{% url 'Aplicacion2:inicio' %}", 900);
  }

  /* =========================================================
     🚀 INICIO AUTOMÁTICO
     ========================================================= */
  async function iniciarBienvenida() {
    try {
      // Reproducir música al inicio
      await music.play();
      reproducirVozBienvenida();
      // Lanzar confeti al cargar
      lanzarConfeti();
    } catch(err) {
      console.warn("El autoplay fue bloqueado, se requiere interacción:", err);
    }
  }
  iniciarBienvenida();

  /* =========================================================
     🎉 EVENTOS PRINCIPALES
     ========================================================= */
  enterBtn.addEventListener("click", irAlInicio);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.code === "Space") {
      e.preventDefault();
      irAlInicio();
    }
    if (e.key.toLowerCase() === "m") toggleMute();
  });

  muteBtn.addEventListener("click", toggleMute);
  toggleAnimationsBtn.addEventListener("click", toggleAnimaciones);
  toggleBgBtn.addEventListener("click", () => document.body.classList.toggle("paused-bg"));
  volumeSlider.addEventListener("input", ajustarVolumen);

  document.addEventListener("mousemove", (e) => {
    if (!animationsEnabled || window.innerWidth < 576) return;
    myConfetti({
      particleCount: 6,
      spread: 40,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
    });
  });

  if (window.innerWidth > 576) setInterval(() => lanzarConfeti(), 10000);

  /* =========================================================
     ♿ FUNCIONES DE CONTROL
     ========================================================= */
  function toggleMute() {
    music.muted = !music.muted;
    localStorage.setItem("musicMuted", music.muted);
    updateMuteIcon();
  }

  function toggleAnimaciones() {
    animationsEnabled = !animationsEnabled;
    localStorage.setItem("animationsEnabled", animationsEnabled);
    stars.style.display = animationsEnabled ? "block" : "none";
    balloons.forEach(b => b.style.display = animationsEnabled ? "block" : "none");
    if (animationsEnabled) lanzarConfeti();
  }

  function ajustarVolumen(e) {
    music.volume = parseFloat(e.target.value);
    localStorage.setItem("musicVolume", music.volume);
    updateMuteIcon();
  }

  /* =========================================================
     ♿ ACCESIBILIDAD
     ========================================================= */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animationsEnabled = false;
    stars.style.display = "none";
    balloons.forEach(b => b.style.display = "none");
  }

  document.querySelectorAll(".welcome-title span span").forEach((letter, i) => {
    letter.style.animationDelay = `${i * 0.12}s`;
  });
});
