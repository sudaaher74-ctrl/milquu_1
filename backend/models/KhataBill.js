import mongoose from 'mongoose';

const khataBillSchema = new mongoose.Schema({
  billNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    index: true 
  },
  guestId: { 
    type: String, 
    index: true 
  },
  customerName: { 
    type: String, 
    required: true 
  },
  customerPhone: { 
    type: String 
  },
  customerAddress: { 
    type: String 
  },
  billingCycle: { 
    type: String, 
    default: '15 Days' 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  dateRangeStr: { 
    type: String 
  },
  orders: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  }],
  dailyDeliveries: [
    {
      date: { type: String, required: true }, // "YYYY-MM-DD"
      litres: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
      productName: { type: String, default: 'Milk' },
      shift: { type: String, default: 'Morning' },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }
  ],
  totalLitres: { 
    type: Number, 
    default: 0 
  },
  subtotal: { 
    type: Number, 
    default: 0 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  paidAmount: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['Unpaid', 'Partially Paid', 'Settled'], 
    default: 'Unpaid',
    index: true 
  },
  dueDate: { 
    type: Date 
  },
  settledAt: { 
    type: Date 
  },
  settledMethod: { 
    type: String 
  },
  notes: { 
    type: String 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true
});

khataBillSchema.index({ user: 1, startDate: 1, endDate: 1 });
khataBillSchema.index({ guestId: 1, startDate: 1, endDate: 1 });

const KhataBill = mongoose.model('KhataBill', khataBillSchema);
export default KhataBill;
