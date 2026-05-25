const COD_HANDLING_FEE = 1;
const DEFAULT_CITY = 'Navi Mumbai';
const DEFAULT_ORDER_BUTTON_LABEL = '💵 Confirm & Place Order';
const DEFAULT_SUBSCRIPTION_BUTTON_LABEL = '💵 Confirm Subscription';

function isMongoId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || ''));
}

function productImg(product, size) {
  const height = size === 'detail' ? '320px' : '170px';
  const emojiSize = size === 'detail' ? '110px' : '76px';

  if (product.img) {
    return `
      <img src="${product.img}" alt="${product.name}"
        style="width:100%;height:${height};object-fit:contain;padding:10px;display:block;"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="display:none;width:100%;height:${height};font-size:${emojiSize};align-items:center;justify-content:center;">${product.e}</div>`;
  }

  return `<div style="width:100%;height:${height};font-size:${emojiSize};display:flex;align-items:center;justify-content:center;">${product.e}</div>`;
}

function card(product) {
  return `
<div class="product-card fade-in" data-cat="${product.cat}">
  <div class="product-img" onclick="detail('${product.id}')" style="padding:0;overflow:hidden;background:#f0fdf4;position:relative;cursor:pointer;">
    ${product.badge ? `<span class="product-badge" style="position:absolute;top:10px;left:10px;z-index:2;">${product.badge}</span>` : ''}
    ${productImg(product, 'card')}
  </div>
  <div class="product-info">
    <div class="product-cat">${product.cat}</div>
    <div class="product-name" onclick="detail('${product.id}')" style="cursor:pointer;">${product.name}</div>
    <div class="product-desc">${product.desc}</div>
    <div class="product-footer">
      <div class="product-price">₹${product.price}<span>${product.unit}</span></div>
      <button class="add-cart-btn" onclick="addToCart({id:'${product.id}',productId:'${product.productId}',name:'${product.name}',price:${product.price},e:'${product.e}',unit:'${product.unit}'})">+</button>
    </div>
  </div>
</div>`;
}

function renderGrid(gridId, filter) {
  const list = !filter || filter === 'all' ? P : P.filter(product => product.cat === filter);
  const grid = document.getElementById(gridId);

  if (!grid) return;

  if (!list.length) {
    grid.innerHTML = `
      <div class="why-card" style="grid-column:1 / -1;text-align:center;">
        <div class="why-icon" style="margin:0 auto 18px;">📦</div>
        <h3>No products available</h3>
        <p>We are updating the catalog right now. Please check back in a moment.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map(card).join('');
  initFade();
}

function nav(page, cat, closeMob) {
  const targetPage = document.getElementById(`page-${page}`);
  if (!targetPage) return false;

  document.querySelectorAll('.page').forEach(panel => panel.classList.remove('active'));
  targetPage.classList.add('active');

  document.querySelectorAll('.nl').forEach(link => {
    link.classList.toggle('active', link.dataset.p === page);
  });

  if (closeMob) {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (page === 'home') {
    renderGrid('home-grid');
    initTabs('home-tabs', 'home-grid');
  }

  if (page === 'products') {
    renderGrid('prod-grid', cat || 'all');
    initTabs('prod-tabs', 'prod-grid');

    if (cat) {
      window.setTimeout(() => {
        const tab = document.querySelector(`#prod-tabs [data-cat="${cat}"]`);
        if (!tab) return;

        document.querySelectorAll('#prod-tabs .filter-tab').forEach(item => item.classList.remove('active'));
        tab.classList.add('active');
        renderGrid('prod-grid', cat);
      }, 50);
    }
  }

  if (page === 'subscription') {
    initSub();
  }

  if (page === 'account') {
    initAccount();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  initFade();
  return false;
}

function initTabs(tabsId, gridId) {
  document.querySelectorAll(`#${tabsId} .filter-tab`).forEach(tab => {
    tab.onclick = function () {
      document.querySelectorAll(`#${tabsId} .filter-tab`).forEach(item => item.classList.remove('active'));
      tab.classList.add('active');
      renderGrid(gridId, tab.dataset.cat);
    };
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
    const imageUrl = contentImageUrl(item);
    return `
      <div class="why-card fade-in" style="overflow:hidden;">
        ${imageUrl ? `<img src="${imageUrl}" alt="${item.title || item.key}" style="width:100%;height:180px;object-fit:cover;border-radius:14px;margin-bottom:18px;" onerror="this.style.display='none';">` : ''}
        <div class="tag" style="display:inline-flex;margin-bottom:12px;">${item.type}</div>
        <h3>${item.title || item.key}</h3>
        <p>${item.value || 'Published from the admin dashboard.'}</p>
      </div>`;
  }).join('');

  section.style.display = '';
  initFade();
}

