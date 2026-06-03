import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

async function run() {
  await connectDB();
  const adminUser = await User.findOne({ role: 'admin' });
  if (adminUser) {
    const data = {
      token: generateToken(adminUser._id),
      role: adminUser.role,
      name: adminUser.name,
      email: adminUser.email
    };
    console.log("ADMIN_TOKEN_JSON=" + JSON.stringify(data));
  } else {
    console.log("No admin user found");
  }
  process.exit(0);
}
run();
