// cart.js — handles cart functionality
document.addEventListener("DOMContentLoaded", () => {
  const cart = {};
  const cartItemsList = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const clearCartBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const shopGrid = document.getElementById("shop-grid");

  // Update cart display
  function updateCart() {
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
        updateCart();
      });

      li.appendChild(removeBtn);
      cartItemsList.appendChild(li);
      total += item.price * item.quantity;
    });

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
  }

  // Add to Cart
  shopGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;

    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);

    if (cart[name]) {
      cart[name].quantity += 1;
    } else {
      cart[name] = { price, quantity: 1 };
    }
    updateCart();
  });

  // Clear Cart
  clearCartBtn.addEventListener("click", () => {
    for (const key in cart) delete cart[key];
    updateCart();
  });

  // Checkout — calculate total and redirect
  checkoutBtn.addEventListener("click", () => {
    let total = 0;
    Object.keys(cart).forEach((name) => {
      const item = cart[name];
      total += item.price * item.quantity;
    });

    // Save numeric total in localStorage
    localStorage.setItem("cartTotal", total.toFixed(2));

    // Redirect to checkout page
    window.location.href = "checkout.html";
  });
});