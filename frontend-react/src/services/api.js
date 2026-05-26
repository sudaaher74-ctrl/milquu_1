import api from '../config/api';

// ─── Products ─────────────────────────────────────────────────────────────────

export const FALLBACK_PRODUCTS = [
  { id: 'm1', productId: 'm1', name: 'Cow Milk',      e: '🥛', img: '/images/CowMilk.png',    price: 60,  unit: '/L',    cat: 'milk',       badge: 'Fresh',       desc: 'Pure A2 cow milk, collected fresh each morning.',               nut: [['Calories','62 kcal'],['Protein','3.2g'],['Fat','3.7g'],['Carbs','4.8g'],['Calcium','120mg'],['Vit D','40 IU']] },
  { id: 'm2', productId: 'm2', name: 'Buffalo Milk',  e: '🍼', img: '/images/buffaloMilk.png', price: 75,  unit: '/L',    cat: 'milk',       badge: 'Popular',     desc: 'Rich, creamy buffalo milk — perfect for curd and sweets.',      nut: [['Calories','97 kcal'],['Protein','3.7g'],['Fat','6.9g'],['Carbs','5.2g'],['Calcium','195mg']] },
  { id: 'm3', productId: 'm3', name: 'Organic Milk',  e: '🌿', img: '/images/Organicmilk.png', price: 120, unit: '/L',    cat: 'milk',       badge: 'Organic',     desc: 'Certified organic milk from free-range cows.',                  nut: [['Calories','64 kcal'],['Protein','3.4g'],['Fat','3.9g'],['Carbs','4.9g'],['Omega-3','0.3g']] },
  { id: 'v1', productId: 'v1', name: 'Fresh Tomatoes',e: '🍅', img: '/images/fresh tomato.png', price: 40, unit: '/kg',   cat: 'vegetables', badge: null,          desc: 'Sun-ripened tomatoes from Karnataka farms.',                    nut: [['Calories','18 kcal'],['Fiber','1.2g'],['Vit C','14mg']] },
  { id: 'v2', productId: 'v2', name: 'Potatoes',      e: '🥔', img: '/images/potatos.png',      price: 30, unit: '/kg',   cat: 'vegetables', badge: null,          desc: 'Fresh farm potatoes, versatile and nutritious.',                nut: [['Calories','77 kcal'],['Carbs','17g'],['Fiber','2.2g']] },
  { id: 'v3', productId: 'v3', name: 'Red Onions',    e: '🧅', img: '/images/red onions.png',   price: 35, unit: '/kg',   cat: 'vegetables', badge: null,          desc: 'Pungent, full-flavored red onions from Nashik.',                nut: [['Calories','40 kcal'],['Fiber','1.7g'],['Vit C','7mg']] },
  { id: 'v5', productId: 'v5', name: 'Carrots',       e: '🥕', img: '/images/carrots.png',      price: 45, unit: '/kg',   cat: 'vegetables', badge: 'Fresh',       desc: 'Sweet crunchy carrots loaded with beta-carotene.',              nut: [['Calories','41 kcal'],['Beta-Carotene','8285µg'],['Fiber','2.8g']] },
  { id: 'd1', productId: 'd1', name: 'Pure Ghee',     e: '🫙', img: '/images/pure ghee.png',    price: 580, unit: '/500g', cat: 'dairy',      badge: 'Best Seller', desc: 'Traditional cultured desi ghee from pure cow milk.',            nut: [['Calories','900 kcal'],['Fat','100g'],['Vit A','3069 IU']] },
  { id: 'd2', productId: 'd2', name: 'Fresh Paneer',  e: '🧀', img: '/images/panner.png',       price: 90,  unit: '/200g', cat: 'dairy',      badge: null,          desc: 'Soft fresh paneer from full-fat milk, delivered chilled.',      nut: [['Calories','321 kcal'],['Protein','25g'],['Fat','23g'],['Calcium','480mg']] },
  { id: 'd4', productId: 'd4', name: 'Curd / Dahi',   e: '🥣', img: '/images/dahi.png',         price: 50,  unit: '/500g', cat: 'dairy',      badge: 'Probiotic',   desc: 'Thick set curd with live probiotic cultures.',                  nut: [['Calories','98 kcal'],['Protein','11g'],['Fat','5g']] },
  { id: 'f1', productId: 'f1', name: 'Apples',        e: '🍎', img: '/images/apple.png',         price: 180, unit: '/kg',   cat: 'fruits',     badge: 'Imported',    desc: 'Crisp Shimla apples from Himachal Pradesh.',                    nut: [['Calories','52 kcal'],['Fiber','2.4g'],['Vit C','4.6mg']] },
  { id: 'f2', productId: 'f2', name: 'Bananas',       e: '🍌', img: '/images/banana.png',        price: 50,  unit: '/dozen',cat: 'fruits',     badge: null,          desc: 'Naturally ripened Robusta bananas — energy-packed.',            nut: [['Calories','89 kcal'],['Carbs','23g'],['Potassium','358mg']] },
  { id: 'f3', productId: 'f3', name: 'Alphonso Mango',e: '🥭', img: '/images/mangos.png',        price: 120, unit: '/kg',   cat: 'fruits',     badge: 'Seasonal',    desc: 'The king of mangoes — saffron-hued and aromatic.',              nut: [['Calories','60 kcal'],['Fiber','1.6g'],['Vit C','36mg']] },
];

