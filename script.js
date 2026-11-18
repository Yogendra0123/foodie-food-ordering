<<<<<<< HEAD
/* =====================================================
   PageTurner Online Bookstore - script.js
   ===================================================== */

// ---------- 1. DATA: an array of objects (one object per book) ----------
// Cover images come from Open Library using the book's ISBN.
// If an image fails to load, a placeholder is shown instead.
const books = [
  { id: 1,  title: "The Alchemist",              author: "Paulo Coelho",       category: "Fiction",    price: 350,  isbn: "9780062315007", featured: true },
  { id: 2,  title: "To Kill a Mockingbird",      author: "Harper Lee",         category: "Fiction",    price: 420,  isbn: "9780061120084", featured: false },
  { id: 3,  title: "1984",                       author: "George Orwell",      category: "Fiction",    price: 299,  isbn: "9780451524935", featured: true },
  { id: 4,  title: "The Great Gatsby",           author: "F. Scott Fitzgerald",category: "Fiction",    price: 275,  isbn: "9780743273565", featured: false },
  { id: 5,  title: "A Brief History of Time",    author: "Stephen Hawking",    category: "Science",    price: 499,  isbn: "9780553380163", featured: true },
  { id: 6,  title: "Cosmos",                     author: "Carl Sagan",         category: "Science",    price: 550,  isbn: "9780345539434", featured: false },
  { id: 7,  title: "The Selfish Gene",           author: "Richard Dawkins",    category: "Science",    price: 480,  isbn: "9780198788607", featured: false },
  { id: 8,  title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", category: "Science", price: 399, isbn: "9780393609394", featured: false },
  { id: 9,  title: "Clean Code",                 author: "Robert C. Martin",   category: "Technology", price: 899,  isbn: "9780132350884", featured: true },
  { id: 10, title: "The Pragmatic Programmer",   author: "Andrew Hunt",        category: "Technology", price: 950,  isbn: "9780135957059", featured: false },
  { id: 11, title: "JavaScript: The Good Parts", author: "Douglas Crockford",  category: "Technology", price: 650,  isbn: "9780596517748", featured: false },
  { id: 12, title: "Eloquent JavaScript",        author: "Marijn Haverbeke",   category: "Technology", price: 720,  isbn: "9781593279509", featured: false },
  { id: 13, title: "Atomic Habits",              author: "James Clear",        category: "Education",  price: 499,  isbn: "9780735211292", featured: false },
  { id: 14, title: "Make It Stick",              author: "Peter C. Brown",     category: "Education",  price: 580,  isbn: "9780674729018", featured: false },
  { id: 15, title: "Mindset",                    author: "Carol S. Dweck",     category: "Education",  price: 450,  isbn: "9780345472328", featured: false },
  { id: 16, title: "Deep Work",                  author: "Cal Newport",        category: "Education",  price: 520,  isbn: "9781455586691", featured: false }
];

const STORAGE_KEY = "bookstoreCart"; // name used to save the cart in the browser
const MAX_QTY = 10;                  // maximum copies of one book
const FREE_DELIVERY_ABOVE = 1000;    // free delivery limit
const DELIVERY_FEE = 50;

// Simple grey placeholder (SVG) used when an image can't load
const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280"><rect width="100%" height="100%" fill="#cbd5e1"/>' +
  '<text x="50%" y="50%" font-size="60" text-anchor="middle" dominant-baseline="middle">📖</text></svg>'
);

// ---------- 2. STATE: the cart is an array of { id, qty } objects ----------
let cart = loadCart();

// ---------- 3. GET HTML ELEMENTS (DOM) ----------
const featuredGrid   = document.getElementById("featured-grid");
const bookGrid       = document.getElementById("book-grid");
const noResults      = document.getElementById("no-results");
const searchInput    = document.getElementById("search-input");
const categorySelect = document.getElementById("category-select");
const cartItemsBox   = document.getElementById("cart-items");
const cartCount      = document.getElementById("cart-count");
const subtotalEl     = document.getElementById("subtotal");
const deliveryEl     = document.getElementById("delivery");
const totalEl        = document.getElementById("total");
const modal          = document.getElementById("modal");
const modalText      = document.getElementById("modal-text");
const toast          = document.getElementById("toast");

// ---------- 4. LOCALSTORAGE ----------
// Save the cart: convert array -> string with JSON.stringify()
function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

// Load the cart: convert string -> array with JSON.parse()
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : []; // use [] if nothing valid is saved
  } catch (error) {
    return []; // if the saved data is broken, start with an empty cart
  }
}

