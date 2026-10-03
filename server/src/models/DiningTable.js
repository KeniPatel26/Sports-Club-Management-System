import mongoose from 'mongoose';

/**
 * DiningTable Schema - Canteen and Bar Lounge Table layout & status
 */
const diningTableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 4,
    },

    section: {
      type: String,
      enum: ['INDOOR_CAFE', 'OUTDOOR_TERRACE', 'VIP_LOUNGE', 'COURTSIDE_BAR'],
      default: 'INDOOR_CAFE',
    },

    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'OUT_OF_SERVICE'],
      default: 'AVAILABLE',
    },

    currentCustomer: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },

    activeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
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

export const DiningTable =
  mongoose.models.DiningTable || mongoose.model('DiningTable', diningTableSchema);

export default DiningTable;
