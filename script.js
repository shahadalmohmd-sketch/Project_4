
const products = [
  { id: 1, name: "Golden Watch",       price: 400, category: "Watches",  image: "images/5780895224891642068_121.jpg" },
  { id: 2, name: "Silver necklace",    price: 150, category: "Necklace", image: "images/5780895224891642067_120.jpg" },
  { id: 3, name: "Golden Earrings",    price: 200, category: "Earrings", image: "images/5780895224891642066_121.jpg" },
  { id: 4, name: "Black Watch",        price: 350, category: "Watches",  image: "images/5780895224891642074_120.jpg" },
  { id: 5, name: "Silver Set Rings",   price: 580, category: "Rings",    image: "images/5780895224891642075_121.jpg" },
  { id: 6, name: "Silver necklace",    price: 150, category: "Necklace", image: "images/5780895224891642076_120.jpg" },
  { id: 7, name: "Black bracelet",     price: 100, category: "Bracelet", image: "images/5780895224891642079_121.jpg" },
  { id: 8, name: "Set Necklace",       price: 500, category: "Necklace", image: "images/5780895224891642080_121.jpg" },
  { id: 9, name: "Golden set bracelet", price: 300, category: "Bracelet", image: "images/5780895224891642081_121.jpg" },
];

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  },
};

let favorites = store.get("eclipse_fav", []);

function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem("eclipse_user") || localStorage.getItem("eclipse_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveCurrentUser(user, remember) {
  try {
    sessionStorage.removeItem("eclipse_user");
    localStorage.removeItem("eclipse_user");
    (remember ? localStorage : sessionStorage).setItem("eclipse_user", JSON.stringify(user));
  } catch { /* ignore */ }
}
function logoutUser() {
  try { sessionStorage.removeItem("eclipse_user"); localStorage.removeItem("eclipse_user"); } catch { /* ignore */ }
}

const app         = document.getElementById("app");
const authButtons = document.getElementById("authButtons");
let flash = null; 

const toastBox = document.createElement("div");
toastBox.className = "toast-container position-fixed bottom-0 start-50 translate-middle-x p-3";
document.body.appendChild(toastBox);

function showToast(message) {
  const el = document.createElement("div");
  el.className = "toast align-items-center text-bg-dark border-0";
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  toastBox.appendChild(el);
  const toast = new bootstrap.Toast(el, { delay: 2000 });
  el.addEventListener("hidden.bs.toast", () => el.remove());
  toast.show();
}

function showAlert(type, message) {
  const box = document.getElementById("formAlert");
  box.className = `alert alert-${type}`;
  box.textContent = message;
}

function placeholder(name) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
    <rect width='100%' height='100%' fill='#dfe3e8'/>
    <text x='50%' y='50%' font-size='28' fill='#777' text-anchor='middle' font-family='Arial'>${name}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function renderHome() {
  document.title = "Eclipse Jewelry";
  app.innerHTML = `
    <div class="row g-3 search-bar">
      <div class="col-md-3">
        <select id="searchMode" class="form-select form-select-lg">
          <option value="name">Search by Product Name</option>
          <option value="category">Search by Category</option>
        </select>
      </div>
      <div class="col-md-7">
        <input id="searchInput" type="text" class="form-control form-control-lg" placeholder="Search...">
      </div>
      <div class="col-md-2 d-grid">
        <button id="searchBtn" class="btn btn-dark btn-lg" type="button">Search</button>
      </div>
    </div>
    <div id="productGrid" class="row g-4 mt-2"></div>`;

  const searchInput = document.getElementById("searchInput");
  const searchMode  = document.getElementById("searchMode");

  function runSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const field = searchMode.value; 
    renderProducts(products.filter((p) => p[field].toLowerCase().includes(query)));
  }

  document.getElementById("searchBtn").addEventListener("click", runSearch);
  searchInput.addEventListener("input", runSearch);
  searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });
  searchMode.addEventListener("change", () => {
    searchInput.placeholder = searchMode.value === "name" ? "Search..." : "Search by category (e.g. Rings)...";
    runSearch();
  });

  renderProducts(products);
}

function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  if (!list.length) {
    grid.innerHTML = `<div class="col-12 text-center text-muted py-5 fs-5">No products found.</div>`;
    return;
  }
  grid.innerHTML = list.map((p, i) => `
    <div class="col-12 col-md-6 col-lg-4 product-col" style="animation-delay:${i * 60}ms">
      <div class="product-card">
        <div class="img-wrap">
          <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='${placeholder(p.name)}'">
        </div>
        <div class="card-body">
          <h5 class="card-title">${p.name}</h5>
          <p class="meta">Price: $${p.price}</p>
          <p class="meta">Category: ${p.category}</p>
          <div class="d-flex align-items-center justify-content-center gap-2">
            <button class="heart-btn ${favorites.includes(p.id) ? "active" : ""}" data-action="fav" data-id="${p.id}" aria-label="Favorite">&#9829;</button>
            <button class="btn btn-primary btn-sm" data-action="add" data-id="${p.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>`).join("");
}

