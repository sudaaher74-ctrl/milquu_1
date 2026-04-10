require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const { getBooleanEnv, getRequiredEnv } = require('./config');

async function resetAdmin() {
    try {
        if (!getBooleanEnv('CONFIRM_ADMIN_RESET', false)) {
            throw new Error('Set CONFIRM_ADMIN_RESET=true before resetting admin accounts.');
        }

        await mongoose.connect(getRequiredEnv('MONGO_URI'));
        console.log('Connected to MongoDB.');

        await Admin.deleteMany({});
        console.log('Deleted old admins.');

        const newAdmin = new Admin({
            name: process.env.SEED_ADMIN_NAME || 'Admin',
            email: getRequiredEnv('SEED_ADMIN_EMAIL').toLowerCase(),
            password: getRequiredEnv('SEED_ADMIN_PASSWORD'),
            role: 'super_admin'
        });

        await newAdmin.save();
        console.log('Successfully created new super_admin:', newAdmin.email);
        process.exit(0);
    } catch (err) {
        console.error('Failed to reset admin:', err.message);
        process.exit(1);
    }
}

resetAdmin();
