require('dotenv').config();
const mongoose = require('mongoose');
const Area = require('./models/Area');
const Admin = require('./models/Admin');
const { getRequiredEnv } = require('./config');

async function seedAreas() {
    try {
        await mongoose.connect(getRequiredEnv('MONGO_URI'));
        console.log('Connected to MongoDB.');

        // Clear existing related mock data
        await Area.deleteMany({});
        await Admin.deleteMany({ role: 'delivery_staff' });
        console.log('Cleared existing areas and delivery boys.');

        // 1. Create Area models
        const areaData = [
            { name: 'Kharghar', pincodes: ['410210'] },
            { name: 'New Panvel', pincodes: ['410206'] },
            { name: 'Kamothe', pincodes: ['410209'] },
            { name: 'Karanjade', pincodes: ['410206'] } // Panvel pincode
        ];

        const insertedAreas = await Area.insertMany(areaData);
        console.log('Inserted 4 areas successfully!');

        // 2. Hire Delivery boys for each area
        const adminsData = insertedAreas.map((area, idx) => ({
            name: `${area.name} Delivery Boy`,
            email: `delivery${idx + 1}@milqu.com`,
            password: 'password123',
            role: 'delivery_staff',
            assigned_area: area._id
        }));

        const insertedAdmins = await Admin.insertMany(adminsData);
        console.log('Inserted 4 delivery boys assigned to the areas successfully!');

        // 3. Update the seed-demo-orders.js dynamically by passing one of the area_ids
        process.exit(0);
    } catch (err) {
        console.error('Failed to seed areas:', err.message);
        process.exit(1);
    }
}

seedAreas();
