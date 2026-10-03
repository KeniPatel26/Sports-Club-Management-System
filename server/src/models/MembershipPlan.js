import mongoose from 'mongoose';

/**
 * MembershipPlan Schema - Tiers: Gold (Premium), Silver (Standard), Junior (Under 18 Discounted)
 */
const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    durationInDays: {
      type: Number,
      required: true,
      default: 365,
    },

    courtDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    shopDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    canteenDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    priorityBooking: {
      type: Boolean,
      default: false,
    },

    fullCourtAccess: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MembershipPlan =
  mongoose.models.MembershipPlan ||
  mongoose.model('MembershipPlan', membershipPlanSchema);

export default MembershipPlan;
