import mongoose from 'mongoose';

/**
 * Payment Schema - Financial payment transactions across memberships, courts, shop, and canteen
 */
const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    customerName: {
      type: String,
      default: 'Guest Customer',
    },

    type: {
      type: String,
      enum: ['MEMBERSHIP', 'BOOKING', 'SHOP', 'CANTEEN', 'OTHER'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      enum: ['UPI', 'CARD', 'CASH', 'NET_BANKING', 'WALLET'],
      default: 'UPI',
    },

    status: {
      type: String,
      enum: ['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'],
      default: 'SUCCESS',
    },

    referenceId: {
      type: String,
      default: '',
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

export const Payment =
  mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
