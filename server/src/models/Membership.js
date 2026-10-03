import mongoose from 'mongoose';

/**
 * Membership Schema - Represents active/expired membership subscriptions
 * Links a User (Member) to a MembershipPlan with valid date range and payment status.
 */
const membershipSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    endDate: {
      type: Date,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'],
      default: 'ACTIVE',
    },

    autoRenew: {
      type: Boolean,
      default: false,
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PAID',
    },

    paymentMethod: {
      type: String,
      default: 'UPI',
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure user & endDate are synced with member & expiryDate
membershipSchema.pre('save', function (next) {
  if (this.member && !this.user) {
    this.user = this.member;
  }
  if (this.user && !this.member) {
    this.member = this.user;
  }
  if (this.expiryDate && !this.endDate) {
    this.endDate = this.expiryDate;
  }
  if (this.endDate && !this.expiryDate) {
    this.expiryDate = this.endDate;
  }
  next();
});

// Automatic check for expired status on retrieve
membershipSchema.methods.isExpired = function () {
  return new Date() > (this.expiryDate || this.endDate);
};

export const Membership =
  mongoose.models.Membership ||
  mongoose.model('Membership', membershipSchema);

export default Membership;
