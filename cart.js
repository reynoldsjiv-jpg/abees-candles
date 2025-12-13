// cart.js — sidebar cart logic with color tracking, weights, and slideshow
document.addEventListener("DOMContentLoaded", () => {
  // Load or initialize cart
  let cart = JSON.parse(localStorage.getItem("cart")) || {};

  // DOM refs
  const cartItemsList = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const clearCartBtn = document.getElementById("clear-cart");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartSidebar = document.getElementById("cart-sidebar");
  const openCartBtn = document.getElementById("open-cart");
  const closeCartBtn = document.getElementById("close-cart");

  /* Utilities */
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function parsePrice(value) {
    if (value == null) return NaN;
    const cleaned = String(value).replace(/[^0-9.\-]/g, "");
    const p = parseFloat(cleaned);
    return Number.isFinite(p) ? p : NaN;
  }

  function normalizeName(name) {
    if (!name) return "Item";
    return name.replace(/\s*\(([^)]+)\)(\s*\(\1\))+/g, " ($1)");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* Render cart UI */
  function updateCartUI() {
    if (!cartItemsList || !cartTotalEl) return;
    cartItemsList.innerHTML = "";
    let total = 0;

    Object.entries(cart).forEach(([name, item]) => {
      const li = document.createElement("li");
      li.className = "cart-item";

      li.innerHTML = `
        <div class="cart-item-row">
          <span class="cart-item-name">${escapeHtml(name)}</span>
          <span class="cart-item-meta">$${item.price.toFixed(2)} &times; ${item.quantity}</span>
        </div>
        ${
          item.weight
            ? `<div class="cart-item-weight">
                 Weight: ${(item.weight * item.quantity).toFixed(2)} oz
               </div>`
            : ""
        }
      `;

      const controls = document.createElement("div");
      controls.className = "cart-item-controls";

      const dec = document.createElement("button");
      dec.type = "button";
      dec.className = "cart-decrement";
      dec.textContent = "−";
      dec.addEventListener("click", () => {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          delete cart[name];
        }
        saveCart();
        updateCartUI();
      });

      const inc = document.createElement("button");
      inc.type = "button";
      inc.className = "cart-increment";
      inc.textContent = "+";
      inc.addEventListener("click", () => {
        item.quantity += 1;
        saveCart();
        updateCartUI();
      });

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "cart-remove";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        delete cart[name];
        saveCart();
        updateCartUI();
      });

      controls.appendChild(dec);
      controls.appendChild(inc);
      controls.appendChild(removeBtn);
      li.appendChild(controls);

      cartItemsList.appendChild(li);

      total += item.price * item.quantity;
    });

    cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
    localStorage.setItem("cartTotal", total.toFixed(2));
  }

  /* Repair existing cart data */
  (function repairCart() {
    let changed = false;
    const entries = Object.entries(cart);

    for (const [k, v] of entries) {
      const p = parsePrice(v && v.price);
      if (!Number.isFinite(p) || p <= 0) {
        delete cart[k];
        changed = true;
        continue;
      }

      const normalized = normalizeName(k);

      const quantity = v.quantity && v.quantity > 0 ? v.quantity : 1;

      if (normalized !== k) {
        cart[normalized] = {
          price: parseFloat(p.toFixed(2)),
          quantity: quantity,
          weight: v.weight || null
        };
        delete cart[k];
        changed = true;
      } else {
        cart[k].price = parseFloat(p.toFixed(2));
        cart[k].quantity = quantity;
        if (v.weight !== undefined) {
          cart[k].weight = v.weight;
        }
      }
    }

    if (changed) saveCart();
  })();

  /* Find selects for a clicked button */
  function findSelectsForButton(btn) {
    let shopItem = btn.closest && btn.closest(".shop-item");
    let sizeSelect = null;
    let colorSelect = null;

    if (shopItem) {
      sizeSelect = shopItem.querySelector('select[name="size"], select.size, select#size');
      colorSelect = shopItem.querySelector('select[name="color"], select.color, select#color');
    }

    if (!sizeSelect) sizeSelect = document.getElementById("size");
    if (!colorSelect) colorSelect = document.getElementById("color");

    return { sizeSelect, colorSelect };
  }

  /* Create color indicator in each .shop-item that has a color select */
  function initColorIndicators() {
    const shopItems = document.querySelectorAll(".shop-item");
    shopItems.forEach(item => {
      if (item.querySelector(".color-indicator")) return;

      const colorSelect = item.querySelector('select[name="color"], select.color, select#color');
      if (!colorSelect) return;

      const indicator = document.createElement("span");
      indicator.className = "color-indicator";
      indicator.setAttribute("aria-hidden", "true");

      const sel = colorSelect.options[colorSelect.selectedIndex];
      renderIndicator(indicator, sel && sel.value);

      colorSelect.addEventListener("change", () => {
        const s = colorSelect.options[colorSelect.selectedIndex];
        renderIndicator(indicator, s && s.value);
      });

      const btn = item.querySelector(".add-to-cart");
      if (btn) btn.parentNode.insertBefore(indicator, btn);
      else item.appendChild(indicator);
    });
  }

  function renderIndicator(indicatorEl, colorValue) {
    indicatorEl.textContent = "";
    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.background = colorValue || "transparent";
    swatch.title = colorValue || "";
    const label = document.createElement("span");
    label.className = "color-label";
    label.textContent = colorValue || "";
    indicatorEl.appendChild(swatch);
    indicatorEl.appendChild(label);
  }

  /* Add to cart logic with color and weight tracking */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest(".add-to-cart");
    if (!btn) return;

    const baseName = btn.dataset.name || "Item";
    let priceFromBtn = parsePrice(btn.dataset.price);

    // Look up product from global products array
    const product = Array.isArray(window.products)
      ? window.products.find(p => p.name === baseName)
      : null;

    const { sizeSelect, colorSelect } = findSelectsForButton(btn);

    let finalName = baseName;
    let finalPrice = priceFromBtn;
    let finalWeight = product && typeof product.weight === "number" ? product.weight : 0;

    const suffixParts = [];

    // SIZE handling
    if (sizeSelect) {
      const selectedSize = sizeSelect.options[sizeSelect.selectedIndex];
      const sizeText = selectedSize ? selectedSize.value : "";

      // price override from data-price
      const sizePrice = parsePrice(selectedSize && selectedSize.dataset && selectedSize.dataset.price);
      if (Number.isFinite(sizePrice)) finalPrice = sizePrice;

      // weight override: from data-weight, or from product.sizes if available
      let sizeWeight = parseFloat(selectedSize && selectedSize.dataset && selectedSize.dataset.weight);
      if (!Number.isFinite(sizeWeight) && product && Array.isArray(product.sizes)) {
        const sizeDef = product.sizes.find(s => s.label === sizeText);
        if (sizeDef && typeof sizeDef.weight === "number") {
          sizeWeight = sizeDef.weight;
        }
      }
      if (Number.isFinite(sizeWeight)) finalWeight = sizeWeight;

      if (sizeText) suffixParts.push(sizeText);
    }

    // COLOR handling
    if (colorSelect) {
      const selectedColor = colorSelect.options[colorSelect.selectedIndex];
      const colorText = selectedColor ? selectedColor.value : "";
      if (colorText) suffixParts.push(colorText);
    }

    if (suffixParts.length) {
      finalName = `${baseName} (${suffixParts.join(", ")})`;
    }

    // Fallback: read .price near the button
    if (!Number.isFinite(finalPrice)) {
      const shopItem = btn.closest && btn.closest(".shop-item");
      if (shopItem) {
        const priceEl = shopItem.querySelector(".price");
        if (priceEl) finalPrice = parsePrice(priceEl.textContent);
      }
    }

    if (!Number.isFinite(finalPrice)) {
      alert("Error: price not found for this item. Please select a size or contact support.");
      return;
    }

    finalName = normalizeName(finalName);

    if (cart[finalName]) {
      cart[finalName].quantity += 1;
    } else {
      cart[finalName] = {
        price: parseFloat(finalPrice.toFixed(2)),
        quantity: 1,
        weight: Number.isFinite(finalWeight) ? finalWeight : 0
      };
    }

    saveCart();
    updateCartUI();

    if (cartSidebar) cartSidebar.classList.add("open");
  });

  /* Clear / Checkout / Sidebar controls */
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      if (!confirm("Clear your cart?")) return;
      cart = {};
      saveCart();
      updateCartUI();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      let total = 0;
      Object.values(cart).forEach(item => {
        total += item.price * item.quantity;
      });
      localStorage.setItem("cartTotal", total.toFixed(2));
      localStorage.setItem("cartSnapshot", JSON.stringify(cart));
      window.location.href = "checkout.html";
    });
  }

  if (openCartBtn && cartSidebar) {
    openCartBtn.addEventListener("click", () => cartSidebar.classList.add("open"));
  }
  if (closeCartBtn && cartSidebar) {
    closeCartBtn.addEventListener("click", () => cartSidebar.classList.remove("open"));
  }

  // Initialize
  initColorIndicators();
  updateCartUI();
});

