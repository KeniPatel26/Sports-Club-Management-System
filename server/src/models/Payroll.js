import mongoose from 'mongoose';

/**
 * Payroll Schema - Monthly Salary, Bonuses, Deductions, and Payouts
 */
const payrollSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    monthYear: {
      type: String, // e.g. "October 2026" or "2026-10"
      required: true,
    },

    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },

    deduction: {
      type: Number,
      default: 0,
      min: 0,
    },

    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'PAID'],
      default: 'DRAFT',
    },

    paidDate: {
      type: Date,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH'],
      default: 'BANK_TRANSFER',
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

payrollSchema.index({ staff: 1, monthYear: 1 }, { unique: true });

export const Payroll =
  mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);

export default Payroll;
