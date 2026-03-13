// =============================================================
//  MILQU FRESH — FRONTEND API CONNECTOR
//  Add this to the TOP of your script.js
//  Replace the DB.push() calls with these fetch() functions
// =============================================================

const API_BASE = 'http://localhost:5000/api'; // Change to your deployed server URL in production

// ── Place Order  (replaces DB.push('orders', order) in placeOrder())
async function saveOrderToServer(orderData) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return await response.json();
}

// ── Save Subscription  (replaces DB.push('subscriptions', ...) in sub-form submit)
async function saveSubscriptionToServer(subData) {
  const response = await fetch(`${API_BASE}/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subData)
  });
  return await response.json();
}

// ── Save Contact Message  (replaces DB.push('messages', ...) in contact-form submit)
async function saveMessageToServer(msgData) {
  const response = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msgData)
  });
  return await response.json();
}


// =============================================================
//  REPLACE your existing placeOrder() function with this:
// =============================================================

async function placeOrder() {
  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Processing...';

  const c   = getCart();
  const sum = c.reduce((s, i) => s + i.price * i.qty, 0);

  const orderData = {
    customer: {
      name:    document.getElementById('pay-fname').value + ' ' + document.getElementById('pay-lname').value,
      phone:   document.getElementById('pay-phone').value,
      email:   document.getElementById('pay-email').value,
      address: `${document.getElementById('pay-address').value}, ${document.getElementById('pay-city').value} - ${document.getElementById('pay-pin').value}`,
      notes:   document.getElementById('pay-notes').value
    },
    items: c,
    total: sum,
    paymentMethod: selPayMethod
  };

  try {
    const result = await saveOrderToServer(orderData);

    if (result.success) {
      btn.disabled = false;
      btn.textContent = '🔒 Place Order & Pay';
      document.getElementById('final-order-id').textContent = '#' + result.orderId;
      document.querySelectorAll('.pay-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.pay-step').forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
      document.getElementById('pay-panel-success').classList.add('active');
      saveCart([]); updateCart();
    } else {
      notif('❌ ' + result.message);
      btn.disabled = false;
      btn.textContent = '🔒 Place Order & Pay';
    }
  } catch (err) {
    console.error('Order failed:', err);
    notif('❌ Could not connect to server. Please try again.');
    btn.disabled = false;
    btn.textContent = '🔒 Place Order & Pay';
  }
}


// =============================================================
//  REPLACE the sub-form addEventListener with this:
// =============================================================

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
    name:         nm,
    phone:        ph,
    address:      ad,
    milkType:     document.getElementById('milk-type').value,
    qty:          document.getElementById('milk-qty').value,
    schedule:     sSched,
    startDate:    document.getElementById('sub-start').value,
    notes:        document.getElementById('sub-note').value,
    monthlyTotal: total,
    status:       'active'
  };

  try {
    const result = await saveSubscriptionToServer(subData);
    if (result.success) {
      notif(`Subscription #${result.subscriptionId} confirmed! ${total}/month 🎉`);
      e.target.reset(); calcSub();
    } else {
      notif('❌ ' + result.message);
    }
  } catch (err) {
    notif('❌ Could not connect to server. Please try again.');
  }
});


// =============================================================
//  REPLACE the contact-form addEventListener with this:
// =============================================================

document.getElementById('contact-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const nm = document.getElementById('c-name').value.trim();
  const em = document.getElementById('c-email').value.trim();
  const sj = document.getElementById('c-subject').value;
  const mg = document.getElementById('c-msg').value.trim();

  if (!nm || !em || !sj || !mg) { notif('Please fill all required fields ⚠️'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { notif('Enter a valid email ⚠️'); return; }

  const msgData = {
    name:    nm,
    email:   em,
    phone:   document.getElementById('c-phone')?.value || '',
    subject: sj,
    message: mg
  };

  try {
    const result = await saveMessageToServer(msgData);
    if (result.success) {
      notif("Message sent! We'll reply soon 💚");
      e.target.reset();
    } else {
      notif('❌ ' + result.message);
    }
  } catch (err) {
    notif('❌ Could not connect to server. Please try again.');
  }
});