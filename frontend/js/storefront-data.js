var API_BASE = window.MILQU_CONFIG.API_BASE;
var DB = {
    get: function (key) {
        try {
            return JSON.parse(localStorage.getItem('mq_' + key)) || [];
        } catch {
            return [];
        }
    },
    set: function (key, value) {
        localStorage.setItem('mq_' + key, JSON.stringify(value));
    }
};

var P = [];
var CMS_CONTENT = [];

// Fallback products — shown when the backend server is not running
var FALLBACK_PRODUCTS = [
  // MILK
  { id: 'm1', productId: 'm1', name: 'Cow Milk',     e: '🥛', img: 'images/cow-milk.png',    price: 60,  unit: '/L',    cat: 'milk',       badge: 'Fresh',       desc: 'Pure A2 cow milk, collected fresh each morning.',                              nut: [['Calories','62 kcal'],['Protein','3.2g'],['Fat','3.7g'],['Carbs','4.8g'],['Calcium','120mg'],['Vit D','40 IU']] },
  { id: 'm2', productId: 'm2', name: 'Buffalo Milk', e: '🍼', img: 'images/buffalo-milk.png', price: 75,  unit: '/L',    cat: 'milk',       badge: 'Popular',     desc: 'Rich, creamy buffalo milk — perfect for curd and sweets.',                    nut: [['Calories','97 kcal'],['Protein','3.7g'],['Fat','6.9g'],['Carbs','5.2g'],['Calcium','195mg'],['Phosphorus','130mg']] },
  { id: 'm3', productId: 'm3', name: 'Organic Milk', e: '🌿', img: 'images/buffalo-milk.png', price: 120, unit: '/L',    cat: 'milk',       badge: 'Organic',     desc: 'Certified organic milk from free-range cows on pesticide-free pastures.',    nut: [['Calories','64 kcal'],['Protein','3.4g'],['Fat','3.9g'],['Carbs','4.9g'],['Omega-3','0.3g'],['Vit B12','1.1µg']] },
  // VEGETABLES
  { id: 'v1', productId: 'v1', name: 'Fresh Tomatoes',e: '🍅', img: 'images/fresh tomato.png', price: 40, unit: '/kg',   cat: 'vegetables', badge: null,          desc: 'Sun-ripened tomatoes from Karnataka farms.',                                  nut: [['Calories','18 kcal'],['Fiber','1.2g'],['Vit C','14mg'],['Lycopene','3.0mg'],['Potassium','237mg'],['Folate','15µg']] },
  { id: 'v2', productId: 'v2', name: 'Potatoes',      e: '🥔', img: 'images/potatos.png',      price: 30, unit: '/kg',   cat: 'vegetables', badge: null,          desc: 'Fresh farm potatoes, versatile and nutritious.',                              nut: [['Calories','77 kcal'],['Carbs','17g'],['Fiber','2.2g'],['Vit C','19.7mg'],['Potassium','421mg'],['Protein','2g']] },
  { id: 'v3', productId: 'v3', name: 'Red Onions',    e: '🧅', img: 'images/red onions.png',   price: 35, unit: '/kg',   cat: 'vegetables', badge: null,          desc: 'Pungent, full-flavored red onions from Nashik.',                              nut: [['Calories','40 kcal'],['Fiber','1.7g'],['Vit C','7mg'],['Quercetin','22mg'],['Folate','19µg'],['Potassium','146mg']] },
  { id: 'v5', productId: 'v5', name: 'Carrots',       e: '🥕', img: 'images/carrots.png',      price: 45, unit: '/kg',   cat: 'vegetables', badge: 'Fresh',       desc: 'Sweet crunchy carrots loaded with beta-carotene.',                            nut: [['Calories','41 kcal'],['Beta-Carotene','8285µg'],['Fiber','2.8g'],['Vit K','13.2µg'],['Potassium','320mg'],['Vit C','5.9mg']] },
  // DAIRY
  { id: 'd1', productId: 'd1', name: 'Pure Ghee',    e: '🫙', img: 'images/pure ghee.png',    price: 580, unit: '/500g', cat: 'dairy',      badge: 'Best Seller', desc: 'Traditional cultured desi ghee from pure cow milk.',                          nut: [['Calories','900 kcal'],['Fat','100g'],['Vit A','3069 IU'],['Butyric Acid','3.5g'],['CLA','1.5g'],['Vit D','15 IU']] },
  { id: 'd2', productId: 'd2', name: 'Fresh Paneer', e: '🧀', img: 'images/panner.png',       price: 90,  unit: '/200g', cat: 'dairy',      badge: null,          desc: 'Soft fresh paneer from full-fat milk, delivered chilled.',                    nut: [['Calories','321 kcal'],['Protein','25g'],['Fat','23g'],['Calcium','480mg'],['Phosphorus','340mg'],['Riboflavin','0.5mg']] },
  { id: 'd4', productId: 'd4', name: 'Curd / Dahi',  e: '🥣', img: 'images/dahi.png',         price: 50,  unit: '/500g', cat: 'dairy',      badge: 'Probiotic',   desc: 'Thick set curd with live probiotic cultures.',                                nut: [['Calories','98 kcal'],['Protein','11g'],['Fat','5g'],['Calcium','340mg'],['Probiotics','~10⁹ CFU'],['Riboflavin','0.3mg']] },
  { id: 'd5', productId: 'd5', name: 'Sweet Lassi',  e: '🥛', img: 'images/lassi.png',        price: 60,  unit: '/500ml',cat: 'dairy',      badge: 'New',         desc: 'Thick and refreshing sweet lassi made from fresh dahi.',                      nut: [['Calories','150 kcal'],['Protein','5g'],['Fat','4g'],['Calcium','200mg'],['Sugar','18g'],['Probiotics','~10⁸ CFU']] },
  // FRUITS
  { id: 'f1', productId: 'f1', name: 'Apples',         e: '🍎', img: 'images/apple.png',   price: 180, unit: '/kg',    cat: 'fruits', badge: 'Imported', desc: 'Crisp Shimla apples from Himachal Pradesh.',                              nut: [['Calories','52 kcal'],['Fiber','2.4g'],['Vit C','4.6mg'],['Potassium','107mg'],['Quercetin','4.4mg'],['Sugar','10g']] },
  { id: 'f2', productId: 'f2', name: 'Bananas',        e: '🍌', img: 'images/banana.png',  price: 50,  unit: '/dozen', cat: 'fruits', badge: null,        desc: 'Naturally ripened Robusta bananas — energy-packed.',                      nut: [['Calories','89 kcal'],['Carbs','23g'],['Fiber','2.6g'],['Potassium','358mg'],['Vit B6','0.4mg'],['Magnesium','27mg']] },
  { id: 'f3', productId: 'f3', name: 'Alphonso Mango', e: '🥭', img: 'images/mangos.png',  price: 120, unit: '/kg',    cat: 'fruits', badge: 'Seasonal', desc: 'The king of mangoes — saffron-hued and exquisitely aromatic.',            nut: [['Calories','60 kcal'],['Fiber','1.6g'],['Vit C','36mg'],['Vit A','765 IU'],['Folate','43µg'],['Sugar','13.7g']] },
  { id: 'f4', productId: 'f4', name: 'Oranges',        e: '🍊', img: 'images/oranges.png', price: 80,  unit: '/kg',    cat: 'fruits', badge: null,        desc: 'Juicy Nagpur oranges bursting with Vitamin C.',                           nut: [['Calories','47 kcal'],['Vit C','53mg'],['Fiber','2.4g'],['Folate','30µg'],['Thiamine','0.1mg'],['Potassium','181mg']] },
  { id: 'f5', productId: 'f5', name: 'Papaya',         e: '🍈', img: 'images/papays.png',  price: 60,  unit: '/kg',    cat: 'fruits', badge: null,        desc: 'Ripe, sweet papaya loaded with antioxidants and enzymes.',                nut: [['Calories','43 kcal'],['Vit C','62mg'],['Folate','37µg'],['Potassium','182mg'],['Lycopene','1828µg'],['Fiber','1.7g']] },
];

