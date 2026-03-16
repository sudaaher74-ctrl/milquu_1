const Product = require('../models/Product');
const defaultProducts = require('./default-products');

async function ensureDefaultProducts() {
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
        return;
    }

    await Product.insertMany(defaultProducts);
}

module.exports = {
    ensureDefaultProducts
};
