// ===================================================
//  MILQU FRESH — script.js  (MongoDB backend version)
// ===================================================

// ── API base URL (change to your deployed URL in production)
const API_BASE = 'http://localhost:5000/api';

// ── Legacy localStorage DB (kept for cart only)
const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem('mq_'+k)) || []; } catch { return []; } },
  set: (k, v) => localStorage.setItem('mq_'+k, JSON.stringify(v)),
};

// ===================================================
//  📁 IMAGE FOLDER SETTING
//  All product images must be inside the "images" folder.
//  Your folder structure should look like this:
//
//  milqu-fresh/
//  ├── index.html
//  ├── script.js
//  ├── style.css
//  └── images/
//      ├── logo.png
//      ├── cow_milk.png
//      ├── buffalo_milk.png
//      ├── dahi.png
//      ├── lassi.png
//      └── (add any new product image here)
//
//  To add an image to a product:
//  1. Put your photo inside the "images" folder
//  2. Find the product below by its name
//  3. Set  img: 'your_filename.png'
//  4. If a product has no photo yet, keep  img: null
//     (it will show an emoji automatically as fallback)
// ===================================================
const IMG = 'images/'; // ← change this if you rename your folder

// ===================================================
//  PRODUCTS LIST
//  ┌─────────────────────────────────────────────────┐
//  │  HOW TO ADD A NEW PRODUCT:                      │
//  │  Copy any line below and change these fields:   │
//  │                                                 │
//  │  id       — unique code (e.g. 'm4', 'v6')      │
//  │  name     — product name shown on website       │
//  │  e        — emoji shown if no image             │
//  │  img      — filename in images/ folder          │
//  │             use null if no photo yet            │
//  │  price    — price in rupees                     │
//  │  unit     — '/L', '/kg', '/500g' etc.           │
//  │  cat      — milk | vegetables | dairy | fruits  │
//  │  badge    — small label like 'New','Fresh',null │
//  │  desc     — one line description                │
//  └─────────────────────────────────────────────────┘
const P = [

  // ── 🥛 MILK ──────────────────────────────────────
  {
    id:'m1', name:'Cow Milk', e:'🥛',
    img:'cow_milk.png',          // ← put cow_milk.png inside images/ folder
    price:60, unit:'/L', cat:'milk', badge:'Fresh',
    desc:'Pure A2 cow milk, collected fresh each morning.',
    nut:[['Calories','62 kcal'],['Protein','3.2g'],['Fat','3.7g'],['Carbs','4.8g'],['Calcium','120mg'],['Vit D','40 IU']]
  },
  {
    id:'m2', name:'Buffalo Milk', e:'🍼',
    img:'buffalo_milk.png',      // ← put buffalo_milk.png inside images/ folder
    price:75, unit:'/L', cat:'milk', badge:'Popular',
    desc:'Rich, creamy buffalo milk — perfect for curd & sweets.',
    nut:[['Calories','97 kcal'],['Protein','3.7g'],['Fat','6.9g'],['Carbs','5.2g'],['Calcium','195mg'],['Phosphorus','130mg']]
  },
  {
    id:'m3', name:'Organic Milk', e:'🌿',
    img:'organic_milk.png',      // ← add organic_milk.png to images/ folder (or use null)
    price:90, unit:'/L', cat:'milk', badge:'Organic',
    desc:'Certified organic milk from free-range cows on pesticide-free pastures.',
    nut:[['Calories','64 kcal'],['Protein','3.4g'],['Fat','3.9g'],['Carbs','4.9g'],['Omega-3','0.3g'],['Vit B12','1.1µg']]
  },

  // ── 🥦 VEGETABLES ────────────────────────────────
  {
    id:'v1', name:'Fresh Tomatoes', e:'🍅',
    img:null,                    // ← add tomatoes.png to images/ and write 'tomatoes.png' here
    price:40, unit:'/kg', cat:'vegetables', badge:null,
    desc:'Sun-ripened tomatoes from Karnataka farms.',
    nut:[['Calories','18 kcal'],['Fiber','1.2g'],['Vit C','14mg'],['Lycopene','3.0mg'],['Potassium','237mg'],['Folate','15µg']]
  },
  {
    id:'v2', name:'Potatoes', e:'🥔',
    img:null,                    // ← add potatoes.png to images/ and write 'potatoes.png' here
    price:30, unit:'/kg', cat:'vegetables', badge:null,
    desc:'Fresh farm potatoes, versatile and nutritious.',
    nut:[['Calories','77 kcal'],['Carbs','17g'],['Fiber','2.2g'],['Vit C','19.7mg'],['Potassium','421mg'],['Protein','2g']]
  },
  {
    id:'v3', name:'Red Onions', e:'🧅',
    img:null,                    // ← add onions.png to images/ and write 'onions.png' here
    price:35, unit:'/kg', cat:'vegetables', badge:null,
    desc:'Pungent, full-flavored red onions from Nashik.',
    nut:[['Calories','40 kcal'],['Fiber','1.7g'],['Vit C','7mg'],['Quercetin','22mg'],['Folate','19µg'],['Potassium','146mg']]
  },
  {
    id:'v4', name:'Spinach', e:'🥬',
    img:null,                    // ← add spinach.png to images/ and write 'spinach.png' here
    price:30, unit:'/bunch', cat:'vegetables', badge:null,
    desc:'Tender, nutrient-rich spinach leaves.',
    nut:[['Calories','23 kcal'],['Iron','2.7mg'],['Calcium','99mg'],['Vit A','469µg'],['Vit K','483µg'],['Folate','194µg']]
  },
  {
    id:'v5', name:'Carrots', e:'🥕',
    img:null,                    // ← add carrots.png to images/ and write 'carrots.png' here
    price:45, unit:'/kg', cat:'vegetables', badge:'Fresh',
    desc:'Sweet crunchy carrots loaded with beta-carotene.',
    nut:[['Calories','41 kcal'],['Beta-Carotene','8285µg'],['Fiber','2.8g'],['Vit K','13.2µg'],['Potassium','320mg'],['Vit C','5.9mg']]
  },

  // ── 🧀 DAIRY BY-PRODUCTS ─────────────────────────
  {
    id:'d1', name:'Pure Ghee', e:'🫙',
    img:null,                    // ← add ghee.png to images/ and write 'ghee.png' here
    price:580, unit:'/500g', cat:'dairy', badge:'Best Seller',
    desc:'Traditional cultured desi ghee from pure cow milk.',
    nut:[['Calories','900 kcal'],['Fat','100g'],['Vit A','3069 IU'],['Butyric Acid','3.5g'],['CLA','1.5g'],['Vit D','15 IU']]
  },
  {
    id:'d2', name:'Fresh Paneer', e:'🧀',
    img:null,                    // ← add paneer.png to images/ and write 'paneer.png' here
    price:90, unit:'/200g', cat:'dairy', badge:null,
    desc:'Soft fresh paneer from full-fat milk — delivered chilled.',
    nut:[['Calories','321 kcal'],['Protein','25g'],['Fat','23g'],['Calcium','480mg'],['Phosphorus','340mg'],['Riboflavin','0.5mg']]
  },
  {
    id:'d3', name:'White Butter', e:'🧈',
    img:null,                    // ← add butter.png to images/ and write 'butter.png' here
    price:120, unit:'/200g', cat:'dairy', badge:null,
    desc:'Hand-churned unsalted white butter, creamy and mildly tangy.',
    nut:[['Calories','717 kcal'],['Fat','81g'],['Sat Fat','51g'],['Cholesterol','215mg'],['Vit A','684µg'],['Vit E','2.3mg']]
  },
  {
    id:'d4', name:'Curd / Dahi', e:'🥣',
    img:'dahi.png',              // ← put dahi.png inside images/ folder
    price:50, unit:'/500g', cat:'dairy', badge:'Probiotic',
    desc:'Thick set curd with live probiotic cultures.',
    nut:[['Calories','98 kcal'],['Protein','11g'],['Fat','5g'],['Calcium','340mg'],['Probiotics','~10⁹ CFU'],['Riboflavin','0.3mg']]
  },
  {
    id:'d5', name:'Sweet Lassi', e:'🥛',
    img:'lassi.png',             // ← put lassi.png inside images/ folder
    price:60, unit:'/500ml', cat:'dairy', badge:'New',
    desc:'Thick & refreshing sweet lassi made from fresh dahi.',
    nut:[['Calories','150 kcal'],['Protein','5g'],['Fat','4g'],['Calcium','200mg'],['Sugar','18g'],['Probiotics','~10⁸ CFU']]
  },

  // ── 🍎 FRUITS ────────────────────────────────────
  {
    id:'f1', name:'Apples', e:'🍎',
    img:null,                    // ← add apples.png to images/ and write 'apples.png' here
    price:180, unit:'/kg', cat:'fruits', badge:'Imported',
    desc:'Crisp Shimla apples from Himachal Pradesh.',
    nut:[['Calories','52 kcal'],['Fiber','2.4g'],['Vit C','4.6mg'],['Potassium','107mg'],['Quercetin','4.4mg'],['Sugar','10g']]
  },
  {
    id:'f2', name:'Bananas', e:'🍌',
    img:null,                    // ← add bananas.png to images/ and write 'bananas.png' here
    price:50, unit:'/dozen', cat:'fruits', badge:null,
    desc:'Naturally ripened Robusta bananas — energy-packed.',
    nut:[['Calories','89 kcal'],['Carbs','23g'],['Fiber','2.6g'],['Potassium','358mg'],['Vit B6','0.4mg'],['Magnesium','27mg']]
  },
  {
    id:'f3', name:'Alphonso Mango', e:'🥭',
    img:null,                    // ← add mango.png to images/ and write 'mango.png' here
    price:120, unit:'/kg', cat:'fruits', badge:'Seasonal',
    desc:'The king of mangoes — saffron-hued and exquisitely aromatic.',
    nut:[['Calories','60 kcal'],['Fiber','1.6g'],['Vit C','36mg'],['Vit A','765 IU'],['Folate','43µg'],['Sugar','13.7g']]
  },
  {
    id:'f4', name:'Oranges', e:'🍊',
    img:null,                    // ← add oranges.png to images/ and write 'oranges.png' here
    price:80, unit:'/kg', cat:'fruits', badge:null,
    desc:'Juicy Nagpur oranges bursting with Vitamin C.',
    nut:[['Calories','47 kcal'],['Vit C','53mg'],['Fiber','2.4g'],['Folate','30µg'],['Thiamine','0.1mg'],['Potassium','181mg']]
  },
  {
    id:'f5', name:'Papaya', e:'🍈',
    img:null,                    // ← add papaya.png to images/ and write 'papaya.png' here
    price:60, unit:'/kg', cat:'fruits', badge:null,
    desc:'Ripe, sweet papaya loaded with antioxidants and enzymes.',
    nut:[['Calories','43 kcal'],['Vit C','62mg'],['Folate','37µg'],['Potassium','182mg'],['Lycopene','1828µg'],['Fiber','1.7g']]
  },

  // ── ➕ ADD YOUR NEW PRODUCT BELOW ─────────────────
  // {
  //   id:'m4', name:'Goat Milk', e:'🐐',
  //   img:'goat_milk.png',       // ← filename inside images/ folder
  //   price:120, unit:'/L', cat:'milk', badge:'New',
  //   desc:'Fresh goat milk, easy to digest.',
  //   nut:[['Calories','69 kcal'],['Protein','3.6g'],['Fat','4.1g'],['Calcium','134mg']]
  // },

];

