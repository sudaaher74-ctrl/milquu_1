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

async function patchOrders() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Sudarshan Aher's user ID from the DB
  const sudarshanUserId = new mongoose.Types.ObjectId('6a1a8aaa76883d289bf7a7b7');

  // His order IDs (phone 8767067884 / 08767067884)
  const orderIds = [
    '6a19582c64aa707164f70fcb',  // sudarshan aher - May 29
    '6a1a8bb376883d289bf7a7b8',  // Sudarshan aher - May 30
    '6a1a9640de50ce7f2a8c2903',  // Sudadrshan Aher - May 30
    '6a1a9b1f6bf1ae720de3253c',  // Sudarshan aher - May 30 (latest)
  ].map(id => new mongoose.Types.ObjectId(id));

  const result = await Order.updateMany(
    { _id: { $in: orderIds } },
    { $set: { user: sudarshanUserId } }
  );

  console.log(`\n✅ Patched ${result.modifiedCount} orders — linked to Sudarshan Aher`);

  // Verify
  const orders = await Order.find({ user: sudarshanUserId }).select('_id name phone createdAt');
  console.log(`\n=== SUDARSHAN'S LINKED ORDERS ===`);
  orders.forEach(o => console.log(`ID: ${o._id}  Name: ${o.name}  Date: ${o.createdAt}`));

  mongoose.disconnect();
}

patchOrders().catch(console.error);
