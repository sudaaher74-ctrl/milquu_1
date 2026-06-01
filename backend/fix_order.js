import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/milquu/milquu_1/.env' });

const OrderSchema = new mongoose.Schema({},{ strict: false });
const Order = mongoose.model('Order', OrderSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const latestOrder = await Order.findOne().sort({ createdAt: -1 });
  console.log('Old scheduled date:', latestOrder.scheduledDeliveryDate);
  latestOrder.scheduledDeliveryDate = new Date(); // set to today
  await latestOrder.save();
  console.log('New scheduled date:', latestOrder.scheduledDeliveryDate);
  process.exit(0);
}
run();
