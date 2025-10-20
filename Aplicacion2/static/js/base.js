/* ============================================================
   🎮 BASE.JS — Interactividad, accesibilidad y animaciones (v2)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const AppUI = {
    els: {
      toggleAccessible: document.getElementById("toggle-accessible"),
      toggleContrast: document.getElementById("toggle-contrast"),
      backToTop: document.getElementById("backToTop"),
      header: document.querySelector(".site-header"),
      main: document.querySelector("main"),
      alerts: document.querySelectorAll(".alert"),
    },

    init() {
      document.body.style.transition =
        "background 0.4s ease, color 0.4s ease, filter 0.4s ease";
      this.loadPreferences();
      this.bindEvents();
      this.fadeMain();
      this.observeSections();
      this.autoCloseAlerts();
      this.restoreScroll();
      this.cleanLocalStorage();
    },

    /* 🔔 Toast accesible */
    showToast(message) {
      const toast = document.createElement("div");
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.textContent = message;
      Object.assign(toast.style, {
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "8px",
        fontWeight: "600",
        zIndex: 2000,
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      });
      document.body.appendChild(toast);
      requestAnimationFrame(() => (toast.style.opacity = "1"));
      setTimeout(() => (toast.style.opacity = "0"), 1600);
      setTimeout(() => toast.remove(), 2000);
    },

    /* ⚙️ Preferencias guardadas */
    loadPreferences() {
      if (localStorage.getItem("accessibleFont") === "true")
        document.body.classList.add("accessible-font");

      if (
        localStorage.getItem("highContrast") === "true" ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches &&
          !localStorage.getItem("highContrast"))
      )
        document.body.classList.add("high-contrast");
    },

    /* 🧩 Eventos principales */
    bindEvents() {
      const { toggleAccessible, toggleContrast, backToTop, header } = this.els;

      toggleAccessible?.addEventListener("click", () => {
        document.body.classList.toggle("accessible-font");
        const active = document.body.classList.contains("accessible-font");
        localStorage.setItem("accessibleFont", active);
        this.showToast(
          active
            ? "🅰️ Modo accesible activado"
            : "🅰️ Modo accesible desactivado"
        );
      });

      toggleContrast?.addEventListener("click", () => {
        document.body.classList.toggle("high-contrast");
        const active = document.body.classList.contains("high-contrast");
        localStorage.setItem("highContrast", active);
        this.showToast(
          active ? "🌙 Modo oscuro activado" : "☀️ Modo claro restaurado"
        );
      });

      // Escuchar cambios del sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
      prefersDark.addEventListener("change", (e) =>
        document.body.classList.toggle("high-contrast", e.matches)
      );

      // Efectos en scroll (optimizado)
      let lastScroll = 0;
      window.addEventListener("scroll", () => {
        const currentY = window.scrollY;
        if (Math.abs(currentY - lastScroll) < 10) return;
        lastScroll = currentY;

        if (currentY > 50) header?.classList.add("scrolled");
        else header?.classList.remove("scrolled");

        backToTop?.classList.toggle("visible", currentY > 200);
      });

      backToTop?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Guardar posición scroll
      window.addEventListener("beforeunload", () => {
        localStorage.setItem("scrollY", window.scrollY);
      });
    },

    /* ✨ Animación fade del contenido principal */
    fadeMain() {
      this.els.main?.classList.add("animate__animated", "animate__fadeIn");
    },

    /* 🔔 Auto-cierre de alertas Bootstrap */
    autoCloseAlerts() {
      this.els.alerts.forEach((alert) =>
        setTimeout(() => {
          const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
          bsAlert.close();
        }, 5000)
      );
    },

    /* 🔄 Restaurar posición del scroll */
    restoreScroll() {
      const y = parseInt(localStorage.getItem("scrollY"), 10);
      if (!isNaN(y)) window.scrollTo(0, y);
    },

    /* 👁️ Animaciones Reveal con IntersectionObserver */
    observeSections() {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add(
                "animate__animated",
                "animate__fadeInUp"
              );
              obs.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.2 }
      );
      document
        .querySelectorAll("section, .card, .feature, .content-block")
        .forEach((el) => observer.observe(el));
    },

    /* 🧹 Limpieza de localStorage */
    cleanLocalStorage() {
      const valid = ["accessibleFont", "highContrast", "scrollY"];
      Object.keys(localStorage).forEach((key) => {
        if (!valid.includes(key)) localStorage.removeItem(key);
      });
    },
  };

  // 🚀 Inicializar aplicación
  AppUI.init();
});
