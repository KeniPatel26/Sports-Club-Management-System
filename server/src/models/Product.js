import mongoose from 'mongoose';

/**
 * Product Schema - Sports Shop gear & Canteen/Bar cafeteria menu items
 * Uses a single unified inventory for both physical counter sales and online orders
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },

    type: {
      type: String,
      enum: ['canteen', 'sports'],
      required: [true, 'Please specify product type (canteen or sports)'],
    },

    category: {
      type: String,
      default: 'General',
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Please specify price'],
      min: 0,
    },

    image: {
      type: String,
      default: '',
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product =
  mongoose.models.Product ||
  mongoose.model('Product', productSchema);

export default Product;