function mapProduct(p, apiBase) {
  const fallback = FALLBACK_PRODUCTS.find(f => f.name.toLowerCase() === p.name?.toLowerCase());
  
  let imgUrl = null;
  if (p.image) {
    imgUrl = `${apiBase.replace('/api', '')}/uploads/${p.image}`;
  } else if (p.imageUrl) {
    imgUrl = p.imageUrl;
  } else if (fallback && fallback.img) {
    imgUrl = fallback.img;
  }

  return {
    id: p.productCode || p._id,
    productId: p._id,
    name: p.name,
    e: p.emoji || fallback?.e || '📦',
    img: imgUrl,
    price: p.price,
    unit: p.unit || fallback?.unit || '/unit',
    cat: p.category || fallback?.cat,
    badge: p.badge || fallback?.badge || null,
    desc: p.description || fallback?.desc || '',
    nut: Array.isArray(p.nutrition) && p.nutrition.length > 0 ? p.nutrition : (fallback?.nut || []),
  };
}

export async function fetchProducts(scope = '') {
  try {
    const res = await api.get(`/products${scope ? `?scope=${scope}` : ''}`);
    return (res.data.products || []).map((p) => mapProduct(p, api.defaults.baseURL || '/api'));
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

// ─── Areas ────────────────────────────────────────────────────────────────────

export const DELIVERY_ZONES = {
  '410206': 'Panvel / Old Panvel / Karanjade, Navi Mumbai',
  '410218': 'New Panvel / Kalamboli, Navi Mumbai',
  '410209': 'Kamothe, Navi Mumbai',
  '410210': 'Kharghar, Navi Mumbai',
  '410220': 'Taloja, Navi Mumbai',
  '410222': 'Ulwe, Navi Mumbai',
  '400614': 'CBD Belapur, Navi Mumbai',
  '400706': 'Nerul, Navi Mumbai',
  '410208': 'Panvel (Rural), Navi Mumbai',
  '410221': 'Roadpali / Kalamboli, Navi Mumbai',
};

export async function fetchAreas() {
  try {
    const res = await api.get('/areas');
    if (res.data.success && res.data.data?.length) {
      return res.data.data.map((a) => ({ value: a._id, label: a.name }));
    }
    throw new Error('No areas');
  } catch {
    return Object.entries(DELIVERY_ZONES).map(([pin, label]) => ({ value: pin, label: `${label} (${pin})` }));
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function placeOrder(orderData) {
  const res = await api.post('/orders', orderData);
  return res.data;
}

export async function fetchOrders(params = '') {
  const res = await api.get(`/orders${params}`);
  return res.data;
}

export async function updateOrderStatus(id, status) {
  const res = await api.patch(`/orders/${id}/status`, { status });
  return res.data;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function createSubscription(data) {
  const res = await api.post('/subscriptions', data);
  return res.data;
}

export async function fetchSubscriptions(params = '') {
  const res = await api.get(`/subscriptions${params}`);
  return res.data;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function fetchAdminSetupStatus() {
  const res = await api.get('/admin/setup-status');
  return res.data;
}

export async function fetchMessages() {
  const res = await api.get('/messages?limit=500');
  return res.data;
}

export async function fetchCustomers() {
  const res = await api.get('/customers');
  return res.data;
}

export async function fetchAnalytics() {
  const res = await api.get('/analytics');
  return res.data;
}

export async function fetchInventory() {
  const res = await api.get('/inventory');
  return res.data;
}

export async function fetchContent() {
  try {
    const res = await api.get('/content');
    return res.data.content || [];
  } catch {
    return [];
  }
}

export async function updateContent(id, data) {
  const res = await api.patch(`/content/${id}`, data);
  return res.data;
}

export async function createProduct(formData) {
  const res = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
}

export async function updateProduct(id, formData) {
  const res = await api.patch(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}

export async function fetchAreas_admin() {
  const res = await api.get('/areas?scope=admin');
  return res.data;
}

export async function fetchDeliveryBoys() {
  const res = await api.get('/admin/delivery-boys');
  return res.data;
}

export async function fetchNotifications() {
  const res = await api.get('/notifications');
  return res.data;
}

export async function fetchExpenses() {
  const res = await api.get('/expenses');
  return res.data;
}

export async function fetchReports(params = '') {
  const res = await api.get(`/reports${params}`);
  return res.data;
}

export async function sendMessage(data) {
  const res = await api.post('/messages', data);
  return res.data;
}

export async function fetchHealthStatus() {
  const res = await api.get('/health');
  return res.data;
}
