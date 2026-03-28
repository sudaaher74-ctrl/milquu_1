function productImg(p, size) {
  const h = size === 'detail' ? '320px' : '170px';
  const fz = size === 'detail' ? '110px' : '76px';
  if (p.img) {
    return `
      <img src="${p.img}" alt="${p.name}"
        style="width:100%;height:${h};object-fit:contain;padding:10px;display:block;"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="display:none;width:100%;height:${h};font-size:${fz};align-items:center;justify-content:center;">${p.e}</div>`;
  }
  return `<div style="width:100%;height:${h};font-size:${fz};display:flex;align-items:center;justify-content:center;">${p.e}</div>`;
}

// ============================================================
//  PRODUCT CARD
// ============================================================
function card(p) {
  return `
<div class="product-card fade-in" data-cat="${p.cat}">
  <div class="product-img" onclick="detail('${p.id}')" style="padding:0;overflow:hidden;background:#f0fdf4;position:relative;cursor:pointer;">
    ${p.badge ? `<span class="product-badge" style="position:absolute;top:10px;left:10px;z-index:2;">${p.badge}</span>` : ''}
    ${productImg(p, 'card')}
  </div>
  <div class="product-info">
    <div class="product-cat">${p.cat}</div>
    <div class="product-name" onclick="detail('${p.id}')" style="cursor:pointer;">${p.name}</div>
    <div class="product-desc">${p.desc}</div>
    <div class="product-footer">
      <div class="product-price">₹${p.price}<span>${p.unit}</span></div>
      <button class="add-cart-btn" onclick="addToCart({id:'${p.id}',productId:'${p.productId}',name:'${p.name}',price:${p.price},e:'${p.e}',unit:'${p.unit}'})">+</button>
    </div>
  </div>
</div>`;
}

function renderGrid(gridId, filter) {
  const list = (!filter || filter === 'all') ? P : P.filter(p => p.cat === filter);
  const el = document.getElementById(gridId);
  if (el) { el.innerHTML = list.map(card).join(''); initFade(); }
}

// ============================================================
//  NAVIGATION
// ============================================================
function nav(page, cat, closeMob) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nl').forEach(l => l.classList.toggle('active', l.dataset.p === page));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (closeMob) { document.getElementById('mobile-menu').classList.remove('open'); document.body.style.overflow = ''; }
  if (page === 'home') { renderGrid('home-grid'); initTabs('home-tabs', 'home-grid'); }
  if (page === 'products') {
    renderGrid('prod-grid', cat || 'all');
    initTabs('prod-tabs', 'prod-grid');
    if (cat) setTimeout(() => {
      const t = document.querySelector(`#prod-tabs [data-cat="${cat}"]`);
      if (t) { document.querySelectorAll('#prod-tabs .filter-tab').forEach(x => x.classList.remove('active')); t.classList.add('active'); renderGrid('prod-grid', cat); }
    }, 50);
  }
  if (page === 'subscription') initSub();
  initFade();
  return false;
}

function initTabs(tabsId, gridId) {
  document.querySelectorAll(`#${tabsId} .filter-tab`).forEach(t => {
    t.onclick = () => { document.querySelectorAll(`#${tabsId} .filter-tab`).forEach(x => x.classList.remove('active')); t.classList.add('active'); renderGrid(gridId, t.dataset.cat); };
  });
}

function renderCmsUpdates() {
  const section = document.getElementById('cms-updates-section');
  const grid = document.getElementById('cms-updates-grid');
  if (!section || !grid) return;

  const items = CMS_CONTENT
    .filter(item => ['banner', 'offer', 'text'].includes(item.type))
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 6);

  if (!items.length) {
    section.style.display = 'none';
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = items.map(item => {
    const img = contentImageUrl(item);
    return `
      <div class="why-card fade-in" style="overflow:hidden;">
        ${img ? `<img src="${img}" alt="${item.title || item.key}" style="width:100%;height:180px;object-fit:cover;border-radius:14px;margin-bottom:18px;" onerror="this.style.display='none';">` : ''}
        <div class="tag" style="display:inline-flex;margin-bottom:12px;">${item.type}</div>
        <h3>${item.title || item.key}</h3>
        <p>${item.value || 'Published from the admin dashboard.'}</p>
      </div>`;
  }).join('');

  section.style.display = '';
  initFade();
}

