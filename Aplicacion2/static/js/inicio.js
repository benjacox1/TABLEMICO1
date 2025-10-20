// 🎮 Juegos Motrices - Animaciones + Carrito Mejorado
document.addEventListener("DOMContentLoaded", () => {

  // ==============================
  // 🎮 Animación de tarjetas (hover)
  // ==============================
  const cards = document.querySelectorAll(".game-card, .shop-card");
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => card.classList.add("active"));
    card.addEventListener("mouseleave", () => card.classList.remove("active"));
  });

  // ==============================
  // 🛒 Carrito Interactivo
  // ==============================
  const cart = document.getElementById("cart");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const clearBtn = document.getElementById("clear-cart");
  const addButtons = document.querySelectorAll(".add-to-cart");

  let items = JSON.parse(localStorage.getItem("cartItems")) || [];

  // 🔄 Renderizado del carrito
  const renderCart = () => {
    cartItems.innerHTML = "";
    let total = 0;

    if (items.length === 0) {
      cartItems.innerHTML = `<li class="text-muted small">🛍️ Tu carrito está vacío</li>`;
      cart.classList.remove("show");
      cartTotal.textContent = "0";
      return;
    }

    items.forEach((item, i) => {
      total += item.price;
      const li = document.createElement("li");
      li.classList.add("d-flex", "justify-content-between", "align-items-center", "mb-2");
      li.innerHTML = `
        <span>${item.name} - $${item.price}</span>
        <button class="btn btn-sm btn-outline-danger" data-index="${i}" title="Eliminar">✖</button>
      `;
      cartItems.appendChild(li);
    });

    cartTotal.textContent = total.toFixed(2);
    localStorage.setItem("cartItems", JSON.stringify(items));
    cart.classList.add("show");
  };

  // ➕ Agregar producto
  addButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      items.push({ name, price });
      renderCart();
      showToast(`✅ "${name}" agregado al carrito`);
    });
  });

  // ❌ Eliminar un producto
  cartItems.addEventListener("click", e => {
    if (e.target.matches("button[data-index]")) {
      const index = e.target.dataset.index;
      const removed = items.splice(index, 1);
      renderCart();
      showToast(`🗑️ "${removed[0].name}" eliminado`);
    }
  });

  // 🧹 Vaciar carrito
  clearBtn.addEventListener("click", () => {
    items = [];
    renderCart();
    showToast("🧺 Carrito vaciado");
  });

  renderCart();

  // ==============================
  // 🔔 Notificación visual (toast)
  // ==============================
  const showToast = (msg) => {
    let toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };
});