// ---------- 5. HELPERS ----------
function formatPrice(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function getCover(book) {
  return "https://covers.openlibrary.org/b/isbn/" + book.isbn + "-L.jpg?default=false";
}

function findBook(id) {
  return books.find(function (book) { return book.id === id; });
}

// Show a small message at the bottom of the screen
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2000);
}

// ---------- 6. DISPLAY BOOKS ----------
// Build the HTML for one book card
function createCard(book) {
  return `
    <article class="card">
      <div class="card-img">
        <img src="${getCover(book)}" alt="${book.title} cover" loading="lazy"
             onerror="this.onerror=null; this.src=PLACEHOLDER;">
      </div>
      <div class="card-body">
        <span class="category">${book.category}</span>
        <h3>${book.title}</h3>
        <p class="author">by ${book.author}</p>
        <p class="price">${formatPrice(book.price)}</p>
        <button class="btn" data-action="add" data-id="${book.id}">Add to Cart</button>
      </div>
    </article>`;
}

// Show the featured books on the home page
function renderFeatured() {
  const featured = books.filter(function (book) { return book.featured; });
  featuredGrid.innerHTML = featured.map(createCard).join("");
}

// Show books after applying search text + category filter
function renderBooks() {
  const searchText = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  const result = books.filter(function (book) {
    const matchesSearch = book.title.toLowerCase().includes(searchText) ||
                          book.author.toLowerCase().includes(searchText);
    const matchesCategory = category === "All" || book.category === category;
    return matchesSearch && matchesCategory;
  });

  bookGrid.innerHTML = result.map(createCard).join("");
  noResults.classList.toggle("hidden", result.length > 0); // show message if no match
}

// ---------- 7. CART FUNCTIONS ----------
// Add a book. If it's already in the cart, increase its quantity (no duplicates).
function addToCart(id) {
  const item = cart.find(function (entry) { return entry.id === id; });

  if (item) {
    if (item.qty >= MAX_QTY) {
      showToast("Maximum " + MAX_QTY + " copies per book");
      return;
    }
    item.qty++;
  } else {
    cart.push({ id: id, qty: 1 });
  }

  saveCart();
  renderCart();
  showToast("Added: " + findBook(id).title);
}

// Increase (+1) or decrease (-1) quantity
function changeQty(id, change) {
  const item = cart.find(function (entry) { return entry.id === id; });
  if (!item) return;

  const newQty = item.qty + change;
  if (newQty < 1) { removeFromCart(id); return; } // going below 1 removes the item
  if (newQty > MAX_QTY) { showToast("Maximum " + MAX_QTY + " copies per book"); return; }

  item.qty = newQty;
  saveCart();
  renderCart();
}

// Set quantity typed by the user (validates bad input)
function setQty(id, value) {
  const item = cart.find(function (entry) { return entry.id === id; });
  if (!item) return;

  let qty = parseInt(value, 10);
  if (isNaN(qty) || qty < 1) qty = 1;        // invalid -> 1
  if (qty > MAX_QTY) {                        // too big -> max
    qty = MAX_QTY;
    showToast("Maximum " + MAX_QTY + " copies per book");
  }

  item.qty = qty;
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(function (entry) { return entry.id !== id; });
  saveCart();
  renderCart();
}

// ---------- 8. DISPLAY CART ----------
function renderCart() {
  // Empty cart message
  if (cart.length === 0) {
    cartItemsBox.innerHTML = '<div class="empty-cart"><h3>Your cart is empty 😕</h3><p>Add some books to get started!</p></div>';
  } else {
    cartItemsBox.innerHTML = cart.map(function (entry) {
      const book = findBook(entry.id);
      return `
        <div class="cart-item">
          <img src="${getCover(book)}" alt="${book.title}" onerror="this.onerror=null; this.src=PLACEHOLDER;">
          <div>
            <h4>${book.title}</h4>
            <small>${book.author} · ${formatPrice(book.price)}</small>
          </div>
          <div class="qty">
            <button data-action="minus" data-id="${book.id}" aria-label="Decrease">−</button>
            <input type="number" min="1" max="${MAX_QTY}" value="${entry.qty}" data-action="input" data-id="${book.id}">
            <button data-action="plus" data-id="${book.id}" aria-label="Increase">+</button>
          </div>
          <div class="line-total">${formatPrice(book.price * entry.qty)}</div>
          <button class="remove" data-action="remove" data-id="${book.id}" aria-label="Remove">🗑</button>
        </div>`;
    }).join("");
  }

  // Price calculation
  let subtotal = 0;
  let itemCount = 0;
  cart.forEach(function (entry) {
    subtotal += findBook(entry.id).price * entry.qty;
    itemCount += entry.qty;
  });
  const delivery = (subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE) ? 0 : DELIVERY_FEE;

  subtotalEl.textContent = formatPrice(subtotal);
  deliveryEl.textContent = delivery === 0 ? "Free" : formatPrice(delivery);
  totalEl.textContent    = formatPrice(subtotal + delivery);
  cartCount.textContent  = itemCount;
}

