require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const { getRequiredEnv } = require('./config');

async function seedDemoOrders() {
    try {
        await mongoose.connect(getRequiredEnv('MONGO_URI'));
        console.log('Connected to MongoDB.');

        const Area = require('./models/Area');
        const Admin = require('./models/Admin');
        const areas = await Area.find();
        if(areas.length < 4) {
             console.error("Please run node seed-areas.js first!");
             process.exit(1);
        }

        // We fetch the delivery boys for each area
        const findBoy = async (areaId) => {
             const b = await Admin.findOne({ role: 'delivery_staff', assigned_area: areaId });
             return b ? b._id : null;
        }

        const area1 = areas[0]._id; // Kharghar
        const area2 = areas[1]._id; // New Panvel
        const area3 = areas[2]._id; // Kamothe
        const area4 = areas[3]._id; // Karanjade

        const b1 = await findBoy(area1);
        const b2 = await findBoy(area2);
        const b3 = await findBoy(area3);
        const b4 = await findBoy(area4);

        const demoOrders = [
            {
                orderId: 'MQ-INV001',
                customer: {
                    name: 'Priya Sharma',
                    phone: '9876543210',
                    address: 'A-402, Seawood Estates, Navi Mumbai' // Let's say she's ordered in Kharghar
                },
                items: [
                    { id: 'PD_CM_A2_1L', productId: '60c72b2f9b1d8b001c8e4a90', name: 'Farm Fresh A2 Cow Milk', price: 90, qty: 2, e: '🥛' },
                    { id: 'PD_PN_FR_250', productId: '60c72b2f9b1d8b001c8e4a91', name: 'Organic Fresh Paneer (250g)', price: 120, qty: 1, e: '🧀' }
                ],
                total: 300,
                paymentMethod: 'upi',
                status: 'out_for_delivery',
                paymentStatus: 'paid',
                area_id: area1,
                assigned_delivery_boy_id: b1
            },
            {
                orderId: 'MQ-INV002',
                customer: {
                    name: 'Raju Gupta',
                    phone: '9876509876',
                    address: 'Villa 14, Palm Beach Rd, Vashi'
                },
                items: [
                    { id: 'PD_BM_FR_1L', productId: '60c72b2f9b1d8b001c8e4a92', name: 'Premium Buffalo Milk', price: 80, qty: 1, e: '🥛' },
                    { id: 'PD_GH_CO_500', productId: '60c72b2f9b1d8b001c8e4a93', name: 'Pure Cow Ghee (500ml)', price: 450, qty: 1, e: '🍯' }
                ],
                total: 530,
                paymentMethod: 'cod',
                status: 'out_for_delivery',
                paymentStatus: 'pending',
                area_id: area2,
                assigned_delivery_boy_id: b2
            },
            {
                orderId: 'MQ-INV003',
                customer: {
                    name: 'Sneha Desai',
                    phone: '9988776655',
                    address: 'B-201, Green View Apts, Belapur'
                },
                items: [
                    { id: 'PD_CM_A2_1L', productId: '60c72b2f9b1d8b001c8e4a90', name: 'Farm Fresh A2 Cow Milk', price: 90, qty: 3, e: '🥛' }
                ],
                total: 270,
                paymentMethod: 'card',
                status: 'out_for_delivery',
                paymentStatus: 'paid',
                area_id: area3,
                assigned_delivery_boy_id: b3
            },
            {
                orderId: 'MQ-INV004',
                customer: {
                    name: 'Amit Patel',
                    phone: '9822334455',
                    address: 'Shop No. 4, Daily Needs, Kharghar Sector 12, Navi Mumbai'
                },
                items: [
                    { id: 'PD_CM_A2_1L', productId: '60c72b2f9b1d8b001c8e4a90', name: 'Farm Fresh A2 Cow Milk', price: 90, qty: 12, e: '🥛' },
                    { id: 'PD_PN_FR_BULK', productId: '60c72b2f9b1d8b001c8e4a94', name: 'Organic Fresh Paneer (Bulk)', price: 100, qty: 5, e: '🧀' }
                ],
                total: 1580,
                paymentMethod: 'cod',
                status: 'out_for_delivery',
                paymentStatus: 'pending',
                area_id: area1,
                assigned_delivery_boy_id: b1
            }
        ];

        // Ensure we don't have existing duplicates if run multiple times
        for (const o of demoOrders) {
            await Order.deleteOne({ orderId: o.orderId });
        }

        await Order.insertMany(demoOrders);
        console.log('Successfully added 4 premium demo orders for the investor demo!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to seed demo orders:', err.message);
        process.exit(1);
    }
}

seedDemoOrders();
