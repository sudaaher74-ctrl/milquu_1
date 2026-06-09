import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

export const startSubscriptionEngine = () => {
  // Run every night at 11:59 PM
  cron.schedule('59 23 * * *', async () => {
    console.log('Running automated subscription engine...');
    try {
      // Find all subscriptions that are Active or paused
      const activeSubscriptions = await Subscription.find({ 
        status: { $in: ['Active', 'active', 'paused', 'Paused'] } 
      });

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Normalize to start of day

      for (const sub of activeSubscriptions) {
        
        // Handle auto-resuming if the pause end date has passed
        if ((sub.status === 'paused' || sub.status === 'Paused') && sub.pauseEndDate) {
          const endDate = new Date(sub.pauseEndDate);
          endDate.setHours(0, 0, 0, 0);
          
          if (currentDate > endDate) {
            sub.status = 'Active';
            sub.pauseStartDate = undefined;
            sub.pauseEndDate = undefined;
            await sub.save();
            console.log(`Auto-resumed subscription: ${sub._id}`);
          }
        }

        // If the subscription is STILL paused, skip generating an order
        if (sub.status === 'paused' || sub.status === 'Paused') {
          console.log(`Skipping paused subscription: ${sub._id}`);
          continue;
        }

        // Fetch User to check Wallet Balance
        const user = await User.findById(sub.user);
        const dailyCost = sub.monthlyTotal / 30; // Rough estimate for daily price

        if (!user) continue;

        if (user.walletBalance < dailyCost) {
          console.log(`Auto-pausing subscription ${sub._id} due to low balance (Balance: ₹${user.walletBalance}, Cost: ₹${dailyCost})`);
          sub.status = 'paused';
          await sub.save();
          continue;
        } else if (user.walletBalance < (dailyCost * 3)) {
          console.log(`[SIMULATED SMS to ${user.phone}]: Hi ${user.name}, your MilQuu wallet is critically low (₹${user.walletBalance}). Please recharge to avoid milk delivery pauses.`);
        }

        // Generate an order for this subscription for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const order = new Order({
          user: sub.user,
          name: sub.name,
          phone: sub.phone,
          orderItems: sub.items.map(item => ({
            name: item.name,
            qty: item.quantity || 1,
            image: '/placeholder.jpg',
            price: item.price,
            product: item.productId // Ensure your items have this mapping
          })),
          shippingAddress: {
            address: sub.deliveryAddress,
            city: 'Local',
            postalCode: '000000',
            country: 'India'
          },
          paymentMethod: 'Wallet', // Changed from 'Subscription' to 'Wallet' for Phase 2/3
          taxPrice: 0,
          totalPrice: dailyCost,
          isPaid: false,
          isDelivered: false,
          scheduledDeliveryDate: tomorrow,
          orderSource: 'Website'
        });

        await order.save();
        console.log(`Order auto-generated for subscription: ${sub._id}`);
      }

      console.log('Subscription engine completed successfully.');
    } catch (error) {
      console.error('Error in subscription engine:', error.message);
    }
  });

  console.log('Automated Subscription Engine initialized.');
};
