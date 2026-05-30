import DeliveryStaff from '../models/DeliveryStaff.js';
import Order from '../models/Order.js';
import generateToken from '../utils/generateToken.js';

export const loginDeliveryStaff = async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await DeliveryStaff.findOne({ email });
    
    if (staff && (await staff.matchPassword(password))) {
      res.json({
        _id: staff._id,
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        area: staff.area,
        city: staff.city,
        role: 'delivery',
        token: generateToken(staff._id, 'delivery')
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyDeliveries = async (req, res) => {
  try {
    // For demo, we just return an empty array or all orders depending on how we want to handle it.
    // In prod, this would use req.user._id to find assigned orders.
    const deliveries = await Order.find({ deliveryStatus: 'Out for Delivery' });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const markOrderDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { proofImageUrl } = req.body;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Optional: Check if req.user._id matches order.deliveryStaff
    order.deliveryStatus = 'Delivered';
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.proofOfDelivery = proofImageUrl || '';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
