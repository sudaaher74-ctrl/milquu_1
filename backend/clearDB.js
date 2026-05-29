import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Purchase from './models/Purchase.js';
import Expense from './models/Expense.js';
import Procurement from './models/Procurement.js';
import Wastage from './models/Wastage.js';
import Order from './models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const clearDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from environment variables");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    await Purchase.deleteMany({});
    await Expense.deleteMany({});
    await Procurement.deleteMany({});
    await Wastage.deleteMany({});
    await Order.deleteMany({});

    console.log('Successfully cleared ERP mock data from the database!');
    process.exit();
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearDB();
