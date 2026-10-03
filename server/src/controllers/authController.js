import User from '../models/User.js';
import MemberProfile from '../models/MemberProfile.js';
import StaffProfile from '../models/StaffProfile.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import generateToken from '../utils/generateToken.js';
import { logActivity } from '../services/activityService.js';
import { markLoginAttendance, markLogoutAttendance } from '../services/attendanceService.js';

// ============================================
// REGISTER MEMBER (Public Registration)
// ============================================
export const registerMember = async (req, res) => {
  return res.status(403).json({
    success: false,
    message:
      'Public registration is disabled. All Member and Staff accounts are provisioned exclusively by Club Managers. Please contact Club Administration or login with your assigned credentials.',
  });
};

// ============================================
// LOGIN
// ============================================
export const login = async (req, res) => {
  try {
    const { email, emailId, password } = req.body;
    const resolvedEmail = (email || emailId || '').toLowerCase().trim();

    if (!resolvedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({
      email: resolvedEmail,
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active',
      });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    // ⚡ AUTOMATED STAFF ATTENDANCE SYNC ON LOGIN
    let attendanceRecord = null;
    if (user.role === 'STAFF') {
      attendanceRecord = await markLoginAttendance(user._id);
    }

    const token = generateToken(user);

    // Activity log
    try {
      await logActivity({
        userId: user._id,
        action: `Signed in as ${user.role}${user.department ? ` (${user.department})` : ''}`,
        entity: 'User',
        entityId: user._id,
      });
    } catch (e) {
      // ignore
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      attendance: attendanceRecord,
      user: {
        id: user._id,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        status: user.status,
      },
      data: {
        token,
        attendance: attendanceRecord,
        user: {
          id: user._id,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          department: user.department,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// ============================================
// LOGOUT
// ============================================
export const logout = async (req, res) => {
  try {
    if (req.user && req.user.role === 'STAFF') {
      await markLogoutAttendance(req.user._id);
    }
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully. Shift check-out updated.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message,
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    let memberProfile = null;
    let staffProfile = null;

    if (user.role === 'MEMBER') {
      memberProfile = await MemberProfile.findOne({ user: user._id });
    } else if (user.role === 'STAFF') {
      staffProfile = await StaffProfile.findOne({ user: user._id });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        status: user.status,
        profileImage: user.profileImage,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        isEmailVerified: user.isEmailVerified,
        memberProfile,
        staffProfile,
      },
      data: {
        ...user.toObject(),
        memberProfile,
        staffProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message,
    });
  }
};

// ============================================
// UPDATE PROFILE
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, profileImage, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (phone) user.phone = phone.trim();
    if (profileImage || avatar) user.profileImage = profileImage || avatar;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await comparePassword(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
    });
  }
};

// Backward-compatible alias exports
export const registerUser = registerMember;
export const loginUser = login;

export default {
  registerMember,
  registerUser,
  login,
  loginUser,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
