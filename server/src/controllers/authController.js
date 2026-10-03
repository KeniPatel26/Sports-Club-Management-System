import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity, logAudit } from '../services/activityService.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, emailId, email, password, role } = req.body;
    const resolvedEmail = (emailId || email || '').toLowerCase().trim();

    if (!resolvedEmail || !password) {
      return sendError(res, {
        statusCode: 400,
        message: 'Email and password are required',
      });
    }

    const existingUser = await User.findOne({ emailId: resolvedEmail });
    if (existingUser) {
      return sendError(res, {
        statusCode: 400,
        message: 'User with this email already exists',
      });
    }

    const user = await User.create({
      name: name || 'Team Member',
      emailId: resolvedEmail,
      password,
      role: role && ['user', 'admin', 'manager'].includes(role) ? role : 'user',
    });

    const token = generateToken(user);

    await logActivity({
      userId: user._id,
      action: 'Account registered',
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
        name: user.name,
        emailId: user.emailId,
        email: user.emailId,
        role: user.role,
        avatar: user.avatar,
        title: user.title,
        bio: user.bio,
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
    const resolvedEmail = (emailId || email || '').toLowerCase().trim();

    if (!resolvedEmail || !password) {
      return sendError(res, {
        statusCode: 400,
        message: 'Email and password are required',
      });
    }

    // Include hidden password field for authentication
    const user = await User.findOne({ emailId: resolvedEmail }).select('+password');

    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    await logActivity({
      userId: user._id,
      action: 'Logged into system',
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
        name: user.name,
        emailId: user.emailId,
        email: user.emailId,
        role: user.role,
        avatar: user.avatar,
        title: user.title,
        bio: user.bio,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    return sendSuccess(res, {
      message: 'Profile fetched successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, title, bio, avatar, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    if (name) user.name = name;
    if (title !== undefined) user.title = title;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;

    const updatedUser = await user.save();

    await logActivity({
      userId: user._id,
      action: 'Updated profile information',
      entity: 'User',
      entityId: user._id,
    });

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
      return sendError(res, {
        statusCode: 400,
        message: 'Current and new password are required',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return sendError(res, {
        statusCode: 400,
        message: 'Current password is incorrect',
      });
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