let dQty = 1;

function detail(id) {
  const product = P.find(item => item.id === id);
  if (!product) return;

  dQty = 1;
  document.getElementById('bc-name').textContent = product.name;

  const nutritionRows = Array.isArray(product.nut) && product.nut.length
    ? product.nut.map(([name, value]) => `<tr><td>${name}</td><td><strong>${value}</strong></td></tr>`).join('')
    : '<tr><td colspan="2"><strong>Nutrition details will be added soon.</strong></td></tr>';

  document.getElementById('detail-grid').innerHTML = `
    <div>
      <div style="background:#f0fdf4;border-radius:16px;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:300px;">
        ${productImg(product, 'detail')}
      </div>
      <div class="product-thumbs" style="margin-top:12px;">
        <div class="thumb active" style="background:#f0fdf4;overflow:hidden;display:flex;align-items:center;justify-content:center;">
          ${product.img ? `<img src="${product.img}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none';">` : product.e}
        </div>
        <div class="thumb">🌾</div>
        <div class="thumb">✅</div>
        <div class="thumb">🚚</div>
      </div>
    </div>
    <div>
      <div class="prod-cat">${product.cat}</div>
      <h1 style="font-size:32px;margin-bottom:12px;">${product.name}</h1>
      <div class="prod-price">₹${product.price} <span>${product.unit}</span></div>
      <p class="prod-desc">${product.desc}</p>
      <h4 style="font-size:15px;margin-bottom:12px;font-weight:700;">Nutrition Information</h4>
      <table class="nutrition-table"><thead><tr><th>Nutrient</th><th>Amount</th></tr></thead><tbody>${nutritionRows}</tbody></table>
      <div class="qty-selector">
        <label>Quantity:</label>
        <div class="qty-control">
          <button onclick="dQty=Math.max(1,dQty-1);document.getElementById('dq').textContent=dQty">−</button>
          <span class="qty-num" id="dq">1</span>
          <button onclick="dQty++;document.getElementById('dq').textContent=dQty">+</button>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" onclick="for(let i=0;i<dQty;i++)addToCart({id:'${product.id}',productId:'${product.productId}',name:'${product.name}',price:${product.price},e:'${product.e}',unit:'${product.unit}'})">🛒 Add to Cart</button>
        <button class="btn btn-outline" onclick="nav('subscription')">📦 Subscribe Daily</button>
      </div>
      <div style="display:flex;gap:20px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border);flex-wrap:wrap;">
        <span style="font-size:13px;color:var(--gray);">✅ Farm Fresh</span>
        <span style="font-size:13px;color:var(--gray);">🚚 Free Delivery ₹200+</span>
        <span style="font-size:13px;color:var(--gray);">🔄 Easy Returns</span>
      </div>
    </div>`;

  const related = P.filter(item => item.cat === product.cat && item.id !== product.id).slice(0, 4);
  document.getElementById('related-grid').innerHTML = related.map(card).join('');
  nav('detail');
}

const getCart = () => DB.get('cart');
const saveCart = cart => DB.set('cart', cart);

function syncCartWithCatalog() {
  const cart = getCart();
  if (!cart.length) return;

  const productByRef = new Map();
  P.forEach(product => {
    if (product.productId) productByRef.set(product.productId, product);
    if (product.id) productByRef.set(product.id, product);
  });

  let changed = false;
  const nextCart = cart.flatMap(item => {
    const product = productByRef.get(item.productId) || productByRef.get(item.id);
    if (!product) {
      changed = true;
      return [];
    }

    const nextItem = {
      ...item,
      id: product.id,
      productId: product.productId,
      name: product.name,
      price: product.price,
      e: product.e,
      unit: product.unit
    };

    if (
      nextItem.id !== item.id ||
      nextItem.productId !== item.productId ||
      nextItem.name !== item.name ||
      nextItem.price !== item.price ||
      nextItem.e !== item.e ||
      nextItem.unit !== item.unit
    ) {
      changed = true;
    }

    return [nextItem];
  });

  if (changed) {
    saveCart(nextCart);
  }
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(cartItem => cartItem.id === item.id);

  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });

  saveCart(cart);
  updateCart();
  notif(`${item.name} added to cart! ✅`);
}

function removeFromCart(id) {
  saveCart(getCart().filter(item => item.id !== id));
  updateCart();
}

function upQty(id, delta) {
  const cart = getCart();
  const item = cart.find(entry => entry.id === id);

  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    saveCart(cart);
  }

  updateCart();
}

