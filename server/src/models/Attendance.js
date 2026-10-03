import mongoose from 'mongoose';

/**
 * Attendance Schema - Daily Employee Check-in, Check-out, Shift tracking & Automated Login Sync
 */
const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },

    dateKey: {
      type: String, // e.g. "2026-10-04" for deterministic uniqueness
      required: true,
      index: true,
    },

    checkIn: {
      type: Date,
      default: Date.now,
    },

    checkInTime: {
      type: String, // e.g. "09:04 AM"
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    checkOutTime: {
      type: String, // e.g. "05:58 PM"
      default: null,
    },

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      default: null,
    },

    status: {
      type: String,
      enum: ['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'LEAVE', 'ON_LEAVE'],
      default: 'PRESENT',
    },

    workedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    source: {
      type: String,
      enum: ['LOGIN', 'MANUAL', 'ADMIN'],
      default: 'LOGIN',
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

// Pre-validate hook to sync staff & employee and populate dateKey if missing
attendanceSchema.pre('validate', function (next) {
  if (this.staff && !this.employee) {
    this.employee = this.staff;
  }
  if (this.employee && !this.staff) {
    this.staff = this.employee;
  }
  if (!this.dateKey) {
    const d = this.date || new Date();
    this.dateKey = new Date(d).toISOString().slice(0, 10);
  }
  if (!this.checkInTime && this.checkIn) {
    this.checkInTime = new Date(this.checkIn).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
  next();
});

// Enforce strictly one attendance record per employee per calendar day
attendanceSchema.index({ staff: 1, dateKey: 1 }, { unique: true });

export const Attendance =
  mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default Attendance;
