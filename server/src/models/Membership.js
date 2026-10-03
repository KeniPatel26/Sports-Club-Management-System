import mongoose from 'mongoose';

/**
 * Membership Schema - Represents active/expired membership subscriptions
 */
const membershipSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
      default: 'PENDING',
    },

    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Automatic check for expired status on retrieve
membershipSchema.methods.isExpired = function () {
  return new Date() > this.expiryDate;
};

export const Membership =
  mongoose.models.Membership ||
  mongoose.model('Membership', membershipSchema);

export default Membership;