function updateCart() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const desktopCount = document.getElementById('cart-count');
  const mobileCount = document.getElementById('mobile-cart-count');

  if (desktopCount) {
    desktopCount.textContent = totalItems;
    desktopCount.classList.toggle('show', totalItems > 0);
  }

  if (mobileCount) {
    mobileCount.textContent = totalItems;
  }

  renderCart();
}

function renderCart() {
  const cart = getCart();
  const list = document.getElementById('cart-items-list');
  const totalValue = document.getElementById('cart-total-val');

  if (!list || !totalValue) return;

  if (!cart.length) {
    list.innerHTML = `<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p><button class="btn btn-primary" style="margin-top:16px;" onclick="nav('products');closeCart()">Shop Now</button></div>`;
    totalValue.textContent = '₹0';
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.e}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price}${item.unit}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="upQty('${item.id}',-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="upQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="removeFromCart('${item.id}')">🗑</button>
    </div>`).join('');

  totalValue.textContent = `₹${subtotal.toFixed(0)}`;
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-sidebar').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-sidebar').classList.remove('open');
  document.body.style.overflow = '';
}

function setAreaOptions(selectId, options, placeholder) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const selectedValue = select.value;
  const defaultLabel = placeholder || 'Select Area';
  const defaultOption = `<option value="" disabled selected>${defaultLabel}</option>`;
  select.innerHTML = defaultOption + options.map(option => `<option value="${option.value}">${option.label}</option>`).join('');

  if (selectedValue && options.some(option => option.value === selectedValue)) {
    select.value = selectedValue;
  }
}

function getSelectedArea(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return { value: '', name: '' };

  const option = select.options[select.selectedIndex];
  return {
    value: select.value || '',
    name: option && option.value ? option.text.trim() : ''
  };
}

function getFallbackAreaOptions() {
  return getAllServiceableAreas()
    .slice()
    .sort((a, b) => a.area.localeCompare(b.area))
    .map(area => ({
      value: area.pincode,
      label: `${area.area}, ${area.city} (${area.pincode})`
    }));
}

async function fetchAreas() {
  try {
    const response = await fetch(`${API_BASE}/areas`);
    const result = await response.json();

    if (!response.ok || !result.success || !Array.isArray(result.data) || !result.data.length) {
      throw new Error(result.message || 'No active areas available');
    }

    const options = result.data.map(area => ({
      value: area._id,
      label: area.name
    }));

    setAreaOptions('pay-area', options, 'Select Area');
    setAreaOptions('sub-area', options, 'Select Area');
  } catch (err) {
    console.warn('Falling back to static delivery areas:', err.message);
    const fallbackOptions = getFallbackAreaOptions();
    setAreaOptions('pay-area', fallbackOptions, 'Select Area');
    setAreaOptions('sub-area', fallbackOptions, 'Select Area');
  }
}

function buildCheckoutAddress() {
  const addressLine = document.getElementById('pay-address')?.value.trim() || '';
  const city = document.getElementById('pay-city')?.value.trim() || DEFAULT_CITY;
  const area = getSelectedArea('pay-area');
  return [addressLine, area.name || city, area.name ? '' : city].filter(Boolean).join(', ');
}

function buildSubscriptionAddress() {
  const addressLine = document.getElementById('sub-address')?.value.trim() || '';
  const area = getSelectedArea('sub-area');
  return [addressLine, area.name || DEFAULT_CITY].filter(Boolean).join(', ');
}

let curPayStep = 1;

function resetCheckoutState() {
  curPayStep = 1;

  document.querySelectorAll('.pay-step').forEach((step, index) => {
    step.classList.remove('active', 'done');
    if (index === 0) step.classList.add('active');
  });

  document.querySelectorAll('.pay-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById('pay-panel-1').classList.add('active');

  const placeOrderButton = document.getElementById('place-order-btn');
  if (placeOrderButton) {
    placeOrderButton.disabled = false;
    placeOrderButton.textContent = DEFAULT_ORDER_BUTTON_LABEL;
  }
}

function openPayModal() {
  const cart = getCart();
  if (!cart.length) {
    notif('Your cart is empty 🛒');
    return;
  }

  closeCart();
  renderOrderSummary();
  resetCheckoutState();
  fetchAreas();
  document.getElementById('pay-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePayModal() {
  document.getElementById('pay-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function goPayStep(stepNumber) {
  if (stepNumber === 2) {
    const firstName = document.getElementById('pay-fname').value.trim();
    const lastName = document.getElementById('pay-lname').value.trim();
    const phone = document.getElementById('pay-phone').value.trim();
    const address = document.getElementById('pay-address').value.trim();
    const area = getSelectedArea('pay-area');

    if (!firstName || !lastName || !phone || !address || !area.value) {
      notif('Please fill all required fields ⚠️');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      notif('Enter a valid 10-digit phone number ⚠️');
      return;
    }
  }

  if (stepNumber === 3) {
    renderReview();
  }

  curPayStep = stepNumber;
  document.querySelectorAll('.pay-panel').forEach(panel => panel.classList.remove('active'));
  document.querySelectorAll('.pay-step').forEach((step, index) => {
    step.classList.remove('active', 'done');
    if (index + 1 === stepNumber) step.classList.add('active');
    else if (index + 1 < stepNumber) step.classList.add('done');
  });

  if (stepNumber <= 3) {
    document.getElementById(`pay-panel-${stepNumber}`).classList.add('active');
  }
}

function renderOrderSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById('pay-order-summary').innerHTML =
    cart.map(item => `<div class="order-item-row"><span>${item.e} ${item.name} × ${item.qty}</span><span>₹${(item.price * item.qty).toFixed(0)}</span></div>`).join('') +
    `<div class="order-item-row"><span>Delivery</span><span style="color:var(--green)">FREE</span></div>
     <div class="order-total-row"><span>Subtotal</span><span style="color:var(--green)">₹${subtotal.toFixed(0)}</span></div>`;
}

function renderReview() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + COD_HANDLING_FEE;
  const fullName = `${document.getElementById('pay-fname').value.trim()} ${document.getElementById('pay-lname').value.trim()}`.trim();
  const phone = document.getElementById('pay-phone').value.trim();

  document.getElementById('review-content').innerHTML = `
    <div style="background:var(--light-gray);border-radius:12px;padding:16px;margin-bottom:14px;">
      <h4 style="font-size:14px;margin-bottom:8px;">📦 Delivering To</h4>
      <p style="font-size:14px;font-weight:600;">${fullName}</p>
      <p style="font-size:13px;color:var(--gray);">${phone}</p>
      <p style="font-size:13px;color:var(--gray);">${buildCheckoutAddress()}</p>
    </div>
    <div style="background:var(--green-light);border:1.5px solid var(--green);border-radius:12px;padding:16px;margin-bottom:14px;">
      <h4 style="font-size:14px;margin-bottom:6px;color:var(--green-dark);">💵 Cash on Delivery</h4>
      <p style="font-size:13px;color:var(--green-dark);">Pay ₹${total.toFixed(0)} in cash when your order arrives. (Incl. ₹${COD_HANDLING_FEE} handling fee)</p>
    </div>
    <div>
      ${cart.map(item => `<div class="order-item-row"><span>${item.e} ${item.name} × ${item.qty}</span><span>₹${(item.price * item.qty).toFixed(0)}</span></div>`).join('')}
      <div class="order-item-row"><span>COD Handling Fee</span><span>₹${COD_HANDLING_FEE}</span></div>
      <div class="order-total-row"><span>Total to Pay (Cash)</span><span style="color:var(--green)">₹${total.toFixed(0)}</span></div>
    </div>`;
}

async function placeOrder() {
  const placeOrderButton = document.getElementById('place-order-btn');
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const area = getSelectedArea('pay-area');

  if (!cart.length) {
    notif('Your cart is empty 🛒');
    return;
  }

  if (!area.value) {
    notif('Please select a delivery area ⚠️');
    return;
  }

  placeOrderButton.disabled = true;
  placeOrderButton.textContent = '⏳ Processing...';

  const orderData = {
    customer: {
      name: `${document.getElementById('pay-fname').value.trim()} ${document.getElementById('pay-lname').value.trim()}`.trim(),
      phone: document.getElementById('pay-phone').value.trim(),
      email: document.getElementById('pay-email').value.trim(),
      address: buildCheckoutAddress(),
      notes: document.getElementById('pay-notes').value.trim()
    },
    area_id: isMongoId(area.value) ? area.value : undefined,
    items: cart.map(item => ({ productId: item.productId || item.id, qty: item.qty })),
    total: subtotal + COD_HANDLING_FEE,
    paymentMethod: 'cod'
  };

  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Order failed. Please try again.');
    }

    document.getElementById('final-order-id').textContent = `#${result.orderId}`;
    document.querySelectorAll('.pay-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.pay-step').forEach(step => {
      step.classList.remove('active');
      step.classList.add('done');
    });
    document.getElementById('pay-panel-success').classList.add('active');
    saveCart([]);
    updateCart();
  } catch (err) {
    console.error(err);
    notif(`❌ ${err.message || 'Server offline. Please try again.'}`);
  } finally {
    placeOrderButton.disabled = false;
    placeOrderButton.textContent = DEFAULT_ORDER_BUTTON_LABEL;
  }
}

