import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  expenseId: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // Fuel Costs, Marketing, Electricity, Rent, etc.
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidTo: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
