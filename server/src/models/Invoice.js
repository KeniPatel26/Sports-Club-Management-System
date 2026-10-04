import mongoose from 'mongoose';

/**
 * Invoice Schema - Invoices generated for Members, Bookings, Shop, and Canteen tabs
 */
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
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

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },

    customerName: {
      type: String,
      default: 'Guest Customer',
    },

    customerEmail: {
      type: String,
      default: '',
    },

    customerPhone: {
      type: String,
      default: '',
    },

    type: {
      type: String,
      enum: ['MEMBERSHIP', 'BOOKING', 'SHOP', 'CANTEEN', 'GENERAL'],
      required: true,
    },

    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING', 'OVERDUE', 'CANCELLED'],
      default: 'PAID',
    },

    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'CASH', 'NET_BANKING', 'WALLET', 'MEMBERSHIP_INCLUDED'],
      default: 'UPI',
    },

    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },

    paidDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice =
  mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);

export default Invoice;
