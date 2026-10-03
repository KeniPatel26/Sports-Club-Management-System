import mongoose from 'mongoose';

/**
 * StaffProfile Schema - Stores employee department, salary, shifts, and designation
 */
const staffProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    employeeId: {
      type: String,
      required: true,
      unique: true,
    },

    department: {
      type: String,
      enum: ['FRONT_DESK', 'SPORTS_SHOP', 'CANTEEN'],
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    joiningDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    salary: {
      type: Number,
      min: 0,
      default: 0,
    },

    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
      default: 'FULL_TIME',
    },

    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },

    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

export const StaffProfile =
  mongoose.models.StaffProfile ||
  mongoose.model('StaffProfile', staffProfileSchema);

export default StaffProfile;
