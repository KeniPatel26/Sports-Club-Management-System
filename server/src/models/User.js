import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema with emailId, role, and password as primary fields
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Member',
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    emailId: {
      type: String,
      required: [true, 'Please provide an emailId'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address for emailId',
      ],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'manager'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Hidden by default from queries for security
    },
    title: {
      type: String,
      default: 'Product Specialist',
      trim: true,
    },
    bio: {
      type: String,
      default: 'Passionate about building modern software solutions.',
      maxlength: [250, 'Bio cannot exceed 250 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for email backward compatibility
userSchema.virtual('email')
  .get(function () {
    return this.emailId;
  })
  .set(function (val) {
    this.emailId = val;
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

// Compare user entered plain password with hashed password in MongoDB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
