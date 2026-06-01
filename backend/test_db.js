import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/milquu/milquu_1/.env' });

const OrderSchema = new mongoose.Schema({},{ strict: false });
const Order = mongoose.model('Order', OrderSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const cutoff = new Date(startOfToday);
  cutoff.setHours(-2);

  const allPending = await Order.find({ isDelivered: false }).lean();
  console.log('Total pending orders:', allPending.length);

  const filtered = await Order.find({ 
    isDelivered: false,
    $or: [
      { scheduledDeliveryDate: { $gte: startOfToday, $lte: endOfToday } },
      { scheduledDeliveryDate: null, createdAt: { $gte: cutoff, $lte: endOfToday } },
      { scheduledDeliveryDate: { $exists: false }, createdAt: { $gte: cutoff, $lte: endOfToday } }
    ]
  }).lean();
  console.log('Filtered pending orders:', filtered.length);
  
  if(allPending.length > 0) {
      console.log('Sample of an unfiltered order that was missed:');
      const missed = allPending.filter(o => !filtered.find(f => f._id.toString() === o._id.toString()));
      if(missed.length > 0) {
          console.log(missed[0]);
      } else {
          console.log('None missed? Wait, then filtered should equal allPending.');
      }
  }

  process.exit(0);
}
run();