// ===================================================
//  IMAGE HELPER  (reads from images/ folder)
// ===================================================
function productImg(p, size='card'){
  const h   = size === 'card' ? '160px' : '320px';
  const fz  = size === 'card' ? '72px'  : '120px';
  const src = p.img ? (IMG + p.img) : null;   // ← builds path: images/filename.png

  if(src){
    return `
      <img src="${src}" alt="${p.name}"
           style="width:100%;height:${h};object-fit:contain;padding:12px;"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="display:none;font-size:${fz};align-items:center;justify-content:center;height:${h};">${p.e}</div>`;
  }
  // No image set → show emoji
  return `<div style="font-size:${fz};display:flex;align-items:center;justify-content:center;height:${h};">${p.e}</div>`;
}

function card(p){
  return `<div class="product-card fade-in" data-cat="${p.cat}">
  <div class="product-img" onclick="detail('${p.id}')" style="padding:0;overflow:hidden;background:#f8fdf8;position:relative;">
    ${p.badge?`<span class="product-badge" style="position:absolute;top:10px;left:10px;z-index:2;">${p.badge}</span>`:''}
    ${productImg(p,'card')}
  </div>
  <div class="product-info">
    <div class="product-cat">${p.cat}</div>
    <div class="product-name" onclick="detail('${p.id}')">${p.name}</div>
    <div class="product-desc">${p.desc}</div>
    <div class="product-footer">
      <div class="product-price">₹${p.price}<span>${p.unit}</span></div>
      <button class="add-cart-btn" onclick="addToCart({id:'${p.id}',name:'${p.name}',price:${p.price},e:'${p.e}',unit:'${p.unit}'})">+</button>
    </div>
  </div>
</div>`;
}
function renderGrid(gridId, filter='all'){
  const list = filter==='all' ? P : P.filter(p=>p.cat===filter);
  const el = document.getElementById(gridId);
  if(el){ el.innerHTML = list.map(card).join(''); initFade(); }
}

