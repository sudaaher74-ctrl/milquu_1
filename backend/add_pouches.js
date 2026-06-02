import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
dotenv.config({ path: '/Users/milquu/milquu_1/.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const cowPouch = new Product({
    name: 'Cow Milk (Pouch)',
    description: 'Fresh cow milk available in convenient pouch packaging. Daily morning delivery.',
    price: 58,
    unit: '1 Litre',
    image: '/img/cow-milk-pouch.webp',
    category: 'milk',
    labels: ['Farm Fresh']
  });
  
  const buffaloPouch = new Product({
    name: 'Buffalo Milk (Pouch)',
    description: 'Thick buffalo milk available in convenient pouch packaging. Daily morning delivery.',
    price: 75,
    unit: '1 Litre',
    image: '/img/buffalo-milk-pouch.webp',
    category: 'milk',
    labels: ['Thick & Creamy']
  });
  
  await cowPouch.save();
  await buffaloPouch.save();
  
  console.log('Products added!');
  process.exit(0);
}
run();
