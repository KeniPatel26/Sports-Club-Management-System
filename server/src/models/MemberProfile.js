import mongoose from 'mongoose';

/**
 * MemberProfile Schema - Stores detailed customer & member attributes
 */
const memberProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
    },

    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: {
        type: String,
        default: 'India',
      },
    },

    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    memberId: {
      type: String,
      unique: true,
      sparse: true,
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

export const MemberProfile =
  mongoose.models.MemberProfile ||
  mongoose.model('MemberProfile', memberProfileSchema);

export default MemberProfile;
