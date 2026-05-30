import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products'); // Explicitly set collection to 'products'

const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const products = await Product.find({});
    let updatedCount = 0;
    
    for (let p of products) {
      if (p.get('image') && p.get('image').includes('.png')) {
        const newImage = p.get('image').replace('.png', '.webp');
        await Product.updateOne({ _id: p._id }, { $set: { image: newImage } });
        updatedCount++;
        console.log(`Updated product: ${p.get('name')} to ${newImage}`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixImages();
