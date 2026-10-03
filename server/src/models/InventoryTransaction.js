import mongoose from 'mongoose';

/**
 * InventoryTransaction Schema - Audit log for all stock movements
 */
const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    type: {
      type: String,
      enum: ['PURCHASE', 'COUNTER_SALE', 'ONLINE_SALE', 'RETURN', 'DAMAGE', 'ADJUSTMENT'],
      required: true,
    },

    quantity: {
      type: Number,
      required: true, // positive for addition, negative or positive handled by controller
    },

    previousStock: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
    },

    referenceOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    notes: {
      type: String,
      default: '',
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const InventoryTransaction =
  mongoose.models.InventoryTransaction ||
  mongoose.model('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;
