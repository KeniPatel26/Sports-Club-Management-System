import mongoose from 'mongoose';

/**
 * Court Schema - Tennis, Cricket, Padel, and Badminton facilities
 */
const courtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a court name'],
      trim: true,
      unique: true,
    },

    type: {
      type: String,
      enum: ['TENNIS', 'CRICKET', 'PADEL', 'BADMINTON'],
      required: true,
    },

    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
      default: 500,
    },

    walkInRate: {
      type: Number,
      required: true,
      min: 0,
      default: 800,
    },

    isIndoor: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Court = mongoose.models.Court || mongoose.model('Court', courtSchema);
export default Court;
