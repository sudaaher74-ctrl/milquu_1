require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const { getRequiredEnv } = require('./config');

async function resetAdmin() {
    try {
        await mongoose.connect(getRequiredEnv('MONGO_URI'));
        console.log('Connected to MongoDB.');

        await Admin.deleteMany({});
        console.log('Deleted old admins.');

        const newAdmin = new Admin({
            name: 'Sudarshan',
            email: 'sudaaher74@gmail.com',
            password: 'Sudarshan@2002',
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