// ---------- 9. CHECKOUT (demo only) ----------
function checkout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }
  const orderId = "ORD" + Math.floor(100000 + Math.random() * 900000);
  modalText.textContent = "Thank you! Your order " + orderId + " (" + totalEl.textContent +
                          ") has been placed. This is a demo, so no payment was taken.";
  modal.classList.remove("hidden");

  cart = [];        // empty the cart
  saveCart();
  renderCart();
}

// ---------- 10. EVENT LISTENERS ----------
// One handler for "Add to Cart" buttons (works for featured + main grid)
function handleGridClick(event) {
  const button = event.target.closest("[data-action='add']");
  if (button) addToCart(Number(button.dataset.id));
}
featuredGrid.addEventListener("click", handleGridClick);
bookGrid.addEventListener("click", handleGridClick);

// Cart buttons: +, -, remove (event delegation on the cart container)
cartItemsBox.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);

  if (button.dataset.action === "plus")   changeQty(id, 1);
  if (button.dataset.action === "minus")  changeQty(id, -1);
  if (button.dataset.action === "remove") removeFromCart(id);
});

// Quantity typed into the input box
cartItemsBox.addEventListener("change", function (event) {
  if (event.target.dataset.action === "input") {
    setQty(Number(event.target.dataset.id), event.target.value);
  }
});

// Search + filter
searchInput.addEventListener("input", renderBooks);
categorySelect.addEventListener("change", renderBooks);

// Checkout, clear cart, modal
document.getElementById("checkout-btn").addEventListener("click", checkout);
document.getElementById("clear-btn").addEventListener("click", function () {
  if (cart.length === 0) { showToast("Cart is already empty"); return; }
  cart = [];
  saveCart();
  renderCart();
});
document.getElementById("modal-close").addEventListener("click", function () {
  modal.classList.add("hidden");
});

// Mobile menu
const navLinks = document.getElementById("nav-links");
document.getElementById("menu-toggle").addEventListener("click", function () {
  navLinks.classList.toggle("open");
});
navLinks.addEventListener("click", function () { navLinks.classList.remove("open"); });

// ---------- 11. START THE APP ----------
renderFeatured();
renderBooks();
renderCart();
=======
/* Foodie – vanilla JS: menu, search/filter, cart (LocalStorage), checkout */
"use strict";

// ---------- Data ----------
const CATEGORIES = ["Pizza", "Burgers", "Biryani", "Chinese", "Desserts", "Beverages"];
const IMG = (f) => `assets/images/${f}.svg`;
// [id, name, description, price (₹), rating, category]
const FOODS = [
  [1, "Margherita Pizza", "Tomato, fresh mozzarella and basil on a thin crust.", 249, 4.6, "Pizza"],
  [2, "Pepperoni Feast", "Loaded with pepperoni and extra cheese.", 349, 4.7, "Pizza"],
  [3, "Classic Cheeseburger", "Grilled patty, cheddar, lettuce and house sauce.", 179, 4.4, "Burgers"],
  [4, "Crispy Chicken Burger", "Buttermilk fried chicken with spicy mayo.", 199, 4.5, "Burgers"],
  [5, "Hyderabadi Chicken Biryani", "Dum-cooked basmati rice with tender chicken.", 299, 4.8, "Biryani"],
  [6, "Paneer Dum Biryani", "Fragrant rice layered with spiced paneer.", 249, 4.5, "Biryani"],
  [7, "Veg Hakka Noodles", "Wok-tossed noodles with crunchy vegetables.", 169, 4.3, "Chinese"],
  [8, "Chicken Manchurian", "Crispy chicken in a tangy garlic-soy sauce.", 219, 4.4, "Chinese"],
  [9, "Chocolate Lava Cake", "Warm cake with a molten chocolate centre.", 119, 4.7, "Desserts"],
  [10, "Gulab Jamun", "Soft milk dumplings soaked in rose syrup.", 89, 4.6, "Desserts"],
  [11, "Cold Coffee", "Chilled, creamy and lightly sweet.", 99, 4.3, "Beverages"],
  [12, "Fresh Lime Soda", "Zesty lime, soda and a pinch of salt.", 69, 4.2, "Beverages"],
].map(([id, name, desc, price, rating, category]) => ({ id, name, desc, price, rating, category, img: IMG("d" + id) }));

