let cart = [];

// Simple cart add function
function addToCart(productId) {
  cart.push(productId);
  alert(productId + " added to cart!");
}

let products = [];

/* ---------------------------------------------------------
   ✅ AUTO-DETECT CORRECT PATH FOR products.json
--------------------------------------------------------- */
let productPath;

if (window.location.pathname.includes("Item-pages")) {
  productPath = "../products.json";
} else {
  productPath = "products.json";
}

/* ---------------------------------------------------------
   ✅ LOAD PRODUCT DATA
--------------------------------------------------------- */
fetch(productPath)
  .then(res => res.json())
  .then(data => {
    products = data;
  })
  .catch(err => console.error("Error loading products:", err));

/* ---------------------------------------------------------
   ✅ SEARCH LOGIC
--------------------------------------------------------- */
function searchProducts(query) {
  query = query.toLowerCase();

  return products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.tags.some(tag => tag.toLowerCase().includes(query))
  );
}

/* ---------------------------------------------------------
   ✅ DISPLAY RESULTS (GRID CARDS)
--------------------------------------------------------- */
function displayResults(results) {
  const container = document.getElementById("searchResults");
  container.innerHTML = "";
  container.style.display = "grid";

  if (!results.length) {
    container.innerHTML = `<p class="no-results">No results found.</p>`;
    return;
  }

  results.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("search-card");

    // ✅ Fix link path for item pages
    const linkPrefix = window.location.pathname.includes("Item-pages")
      ? "../item-pages/"
      : "item-pages/";

    // ✅ Fix image path for item pages
    const imagePath = window.location.pathname.includes("Item-pages")
      ? "../" + item.image
      : item.image;

    card.innerHTML = `
      <a href="${linkPrefix}${item.id}.html">
        <img src="${imagePath}" alt="${item.name}">
        <h4>${item.name}</h4>
      </a>
    `;

    container.appendChild(card);
  });
}

/* ---------------------------------------------------------
   ✅ EVENT LISTENERS
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (!searchBtn || !searchInput) return;

  searchBtn.addEventListener("click", () => {
    const query = searchInput.value;
    const results = searchProducts(query);
    displayResults(results);
  });

  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const query = e.target.value;
      const results = searchProducts(query);
      displayResults(results);
    }
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    const results = searchProducts(query);
    displayResults(results);
  });
});

/* ---------------------------------------------------------
   ✅ CLICK OUTSIDE TO CLOSE SEARCH DROPDOWN
--------------------------------------------------------- */
document.addEventListener("click", function (event) {
  const searchBar = document.querySelector(".search-bar");
  const results = document.getElementById("searchResults");

  if (!searchBar.contains(event.target)) {
    results.innerHTML = "";
    results.style.display = "none";
  }
});