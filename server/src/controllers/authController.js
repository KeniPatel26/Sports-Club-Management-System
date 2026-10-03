import User from '../models/User.js';
import MemberProfile from '../models/MemberProfile.js';
import StaffProfile from '../models/StaffProfile.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import generateToken from '../utils/generateToken.js';
import { logActivity, logAudit } from '../services/activityService.js';

// ============================================
// REGISTER MEMBER (Public Registration)
// ============================================
export const registerMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName = '',
      name,
      email,
      emailId,
      phone,
      password,
    } = req.body;

    const resolvedEmail = (email || emailId || '').toLowerCase().trim();
    let fName = firstName;
    let lName = lastName;

    // Split compound name if firstName not provided
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ');
    }

    if (!fName || !resolvedEmail || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: resolvedEmail },
        { phone: phone.trim() },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or phone already exists',
      });
    }

    const hashedPassword = await hashPassword(password);

    // Enforce role = MEMBER for public registration
    const user = await User.create({
      firstName: fName.trim(),
      lastName: lName.trim(),
      email: resolvedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: 'MEMBER',
      department: null,
      status: 'ACTIVE',
    });

    // Auto-create initial MemberProfile
    try {
      const memberCount = await MemberProfile.countDocuments();
      const memberId = `MEM${(memberCount + 1001).toString()}`;
      await MemberProfile.create({
        user: user._id,
        memberId,
        joinedAt: new Date(),
      });
    } catch (profileErr) {
      console.warn('MemberProfile auto-creation warning:', profileErr.message);
    }

    const token = generateToken(user);

    // Optional audit logging
    try {
      await logActivity({
        userId: user._id,
        action: 'Member registered for Champions Club',
        entity: 'User',
        entityId: user._id,
      });
    } catch (e) {
      // ignore
    }

    return res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      token,
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
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
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

    const token = generateToken(user);

    // Optional audit log
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
  getMe,
  updateProfile,
  changePassword,
};
