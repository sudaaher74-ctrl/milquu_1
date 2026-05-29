import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'milk', 'by-products'
  labels: [{ type: String }] // e.g., ['Farm Fresh', 'A2 Protein']
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