// ============================================================
//  PRODUCT DETAIL PAGE
// ============================================================
let dQty = 1;

function detail(id) {
  const p = P.find(x => x.id === id);
  if (!p) return;
  dQty = 1;
  document.getElementById('bc-name').textContent = p.name;
  const rows = p.nut.map(([n, v]) => `<tr><td>${n}</td><td><strong>${v}</strong></td></tr>`).join('');
  document.getElementById('detail-grid').innerHTML = `
    <div>
      <div style="background:#f0fdf4;border-radius:16px;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:300px;">
        ${productImg(p, 'detail')}
      </div>
      <div class="product-thumbs" style="margin-top:12px;">
        <div class="thumb active" style="background:#f0fdf4;overflow:hidden;display:flex;align-items:center;justify-content:center;">
          ${p.img ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none';">` : p.e}
        </div>
        <div class="thumb">🌾</div><div class="thumb">✅</div><div class="thumb">🚚</div>
      </div>
    </div>
    <div>
      <div class="prod-cat">${p.cat}</div>
      <h1 style="font-size:32px;margin-bottom:12px;">${p.name}</h1>
      <div class="prod-price">₹${p.price} <span>${p.unit}</span></div>
      <p class="prod-desc">${p.desc}</p>
      <h4 style="font-size:15px;margin-bottom:12px;font-weight:700;">Nutrition Information</h4>
      <table class="nutrition-table"><thead><tr><th>Nutrient</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="qty-selector">
        <label>Quantity:</label>
        <div class="qty-control">
          <button onclick="dQty=Math.max(1,dQty-1);document.getElementById('dq').textContent=dQty">−</button>
          <span class="qty-num" id="dq">1</span>
          <button onclick="dQty++;document.getElementById('dq').textContent=dQty">+</button>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" onclick="for(let i=0;i<dQty;i++)addToCart({id:'${p.id}',productId:'${p.productId}',name:'${p.name}',price:${p.price},e:'${p.e}',unit:'${p.unit}'})">🛒 Add to Cart</button>
        <button class="btn btn-outline" onclick="nav('subscription')">📦 Subscribe Daily</button>
      </div>
      <div style="display:flex;gap:20px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border);flex-wrap:wrap;">
        <span style="font-size:13px;color:var(--gray);">✅ Farm Fresh</span>
        <span style="font-size:13px;color:var(--gray);">🚚 Free Delivery ₹200+</span>
        <span style="font-size:13px;color:var(--gray);">🔄 Easy Returns</span>
      </div>
    </div>`;
  const related = P.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  document.getElementById('related-grid').innerHTML = related.map(card).join('');
  nav('detail');
}

// ============================================================
//  CART
// ============================================================
const getCart = () => DB.get('cart');
const saveCart = c => DB.set('cart', c);

function addToCart(item) {
  const c = getCart(), ex = c.find(i => i.id === item.id);
  if (ex) ex.qty++; else c.push({ ...item, qty: 1 });
  saveCart(c); updateCart(); notif(`${item.name} added to cart! ✅`);
}

function removeFromCart(id) { saveCart(getCart().filter(i => i.id !== id)); updateCart(); }

function upQty(id, d) {
  const c = getCart(), it = c.find(i => i.id === id);
  if (it) { it.qty = Math.max(1, it.qty + d); saveCart(c); }
  updateCart();
}

function updateCart() {
  const c = getCart(), tot = c.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cart-count');
  el.textContent = tot; el.classList.toggle('show', tot > 0);
  const mobileCount = document.getElementById('mobile-cart-count');
  if (mobileCount) mobileCount.textContent = tot;
  renderCart();
}

function renderCart() {
  const c = getCart(), list = document.getElementById('cart-items-list'), tv = document.getElementById('cart-total-val');
  if (!c.length) {
    list.innerHTML = `<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p><button class="btn btn-primary" style="margin-top:16px;" onclick="nav('products');closeCart()">Shop Now</button></div>`;
    if (tv) tv.textContent = '₹0'; return;
  }
  const sum = c.reduce((s, i) => s + i.price * i.qty, 0);
  list.innerHTML = c.map(i => `
    <div class="cart-item">
      <div class="cart-item-img">${i.e}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-price">₹${i.price}${i.unit}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="upQty('${i.id}',-1)">−</button>
          <span class="qty-val">${i.qty}</span>
          <button class="qty-btn" onclick="upQty('${i.id}',1)">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="removeFromCart('${i.id}')">🗑</button>
    </div>`).join('');
  if (tv) tv.textContent = `₹${sum.toFixed(0)}`;
}

const openCart = () => { document.getElementById('cart-overlay').classList.add('open'); document.getElementById('cart-sidebar').classList.add('open'); document.body.style.overflow = 'hidden'; };
const closeCart = () => { document.getElementById('cart-overlay').classList.remove('open'); document.getElementById('cart-sidebar').classList.remove('open'); document.body.style.overflow = ''; };

// ============================================================
//  CHECKOUT PAYMENT MODAL
// ============================================================
let curPayStep = 1, selPayMethod = 'cod', selUPIApp = '';

function openPayModal() {
  const c = getCart();
  if (!c.length) { notif('Your cart is empty 🛒'); return; }
  closeCart(); renderOrderSummary(); goPayStep(1);
  document.getElementById('pay-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePayModal() { document.getElementById('pay-modal').classList.remove('open'); document.body.style.overflow = ''; }

function goPayStep(n) {
  if (n === 2) {
    const fn = document.getElementById('pay-fname').value.trim();
    const ln = document.getElementById('pay-lname').value.trim();
    const ph = document.getElementById('pay-phone').value.trim();
    const ad = document.getElementById('pay-address').value.trim();
    const cy = document.getElementById('pay-city').value.trim();
    const pi = document.getElementById('pay-pin').value.trim();
    if (!fn || !ln || !ph || !ad || !cy || !pi) { notif('Please fill all required fields ⚠️'); return; }
    if (!/^[6-9]\d{9}$/.test(ph)) { notif('Enter valid 10-digit phone number ⚠️'); return; }
    if (!/^\d{6}$/.test(pi)) { notif('Enter valid 6-digit pincode ⚠️'); return; }
  }
  if (n === 3) {
    renderReview();
  }
  curPayStep = n;
  document.querySelectorAll('.pay-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.pay-step').forEach((s, i) => { s.classList.remove('active', 'done'); if (i + 1 === n) s.classList.add('active'); else if (i + 1 < n) s.classList.add('done'); });
  if (n <= 3) document.getElementById('pay-panel-' + n).classList.add('active');
}

function renderOrderSummary() {
  const c = getCart(), sum = c.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('pay-order-summary').innerHTML =
    c.map(i => `<div class="order-item-row"><span>${i.e} ${i.name} × ${i.qty}</span><span>₹${(i.price * i.qty).toFixed(0)}</span></div>`).join('') +
    `<div class="order-item-row"><span>Delivery</span><span style="color:var(--green)">FREE</span></div>
     <div class="order-total-row"><span>Total</span><span style="color:var(--green)">₹${sum.toFixed(0)}</span></div>`;
}

// Payment is COD only — no method selection needed

function renderReview() {
  const c = getCart(), sum = c.reduce((s, i) => s + i.price * i.qty, 0);
  const nm = document.getElementById('pay-fname').value + ' ' + document.getElementById('pay-lname').value;
  const ph = document.getElementById('pay-phone').value;
  const ad = `${document.getElementById('pay-address').value}, ${document.getElementById('pay-city').value} - ${document.getElementById('pay-pin').value}`;
  const total = sum + 20; // COD fee
  document.getElementById('review-content').innerHTML = `
    <div style="background:var(--light-gray);border-radius:12px;padding:16px;margin-bottom:14px;">
      <h4 style="font-size:14px;margin-bottom:8px;">📦 Delivering To</h4>
      <p style="font-size:14px;font-weight:600;">${nm}</p>
      <p style="font-size:13px;color:var(--gray);">${ph}</p>
      <p style="font-size:13px;color:var(--gray);">${ad}</p>
    </div>
    <div style="background:var(--green-light);border:1.5px solid var(--green);border-radius:12px;padding:16px;margin-bottom:14px;">
      <h4 style="font-size:14px;margin-bottom:6px;color:var(--green-dark);">💵 Cash on Delivery</h4>
      <p style="font-size:13px;color:var(--green-dark);">Pay ₹${total.toFixed(0)} in cash when your order arrives. (Incl. ₹20 handling fee)</p>
    </div>
    <div>
      ${c.map(i => `<div class="order-item-row"><span>${i.e} ${i.name} × ${i.qty}</span><span>₹${(i.price * i.qty).toFixed(0)}</span></div>`).join('')}
      <div class="order-item-row"><span>COD Handling Fee</span><span>₹20</span></div>
      <div class="order-total-row"><span>Total to Pay (Cash)</span><span style="color:var(--green)">₹${total.toFixed(0)}</span></div>
    </div>`;
}

async function placeOrder() {
  const btn = document.getElementById('place-order-btn');
  btn.disabled = true; btn.textContent = '⏳ Processing...';
  const c = getCart(), sum = c.reduce((s, i) => s + i.price * i.qty, 0);
  const orderData = {
    customer: {
      name: document.getElementById('pay-fname').value.trim() + ' ' + document.getElementById('pay-lname').value.trim(),
      phone: document.getElementById('pay-phone').value.trim(),
      email: document.getElementById('pay-email').value.trim(),
      address: `${document.getElementById('pay-address').value}, ${document.getElementById('pay-city').value} - ${document.getElementById('pay-pin').value}`,
      notes: document.getElementById('pay-notes').value
    },
    items: c.map(i => ({ productId: i.productId, qty: i.qty })), total: sum + 20, paymentMethod: 'cod'
  };
  try {
    const res = await fetch(`${API_BASE}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
    const result = await res.json();
    btn.disabled = false; btn.textContent = '💵 Confirm & Place Order';
    if (result.success) {
      document.getElementById('final-order-id').textContent = '#' + result.orderId;
      document.querySelectorAll('.pay-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.pay-step').forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
      document.getElementById('pay-panel-success').classList.add('active');
      saveCart([]); updateCart();
    } else { notif('❌ ' + (result.message || 'Order failed. Try again.')); }
  } catch (err) {
    console.error(err);
    btn.disabled = false; btn.textContent = '💵 Confirm & Place Order';
    notif('❌ Server offline. Please try again.');
  }
}

