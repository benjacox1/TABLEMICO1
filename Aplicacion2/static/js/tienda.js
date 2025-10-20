document.addEventListener("DOMContentLoaded", () => {
  const cart = document.getElementById("cart");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const clearCartBtn = document.getElementById("clear-cart");
  const addToCartButtons = document.querySelectorAll(".add-to-cart");

  let items = JSON.parse(localStorage.getItem("cart")) || [];

  function renderCart() {
    cartItems.innerHTML = "";
    let total = 0;

    items.forEach((item, i) => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - $${item.price}`;
      li.classList.add("mb-1");
      cartItems.appendChild(li);
      total += parseFloat(item.price);
    });

    cartTotal.textContent = total.toFixed(2);
    cart.classList.toggle("visible", items.length > 0);
  }

  addToCartButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      items.push({ name, price });
      localStorage.setItem("cart", JSON.stringify(items));
      renderCart();
    });
  });

  clearCartBtn.addEventListener("click", () => {
    items = [];
    localStorage.removeItem("cart");
    renderCart();
  });

  renderCart();
});