function notif(message) {
  const notification = document.getElementById('notification');
  if (!notification) return;

  notification.textContent = message;
  notification.classList.add('show');
  window.setTimeout(() => notification.classList.remove('show'), 3000);
}

const DEFAULT_MILK_RATES = { cow: 60, buffalo: 75, organic: 120 };
const DEFAULT_MILK_META = {
  cow: { name: 'Cow Milk', emoji: '🥛' },
  buffalo: { name: 'Buffalo Milk', emoji: '🍼' },
  organic: { name: 'Organic Milk', emoji: '🌿' }
};
const DAYS = { daily: 30, alternate: 15, weekdays: 22, custom: 30 };
let sSched = 'daily';

function findMilkProduct(type) {
  return P.find(product => product.cat === 'milk' && product.name && product.name.toLowerCase().includes(type));
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

  document.querySelectorAll('[data-plan-type]').forEach(cardEl => {
    const type = cardEl.dataset.planType;
    const qty = Number(cardEl.dataset.planQty) || 1;
    const product = findMilkProduct(type);
    const name = (product && product.name) || (DEFAULT_MILK_META[type] && DEFAULT_MILK_META[type].name) || 'Milk';
    const monthly = getMilkRate(type) * qty * DAYS.daily;
    const priceEl = cardEl.querySelector('[data-plan-price]');
    const descEl = cardEl.querySelector('[data-plan-desc]');

    if (priceEl) {
      priceEl.innerHTML = `<sup>₹</sup>${monthly.toFixed(0)}<sub>/mo</sub>`;
    }

    if (descEl) {
      descEl.textContent = `${name} · ${qty} ${qty === 1 ? 'Litre' : 'Litres'}/day`;
    }
  });
}

