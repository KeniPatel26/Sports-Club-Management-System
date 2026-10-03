import mongoose from 'mongoose';

/**
 * Lead Schema - Enquiry tracker for new visitors who find the club online
 */
const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    interestedSport: {
      type: String,
      enum: ['TENNIS', 'CRICKET', 'PADEL', 'BADMINTON', 'ALL_SPORTS'],
      default: 'ALL_SPORTS',
    },

    interestedPlan: {
      type: String,
      default: 'GOLD',
    },

    message: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'TRIAL_BOOKED', 'CONVERTED_MEMBER', 'ARCHIVED'],
      default: 'NEW',
    },

    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
export default Lead;
