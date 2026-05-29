import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DeliveryStaff from './models/DeliveryStaff.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB Connected');
  
  await DeliveryStaff.deleteMany({});
  
  await DeliveryStaff.create({
    staffId: 'DEL-001',
    name: 'Ramesh Kumar',
    email: 'delivery@milquu.com',
    phone: '9876543210',
    password: 'delivery123',
    vehicleNo: 'KA-01-AB-1234',
    city: 'Bangalore',
    area: 'Indiranagar',
    status: 'Active'
  });
  
  console.log('Delivery Staff created!');
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
