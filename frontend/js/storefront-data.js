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
    var response = await fetch(`${API_BASE}/products`);
    var result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to load products');
    }
    P = (result.products || []).map(mapProduct);
    return P;
}
