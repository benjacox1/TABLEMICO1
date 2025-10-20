// 🎮 Interactividad de la página de juegos
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".game-card");

  // 🧩 Hover animado
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => card.classList.add("active"));
    card.addEventListener("mouseleave", () => card.classList.remove("active"));
  });

  // 🔍 Filtro en tiempo real (por título y descripción)
  const searchInput = document.querySelector("input[name='q']");
  if (searchInput) {
    let searchTimeout;

    searchInput.addEventListener("input", e => {
      clearTimeout(searchTimeout);
      const query = e.target.value.toLowerCase();

      // Delay de 200ms para mejorar rendimiento
      searchTimeout = setTimeout(() => {
        document.querySelectorAll(".game-card").forEach(card => {
          const title = card.querySelector("h5")?.textContent.toLowerCase() || "";
          const desc = card.querySelector("p")?.textContent.toLowerCase() || "";
          const matches = title.includes(query) || desc.includes(query);

          // Animación suave de ocultar/mostrar
          card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
          if (matches) {
            card.style.opacity = "1";
            card.style.transform = "scale(1)";
            card.style.display = "";
          } else {
            card.style.opacity = "0";
            card.style.transform = "scale(0.95)";
            setTimeout(() => (card.style.display = "none"), 300);
          }
        });
      }, 200);
    });
  }

  // 💖 Sistema de “me gusta” (favoritos locales)
  document.querySelectorAll(".game-card").forEach(card => {
    const favBtn = document.createElement("button");
    favBtn.className = "fav-btn";
    favBtn.innerHTML = `<i class="bi bi-heart"></i>`;
    card.appendChild(favBtn);

    favBtn.addEventListener("click", () => {
      favBtn.classList.toggle("active");
      const icon = favBtn.querySelector("i");
      icon.className = favBtn.classList.contains("active")
        ? "bi bi-heart-fill text-danger"
        : "bi bi-heart";
    });
  });

  // ✨ Efecto de aparición al hacer scroll (scroll reveal)
  const revealCards = () => {
    const triggerBottom = window.innerHeight * 0.85;
    cards.forEach(card => {
      const cardTop = card.getBoundingClientRect().top;
      if (cardTop < triggerBottom) {
        card.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", revealCards);
  revealCards(); // Inicial
});