// ===================================================
//  NAV
// ===================================================
function nav(page, cat, closeMob){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nl').forEach(l=>l.classList.toggle('active', l.dataset.p===page));
  window.scrollTo({top:0,behavior:'smooth'});
  if(closeMob){ document.getElementById('mobile-menu').classList.remove('open'); document.body.style.overflow=''; }
  if(page==='products'){ renderGrid('prod-grid', cat||'all'); initTabs('prod-tabs','prod-grid'); if(cat){ setTimeout(()=>{const t=document.querySelector(`#prod-tabs [data-cat="${cat}"]`); if(t){document.querySelectorAll('#prod-tabs .filter-tab').forEach(x=>x.classList.remove('active')); t.classList.add('active'); renderGrid('prod-grid',cat);}},50); } }
  if(page==='home'){ renderGrid('home-grid'); initTabs('home-tabs','home-grid'); }
  if(page==='subscription') initSub();
  initFade();
  return false;
}
function initTabs(tabsId, gridId){
  document.querySelectorAll(`#${tabsId} .filter-tab`).forEach(t=>{
    t.onclick=()=>{ document.querySelectorAll(`#${tabsId} .filter-tab`).forEach(x=>x.classList.remove('active')); t.classList.add('active'); renderGrid(gridId,t.dataset.cat); };
  });
}

