document.addEventListener("DOMContentLoaded", () => {
  const colors = [
    { name: "rojo", value: "#ff4b4b" },
    { name: "azul", value: "#4b6cff" },
    { name: "verde", value: "#4bff85" },
    { name: "amarillo", value: "#fff34b" },
    { name: "naranja", value: "#ffa54b" },
    { name: "violeta", value: "#c04bff" }
  ];

  let target = null;
  let score = 0;

  const targetColorText = document.getElementById("target-color");
  const colorGrid = document.getElementById("color-grid");
  const scoreDisplay = document.getElementById("score");
  const nextRoundBtn = document.getElementById("next-round");
  const feedback = document.getElementById("feedback");
  const repeatBtn = document.getElementById("repeat-instruction");
  const soundCorrect = document.getElementById("sound-correct");
  const soundWrong = document.getElementById("sound-wrong");

  function hablar(texto) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = "es-ES";
    msg.rate = 0.95;
    speechSynthesis.speak(msg);
  }

  function mostrarFeedback(texto, color) {
    feedback.textContent = texto;
    feedback.style.color = color || "#fff";
    feedback.style.opacity = 1;
    setTimeout(() => (feedback.style.opacity = 0), 1200);
  }

  function nuevaRonda() {
    feedback.style.opacity = 0;
    colorGrid.innerHTML = "";

    const shuffled = colors.sort(() => 0.5 - Math.random());
    const seleccion = shuffled.slice(0, 3);
    target = seleccion[Math.floor(Math.random() * seleccion.length)];

    targetColorText.textContent = target.name;
    setTimeout(() => hablar(`Encuentra el color ${target.name}`), 300);

    seleccion.forEach(color => {
      const btn = document.createElement("button");
      btn.className = "color-btn";
      btn.style.backgroundColor = color.value;
      btn.type = "button";
      btn.setAttribute("aria-label", `Color ${color.name}`);
      btn.tabIndex = 0;

      btn.addEventListener("click", () => verificarRespuesta(color, btn));
      btn.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          verificarRespuesta(color, btn);
        }
      });

      colorGrid.appendChild(btn);
    });
  }

  function verificarRespuesta(color, btn) {
    if (color.name === target.name) {
      score++;
      scoreDisplay.textContent = `Puntuación: ${score}`;
      mostrarFeedback("✅ ¡Muy bien!", "#00ffcc");
      soundCorrect.play().catch(() => {});
      hablar("¡Muy bien! Has acertado.");
      btn.classList.add("correct");
      setTimeout(() => btn.classList.remove("correct"), 500);
      setTimeout(nuevaRonda, 1000);
    } else {
      mostrarFeedback("❌ Intenta de nuevo", "#ff8080");
      soundWrong.play().catch(() => {});
      hablar("Intenta otra vez");
    }
  }

  nextRoundBtn.addEventListener("click", nuevaRonda);

  repeatBtn.addEventListener("click", () => {
    if (target) {
      hablar(`Encuentra el color ${target.name}`);
    } else {
      nuevaRonda();
    }
  });

  nuevaRonda();
});