function setDefaultSubscriptionDate() {
  const startDateInput = document.getElementById('sub-start');
  if (!startDateInput) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  startDateInput.min = minDate;
  if (!startDateInput.value || startDateInput.value < minDate) {
    startDateInput.value = minDate;
  }
}

function setSchedule(schedule) {
  sSched = schedule;
  document.querySelectorAll('.schedule-opt').forEach(option => {
    option.classList.toggle('active', option.dataset.s === schedule);
  });
  calcSub();
}

function resetSubscriptionForm(form) {
  if (form) form.reset();
  setSchedule('daily');
  setDefaultSubscriptionDate();
  fetchAreas();
  calcSub();
}

function initSub() {
  const milkType = document.getElementById('milk-type');
  const milkQty = document.getElementById('milk-qty');

  refreshSubscriptionContent();
  fetchAreas();
  setDefaultSubscriptionDate();

  if (milkType && !milkType.dataset.calcBound) {
    milkType.addEventListener('change', calcSub);
    milkType.dataset.calcBound = 'true';
  }

  if (milkQty && !milkQty.dataset.calcBound) {
    milkQty.addEventListener('input', calcSub);
    milkQty.dataset.calcBound = 'true';
  }

  document.querySelectorAll('.schedule-opt').forEach(option => {
    if (option.dataset.calcBound) return;
    option.addEventListener('click', () => setSchedule(option.dataset.s));
    option.dataset.calcBound = 'true';
  });

  if (!document.querySelector('.schedule-opt.active')) {
    setSchedule('daily');
  } else {
    sSched = document.querySelector('.schedule-opt.active').dataset.s;
    calcSub();
  }
}

function calcSub() {
  const type = document.getElementById('milk-type')?.value || 'cow';
  const qty = parseFloat(document.getElementById('milk-qty')?.value) || 1;
  const rate = getMilkRate(type);
  const days = DAYS[sSched] || DAYS.daily;
  const subtotal = qty * days * rate;
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  setText('s-rate', `₹${rate}/L`);
  setText('s-qty', `${qty} L/day`);
  setText('s-days', `${days} days`);
  setText('s-sub', `₹${subtotal.toFixed(0)}`);
  setText('s-del', '₹0 (Free)');
  setText('s-total', `₹${subtotal.toFixed(0)}`);
}

