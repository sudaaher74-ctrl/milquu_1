import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import connectDB from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const categoryData = {
  'milk': {
    title: 'Pure Farm Milk',
    description: '100% organic, freshly milked and delivered within hours.',
    bgLight: 'bg-milquu-green/5',
    blobColor: 'bg-milquu-green/20',
    products: [
      { 
        name: 'A2 Cow Milk', 
        description: 'Rich in A2 protein, easily digestible and highly nutritious.',
        price: 95, 
        unit: '1 Litre', 
        image: '/img/products/A2milk.png',
        labels: ['Farm Fresh', 'A2 Protein'],
        category: 'milk'
      },
      { 
        name: 'Premium Buffalo Milk', 
        description: 'Thick, creamy, and perfect for making rich curds and ghee.',
        price: 105, 
        unit: '1 Litre', 
        image: '/img/products/buffalomilk.png',
        labels: ['High Fat', 'Creamy'],
        category: 'milk'
      },
      { 
        name: 'Pure Cow Milk', 
        description: 'Light, healthy, and packed with essential vitamins for daily use.',
        price: 85, 
        unit: '1 Litre', 
        image: '/img/products/cowmilk.png',
        labels: ['Organic', 'Daily Health'],
        category: 'milk'
      },
    ]
  },
  'by-products': {
    title: 'Authentic Dairy Delights',
    description: 'Traditional dairy products crafted from pure farm-fresh milk.',
    bgLight: 'bg-milquu-gold/5',
    blobColor: 'bg-milquu-gold/20',
    products: [
      { 
        name: 'Fresh Dahi', 
        description: 'Thick, naturally set curd with a smooth, velvety texture.',
        price: 60, 
        unit: '500g', 
        image: '/img/products/Dahi.png',
        labels: ['Farm Fresh', 'Probiotic'],
        category: 'by-products'
      },
      { 
        name: 'Sweet Lassi', 
        description: 'Traditional churned yogurt drink, refreshing and lightly sweetened.',
        price: 40, 
        unit: '250ml', 
        image: '/img/products/lassi.png',
        labels: ['Traditional', 'Refreshing'],
        category: 'by-products'
      },
      { 
        name: 'Soft Paneer', 
        description: 'Melt-in-mouth cottage cheese, rich in protein and incredibly soft.',
        price: 120, 
        unit: '200g', 
        image: '/img/products/panner.png',
        labels: ['High Protein', 'Pure'],
        category: 'by-products'
      },
      { 
        name: 'A2 Cow Ghee', 
        description: 'Premium bilona churned A2 cow ghee with rich aroma, highly nutritious and healthy.',
        price: 850, 
        unit: '500g', 
        image: '/img/products/A2ghee.png',
        labels: ['Bilona Churned', 'A2 Milk'],
        category: 'by-products'
      },
      { 
        name: 'Pure Cow Ghee', 
        description: 'Traditional pure cow ghee with golden texture, perfect for daily cooking.',
        price: 650, 
        unit: '500g', 
        image: '/img/products/cowghee.png',
        labels: ['Traditional', 'Aromatic'],
        category: 'by-products'
      },
    ]
  }
};

const importData = async () => {
  try {
    await connectDB();

    await Product.deleteMany(); // Clear existing products

    // Flatten products
    const productsToInsert = [];
    Object.values(categoryData).forEach(cat => {
      productsToInsert.push(...cat.products);
    });

    await Product.insertMany(productsToInsert);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

importData();
