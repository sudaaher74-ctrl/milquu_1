import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/milquu/milquu_1/.env' });

const StaffSchema = new mongoose.Schema({},{ strict: false });
const DeliveryStaff = mongoose.model('DeliveryStaff', StaffSchema, 'deliverystaffs');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const staff = await DeliveryStaff.find({ name: { $regex: 'swapnil', $options: 'i' } }).lean();
    if (staff.length > 0) {
      console.log('Found staff:', staff.map(s => ({ name: s.name, email: s.email, password: s.password, staffId: s.staffId })));
    } else {
      console.log('No staff found matching swapnil');
    }
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
