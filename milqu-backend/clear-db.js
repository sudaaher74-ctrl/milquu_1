require('dotenv').config();
const mongoose = require('mongoose');

// Import all models
const Admin = require('./models/Admin');
const Content = require('./models/Content');
const Message = require('./models/Message');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Subscription = require('./models/Subscription');

async function clearDatabase() {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        console.log('🗑️  Deleting all data...');

        // Delete all documents in all collections
        await Admin.deleteMany({});
        await Content.deleteMany({});
        await Message.deleteMany({});
        await Order.deleteMany({});
        await Product.deleteMany({});
        await Subscription.deleteMany({});

        console.log('✨ All data cleared successfully! Your database is now completely empty.');
        console.log('Note: You will need to create a new Admin account when you open the dashboard next time.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        process.exit(1);
    }
}

clearDatabase();
