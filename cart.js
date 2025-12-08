// cart.js — handles cart functionality
document.addEventListener("DOMContentLoaded", () => {
  // Load cart from localStorage, or start empty
  let cart = JSON.parse(localStorage.getItem("cart")) || {};

  const cartItemsList = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const clearCartBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.getElementById("checkout-btn");

  // Update cart display
  function updateCart() {
    if (!cartItemsList || !cartTotal) return; // skip if cart section not present

    cartItemsList.innerHTML = "";
    let total = 0;

    Object.keys(cart).forEach((name) => {
      const item = cart[name];
      const li = document.createElement("li");
      li.textContent = `${name} - $${item.price.toFixed(2)} (x${item.quantity})`;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.className = "remove-btn";
      removeBtn.addEventListener("click", () => {
        delete cart[name];
        saveCart();
        updateCart();
      });

      li.appendChild(removeBtn);
      cartItemsList.appendChild(li);
      total += item.price * item.quantity;
    });

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    localStorage.setItem("cartTotal", total.toFixed(2));
  }

  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Add to Cart — listen globally for any button with .add-to-cart
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;

    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);

    if (cart[name]) {
      cart[name].quantity += 1;
    } else {
      cart[name] = { price, quantity: 1 };
    }
    saveCart();
    updateCart();
  });

  // Clear Cart
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      cart = {};
      saveCart();
      updateCart();
    });
  }

  // Checkout — calculate total and redirect
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      let total = 0;
      Object.keys(cart).forEach((name) => {
        const item = cart[name];
        total += item.price * item.quantity;
      });

      localStorage.setItem("cartTotal", total.toFixed(2));
      window.location.href = "checkout.html";
    });
  }

  // Initialize cart display on page load
  updateCart();
});