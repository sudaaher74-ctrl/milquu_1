import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
const MONGO_URI = process.env.MONGO_URI;

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema);

async function check() {
  await mongoose.connect(MONGO_URI);
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(3);
  console.log(JSON.stringify(orders, null, 2));
  mongoose.disconnect();
}
check();