document.getElementById('sub-form')?.addEventListener('submit', async event => {
  event.preventDefault();

  const name = document.getElementById('sub-name').value.trim();
  const phone = document.getElementById('sub-phone').value.trim();
  const address = document.getElementById('sub-address').value.trim();
  const area = getSelectedArea('sub-area');

  if (!name || !phone || !address || !area.value) {
    notif('Please fill all required fields ⚠️');
    return;
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    notif('Enter a valid 10-digit phone number ⚠️');
    return;
  }

  calcSub();

  const total = document.getElementById('s-total').textContent;
  const submitButton = event.target.querySelector('button[type=submit]');
  const subscriptionData = {
    name,
    phone,
    address: buildSubscriptionAddress(),
    area_id: isMongoId(area.value) ? area.value : undefined,
    milkType: document.getElementById('milk-type').value,
    qty: document.getElementById('milk-qty').value,
    schedule: sSched,
    startDate: document.getElementById('sub-start').value,
    notes: document.getElementById('sub-note').value.trim(),
    monthlyTotal: total,
    paymentMethod: 'cod',
    status: 'active'
  };

  submitButton.disabled = true;
  submitButton.textContent = '⏳ Processing...';

  try {
    const response = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData)
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Subscription failed.');
    }

    notif(`🎉 Subscription #${result.subscriptionId} confirmed! ${total}/month`);
    resetSubscriptionForm(event.target);
  } catch (err) {
    console.error(err);
    notif(`❌ ${err.message || 'Server offline. Try again.'}`);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = DEFAULT_SUBSCRIPTION_BUTTON_LABEL;
  }
});

document.getElementById('contact-form')?.addEventListener('submit', async event => {
  event.preventDefault();

  const name = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const subject = document.getElementById('c-subject').value;
  const message = document.getElementById('c-msg').value.trim();

  if (!name || !email || !subject || !message) {
    notif('Please fill all required fields ⚠️');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    notif('Enter a valid email ⚠️');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone: document.getElementById('c-phone')?.value || '',
        subject,
        message
      })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Message failed to send.');
    }

    notif("Message sent! We'll reply soon 💚");
    event.target.reset();
  } catch (err) {
    console.error(err);
    notif(`❌ ${err.message || 'Server offline. Try again.'}`);
  }
});

(function () {
  const track = document.getElementById('t-track');
  const dots = document.querySelectorAll('.slider-dot');
  if (!track) return;

  let current = 0;
  const total = track.querySelectorAll('.testimonial-slide').length;

  function go(nextIndex) {
    current = (nextIndex + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, index) => dot.classList.toggle('active', index === current));
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => go(parseInt(dot.dataset.i, 10)));
  });

  window.setInterval(() => go(current + 1), 5000);
})();

function initFade() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      window.setTimeout(() => entry.target.classList.add('visible'), index * 80);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in:not(.visible)').forEach(element => observer.observe(element));
}

function checkDeliveryPincode() {
  const input = document.getElementById('hero-pincode');
  const resultBox = document.getElementById('pincode-result');
  if (!input || !resultBox) return;

  const pin = input.value.trim();

  if (!pin || !/^\d{6}$/.test(pin)) {
    resultBox.className = 'pincode-result error show';
    resultBox.innerHTML = '⚠️ Please enter a valid 6-digit pincode';
    return;
  }

  if (isDeliveryAvailable(pin)) {
    const area = getDeliveryAreaName(pin);
    resultBox.className = 'pincode-result success show';
    resultBox.innerHTML = `✅ Great news! We deliver to <strong>${area}</strong>.`;
    return;
  }

  resultBox.className = 'pincode-result error show';
  resultBox.innerHTML = `😔 Sorry, we do not deliver to pincode <strong>${pin}</strong> yet. We currently serve <strong>${DELIVERY_ZONES.businessArea}</strong>.`;
}

function showNotServiceableModal(pincode) {
  const modal = document.getElementById('not-serviceable-modal');
  if (!modal) return;

  const areasHtml = getAllServiceableAreas().map(area =>
    `<div class="ns-area-chip"><span class="ns-pin">${area.pincode}</span> ${area.area}</div>`
  ).join('');

  document.getElementById('ns-pincode').textContent = pincode;
  document.getElementById('ns-areas-list').innerHTML = areasHtml;
  document.getElementById('ns-business-area').textContent = DELIVERY_ZONES.businessArea;
  document.getElementById('ns-whatsapp-link').href = `https://wa.me/${DELIVERY_ZONES.contactWhatsApp}?text=Hi%20${encodeURIComponent(DELIVERY_ZONES.businessName)},%20I%20want%20delivery%20in%20pincode%20${pincode}.%20When%20will%20you%20start%20delivering%20here?`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeNotServiceableModal() {
  const modal = document.getElementById('not-serviceable-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
});

document.getElementById('hamburger')?.addEventListener('click', () => {
  const mobileMenu = document.getElementById('mobile-menu');
  if (!mobileMenu) return;

  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

document.getElementById('cart-btn')?.addEventListener('click', openCart);
document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
document.getElementById('cart-close')?.addEventListener('click', closeCart);
document.getElementById('checkout-btn')?.addEventListener('click', openPayModal);
document.getElementById('pay-modal')?.addEventListener('click', function (event) {
  if (event.target === this) closePayModal();
});

document.getElementById('not-serviceable-modal')?.addEventListener('click', function (event) {
  if (event.target === this) closeNotServiceableModal();
});

document.getElementById('hero-pincode')?.addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '').slice(0, 6);
});