// ============================================================
//  NOTIFICATION
// ============================================================
function notif(msg) { const n = document.getElementById('notification'); n.textContent = msg; n.classList.add('show'); setTimeout(() => n.classList.remove('show'), 3000); }

// ============================================================
//  SUBSCRIPTION
// ============================================================
const DEFAULT_MILK_RATES = { cow: 60, buffalo: 75, organic: 120 };
const DEFAULT_MILK_META = {
  cow: { name: 'Cow Milk', emoji: '🥛' },
  buffalo: { name: 'Buffalo Milk', emoji: '🍼' },
  organic: { name: 'Organic Milk', emoji: '🌿' }
};
const DAYS = { daily: 30, alternate: 15, weekdays: 22, custom: 30 };
let sSched = 'daily', subPayMethod = 'cod', subUPIApp = '';

function findMilkProduct(type) {
  return P.find(p => p.cat === 'milk' && p.name && p.name.toLowerCase().includes(type));
}

function getMilkRate(type) {
  const product = findMilkProduct(type);
  return Number(product && product.price) || DEFAULT_MILK_RATES[type] || DEFAULT_MILK_RATES.cow;
}

function refreshSubscriptionContent() {
  Object.keys(DEFAULT_MILK_META).forEach(type => {
    const option = document.querySelector(`#milk-type option[value="${type}"]`);
    const product = findMilkProduct(type);
    const meta = DEFAULT_MILK_META[type];
    const name = (product && product.name) || meta.name;
    const emoji = (product && product.e) || meta.emoji;
    const unit = (product && product.unit) || '/L';
    const rate = getMilkRate(type);

    if (option) {
      option.textContent = `${emoji} ${name} — ₹${rate}${unit}`;
    }
  });

  document.querySelectorAll('[data-plan-type]').forEach(card => {
    const type = card.dataset.planType;
    const qty = Number(card.dataset.planQty) || 1;
    const product = findMilkProduct(type);
    const name = (product && product.name) || (DEFAULT_MILK_META[type] && DEFAULT_MILK_META[type].name) || 'Milk';
    const monthly = getMilkRate(type) * qty * DAYS.daily;
    const priceEl = card.querySelector('[data-plan-price]');
    const descEl = card.querySelector('[data-plan-desc]');

    if (priceEl) {
      priceEl.innerHTML = `<sup>₹</sup>${monthly.toFixed(0)}<sub>/mo</sub>`;
    }
    if (descEl) {
      descEl.textContent = `${name} · ${qty} ${qty === 1 ? 'Litre' : 'Litres'}/day`;
    }
  });
}

