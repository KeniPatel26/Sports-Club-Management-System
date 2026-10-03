import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema - Foundation Identity & Access Control for The Champions Club
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      default: '',
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },

    role: {
      type: String,
      enum: ['MEMBER', 'CLUB_MANAGER', 'STAFF'],
      default: 'MEMBER',
      required: true,
    },

    // Only used when role === 'STAFF'
    department: {
      type: String,
      enum: ['FRONT_DESK', 'SPORTS_SHOP', 'CANTEEN', null],
      default: null,
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },

    profileImage: {
      type: String,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for full name
userSchema.virtual('name')
  .get(function () {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'Club Member';
  })
  .set(function (fullName) {
    if (fullName) {
      const parts = fullName.trim().split(' ');
      this.firstName = parts[0] || 'Member';
      this.lastName = parts.slice(1).join(' ') || '';
    }
  });

// Virtual field for avatar compatibility
userSchema.virtual('avatar')
  .get(function () {
    return this.profileImage || '';
  })
  .set(function (val) {
    this.profileImage = val;
  });

// Virtual field for emailId backward compatibility
userSchema.virtual('emailId')
  .get(function () {
    return this.email;
  })
  .set(function (val) {
    this.email = val;
  });

// Helper method on instance to match passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
