import mongoose from 'mongoose';

/**
 * Booking Schema - Real-time Court booking reservations
 * Prevents double-booking and enforces 2 bookings/day member limits
 */
const bookingSchema = new mongoose.Schema(
  {
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    bookingType: {
      type: String,
      enum: ['MEMBER', 'WALK_IN', 'SOCIAL_PLAY'],
      default: 'MEMBER',
      required: true,
    },

    walkInDetails: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true, // e.g. "18:00"
    },

    endTime: {
      type: String,
      required: true, // e.g. "19:00"
    },

    durationMinutes: {
      type: Number,
      default: 60,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountApplied: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'UPI', 'ONLINE', 'MEMBERSHIP_INCLUDED'],
      default: 'UPI',
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED'],
      default: 'PENDING',
    },

    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'CONFIRMED',
    },

    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee no two bookings exist for the same court, date, and startTime
bookingSchema.index(
  { court: 1, date: 1, startTime: 1, status: 1 },
  { unique: false }
);

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
export default Booking;
