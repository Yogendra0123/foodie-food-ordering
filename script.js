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