function mapProduct(product) {
    return {
        id: product.productCode || product._id,
        productId: product._id,
        name: product.name,
        e: product.emoji || '📦',
        img: product.image ? `${API_BASE.replace('/api', '')}/uploads/${product.image}` : (product.imageUrl || null),
        price: product.price,
        unit: product.unit || '/unit',
        cat: product.category,
        badge: product.badge || null,
        desc: product.description || '',
        nut: Array.isArray(product.nutrition) ? product.nutrition : []
    };
}

async function loadProducts() {
    try {
        var response = await fetch(`${API_BASE}/products`);
        var result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to load products');
        }
        P = (result.products || []).map(mapProduct);
    } catch (err) {
        // Backend not running — fall back to the built-in product list
        console.warn('Backend unavailable, using fallback products:', err.message);
        P = FALLBACK_PRODUCTS;
    }
    return P;
}

function contentImageUrl(item) {
    if (!item) return '';
    return item.image ? `${API_BASE.replace('/api', '')}/uploads/${item.image}` : '';
}

async function loadContent() {
    try {
        var response = await fetch(`${API_BASE}/content`);
        var result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to load content');
        }
        CMS_CONTENT = result.content || [];
    } catch (err) {
        console.warn('CMS content unavailable:', err.message);
        CMS_CONTENT = [];
    }
    return CMS_CONTENT;
}

// ============================================================
//  DELIVERY ZONES — Serviceable Pincodes
//  Currently serving: Navi Mumbai (Panvel side)
//  Add new pincodes here as you expand your delivery range
// ============================================================
var DELIVERY_ZONES = {
    serviceable: {
        '410206': { area: 'Panvel / Old Panvel / Karanjade', city: 'Navi Mumbai' },
        '410218': { area: 'New Panvel / Kalamboli', city: 'Navi Mumbai' },
        '410209': { area: 'Kamothe', city: 'Navi Mumbai' },
        '410210': { area: 'Kharghar', city: 'Navi Mumbai' },
        '410220': { area: 'Taloja', city: 'Navi Mumbai' },
        '410222': { area: 'Ulwe', city: 'Navi Mumbai' },
        '400614': { area: 'CBD Belapur', city: 'Navi Mumbai' },
        '400706': { area: 'Nerul', city: 'Navi Mumbai' },
        '410208': { area: 'Panvel (Rural)', city: 'Navi Mumbai' },
        '410221': { area: 'Roadpali / Kalamboli', city: 'Navi Mumbai' },
    },
    businessName: 'Milqu Fresh',
    businessArea: 'Navi Mumbai (Panvel side)',
    contactWhatsApp: '8767067884'
};

function isDeliveryAvailable(pincode) {
    var pin = String(pincode).trim();
    return DELIVERY_ZONES.serviceable.hasOwnProperty(pin);
}

function getDeliveryAreaName(pincode) {
    var pin = String(pincode).trim();
    var zone = DELIVERY_ZONES.serviceable[pin];
    return zone ? zone.area + ', ' + zone.city : null;
}

function getAllServiceableAreas() {
    var areas = [];
    for (var pin in DELIVERY_ZONES.serviceable) {
        areas.push({
            pincode: pin,
            area: DELIVERY_ZONES.serviceable[pin].area,
            city: DELIVERY_ZONES.serviceable[pin].city
        });
    }
    return areas;
}