// ===================================================
//  PRODUCT DETAIL
// ===================================================
let dQty=1;
function detail(id){
  const p=P.find(x=>x.id===id);
  if(!p) return;
  dQty=1;
  document.getElementById('bc-name').textContent=p.name;
  const rows=p.nut.map(([n,v])=>`<tr><td>${n}</td><td><strong>${v}</strong></td></tr>`).join('');
  document.getElementById('detail-grid').innerHTML=`
    <div>
      <div class="product-main-img" id="main-img" style="background:#f8fdf8;border-radius:16px;display:flex;align-items:center;justify-content:center;min-height:300px;overflow:hidden;">
        ${p.img ? `<img src="${p.img}" alt="${p.name}" style="width:100%;max-height:320px;object-fit:contain;padding:16px;" onerror="this.style.display='none'">` : `<span style='font-size:100px'>${p.e}</span>`}
      </div>
      <div class="product-thumbs">
        <div class="thumb active" style="background:#f8fdf8;overflow:hidden;">${p.img ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none'">` : p.e}</div>
        <div class="thumb">🌾</div>
        <div class="thumb">✅</div>
        <div class="thumb">🚚</div>
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
        <button class="btn btn-primary" onclick="for(let i=0;i<dQty;i++)addToCart({id:'${p.id}',name:'${p.name}',price:${p.price},e:'${p.e}',unit:'${p.unit}'})">🛒 Add to Cart</button>
        <button class="btn btn-outline" onclick="nav('subscription')">📦 Subscribe Daily</button>
      </div>
      <div style="display:flex;gap:20px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border);flex-wrap:wrap;">
        <span style="font-size:13px;color:var(--gray);">✅ Farm Fresh</span>
        <span style="font-size:13px;color:var(--gray);">🚚 Free Delivery ₹200+</span>
        <span style="font-size:13px;color:var(--gray);">🔄 Easy Returns</span>
      </div>
    </div>`;
  const related=P.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,4);
  document.getElementById('related-grid').innerHTML=related.map(card).join('');
  nav('detail');
}

// ===================================================
//  CART
// ===================================================
const CK='cart';
const getCart=()=>DB.get(CK);
const saveCart=c=>DB.set(CK,c);
function addToCart(item){
  const c=getCart(), ex=c.find(i=>i.id===item.id);
  if(ex) ex.qty++; else c.push({...item,qty:1});
  saveCart(c); updateCart(); notif(`${item.name} added to cart! ✅`);
}
function removeFromCart(id){saveCart(getCart().filter(i=>i.id!==id));updateCart();}
function upQty(id,d){const c=getCart(),it=c.find(i=>i.id===id);if(it){it.qty=Math.max(1,it.qty+d);saveCart(c);}updateCart();}
function updateCart(){
  const c=getCart(), tot=c.reduce((s,i)=>s+i.qty,0);
  const el=document.getElementById('cart-count');
  el.textContent=tot; el.classList.toggle('show',tot>0);
  renderCart();
}
function renderCart(){
  const c=getCart(), list=document.getElementById('cart-items-list'), tv=document.getElementById('cart-total-val');
  if(!c.length){list.innerHTML=`<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p><button class="btn btn-primary" style="margin-top:16px;" onclick="nav('products');closeCart()">Shop Now</button></div>`;if(tv)tv.textContent='₹0';return;}
  const sum=c.reduce((s,i)=>s+i.price*i.qty,0);
  list.innerHTML=c.map(i=>`<div class="cart-item">
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
  if(tv) tv.textContent=`₹${sum.toFixed(0)}`;
}
const openCart=()=>{ document.getElementById('cart-overlay').classList.add('open'); document.getElementById('cart-sidebar').classList.add('open'); document.body.style.overflow='hidden'; };
const closeCart=()=>{ document.getElementById('cart-overlay').classList.remove('open'); document.getElementById('cart-sidebar').classList.remove('open'); document.body.style.overflow=''; };

