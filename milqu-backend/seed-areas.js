require('dotenv').config();
const mongoose = require('mongoose');
const Area = require('./models/Area');
const Admin = require('./models/Admin');
const { getBooleanEnv, getRequiredEnv } = require('./config');

async function seedAreas() {
    try {
        if (!getBooleanEnv('CONFIRM_AREA_SEED', false)) {
            throw new Error('Set CONFIRM_AREA_SEED=true before reseeding areas and delivery staff.');
        }

        await mongoose.connect(getRequiredEnv('MONGO_URI'));
        console.log('Connected to MongoDB.');

        // Clear existing related mock data
        await Area.deleteMany({});
        await Admin.deleteMany({ role: 'delivery_staff' });
        console.log('Cleared existing areas and delivery boys.');

        // 1. Create Area models — All Navi Mumbai areas
        const areaData = [
            { name: 'New Panvel',  pincodes: ['410206'] },
            { name: 'Old Panvel',  pincodes: ['410206'] },
            { name: 'Kamothe',     pincodes: ['410209'] },
            { name: 'Karanjade',   pincodes: ['410206'] },
            { name: 'Kharghar',    pincodes: ['410210'] },
            { name: 'Belapur',     pincodes: ['400614'] },
        ];

        const insertedAreas = await Area.insertMany(areaData);
        console.log(`Inserted ${insertedAreas.length} Navi Mumbai areas successfully!`);

        // 2. Hire Delivery boys for each area
        const deliveryStaffPassword = getRequiredEnv('DELIVERY_STAFF_PASSWORD');
        const staffNames = [
            'Rajesh Kumar',
            'Amit Singh',
            'Vikram Patel',
            'Suresh Yadav',
            'Pradeep Verma',
            'Manoj Sharma'
        ];

        const adminsData = insertedAreas.map((area, idx) => ({
            name: staffNames[idx] || `${area.name} Delivery Boy`,
            email: `delivery${idx + 1}@milqu.com`,
            password: deliveryStaffPassword,
            role: 'delivery_staff',
            phone: `98765432${10 + idx}`,
            assigned_area: area._id
        }));

        const insertedAdmins = await Admin.insertMany(adminsData);
        console.log(`Inserted ${insertedAdmins.length} delivery boys assigned to areas:`);
        insertedAdmins.forEach((a, i) => {
            console.log(`  ${a.name} → ${insertedAreas[i].name} (${insertedAreas[i].pincodes.join(', ')})`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Failed to seed areas:', err.message);
        process.exit(1);
    }
}

seedAreas();
