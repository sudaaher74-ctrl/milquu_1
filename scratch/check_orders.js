const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'milqu-backend', '.env') });

const Order = require('../milqu-backend/models/Order');

async function checkRecentOrders() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/milqu_fresh'; // fallback if env not found
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');
        const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
        console.log('Recent 5 orders:');
        orders.forEach(o => {
            console.log(`ID: ${o.orderId}, Status: ${o.status}, Customer: ${o.customer.name}, CreatedAt: ${o.createdAt}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkRecentOrders();