const MAX_QTY = 10, DELIVERY_FEE = 40, STORE_KEY = "foodie_cart";
const $ = (s) => document.querySelector(s);
const inr = (n) => "₹" + n.toLocaleString("en-IN");

// ---------- State ----------
let cart = loadCart();           // [{id, qty}]
let activeCat = "All";
let query = "";

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY));
    return Array.isArray(raw) ? raw.filter((i) => FOODS.some((f) => f.id === i.id) && i.qty > 0) : [];
  } catch { return []; }
}
function saveCart() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch { /* storage unavailable */ }
}

// ---------- Rendering: categories, chips, food ----------
function renderCategories() {
  $("#categoryGrid").innerHTML = CATEGORIES.map((c) =>
    `<button class="cat" data-cat="${c}"><img src="${IMG("c-" + c.toLowerCase())}" alt="${c}" loading="lazy"><span>${c}</span></button>`).join("");
  $("#chips").innerHTML = ["All", ...CATEGORIES].map((c) =>
    `<button class="chip" data-cat="${c}" aria-pressed="false">${c}</button>`).join("");
}
function syncActive() {
  document.querySelectorAll("[data-cat]").forEach((el) => {
    const on = el.dataset.cat === activeCat;
    el.classList.toggle("active", on);
    if (el.classList.contains("chip")) el.setAttribute("aria-pressed", on);
  });
}
function renderFoods() {
  const q = query.trim().toLowerCase();
  const list = FOODS.filter((f) => (activeCat === "All" || f.category === activeCat) && f.name.toLowerCase().includes(q));
  $("#foodGrid").innerHTML = list.map((f) => `
    <article class="card">
      <img src="${f.img}" alt="${f.name}" loading="lazy">
      <div class="card-body">
        <div class="card-top"><span>${f.category}</span><span class="rating"><i class="fa-solid fa-star"></i> ${f.rating}</span></div>
        <h3>${f.name}</h3><p>${f.desc}</p>
        <div class="card-bottom"><span class="price">${inr(f.price)}</span>
          <button class="btn" data-add="${f.id}">Add to cart</button></div>
      </div>
    </article>`).join("");
  $("#noResults").hidden = list.length > 0;
  syncActive();
}

// ---------- Cart ----------
const findFood = (id) => FOODS.find((f) => f.id === id);
function totals() {
  const subtotal = cart.reduce((s, i) => s + findFood(i.id).price * i.qty, 0);
  const delivery = subtotal ? DELIVERY_FEE : 0;
  return { subtotal, delivery, total: subtotal + delivery };
}
function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  if (item) { if (item.qty < MAX_QTY) item.qty++; else return toast(`Maximum ${MAX_QTY} per item`); }
  else cart.push({ id, qty: 1 });
  updateCart();
  toast(`${findFood(id).name} added to cart`);
}
function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.min(MAX_QTY, Math.max(1, item.qty + delta)); // keep quantity between 1 and MAX_QTY
  updateCart();
}
function removeItem(id) { cart = cart.filter((i) => i.id !== id); updateCart(); }
function updateCart() {
  saveCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $("#cartCount").textContent = count;
  $("#cartItems").innerHTML = cart.length ? cart.map((i) => {
    const f = findFood(i.id);
    return `<div class="cart-item"><img src="${f.img}" alt="${f.name}">
      <div><h4>${f.name}</h4><small>${inr(f.price)} each</small>
        <div class="qty"><button data-dec="${f.id}" aria-label="Decrease quantity" ${i.qty <= 1 ? "disabled" : ""}>−</button>
          <span>${i.qty}</span><button data-inc="${f.id}" aria-label="Increase quantity" ${i.qty >= MAX_QTY ? "disabled" : ""}>+</button></div></div>
      <div><strong>${inr(f.price * i.qty)}</strong><br><button class="rm" data-rm="${f.id}" aria-label="Remove ${f.name}"><i class="fa-solid fa-trash"></i></button></div></div>`;
  }).join("") : `<p class="empty">Your cart is empty. Add something tasty from the menu!</p>`;
  const t = totals();
  $("#subtotal").textContent = inr(t.subtotal);
  $("#delivery").textContent = inr(t.delivery);
  $("#total").textContent = inr(t.total);
  $("#checkoutBtn").disabled = !cart.length;
}

