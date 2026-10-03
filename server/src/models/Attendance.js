import mongoose from 'mongoose';

/**
 * Attendance Schema - Daily Employee Check-in, Check-out & Status
 */
const attendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      default: null,
    },

    checkInTime: {
      type: String, // e.g. "08:55 AM"
      default: null,
    },

    checkOutTime: {
      type: String, // e.g. "05:05 PM"
      default: null,
    },

    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'ON_LEAVE', 'LATE', 'HALF_DAY'],
      default: 'PRESENT',
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

attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

export const Attendance =
  mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default Attendance;
