/* ---------------------------------------------------------
   ✅ GLOBAL VARIABLES
--------------------------------------------------------- */
let products = [];
let originalProducts = [];

/* ---------------------------------------------------------
   ✅ AUTO-DETECT CORRECT PATH FOR products.json
--------------------------------------------------------- */
let productPath = window.location.pathname.includes("Item-pages")
  ? "../products.json"
  : "./products.json";

/* ---------------------------------------------------------
   ✅ LOAD PRODUCT DATA (ONE TIME)
--------------------------------------------------------- */
fetch(productPath)
  .then(res => res.json())
  .then(data => {
    products = data;
    originalProducts = data.slice();

    // If shop page exists, render products
    if (document.getElementById("shop-grid")) {
      renderProducts(products);
    }
  })
  .catch(err => console.error("Error loading products:", err));

/* ---------------------------------------------------------
   ✅ RENDER PRODUCTS (SHOP PAGE)
--------------------------------------------------------- */
function renderProducts(list) {
  const grid = document.getElementById("shop-grid");
  if (!grid) return; // Not on shop page

  grid.innerHTML = "";

  list.forEach(product => {
    const item = document.createElement("div");
    item.classList.add("shop-item");

    // ✅ Use first image from product.images[]
    const firstImage = product.images?.[0] || "images/placeholder.png";

    item.innerHTML = `
      <a href="item.html?id=${product.id}" class="shop-link">
        <img src="${firstImage}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="description">${product.description}</p>
        <p class="price">$${product.price.toFixed(2)}</p>
      </a>

      <button class="add-to-cart"
              data-name="${product.name}"
              data-price="${product.price}">
        Add to Cart
      </button>
    `;

    grid.appendChild(item);
  });
}

/* ---------------------------------------------------------
   ✅ SORTING (SHOP PAGE)
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const sortSelect = document.getElementById("sortSelect");
  if (!sortSelect) return; // Not on shop page

  sortSelect.addEventListener("change", function () {
    const value = this.value;

    switch (value) {
      case "alpha-asc":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "alpha-desc":
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;

      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;

      default:
        products = originalProducts.slice();
    }

    renderProducts(products);
  });
});

/* ---------------------------------------------------------
   ✅ SEARCH LOGIC (ALL PAGES)
--------------------------------------------------------- */
function searchProducts(query) {
  query = query.toLowerCase();

  return products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.tags.some(tag => tag.toLowerCase().includes(query))
  );
}

function displayResults(results) {
  const container = document.getElementById("searchResults");
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "grid";

  if (!results.length) {
    container.innerHTML = `<p class="no-results">No results found.</p>`;
    return;
  }

  // ✅ Always link to dynamic item page
  const linkPrefix = window.location.pathname.includes("Item-pages")
    ? "../item.html?id="
    : "item.html?id=";

  const imagePrefix = window.location.pathname.includes("Item-pages")
    ? "../"
    : "";

  results.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("search-card");

    const firstImage = item.images?.[0] || "images/placeholder.png";

    card.innerHTML = `
      <a href="${linkPrefix}${item.id}">
        <img src="${imagePrefix}${firstImage}" alt="${item.name}">
        <h4>${item.name}</h4>
      </a>
    `;

    container.appendChild(card);
  });
}

/* ---------------------------------------------------------
   ✅ SEARCH EVENT LISTENERS
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (!searchBtn || !searchInput) return;

  function runSearch() {
    const query = searchInput.value;
    const results = searchProducts(query);
    displayResults(results);
  }

  searchBtn.addEventListener("click", runSearch);
  searchInput.addEventListener("keyup", e => e.key === "Enter" && runSearch());
  searchInput.addEventListener("input", runSearch);
});

/* ---------------------------------------------------------
   ✅ CLICK OUTSIDE TO CLOSE SEARCH DROPDOWN
--------------------------------------------------------- */
document.addEventListener("click", event => {
  const searchBar = document.querySelector(".search-bar");
  const results = document.getElementById("searchResults");

  if (searchBar && results && !searchBar.contains(event.target)) {
    results.innerHTML = "";
    results.style.display = "none";
  }
});