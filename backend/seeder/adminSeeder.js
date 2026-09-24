import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = 'milquufresh@gmail.com';
    const password = 'milquu@2026';
    const role = 'admin';

    let user = await User.findOne({ email });

    if (user) {
      user.role = role;
      user.password = password; // pre('save') hook will hash this with bcrypt
      await user.save();
      console.log(`Updated existing user ${email} to role: '${role}' with new password.`);
    } else {
      user = new User({
        name: 'Milquu Admin',
        email,
        password,
        role,
        walletBalance: 0
      });
      await user.save();
      console.log(`Created new admin user ${email} with role: '${role}'.`);
    }

    // Verify password matching
    const isMatch = await user.matchPassword(password);
    console.log(`Password verification test for '${email}': ${isMatch ? 'SUCCESS (matches)' : 'FAILED'}`);

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
