import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../.env' });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({});
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}
test();