function initSub() {
  const mt = document.getElementById('milk-type'), mq = document.getElementById('milk-qty');
  refreshSubscriptionContent();
  if (mt && !mt.dataset.calcBound) {
    mt.addEventListener('change', calcSub);
    mt.dataset.calcBound = 'true';
  }
  if (mq && !mq.dataset.calcBound) {
    mq.addEventListener('input', calcSub);
    mq.dataset.calcBound = 'true';
  }
  document.querySelectorAll('.schedule-opt').forEach(o => {
    if (o.dataset.calcBound) return;
    o.onclick = () => { document.querySelectorAll('.schedule-opt').forEach(x => x.classList.remove('active')); o.classList.add('active'); sSched = o.dataset.s; calcSub(); };
    o.dataset.calcBound = 'true';
  });
  const t = new Date(); t.setDate(t.getDate() + 1);
  const sd = document.getElementById('sub-start');
  if (sd) { sd.min = t.toISOString().split('T')[0]; sd.value = sd.min; }
  calcSub();
  // Payment is always COD — no listener setup needed
}

function calcSub() {
  const type = document.getElementById('milk-type')?.value || 'cow';
  const qty = parseFloat(document.getElementById('milk-qty')?.value) || 1;
  const rate = getMilkRate(type), days = DAYS[sSched] || 30, sub = qty * days * rate;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('s-rate', `₹${rate}/L`); set('s-qty', `${qty} L/day`); set('s-days', `${days} days`);
  set('s-sub', `₹${sub.toFixed(0)}`); set('s-del', '₹0 (Free)'); set('s-total', `₹${sub.toFixed(0)}`);
}