document.getElementById('hero-pincode')?.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    checkDeliveryPincode();
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;

  const notServiceableModal = document.getElementById('not-serviceable-modal');
  const payModal = document.getElementById('pay-modal');
  const cartSidebar = document.getElementById('cart-sidebar');

  if (notServiceableModal?.classList.contains('open')) {
    closeNotServiceableModal();
    return;
  }

  if (payModal?.classList.contains('open')) {
    closePayModal();
    return;
  }

  if (cartSidebar?.classList.contains('open')) {
    closeCart();
  }
});

// ============================================================
//  MY ACCOUNT / CUSTOMER PORTAL
// ============================================================
function initAccount() {
  const savedPhone = localStorage.getItem('mq_customer_phone');
  const emptySec = document.getElementById('account-empty-state');
  const mainSec = document.getElementById('account-main-content');

  if (savedPhone) {
    if (emptySec) emptySec.style.display = 'none';
    if (mainSec) mainSec.style.display = 'block';
    showAccountDashboard(savedPhone);
  } else {
    if (emptySec) emptySec.style.display = 'block';
    if (mainSec) mainSec.style.display = 'none';
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.add('open');
  }
}

// Global Auth Handlers
function showAuthStep(step) {
  const step1 = document.getElementById('auth-step-1');
  const step2 = document.getElementById('auth-step-2');
  if (step1) step1.style.display = step === 1 ? 'block' : 'none';
  if (step2) step2.style.display = step === 2 ? 'block' : 'none';
}

document.getElementById('auth-phone-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const phoneInput = document.getElementById('auth-phone-input');
  if (!phoneInput) return;
  const phone = phoneInput.value.trim();
  const btn = e.target.querySelector('button');
  if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }

  localStorage.setItem('mq_customer_phone', phone);
  const authModal = document.getElementById('auth-modal');
  if (authModal) authModal.classList.remove('open');
  notif('🎉 Welcome!');

  const subPhone = document.getElementById('sub-phone');
  if (subPhone) subPhone.value = phone;
  const payPhone = document.getElementById('pay-phone');
  if (payPhone) payPhone.value = phone;

  const accPage = document.getElementById('page-account');
  if (accPage && accPage.classList.contains('active')) {
    initAccount();
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Login →'; }
});

document.getElementById('auth-otp-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const phoneInput = document.getElementById('auth-phone-input');
  const otpInput = document.getElementById('auth-otp-input');
  if (!phoneInput || !otpInput) return;
  const phone = phoneInput.value.trim();
  const code = otpInput.value.trim();
  const btn = e.target.querySelector('button');
  if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }

  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('mq_customer_phone', phone);
      const authModal = document.getElementById('auth-modal');
      if (authModal) authModal.classList.remove('open');
      notif('🎉 Welcome back!');
      
      // Auto-fill phone in other forms
      const subPhone = document.getElementById('sub-phone');
      if (subPhone) subPhone.value = phone;
      const payPhone = document.getElementById('pay-phone');
      if (payPhone) payPhone.value = phone;

      // If they are on account page, refresh it
      const accPage = document.getElementById('page-account');
      if (accPage && accPage.classList.contains('active')) {
        initAccount();
      }
    } else {
      notif('❌ ' + data.message);
    }
  } catch (e) {
    notif('❌ Verification failed.');
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Verify & Enter'; }
});

function logoutCustomer() {
  localStorage.removeItem('mq_customer_phone');
  location.reload(); 
}

async function showAccountDashboard(phone) {
  const emptySec = document.getElementById('account-empty-state');
  const mainSec = document.getElementById('account-main-content');
  if (emptySec) emptySec.style.display = 'none';
  if (mainSec) mainSec.style.display = 'block';
  
  const phEl = document.getElementById('acc-customer-phone');
  if (phEl) phEl.textContent = '📞 ' + phone;
  
  fetchCustomerData(phone);
}