// ---------- Drawer / dialog / toast ----------
function openCart(open) {
  $("#drawer").classList.toggle("open", open);
  $("#drawer").setAttribute("aria-hidden", !open);
  $("#overlay").hidden = !open;
  if (open) $("#closeCart").focus();
}
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

// ---------- Validation ----------
function setError(input, msg) {
  input.classList.toggle("invalid", !!msg);
  input.parentElement.querySelector(".err").textContent = msg;
  return !msg;
}
const rules = {
  name: (v) => (v.trim().length >= 2 ? "" : "Enter your full name (at least 2 characters)."),
  phone: (v) => (/^[6-9]\d{9}$/.test(v.trim()) ? "" : "Enter a valid 10-digit Indian mobile number."),
  address: (v) => (v.trim().length >= 10 ? "" : "Enter a complete delivery address (at least 10 characters)."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address."),
  message: (v) => (v.trim().length >= 10 ? "" : "Write a message of at least 10 characters."),
};
function validate(pairs) { // pairs: [[inputEl, ruleName]]
  return pairs.map(([el, r]) => setError(el, rules[r](el.value))).every(Boolean);
}

// ---------- Checkout ----------
function openCheckout() {
  if (!cart.length) return;
  $("#summary").innerHTML = cart.map((i) => {
    const f = findFood(i.id);
    return `<li><span>${f.name} × ${i.qty}</span><span>${inr(f.price * i.qty)}</span></li>`;
  }).join("") + `<li><span>Delivery</span><span>${inr(totals().delivery)}</span></li>`;
  $("#coTotal").textContent = inr(totals().total);
  $("#checkoutView").hidden = false; $("#doneView").hidden = true;
  openCart(false);
  $("#checkoutDialog").showModal();
}
function placeOrder(e) {
  e.preventDefault();
  const name = $("#coName"), phone = $("#coPhone"), addr = $("#coAddr");
  if (!validate([[name, "name"], [phone, "phone"], [addr, "address"]]) || !cart.length) return;
  const orderId = "FD" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);
  $("#doneName").textContent = name.value.trim();
  $("#orderId").textContent = "#" + orderId;
  cart = []; updateCart();                       // clear cart after success
  e.target.reset();
  $("#checkoutView").hidden = true; $("#doneView").hidden = false;
}

// ---------- Events ----------
function init() {
  renderCategories(); renderFoods(); updateCart();

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add],[data-inc],[data-dec],[data-rm],[data-cat]");
    if (!t) return;
    if (t.dataset.add) addToCart(+t.dataset.add);
    else if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
    else if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
    else if (t.dataset.rm) removeItem(+t.dataset.rm);
    else if (t.dataset.cat) {
      activeCat = t.dataset.cat; renderFoods();
      if (t.classList.contains("cat")) $("#menu").scrollIntoView({ behavior: "smooth" });
    }
  });

  $("#searchInput").addEventListener("input", (e) => { query = e.target.value; renderFoods(); });
  $("#searchBtn").addEventListener("click", () => { $("#menu").scrollIntoView({ behavior: "smooth" }); setTimeout(() => $("#searchInput").focus(), 400); });
  $("#cartBtn").addEventListener("click", () => openCart(true));
  $("#closeCart").addEventListener("click", () => openCart(false));
  $("#overlay").addEventListener("click", () => openCart(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") openCart(false); });
  $("#checkoutBtn").addEventListener("click", openCheckout);
  $("#closeCheckout").addEventListener("click", () => $("#checkoutDialog").close());
  $("#doneBtn").addEventListener("click", () => { $("#checkoutDialog").close(); $("#menu").scrollIntoView({ behavior: "smooth" }); });
  $("#checkoutForm").addEventListener("submit", placeOrder);

  const toggle = $("#menuToggle"), links = $("#navLinks");
  toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", links.classList.toggle("open")));
  links.addEventListener("click", (e) => { if (e.target.tagName === "A") { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); } });

  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = validate([[$("#cName"), "name"], [$("#cEmail"), "email"], [$("#cMsg"), "message"]]);
    if (ok) { e.target.reset(); toast("Message sent. We'll reply soon!"); }
  });
}
document.addEventListener("DOMContentLoaded", init);
>>>>>>> 29660e975de898bdcaf1e82e8231e2b81d07bc3b
