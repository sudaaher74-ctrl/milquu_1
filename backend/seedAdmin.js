import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    await connectDB();
    const adminExists = await User.findOne({ email: 'admin@milquu.com' });

    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin',
        email: 'admin@milquu.com',
        password: 'admin', // Will be hashed by pre-save hook
        role: 'admin',
      });

      await adminUser.save();
      console.log('Admin user seeded successfully. Email: admin@milquu.com / Password: admin');
    } else {
      console.log('Admin already exists.');
    }
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
