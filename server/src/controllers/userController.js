import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity, logAudit } from '../services/activityService.js';

/**
 * @desc    Get all users with search, role filter, sort, and pagination
 * @route   GET /api/users
 * @access  Private
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search = '', role = '', page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { emailId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOption = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query).sort(sortOption).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, {
      message: 'Users retrieved successfully',
      data: users,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private
 */
export const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });
    const managerCount = await User.countDocuments({ role: 'manager' });

    return sendSuccess(res, {
      message: 'User statistics retrieved',
      data: {
        totalUsers,
        adminCount,
        userCount,
        managerCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    return sendSuccess(res, {
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user (Admin)
 * @route   POST /api/users
 * @access  Private (Admin)
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, emailId, email, password, role, title, bio } = req.body;
    const resolvedEmail = (emailId || email || '').toLowerCase().trim();

    if (!resolvedEmail || !password) {
      return sendError(res, { statusCode: 400, message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ emailId: resolvedEmail });
    if (existingUser) {
      return sendError(res, { statusCode: 400, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name: name || 'Team Member',
      emailId: resolvedEmail,
      password,
      role: role || 'user',
      title: title || 'Member',
      bio: bio || '',
    });

    await logActivity({
      userId: req.user._id,
      action: `Created user ${user.name}`,
      entity: 'User',
      entityId: user._id,
    });

    await logAudit({
      userId: req.user._id,
      action: 'ADMIN_CREATE_USER',
      entity: 'User',
      entityId: user._id.toString(),
      details: { createdUserEmail: user.emailId, role: user.role },
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details / role (Admin)
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, role, title, bio } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (title !== undefined) user.title = title;
    if (bio !== undefined) user.bio = bio;

    const updatedUser = await user.save();

    await logActivity({
      userId: req.user._id,
      action: `Updated user ${user.name}`,
      entity: 'User',
      entityId: user._id,
    });

    return sendSuccess(res, {
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User not found' });
    }

    // Prevent deleting oneself
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, { statusCode: 400, message: 'You cannot delete your own account from user management' });
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity({
      userId: req.user._id,
      action: `Deleted user ${user.name} (${user.emailId})`,
      entity: 'User',
      entityId: user._id,
    });

    await logAudit({
      userId: req.user._id,
      action: 'ADMIN_DELETE_USER',
      entity: 'User',
      entityId: req.params.id,
      details: { deletedEmail: user.emailId },
    });

    return sendSuccess(res, {
      message: 'User deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
