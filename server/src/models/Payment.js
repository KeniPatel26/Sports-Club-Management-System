import mongoose from 'mongoose';

/**
 * Unified Payment Schema - Complete transaction history for Court Bookings, Memberships, Shop & Canteen
 */
const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    customerName: {
      type: String,
      default: 'Club Member',
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'CASH', 'NET_BANKING', 'WALLET', 'MEMBERSHIP_INCLUDED'],
      default: 'UPI',
      required: true,
    },

    purpose: {
      type: String,
      enum: ['COURT_BOOKING', 'MEMBERSHIP', 'SHOP_ORDER', 'CANTEEN_ORDER', 'OTHER'],
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'purposeRef',
    },

    purposeRef: {
      type: String,
      enum: ['Booking', 'Membership', 'Order'],
      default: function () {
        if (this.purpose === 'COURT_BOOKING') return 'Booking';
        if (this.purpose === 'MEMBERSHIP') return 'Membership';
        if (this.purpose === 'SHOP_ORDER' || this.purpose === 'CANTEEN_ORDER') return 'Order';
        return 'Booking';
      },
    },

    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Backward-compatibility virtual fields
paymentSchema.virtual('paymentId').get(function () {
  return this.transactionId || String(this._id);
});

paymentSchema.virtual('type').get(function () {
  return this.purpose;
});

paymentSchema.virtual('method').get(function () {
  return this.paymentMethod;
});

// Compound indexes for fast reporting and queries
paymentSchema.index({ status: 1, purpose: 1, createdAt: -1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ purpose: 1, referenceId: 1 });

export const Payment =
  mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
