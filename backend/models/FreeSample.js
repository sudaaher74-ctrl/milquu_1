import mongoose from 'mongoose';

const freeSampleSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobileNumber: { type: String, required: true, index: true },
  whatsappNumber: { type: String },
  selectedProduct: { type: String, required: true },
  
  address: {
    houseFlat: { type: String, required: true },
    buildingSociety: { type: String, required: true },
    streetArea: { type: String, required: true },
    landmark: { type: String },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    mapsUrl: { type: String }
  },

  preferredDeliveryTime: { type: String, enum: ['Morning', 'Evening'], required: true },
  deliveryInstructions: { type: String },

  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Delivered', 'Rejected'],
    default: 'Pending'
  },
  
  deviceType: { type: String },
  ipAddress: { type: String },
  
}, { timestamps: true });

const FreeSample = mongoose.model('FreeSample', freeSampleSchema);
export default FreeSample;
