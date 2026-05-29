import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';

export const startSubscriptionEngine = () => {
  // Run every night at 11:59 PM
  cron.schedule('59 23 * * *', async () => {
    console.log('Running automated subscription engine...');
    try {
      // Find all active subscriptions
      const activeSubscriptions = await Subscription.find({ status: 'Active' });

      for (const sub of activeSubscriptions) {
        // Skip if frequency doesn't match today (Basic logic: daily runs every day)
        // In a real app, you'd check 'alternate days', 'weekends only', etc.
        
        // Generate an order for this subscription for tomorrow
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
          paymentMethod: 'Subscription',
          taxPrice: 0,
          totalPrice: sub.monthlyTotal / 30, // Rough estimate for daily price
          isPaid: false,
          isDelivered: false,
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
