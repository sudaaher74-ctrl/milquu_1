import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';

import Purchase from '../models/Purchase.js';
import Expense from '../models/Expense.js';
import Procurement from '../models/Procurement.js';
import Wastage from '../models/Wastage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

connectDB();

const importData = async () => {
  try {
    await Purchase.deleteMany();
    await Expense.deleteMany();
    await Procurement.deleteMany();
    await Wastage.deleteMany();

    const samplePurchases = [
      { poNumber: 'PUR-8901', supplierName: 'Navi Mumbai GlassWorks', category: 'Bottles', productName: '1L Glass Bottles', quantity: 5000, rate: 12, totalCost: 60000, status: 'Received' },
      { poNumber: 'PUR-8902', supplierName: 'Rajesh Plastics', category: 'Packaging', productName: '500ml Plastic Pouches', quantity: 20000, rate: 1.5, totalCost: 30000, status: 'Received' },
      { poNumber: 'PUR-8903', supplierName: 'Krishna Dairy Farms', category: 'Raw Milk', productName: 'A2 Cow Milk (Raw)', quantity: 1500, rate: 45, totalCost: 67500, status: 'Received' }
    ];

    const sampleExpenses = [
      { expenseId: 'EXP-101', category: 'Fuel Costs', description: 'Diesel for Delivery Vans', amount: 4500, paidTo: 'Indian Oil', paymentMethod: 'Card' },
      { expenseId: 'EXP-102', category: 'Marketing', description: 'FB Ads', amount: 8000, paidTo: 'Meta', paymentMethod: 'Card' },
      { expenseId: 'EXP-103', category: 'Electricity', description: 'Cold Storage Bill', amount: 14500, paidTo: 'MSEDCL', paymentMethod: 'Bank Transfer' }
    ];

    const sampleProcurements = [
      { procId: 'PROC-101', farmerName: 'Ramesh Patil', shift: 'Morning', milkType: 'Buffalo', quantityLiters: 120, fatPercentage: 6.8, snfPercentage: 9.1, ratePerLiter: 52, totalAmount: 6240 },
      { procId: 'PROC-102', farmerName: 'Suresh More', shift: 'Morning', milkType: 'Cow', quantityLiters: 85, fatPercentage: 4.2, snfPercentage: 8.5, ratePerLiter: 45, totalAmount: 3825 }
    ];

    const sampleWastages = [
      { wastageId: 'WST-001', productName: 'Fresh Malai Paneer', category: 'Dairy', quantity: 5, unit: 'kg', reason: 'Expired', lossValue: 600, reportedBy: 'Shop Manager' }
    ];

    await Purchase.insertMany(samplePurchases);
    await Expense.insertMany(sampleExpenses);
    await Procurement.insertMany(sampleProcurements);
    await Wastage.insertMany(sampleWastages);

    console.log('ERP Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  console.log('Destroy data not implemented');
  process.exit();
} else {
  importData();
}
