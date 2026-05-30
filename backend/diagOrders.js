import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

const orderSchema = new mongoose.Schema({}, { strict: false });
const userSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema);
const User = mongoose.model('User', userSchema);

async function fixOrders() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // List all users
  const users = await User.find({}).select('_id name email phone');
  console.log('\n=== USERS IN DB ===');
  users.forEach(u => console.log(`ID: ${u._id}  Name: ${u.name}  Email: ${u.email}  Phone: ${u.phone}`));

  // List all orders without a user field
  const orphanOrders = await Order.find({ user: { $exists: false } }).select('_id name phone createdAt');
  console.log(`\n=== ORPHAN ORDERS (no user field) ===  Count: ${orphanOrders.length}`);
  orphanOrders.forEach(o => console.log(`ID: ${o._id}  Name: ${o.name}  Phone: ${o.phone}  Date: ${o.createdAt}`));

  // List all orders WITH a user field
  const linkedOrders = await Order.find({ user: { $exists: true } }).select('_id name phone user createdAt');
  console.log(`\n=== LINKED ORDERS (have user field) ===  Count: ${linkedOrders.length}`);
  linkedOrders.forEach(o => console.log(`ID: ${o._id}  Name: ${o.name}  Phone: ${o.phone}  User: ${o.user}  Date: ${o.createdAt}`));

  mongoose.disconnect();
}

fixOrders().catch(console.error);
