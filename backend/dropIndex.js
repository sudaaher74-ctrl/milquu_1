import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB Connected');
  
  try {
    await Order.collection.dropIndex('orderId_1');
    console.log('Dropped orderId_1 index successfully!');
  } catch (err) {
    console.log('Index might not exist or another error occurred:', err.message);
  }
  
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