document.getElementById('sub-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const nm = document.getElementById('sub-name').value.trim();
  const ph = document.getElementById('sub-phone').value.trim();
  const ad = document.getElementById('sub-address').value.trim();
  if (!nm || !ph || !ad) { notif('Please fill all required fields ⚠️'); return; }
  if (!/^[6-9]\d{9}$/.test(ph)) { notif('Enter a valid 10-digit phone number ⚠️'); return; }
  calcSub();
  const total = document.getElementById('s-total').textContent;
  const subData = {
    name: nm, phone: ph, address: ad,
    milkType: document.getElementById('milk-type').value,
    qty: document.getElementById('milk-qty').value,
    schedule: sSched,
    startDate: document.getElementById('sub-start').value,
    notes: document.getElementById('sub-note').value,
    monthlyTotal: total, paymentMethod: 'cod', status: 'active'
  };
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true; btn.textContent = '⏳ Processing...';
  try {
    const res = await fetch(`${API_BASE}/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(subData) });
    const result = await res.json();
    if (result.success) {
      notif(`🎉 Subscription #${result.subscriptionId} confirmed! ${total}/month`);
      e.target.reset(); subPayMethod = 'cod';
      calcSub();
    } else { notif('❌ ' + (result.message || 'Subscription failed.')); }
  } catch (err) { console.error(err); notif('❌ Server offline. Try again.'); }
  btn.disabled = false; btn.textContent = '💵 Confirm Subscription';
});