// ===================================================
//  PAYMENT MODAL (Product checkout)
// ===================================================
let curPayStep=1, selPayMethod='upi', selUPIApp='';

function openPayModal(){
  const c=getCart();
  if(!c.length){notif('Your cart is empty 🛒');return;}
  closeCart();
  renderOrderSummary();
  goPayStep(1);
  document.getElementById('pay-modal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closePayModal(){
  document.getElementById('pay-modal').classList.remove('open');
  document.body.style.overflow='';
}
function goPayStep(n){
  if(n===2){
    const nm=document.getElementById('pay-fname').value.trim()+' '+document.getElementById('pay-lname').value.trim();
    const ph=document.getElementById('pay-phone').value.trim();
    const ad=document.getElementById('pay-address').value.trim();
    const cy=document.getElementById('pay-city').value.trim();
    const pi=document.getElementById('pay-pin').value.trim();
    if(!nm.trim()||!ph||!ad||!cy||!pi){notif('Please fill all required fields ⚠️');return;}
    if(!/^[6-9]\d{9}$/.test(ph)){notif('Enter valid 10-digit phone number ⚠️');return;}
    if(!/^\d{6}$/.test(pi)){notif('Enter valid 6-digit pincode ⚠️');return;}
  }
  if(n===3){
    if(selPayMethod==='card'){
      const num=document.getElementById('card-num').value.replace(/\s/g,'');
      const cvv=document.getElementById('card-cvv').value;
      const exp=document.getElementById('card-exp').value;
      if(num.length<16||!exp||cvv.length<3){notif('Please fill all card details ⚠️');return;}
    }
    if(selPayMethod==='netbanking'&&!document.getElementById('bank-select').value){notif('Please select a bank ⚠️');return;}
    renderReview();
  }
  curPayStep=n;
  document.querySelectorAll('.pay-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.pay-step').forEach((s,i)=>{
    s.classList.remove('active','done');
    if(i+1===n) s.classList.add('active');
    else if(i+1<n) s.classList.add('done');
  });
  if(n<=3) document.getElementById('pay-panel-'+n).classList.add('active');
}
function renderOrderSummary(){
  const c=getCart();
  const sum=c.reduce((s,i)=>s+i.price*i.qty,0);
  const rows=c.map(i=>`<div class="order-item-row"><span>${i.e} ${i.name} × ${i.qty}</span><span>₹${(i.price*i.qty).toFixed(0)}</span></div>`).join('');
  document.getElementById('pay-order-summary').innerHTML=`
    ${rows}
    <div class="order-item-row"><span>Delivery</span><span style="color:var(--green)">FREE</span></div>
    <div class="order-total-row"><span>Total</span><span style="color:var(--green)">₹${sum.toFixed(0)}</span></div>`;
}
function selectPayMethod(el,m){
  document.querySelectorAll('.pay-method').forEach(x=>x.classList.remove('selected'));
  el.classList.add('selected');
  selPayMethod=m;
  ['upi','card','netbanking','cod'].forEach(x=>{
    const el=document.getElementById('pm-'+x);
    if(el) el.style.display = x===m?'block':'none';
  });
}
function selectUPIApp(el,app){
  document.querySelectorAll('.upi-app').forEach(x=>x.style.border='2px solid transparent');
  el.style.border='2px solid var(--green)'; el.style.background='var(--green-light)';
  selUPIApp=app;
  document.getElementById('upi-id').value=app.toLowerCase()+'@'+app.toLowerCase();
}
function verifyUPI(){
  const v=document.getElementById('upi-id').value;
  if(!v.includes('@')){notif('Enter a valid UPI ID ⚠️');return;}
  notif('UPI ID verified ✅');
}
function fmtCard(el){
  let v=el.value.replace(/\D/g,'').substring(0,16);
  el.value=v.replace(/(.{4})/g,'$1 ').trim();
  document.getElementById('card-display').textContent=el.value||'•••• •••• •••• ••••';
}
function fmtExp(el){
  let v=el.value.replace(/\D/g,'');
  if(v.length>=2) v=v.substring(0,2)+'/'+v.substring(2,4);
  el.value=v;
  document.getElementById('card-exp-display').textContent=el.value||'MM/YY';
}
function renderReview(){
  const c=getCart(), sum=c.reduce((s,i)=>s+i.price*i.qty,0);
  const nm=document.getElementById('pay-fname').value+' '+document.getElementById('pay-lname').value;
  const ph=document.getElementById('pay-phone').value;
  const ad=`${document.getElementById('pay-address').value}, ${document.getElementById('pay-city').value} - ${document.getElementById('pay-pin').value}`;
  const pm={'upi':'UPI Payment','card':'Credit/Debit Card','netbanking':'Net Banking','cod':'Cash on Delivery'};
  const isCOD = selPayMethod==='cod';
  document.getElementById('review-content').innerHTML=`
    <div style="background:var(--light-gray);border-radius:12px;padding:18px;margin-bottom:16px;">
      <h4 style="font-size:15px;margin-bottom:10px;">📦 Delivery To</h4>
      <p style="font-size:14px;font-weight:600;">${nm}</p>
      <p style="font-size:13px;color:var(--gray);">${ph}</p>
      <p style="font-size:13px;color:var(--gray);">${ad}</p>
    </div>
    <div style="background:var(--light-gray);border-radius:12px;padding:18px;margin-bottom:16px;">
      <h4 style="font-size:15px;margin-bottom:10px;">💳 Payment: ${pm[selPayMethod]||'UPI'}</h4>
      ${selPayMethod==='upi'?`<p style="font-size:13px;color:var(--gray);">${document.getElementById('upi-id').value||selUPIApp}</p>`:''}
      ${selPayMethod==='card'?`<p style="font-size:13px;color:var(--gray);">Card ending ••••${document.getElementById('card-num').value.replace(/\s/g,'').slice(-4)||'xxxx'}</p>`:''}
      ${selPayMethod==='netbanking'?`<p style="font-size:13px;color:var(--gray);">${document.getElementById('bank-select').value}</p>`:''}
      ${isCOD?`<p style="font-size:13px;color:var(--gray);">Pay ₹${(sum+20).toFixed(0)} (incl. ₹20 COD fee) on delivery</p>`:''}
    </div>
    <div class="order-items">${c.map(i=>`<div class="order-item-row"><span>${i.e} ${i.name} × ${i.qty}</span><span>₹${(i.price*i.qty).toFixed(0)}</span></div>`).join('')}
      <div class="order-total-row"><span>Total to Pay</span><span style="color:var(--green)">₹${(sum+(isCOD?20:0)).toFixed(0)}</span></div>
    </div>`;
}

// ===================================================
//  ✅ FIX #1 — placeOrder() now sends to MongoDB API
// ===================================================
async function placeOrder(){
  const btn=document.getElementById('place-order-btn');
  btn.disabled=true; btn.textContent='⏳ Processing...';

  const c=getCart();
  const sum=c.reduce((s,i)=>s+i.price*i.qty,0);

  const orderData = {
    customer: {
      name:    document.getElementById('pay-fname').value.trim() + ' ' + document.getElementById('pay-lname').value.trim(),
      phone:   document.getElementById('pay-phone').value.trim(),
      email:   document.getElementById('pay-email').value.trim(),
      address: `${document.getElementById('pay-address').value}, ${document.getElementById('pay-city').value} - ${document.getElementById('pay-pin').value}`,
      notes:   document.getElementById('pay-notes').value
    },
    items: c,
    total: sum,
    paymentMethod: selPayMethod
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const result = await res.json();

    btn.disabled=false; btn.textContent='🔒 Place Order & Pay';

    if(result.success){
      document.getElementById('final-order-id').textContent = '#' + result.orderId;
      document.querySelectorAll('.pay-panel').forEach(p=>p.classList.remove('active'));
      document.querySelectorAll('.pay-step').forEach(s=>{s.classList.remove('active');s.classList.add('done');});
      document.getElementById('pay-panel-success').classList.add('active');
      saveCart([]); updateCart();
    } else {
      notif('❌ ' + (result.message || 'Order failed. Try again.'));
    }
  } catch(err){
    console.error('Order error:', err);
    btn.disabled=false; btn.textContent='🔒 Place Order & Pay';
    notif('❌ Server not reachable. Please try again.');
  }
}

// ===================================================
//  NOTIFICATION
// ===================================================
function notif(msg){const n=document.getElementById('notification');n.textContent=msg;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),3000);}