app.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);

  if (btn.dataset.action === "fav") toggleFavorite(id, btn);
  if (btn.dataset.action === "add") handleAddToCart(id, btn);
});

function handleAddToCart(id, btn) {
  if (!getCurrentUser()) {
    location.hash = "#/login";
    return;
  }
  const product = products.find((p) => p.id === id);
  showToast(`${product.name} added`);
  btn.textContent = "Added ✓";
  btn.classList.replace("btn-primary", "btn-success");
  setTimeout(() => {
    btn.textContent = "Add to Cart";
    btn.classList.replace("btn-success", "btn-primary");
  }, 1000);
}

function toggleFavorite(id, btn) {
  const index = favorites.indexOf(id);
  const product = products.find((p) => p.id === id);
  if (index === -1) {
    favorites.push(id);
    btn.classList.add("active");
    showToast(`${product.name} added to favorites`);
  } else {
    favorites.splice(index, 1);
    btn.classList.remove("active");
    showToast(`${product.name} removed from favorites`);
  }
  store.set("eclipse_fav", favorites);
}

function renderLogin() {
  document.title = "Login";
  app.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <div id="formAlert" class="alert d-none"></div>
        <form id="loginForm">
          <div class="mb-3">
            <label for="loginEmail" class="form-label">Email</label>
            <input type="email" class="form-control" id="loginEmail" placeholder="Enter email" required>
          </div>
          <div class="mb-3">
            <label for="loginPassword" class="form-label">Password</label>
            <input type="password" class="form-control" id="loginPassword" placeholder="Enter password" required>
          </div>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="rememberMe">
            <label class="form-check-label" for="rememberMe">Remember Me</label>
          </div>
          <button type="submit" class="btn btn-primary">Login</button>
          <p class="mt-3 mb-0">Don't have an account? <a href="#/register">Register</a></p>
        </form>
      </div>
    </div>`;

  if (flash) { showAlert(flash.type, flash.message); flash = null; }

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email    = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const remember = document.getElementById("rememberMe").checked;

    const user = store.get("eclipse_users", []).find((u) => u.email === email && u.password === password);
    if (!user) return showAlert("danger", "Incorrect email or password.");

    saveCurrentUser({ firstName: user.firstName, lastName: user.lastName, email: user.email }, remember);
    location.hash = "#/";
  });
}

function renderRegister() {
  document.title = "Register";
  app.innerHTML = `
    <div class="auth-wrap">
      <div class="auth-card">
        <div id="formAlert" class="alert d-none"></div>
        <form id="registerForm">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="firstName" class="form-label">First Name</label>
              <input type="text" class="form-control" id="firstName" placeholder="Enter first name" required>
            </div>
            <div class="col-md-6 mb-3">
              <label for="lastName" class="form-label">Last Name</label>
              <input type="text" class="form-control" id="lastName" placeholder="Enter last name" required>
            </div>
          </div>
          <div class="mb-3">
            <label for="regEmail" class="form-label">Email</label>
            <input type="email" class="form-control" id="regEmail" placeholder="Enter email" required>
          </div>
          <div class="mb-3">
            <label for="regPassword" class="form-label">Password</label>
            <input type="password" class="form-control" id="regPassword" placeholder="Enter password" required>
          </div>
          <button type="submit" class="btn btn-primary">Register</button>
          <p class="mt-3 mb-0">Have an account? <a href="#/login">Login</a></p>
        </form>
      </div>
    </div>`;

  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName  = document.getElementById("lastName").value.trim();
    const email     = document.getElementById("regEmail").value.trim().toLowerCase();
    const password  = document.getElementById("regPassword").value;
    const users     = store.get("eclipse_users", []);

    if (password.length < 6) return showAlert("danger", "Password must be at least 6 characters.");
    if (users.some((u) => u.email === email)) return showAlert("danger", "This email is already registered.");

    users.push({ firstName, lastName, email, password });
    store.set("eclipse_users", users);

    flash = { type: "success", message: "Account created successfully. Please login." };
    location.hash = "#/login";
  });
}

function renderAuthButtons() {
  const user = getCurrentUser();
  authButtons.innerHTML = user
    ? `<span class="fw-semibold">Hi, ${user.firstName}</span>
       <button id="logoutBtn" class="btn btn-outline-danger" type="button">Logout</button>`
    : `<a href="#/login" class="btn btn-outline-primary">Login</a>
       <a href="#/register" class="btn btn-outline-success">Register</a>`;
}

authButtons.addEventListener("click", (e) => {
  if (e.target.id === "logoutBtn") {
    logoutUser();
    renderAuthButtons();
    showToast("Logged out");
  }
});

function router() {
  const route = location.hash.replace(/^#\/?/, "");
  const isAuthPage = route === "login" || route === "register";

  renderAuthButtons();
  authButtons.style.display = isAuthPage ? "none" : "flex"; 

  if (route === "login")         renderLogin();
  else if (route === "register") renderRegister();
  else                           renderHome();

  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", router);
router();