document.getElementById('contact-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const nm = document.getElementById('c-name').value.trim();
  const em = document.getElementById('c-email').value.trim();
  const sj = document.getElementById('c-subject').value;
  const mg = document.getElementById('c-msg').value.trim();
  if (!nm || !em || !sj || !mg) { notif('Please fill all required fields ⚠️'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { notif('Enter a valid email ⚠️'); return; }
  try {
    const res = await fetch(`${API_BASE}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nm, email: em, phone: document.getElementById('c-phone')?.value || '', subject: sj, message: mg }) });
    const result = await res.json();
    if (result.success) { notif("Message sent! We'll reply soon 💚"); e.target.reset(); }
    else notif('❌ ' + result.message);
  } catch { notif('❌ Server offline. Try again.'); }
});

// ============================================================
//  TESTIMONIAL SLIDER
// ============================================================
(function () {
  const track = document.getElementById('t-track'), dots = document.querySelectorAll('.slider-dot');
  if (!track) return;
  let cur = 0, tot = track.querySelectorAll('.testimonial-slide').length;
  function go(n) { cur = (n + tot) % tot; track.style.transform = `translateX(-${cur * 100}%)`; dots.forEach((d, i) => d.classList.toggle('active', i === cur)); }
  dots.forEach(d => d.addEventListener('click', () => go(parseInt(d.dataset.i))));
  setInterval(() => go(cur + 1), 5000);
})();

// ============================================================
//  FADE IN ANIMATION
// ============================================================
function initFade() {
  const obs = new IntersectionObserver((entries) => { entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), i * 80); obs.unobserve(e.target); } }); }, { threshold: .12 });
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
}

// ============================================================
//  EVENTS
// ============================================================
window.addEventListener('scroll', () => document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20));
document.getElementById('hamburger').addEventListener('click', () => { const m = document.getElementById('mobile-menu'); m.classList.toggle('open'); document.body.style.overflow = m.classList.contains('open') ? 'hidden' : ''; });
document.getElementById('cart-btn').addEventListener('click', openCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
document.getElementById('checkout-btn').addEventListener('click', openPayModal);
document.getElementById('pay-modal').addEventListener('click', function (e) { if (e.target === this) closePayModal(); });

// ============================================================
//  INIT
// ============================================================
Promise.all([loadProducts(), loadContent()])
  .then(() => {
    refreshSubscriptionContent();
    renderCmsUpdates();
    renderGrid('home-grid');
    initTabs('home-tabs', 'home-grid');
    updateCart();
    initFade();
  })
  .catch((err) => {
    console.error(err);
    notif('? Failed to load products. Please refresh.');
  });