// ===================================================
//  SUBSCRIPTION CALC
// ===================================================
const RATES={cow:60,buffalo:75,organic:90}, DAYS={daily:30,alternate:15,weekdays:22,custom:30};
let sSched='daily';
// ✅ FIX #2 — subscription payment method state
let subPayMethod = 'upi';
let subUPIApp = '';

function initSub(){
  const mt=document.getElementById('milk-type');
  const mq=document.getElementById('milk-qty');
  if(mt) mt.addEventListener('change',calcSub);
  if(mq) mq.addEventListener('input',calcSub);
  document.querySelectorAll('.schedule-opt').forEach(o=>{
    o.onclick=()=>{document.querySelectorAll('.schedule-opt').forEach(x=>x.classList.remove('active'));o.classList.add('active');sSched=o.dataset.s;calcSub();};
  });
  const t=new Date(); t.setDate(t.getDate()+1);
  const sd=document.getElementById('sub-start');
  if(sd){sd.min=t.toISOString().split('T')[0];sd.value=sd.min;}
  calcSub();

  // Init subscription payment method selector
  document.querySelectorAll('.sub-pay-method').forEach(el => {
    el.onclick = () => {
      document.querySelectorAll('.sub-pay-method').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      subPayMethod = el.dataset.m;
      // Show/hide sub-panels
      document.querySelectorAll('.sub-pm-panel').forEach(p => p.style.display = 'none');
      const panel = document.getElementById('sub-pm-' + subPayMethod);
      if(panel) panel.style.display = 'block';
    };
  });

  document.querySelectorAll('.sub-upi-app').forEach(el => {
    el.onclick = () => {
      document.querySelectorAll('.sub-upi-app').forEach(x => x.style.border = '2px solid transparent');
      el.style.border = '2px solid var(--green)';
      el.style.background = 'var(--green-light)';
      subUPIApp = el.dataset.app;
      const upiInput = document.getElementById('sub-upi-id');
      if(upiInput) upiInput.value = subUPIApp.toLowerCase() + '@' + subUPIApp.toLowerCase();
    };
  });
}

