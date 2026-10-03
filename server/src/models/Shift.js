import mongoose from 'mongoose';

/**
 * Shift Schema - Roster schedule for front desk, shop, and canteen employees
 */
const shiftSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      enum: ['FRONT_DESK', 'SPORTS_SHOP', 'CANTEEN'],
      required: true,
    },

    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  {
    timestamps: true,
  }
);

export const Shift = mongoose.models.Shift || mongoose.model('Shift', shiftSchema);
export default Shift;
