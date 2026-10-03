import mongoose from 'mongoose';

/**
 * Expense Schema - Operating club costs (Equipment, Utilities, Maintenance, Supplies, Salaries)
 */
const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ['MAINTENANCE', 'UTILITIES', 'SUPPLIES', 'SALARY', 'EQUIPMENT', 'OTHER'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'UPI', 'CARD', 'CASH', 'CHEQUE'],
      default: 'BANK_TRANSFER',
    },

    vendor: {
      type: String,
      default: '',
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Expense =
  mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

export default Expense;