function calcSub(){
  const type=document.getElementById('milk-type')?.value||'cow';
  const qty=parseFloat(document.getElementById('milk-qty')?.value)||1;
  const rate=RATES[type]||60, days=DAYS[sSched]||30, sub=qty*days*rate;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('s-rate',`₹${rate}/L`); set('s-qty',`${qty} L/day`); set('s-days',`${days} days`);
  set('s-sub',`₹${sub.toFixed(0)}`); set('s-del','₹0 (Free)'); set('s-total',`₹${sub.toFixed(0)}`);
}

// ===================================================
//  SLIDER
// ===================================================
(function(){
  const track=document.getElementById('t-track'), dots=document.querySelectorAll('.slider-dot');
  if(!track) return;
  let cur=0, tot=track.querySelectorAll('.testimonial-slide').length;
  function go(n){cur=(n+tot)%tot;track.style.transform=`translateX(-${cur*100}%)`;dots.forEach((d,i)=>d.classList.toggle('active',i===cur));}
  dots.forEach(d=>d.addEventListener('click',()=>go(parseInt(d.dataset.i))));
  setInterval(()=>go(cur+1),5000);
})();

// ===================================================
//  FADE IN
// ===================================================
function initFade(){
  const obs=new IntersectionObserver((entries)=>{entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>e.target.classList.add('visible'),i*80);obs.unobserve(e.target);}});},{threshold:.12});
  document.querySelectorAll('.fade-in:not(.visible)').forEach(el=>obs.observe(el));
}

