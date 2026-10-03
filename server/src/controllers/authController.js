import User from '../models/User.js';
import MemberProfile from '../models/MemberProfile.js';
import StaffProfile from '../models/StaffProfile.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity, logAudit } from '../services/activityService.js';

/**
 * @desc    Register a new user / member
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, name, emailId, email, phone, password, role = 'MEMBER' } = req.body;
    const resolvedEmail = (email || emailId || '').toLowerCase().trim();

    if (!resolvedEmail || !password) {
      return sendError(res, {
        statusCode: 400,
        message: 'Email and password are required',
      });
    }

    const existingUser = await User.findOne({ email: resolvedEmail });
    if (existingUser) {
      return sendError(res, {
        statusCode: 400,
        message: 'User with this email already exists',
      });
    }

    // Split name if firstName not provided
    let fName = firstName;
    let lName = lastName || '';
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ');
    }

    const user = await User.create({
      firstName: fName || 'Member',
      lastName: lName,
      email: resolvedEmail,
      phone: phone || `+91-${Date.now().toString().slice(-10)}`,
      password,
      role: role.toUpperCase(),
      status: 'ACTIVE',
    });

    // If member, automatically initialize MemberProfile
    if (user.role === 'MEMBER' || user.role === 'USER') {
      const memberCount = await MemberProfile.countDocuments();
      const memberId = `MEM${(memberCount + 1001).toString()}`;
      await MemberProfile.create({
        user: user._id,
        memberId,
        joinedAt: new Date(),
      });
    }

    const token = generateToken(user);

    await logActivity({
      userId: user._id,
      action: `Registered as ${user.role}`,
      entity: 'User',
      entityId: user._id,
    });

    await logAudit({
      userId: user._id,
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account registered successfully',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        avatar: user.avatar,
        status: user.status,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { emailId, email, password } = req.body;
    const resolvedEmail = (email || emailId || '').toLowerCase().trim();

    if (!resolvedEmail || !password) {
      return sendError(res, {
        statusCode: 400,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: resolvedEmail }).select('+password');

    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid credentials. User not found.',
      });
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return sendError(res, {
        statusCode: 403,
        message: `Your account is ${user.status}. Please contact the club manager.`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    await logActivity({
      userId: user._id,
      action: 'Signed in to Champions Club workspace',
      entity: 'User',
      entityId: user._id,
    });

    await logAudit({
      userId: user._id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        avatar: user.avatar,
        status: user.status,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile with Member or Staff profile info
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    let memberProfile = null;
    let staffProfile = null;

    if (user.role === 'MEMBER' || user.role === 'USER') {
      memberProfile = await MemberProfile.findOne({ user: user._id });
    } else if (['STAFF', 'FRONT_DESK', 'SHOP_STAFF', 'CANTEEN_STAFF'].includes(user.role)) {
      staffProfile = await StaffProfile.findOne({ user: user._id });
    }

    return sendSuccess(res, {
      message: 'Profile fetched successfully',
      data: {
        ...user.toObject(),
        memberProfile,
        staffProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, name, phone, profileImage, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (!firstName && name) {
      const parts = name.trim().split(' ');
      user.firstName = parts[0];
      user.lastName = parts.slice(1).join(' ');
    }
    if (phone) user.phone = phone;
    if (profileImage || avatar) user.profileImage = profileImage || avatar;

    const updatedUser = await user.save();

    return sendSuccess(res, {
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, { statusCode: 400, message: 'Current and new password are required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return sendError(res, { statusCode: 400, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, {
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
};
