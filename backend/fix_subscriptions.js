import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subscription from './models/Subscription.js';
dotenv.config({ path: '/Users/milquu/milquu_1/.env' });

async function fixSubscriptions() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const subscriptions = await Subscription.find({ $or: [{ items: { $size: 0 } }, { items: { $exists: false } }] });
  console.log(`Found ${subscriptions.length} subscriptions with empty items.`);

  for (let sub of subscriptions) {
    let priceNum = 85;
    if (sub.totalAmount && !isNaN(sub.totalAmount)) {
      priceNum = sub.totalAmount / 30;
    }

    let name = 'Product';
    if (priceNum === 85) name = 'Pure Cow Milk';
    else if (priceNum === 95) name = 'A2 Cow Milk';
    else if (priceNum === 105) name = 'Premium Buffalo Milk';
    else name = 'Subscription Milk';

    await Subscription.updateOne(
      { _id: sub._id },
      {
        $set: {
          items: [{
            name: name,
            quantity: 1,
            price: priceNum || 85
          }]
        }
      }
    );
    console.log(`Updated subscription ${sub._id} with item ${name}`);
  }

  console.log('Done fixing subscriptions.');
  process.exit(0);
}

fixSubscriptions().catch(err => {
  console.error(err);
  process.exit(1);
});
