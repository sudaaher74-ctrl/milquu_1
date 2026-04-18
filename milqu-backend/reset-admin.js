require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Hunting for super_admins...');

    const admins = await Admin.find({ role: 'super_admin' });
    
    if (admins.length === 0) {
        console.log('No super_admins found! You can create a fresh one directly from the dashboard login screen.');
        process.exit(0);
    }

    console.log('--- FOUND YOUR ADMIN ACCOUNTS ---');
    for (const admin of admins) {
        console.log(`Found Admin Email: ${admin.email}`);
        
        // Let's reset the password so we can guarantee access
        admin.password = 'Aher2002'; 
        await admin.save();
        console.log(`✅ Successfully reset password for ${admin.email} to: Aher2002`);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });
