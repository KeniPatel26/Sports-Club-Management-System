import mongoose from 'mongoose';

/**
 * ClubSetting Schema - System-wide configuration & rules
 */
const clubSettingSchema = new mongoose.Schema(
  {
    clubName: {
      type: String,
      default: 'Champions Sports Club',
    },

    contactEmail: {
      type: String,
      default: 'support@championsclub.com',
    },

    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },

    address: {
      type: String,
      default: '100 Olympic Boulevard, Sports Complex, SG Highway',
    },

    sessionDurationMinutes: {
      type: Number,
      default: 60,
    },

    slotIntervalMinutes: {
      type: Number,
      default: 30,
    },

    maxBookingsPerMemberPerDay: {
      type: Number,
      default: 2,
    },

    membershipGracePeriodDays: {
      type: Number,
      default: 7,
    },

    taxRatePercent: {
      type: Number,
      default: 18,
    },

    currencySymbol: {
      type: String,
      default: '₹',
    },

    allowWalkInBookings: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ClubSetting =
  mongoose.models.ClubSetting || mongoose.model('ClubSetting', clubSettingSchema);

export default ClubSetting;