// ===================================================
//  EVENTS
// ===================================================
window.addEventListener('scroll',()=>document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20));
document.getElementById('hamburger').addEventListener('click',()=>{const m=document.getElementById('mobile-menu');m.classList.toggle('open');document.body.style.overflow=m.classList.contains('open')?'hidden':'';});
document.getElementById('cart-btn').addEventListener('click',openCart);
document.getElementById('cart-overlay').addEventListener('click',closeCart);
document.getElementById('cart-close').addEventListener('click',closeCart);
document.getElementById('checkout-btn').addEventListener('click',openPayModal);
document.getElementById('pay-modal').addEventListener('click',function(e){if(e.target===this)closePayModal();});

// ===================================================
//  ✅ FIX #2 — Subscription form → sends to MongoDB API
//              Now includes paymentMethod
// ===================================================
document.getElementById('sub-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const nm = document.getElementById('sub-name').value.trim();
  const ph = document.getElementById('sub-phone').value.trim();
  const ad = document.getElementById('sub-address').value.trim();

  if(!nm||!ph||!ad){ notif('Please fill all required fields ⚠️'); return; }
  if(!/^[6-9]\d{9}$/.test(ph)){ notif('Enter a valid 10-digit phone number ⚠️'); return; }

  // Validate payment method
  if(subPayMethod === 'upi'){
    const upiVal = document.getElementById('sub-upi-id')?.value?.trim() || subUPIApp;
    if(!upiVal || !upiVal.includes('@')){ notif('Please enter or select a UPI ID ⚠️'); return; }
  }
  if(subPayMethod === 'card'){
    const cardNum = document.getElementById('sub-card-num')?.value?.replace(/\s/g,'') || '';
    const cardExp = document.getElementById('sub-card-exp')?.value || '';
    const cardCvv = document.getElementById('sub-card-cvv')?.value || '';
    if(cardNum.length < 16 || !cardExp || cardCvv.length < 3){ notif('Please fill all card details ⚠️'); return; }
  }
  if(subPayMethod === 'netbanking'){
    if(!document.getElementById('sub-bank-select')?.value){ notif('Please select a bank ⚠️'); return; }
  }

  calcSub();
  const total = document.getElementById('s-total').textContent;

  const subData = {
    name:          nm,
    phone:         ph,
    address:       ad,
    milkType:      document.getElementById('milk-type').value,
    qty:           document.getElementById('milk-qty').value,
    schedule:      sSched,
    startDate:     document.getElementById('sub-start').value,
    notes:         document.getElementById('sub-note').value,
    monthlyTotal:  total,
    paymentMethod: subPayMethod,
    status:        'active'
  };

  const submitBtn = e.target.querySelector('button[type=submit]');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Processing...';

  try {
    const res = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subData)
    });
    const result = await res.json();

    if(result.success){
      notif(`🎉 Subscription #${result.subscriptionId} confirmed! ${total}/month`);
      e.target.reset();
      subPayMethod = 'upi';
      subUPIApp = '';
      document.querySelectorAll('.sub-pay-method').forEach(x => x.classList.remove('selected'));
      const firstPM = document.querySelector('.sub-pay-method');
      if(firstPM) firstPM.classList.add('selected');
      document.querySelectorAll('.sub-pm-panel').forEach(p => p.style.display = 'none');
      const upiPanel = document.getElementById('sub-pm-upi');
      if(upiPanel) upiPanel.style.display = 'block';
      calcSub();
    } else {
      notif('❌ ' + (result.message || 'Subscription failed. Try again.'));
    }
  } catch(err){
    console.error('Sub error:', err);
    notif('❌ Server not reachable. Please try again.');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = '✅ Confirm & Pay';
});

// ===================================================
//  Contact form → sends to MongoDB API
// ===================================================
document.getElementById('contact-form')?.addEventListener('submit', async e => {
  e.preventDefault();
  const nm = document.getElementById('c-name').value.trim();
  const em = document.getElementById('c-email').value.trim();
  const sj = document.getElementById('c-subject').value;
  const mg = document.getElementById('c-msg').value.trim();

  if(!nm||!em||!sj||!mg){ notif('Please fill all required fields ⚠️'); return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){ notif('Enter a valid email ⚠️'); return; }

  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nm, email: em,
        phone: document.getElementById('c-phone')?.value || '',
        subject: sj, message: mg
      })
    });
    const result = await res.json();
    if(result.success){ notif("Message sent! We'll reply soon 💚"); e.target.reset(); }
    else notif('❌ ' + result.message);
  } catch {
    notif('❌ Server not reachable. Please try again.');
  }
});

// ===================================================
//  INIT
// ===================================================
renderGrid('home-grid');
initTabs('home-tabs','home-grid');
updateCart();
initFade();