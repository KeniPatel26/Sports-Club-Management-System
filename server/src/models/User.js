import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema - Central Authentication and Identity for The Champions Club
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
      default: '',
    },

    email: {
      type: String,
      required: [true, 'Please provide an email address'],
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
      required: [true, 'Please provide a phone number'],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Hidden by default from queries
    },

    role: {
      type: String,
      enum: ['MEMBER', 'STAFF', 'OWNER', 'FRONT_DESK', 'SHOP_STAFF', 'CANTEEN_STAFF', 'admin', 'user', 'manager'],
      required: true,
      default: 'MEMBER',
    },

    profileImage: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
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

// Encrypt password using bcryptjs pre-save hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
