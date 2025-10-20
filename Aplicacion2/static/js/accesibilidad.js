/* =========================================================
   🌟 BIENVENIDA INTERACTIVA Y ACCESIBLE - TABLEMICO
   =========================================================
   ✅ Mejoras:
   - Control de accesibilidad (voz, foco, atajos)
   - Reacciones con sonido y confeti
   - Detección de usuario con movilidad reducida
   - Persistencia de estado (localStorage)
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
  const ariaAnnouncer = document.createElement("div");

  /* === ARIA ANNOUNCER (para lectores de pantalla) === */
  ariaAnnouncer.setAttribute("aria-live", "polite");
  ariaAnnouncer.setAttribute("class", "sr-only");
  document.body.appendChild(ariaAnnouncer);

  /* === ESTADOS GUARDADOS === */
  let animationsEnabled = localStorage.getItem("animationsEnabled") !== "false";
  let musicMuted = localStorage.getItem("musicMuted") === "true";
  let musicVolume = parseFloat(localStorage.getItem("musicVolume")) || 0.3;

  music.volume = musicVolume;
  music.muted = musicMuted;
  volumeSlider.value = music.volume;
  updateMuteIcon();

  if (!animationsEnabled) ocultarAnimaciones();

  /* =========================================================
     🌈 FUNCIONES AUXILIARES
     ========================================================= */
  function lanzarConfeti(options = { particleCount: 150, spread: 100, origin: { y: 0.6 } }) {
    if (animationsEnabled) myConfetti(options);
  }

  function updateMuteIcon() {
    muteBtn.innerHTML = music.muted || music.volume === 0
      ? '<i class="bi bi-volume-mute"></i>'
      : music.volume < 0.5
      ? '<i class="bi bi-volume-down"></i>'
      : '<i class="bi bi-volume-up"></i>';
    muteBtn.setAttribute("aria-label", music.muted ? "Sonido desactivado" : "Sonido activado");
  }

  function irAlInicio() {
    document.body.classList.add("fade-out");
    lanzarConfeti();
  new Audio("/static/sounds/happy.mp3").play().catch(() => {});
    ariaAnnouncer.textContent = "Redirigiendo al inicio...";
    setTimeout(() => {
      window.location.href = "/inicio"; // 🔁 Ajusta según tu URL Django
    }, 900);
  }

  function ocultarAnimaciones() {
    stars.style.display = "none";
    balloons.forEach(b => (b.style.display = "none"));
  }

  function mostrarAnimaciones() {
    stars.style.display = "block";
    balloons.forEach(b => (b.style.display = "block"));
  }

  /* =========================================================
     🚀 EVENTOS PRINCIPALES
     ========================================================= */
  enterBtn.addEventListener("click", iniciarBienvenida);
  muteBtn.addEventListener("click", toggleMute);
  toggleAnimationsBtn.addEventListener("click", toggleAnimaciones);
  toggleBgBtn.addEventListener("click", () => document.body.classList.toggle("paused-bg"));
  volumeSlider.addEventListener("input", ajustarVolumen);

  /* === Atajos de teclado === */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.code === "Space") {
      e.preventDefault();
      iniciarBienvenida();
    }
    if (e.key.toLowerCase() === "m") toggleMute();
    if (e.key.toLowerCase() === "a") toggleAnimaciones();
    if (e.key.toLowerCase() === "b") document.body.classList.toggle("paused-bg");
  });

  /* === Mejor experiencia móvil === */
  document.addEventListener("touchstart", () => {
    music.play().catch(() => {});
  }, { once: true });

  /* === Confeti periódico === */
  if (window.innerWidth > 576) setInterval(() => lanzarConfeti(), 12000);

  /* === Movimiento del mouse === */
  document.addEventListener("mousemove", (e) => {
    if (!animationsEnabled || window.innerWidth < 576) return;
    myConfetti({
      particleCount: 6,
      spread: 40,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
    });
  });

  /* === Animación de texto === */
  document.querySelectorAll(".welcome-title span span").forEach((letter, i) => {
    letter.style.animationDelay = `${i * 0.12}s`;
  });

  /* =========================================================
     🧠 FUNCIONES DE CONTROL
     ========================================================= */
  function iniciarBienvenida() {
    music.play().catch(() => {});
    reproducirVozBienvenida();
    irAlInicio();
  }

  function reproducirVozBienvenida() {
    if (sessionStorage.getItem("vozBienvenida")) return;
    if (typeof responsiveVoice !== "undefined") {
      responsiveVoice.speak(
        "Hola, bienvenidos a Tablemico. Nos alegra que estés por aquí.",
        "Spanish Latin American Female",
        { rate: 1.0, pitch: 1.1, volume: 1 }
      );
      ariaAnnouncer.textContent = "Bienvenida reproducida por voz.";
    } else {
      console.warn("⚠️ responsiveVoice no está cargado.");
    }
    sessionStorage.setItem("vozBienvenida", "true");
  }

  function toggleMute() {
    music.muted = !music.muted;
    localStorage.setItem("musicMuted", music.muted);
    updateMuteIcon();
    ariaAnnouncer.textContent = music.muted ? "Sonido desactivado" : "Sonido activado";
  }

  function toggleAnimaciones() {
    animationsEnabled = !animationsEnabled;
    localStorage.setItem("animationsEnabled", animationsEnabled);
    if (animationsEnabled) {
      mostrarAnimaciones();
      lanzarConfeti();
      ariaAnnouncer.textContent = "Animaciones activadas";
    } else {
      ocultarAnimaciones();
      ariaAnnouncer.textContent = "Animaciones desactivadas";
    }
  }

  function ajustarVolumen(e) {
    music.volume = parseFloat(e.target.value);
    localStorage.setItem("musicVolume", music.volume);
    updateMuteIcon();
    ariaAnnouncer.textContent = `Volumen ajustado al ${(music.volume * 100).toFixed(0)}%`;
  }

  /* =========================================================
     ♿ ACCESIBILIDAD EXTRA
     ========================================================= */
  // Preferencia del sistema (reduce motion)
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    animationsEnabled = false;
    ocultarAnimaciones();
    ariaAnnouncer.textContent = "Animaciones desactivadas por preferencia del sistema.";
  }

  // Foco visible y accesible
  document.querySelectorAll("button, input").forEach(el => {
    el.addEventListener("focus", () => el.classList.add("focus-visible"));
    el.addEventListener("blur", () => el.classList.remove("focus-visible"));
  });

});