// --- Slideshow module ---
(function () {
  let slideIndex = 1;

  const slides = () => Array.from(document.getElementsByClassName("mySlides"));
  const dots = () => Array.from(document.getElementsByClassName("dot"));
  const prevBtn = () => document.querySelector(".prev");
  const nextBtn = () => document.querySelector(".next");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox ? lightbox.querySelector("img") : null;

  function showSlides(n) {
    const s = slides();
    const d = dots();
    if (!s.length) return;
    if (n > s.length) slideIndex = 1;
    if (n < 1) slideIndex = s.length;
    s.forEach(sl => (sl.style.display = "none"));
    d.forEach(dot => dot.classList.remove("active"));
    s[slideIndex - 1].style.display = "flex";
    if (d[slideIndex - 1]) d[slideIndex - 1].classList.add("active");
  }

  function plusSlides(n) {
    slideIndex += n;
    showSlides(slideIndex);
  }

  function currentSlide(n) {
    slideIndex = n;
    showSlides(slideIndex);
  }

  window.plusSlides = plusSlides;
  window.currentSlide = currentSlide;

  document.addEventListener("DOMContentLoaded", function () {
    const p = prevBtn();
    const nx = nextBtn();
    if (p) p.addEventListener("click", () => plusSlides(-1));
    if (nx) nx.addEventListener("click", () => plusSlides(1));

    dots().forEach((dot, i) => dot.addEventListener("click", () => currentSlide(i + 1)));

    document.querySelectorAll(".slide-image").forEach(img => {
      img.addEventListener("click", () => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "";
        lightbox.classList.add("open");
      });
    });

    if (lightbox) {
      lightbox.addEventListener("click", () => {
        lightbox.classList.remove("open");
        if (lightboxImg) lightboxImg.src = "";
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") plusSlides(-1);
      if (e.key === "ArrowRight") plusSlides(1);
      if (e.key === "Escape" && lightbox && lightbox.classList.contains("open")) {
        lightbox.classList.remove("open");
        if (lightboxImg) lightboxImg.src = "";
      }
    });

    showSlides(slideIndex);
  });
})();