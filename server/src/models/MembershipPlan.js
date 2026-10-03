import mongoose from 'mongoose';

/**
 * MembershipPlan Schema
 * Tiers: GOLD (Premium), SILVER (Standard), JUNIOR (Youth Under 18)
 * Serves as the central pricing + access engine for Courts, Pro Shop, and Cafe.
 */
const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // "GOLD", "SILVER", "JUNIOR"
    },

    targetUser: {
      type: String,
      default: 'Regular members',
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

    duration: {
      type: Number,
      default: 365, // Duration in days
    },

    durationInDays: {
      type: Number,
      default: 365,
    },

    benefits: {
      courtDiscount: { type: Number, default: 10, min: 0, max: 100 },
      shopDiscount: { type: Number, default: 10, min: 0, max: 100 },
      cafeDiscount: { type: Number, default: 5, min: 0, max: 100 },
      canteenDiscount: { type: Number, default: 5, min: 0, max: 100 },
      bookingPriority: { type: String, enum: ['HIGH', 'STANDARD', 'LOW'], default: 'STANDARD' },
      dailyBookingLimit: { type: Number, default: 2 },
    },

    access: {
      courts: { type: Boolean, default: true },
      courtAccessType: { type: String, default: 'ALL' }, // 'ALL', 'STANDARD', 'JUNIOR'
      shop: { type: Boolean, default: true },
      cafe: { type: Boolean, default: true },
      events: { type: Boolean, default: true },
      eventAccessType: { type: String, default: 'ALL' }, // 'ALL', 'STANDARD', 'JUNIOR'
      training: { type: Boolean, default: false },
      trainingAccessType: { type: String, default: 'STANDARD' }, // 'PREMIUM', 'STANDARD', 'JUNIOR'
      onlineShop: { type: Boolean, default: true },
      clubPickup: { type: Boolean, default: true },
      delivery: { type: Boolean, default: true },
    },

    // Backward compatibility direct fields
    courtDiscount: { type: Number, default: 10 },
    shopDiscount: { type: Number, default: 10 },
    canteenDiscount: { type: Number, default: 5 },
    cafeDiscount: { type: Number, default: 5 },
    priorityBooking: { type: Boolean, default: false },
    fullCourtAccess: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
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

// Sync nested benefits with root fields on save
membershipPlanSchema.pre('save', function (next) {
  if (this.benefits) {
    this.courtDiscount = this.benefits.courtDiscount ?? this.courtDiscount;
    this.shopDiscount = this.benefits.shopDiscount ?? this.shopDiscount;
    this.canteenDiscount = this.benefits.cafeDiscount ?? this.benefits.canteenDiscount ?? this.canteenDiscount;
    this.cafeDiscount = this.canteenDiscount;
    this.priorityBooking = this.benefits.bookingPriority === 'HIGH';
  }
  if (this.duration) {
    this.durationInDays = this.duration;
  }
  this.isActive = this.status === 'ACTIVE';
  next();
});

export const MembershipPlan =
  mongoose.models.MembershipPlan ||
  mongoose.model('MembershipPlan', membershipPlanSchema);

export default MembershipPlan;
