import mongoose from 'mongoose';

/**
 * Order Schema - Sports Shop gear orders and Canteen/Bar cafeteria bills
 * Supports tabs, table service, member discounts, and multiple payment methods
 */
const orderSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    customerName: {
      type: String,
      default: 'Guest Customer',
    },

    customerPhone: {
      type: String,
      default: '',
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    type: {
      type: String,
      enum: ['canteen', 'sports'],
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    fulfillment: {
      type: String,
      enum: ['table', 'pickup', 'delivery', 'counter'],
      required: true,
      default: 'counter',
    },

    tableNumber: {
      type: String,
      default: '',
    },

    isTab: {
      type: Boolean,
      default: false,
    },

    tabStatus: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'CLOSED',
    },

    deliveryAddress: {
      type: String,
      default: '',
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'online', 'tab'],
      required: true,
      default: 'upi',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },

    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Order =
  mongoose.models.Order ||
  mongoose.model('Order', orderSchema);

export default Order;