async function fetchCustomerData(phone) {
  const ordersList = document.getElementById('acc-orders-list');
  const subsList = document.getElementById('acc-subs-list');

  try {
    // Fetch Orders
    const oRes = await fetch(`${API_BASE}/orders/customer/${phone}`);
    const oData = await oRes.json();
    
    if (oData.success && oData.orders.length > 0) {
      const nameEl = document.getElementById('acc-customer-name');
      if (nameEl) nameEl.textContent = oData.orders[0].customer.name.split(' ')[0];
      if (ordersList) {
        ordersList.innerHTML = oData.orders.map(o => `
          <div class="acc-order-item" style="display:flex; justify-content:space-between; align-items:center; padding:16px; border-bottom:1px solid var(--border); transition:0.3s;">
            <div>
              <div style="font-weight:700; margin-bottom:4px;">Order #${o.orderId.split('-').pop()}</div>
              <div style="font-size:12px; color:#6b7280;">${new Date(o.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})} · ₹${o.total}</div>
            </div>
            <div class="badge" style="background:${getStatusColor(o.status)}15; color:${getStatusColor(o.status)}; border:1px solid ${getStatusColor(o.status)}44; font-size:11px; text-transform:capitalize; padding:4px 8px; border-radius:100px;">${o.status.replace(/_/g, ' ')}</div>
          </div>
        `).join('');
      }
    } else if (ordersList) {
      ordersList.innerHTML = '<div class="empty-state" style="padding:40px; text-align:center; color:#6b7280;">No orders found yet. <br><button class="btn btn-primary btn-sm" style="margin-top:12px;" onclick="nav(\'products\')">Shop Now</button></div>';
    }

    // Fetch Subscriptions
    const sRes = await fetch(`${API_BASE}/subscriptions/customer/${phone}`);
    const sData = await sRes.json();

    if (sData.success && sData.subscriptions.length > 0) {
      if (subsList) {
        subsList.innerHTML = sData.subscriptions.map(s => `
          <div class="acc-sub-card" style="background:white; border:1px solid #e5e7eb; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.05); margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:center;">
              <strong style="text-transform:capitalize;">${s.milkType} Milk</strong>
              <span class="badge" style="background:${s.status === 'active' ? '#22c55e' : '#6b7280'}15; color:${s.status === 'active' ? '#16a34a' : '#6b7280'}; padding:4px 8px; border-radius:100px; font-size:11px; font-weight:700;">${s.status.toUpperCase()}</span>
            </div>
            <div style="font-size:13px; color:#6b7280; margin-bottom:16px;">
              ${s.qty}L delivered ${s.schedule}<br>
              Monthly Total: ${s.monthlyTotal}
            </div>
            <button class="btn ${s.status === 'active' ? 'btn-outline' : 'btn-primary'} btn-sm" 
              onclick="updateSubStatus('${s.subscriptionId}', '${s.phone}', '${s.status === 'active' ? 'paused' : 'active'}')"
              style="width:100%; justify-content:center; padding:8px; font-size:13px;">
              ${s.status === 'active' ? '⏸ Pause Subscription' : '▶️ Resume Delivery'}
            </button>
          </div>
        `).join('');
      }
    } else if (subsList) {
      subsList.innerHTML = '<div class="empty-state" style="padding:20px; text-align:center; color:#6b7280; font-size:13px;">No active subscriptions. <br><button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="nav(\'subscription\')">Subscribe Now</button></div>';
    }

  } catch (e) {
    console.error('Account data fetch error', e);
  }
}

async function updateSubStatus(subscriptionId, phone, newStatus) {
  if (!confirm(`Are you sure you want to ${newStatus === 'paused' ? 'pause' : 'resume'} your milk delivery?`)) return;
  try {
    const res = await fetch(`${API_BASE}/subscriptions/status-customer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, phone, status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      notif(`✅ Subscription ${newStatus === 'paused' ? 'paused' : 'resumed'}!`);
      fetchCustomerData(phone);
    } else {
      notif('❌ ' + data.message);
    }
  } catch (e) {
    notif('❌ Failed to update subscription.');
  }
}

function getStatusColor(s) {
  const colors = {
    pending: '#f59e0b',
    confirmed: '#2563eb',
    assigned: '#8b5cf6',
    out_for_delivery: '#10b981',
    delivered: '#16a34a',
    failed: '#ef4444',
    cancelled: '#64748b'
  };
  return colors[s] || '#64748b';
}

// Initial Startup
Promise.all([loadProducts(), loadContent()])
  .then(() => {
    renderCmsUpdates();
    renderGrid('home-grid');
    initTabs('home-tabs', 'home-grid');
    syncCartWithCatalog();
    updateCart();
    initSub();
    initFade();
    
    // Auth Check after data loads
    const phone = localStorage.getItem('mq_customer_phone');
    const authModal = document.getElementById('auth-modal');
    if (!phone && authModal) {
      authModal.classList.add('open');
    } else if (phone) {
      const sp = document.getElementById('sub-phone'); if(sp) sp.value = phone;
      const pp = document.getElementById('pay-phone'); if(pp) pp.value = phone;
    }
  })
  .catch(err => {
    console.error(err);
    notif('Failed to load products. Please refresh.');
  });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      console.warn('Service worker registration failed:', err);
    });
  });
}

