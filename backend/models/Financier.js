import mongoose from 'mongoose';

const financierSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Financier name is required'], 
    trim: true 
  },
  phone: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  email: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  address: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  totalFinanced: { 
    type: Number, 
    default: 0 
  },
  totalRepaid: { 
    type: Number, 
    default: 0 
  },
  currentOutstanding: { 
    type: Number, 
    default: 0 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

financierSchema.index({ name: 1 });
financierSchema.index({ phone: 1 });
financierSchema.index({ isActive: 1 });

const Financier = mongoose.model('Financier', financierSchema);

export default Financier;

