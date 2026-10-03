import User from '../models/User.js';
import StaffProfile from '../models/StaffProfile.js';
import Shift from '../models/Shift.js';
import Leave from '../models/Leave.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity, logAudit } from '../services/activityService.js';

/**
 * @desc    Get all staff members with department filter (Owner)
 * @route   GET /api/staff
 * @access  Private (Owner/Manager)
 */
export const getStaff = async (req, res, next) => {
  try {
    const { department, status } = req.query;
    const query = {};
    if (department && department !== 'ALL') query.department = department;
    if (status && status !== 'ALL') query.status = status;

    const staffProfiles = await StaffProfile.find(query)
      .populate('user', 'firstName lastName email phone role profileImage status')
      .sort({ department: 1, designation: 1 });

    return sendSuccess(res, {
      message: 'Staff directory retrieved',
      data: staffProfiles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add new employee (Owner)
 * @route   POST /api/staff
 * @access  Private (Owner)
 */
export const createStaff = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password = 'Staff@123',
      department,
      designation,
      salary,
      employmentType,
      address,
      emergencyContact,
    } = req.body;

    if (!firstName || !email || !phone || !department || !designation) {
      return sendError(res, {
        statusCode: 400,
        message: 'First name, email, phone, department, and designation are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, { statusCode: 400, message: 'User with this email already exists' });
    }

    // Map department to specific role
    let role = 'STAFF';
    if (department === 'FRONT_DESK') role = 'FRONT_DESK';
    else if (department === 'SPORTS_SHOP') role = 'SHOP_STAFF';
    else if (department === 'CANTEEN') role = 'CANTEEN_STAFF';

    const user = await User.create({
      firstName,
      lastName: lastName || '',
      email: email.toLowerCase(),
      phone,
      password,
      role,
      status: 'ACTIVE',
    });

    const employeeCount = await StaffProfile.countDocuments();
    const employeeId = `EMP${(employeeCount + 1).toString().padStart(3, '0')}`;

    const profile = await StaffProfile.create({
      user: user._id,
      employeeId,
      department,
      designation,
      joiningDate: new Date(),
      salary: salary || 0,
      employmentType: employmentType || 'FULL_TIME',
      address,
      emergencyContact,
    });

    await logActivity({
      userId: req.user._id,
      action: `Hired employee ${user.name} (${department})`,
      entity: 'Staff',
      entityId: user._id,
    });

    const populated = await StaffProfile.findById(profile._id).populate('user', '-password');

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Staff member created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get shift schedules
 * @route   GET /api/staff/shifts
 * @access  Private (Staff/Owner)
 */
export const getShifts = async (req, res, next) => {
  try {
    const { department, date } = req.query;
    const query = {};
    if (department && department !== 'ALL') query.department = department;

    if (date) {
      const d = new Date(date);
      query.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const shifts = await Shift.find(query)
      .populate('staff', 'firstName lastName email phone role')
      .sort({ date: -1, startTime: 1 });

    return sendSuccess(res, {
      message: 'Shifts retrieved',
      data: shifts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign shift (Owner)
 * @route   POST /api/staff/shifts
 * @access  Private (Owner)
 */
export const createShift = async (req, res, next) => {
  try {
    const { staffId, date, startTime, endTime, department } = req.body;

    if (!staffId || !date || !startTime || !endTime || !department) {
      return sendError(res, { statusCode: 400, message: 'All shift parameters are required' });
    }

    const shift = await Shift.create({
      staff: staffId,
      date: new Date(date),
      startTime,
      endTime,
      department,
      status: 'SCHEDULED',
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Shift assigned successfully',
      data: shift,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request leave (Staff)
 * @route   POST /api/staff/leaves
 * @access  Private (Staff)
 */
export const requestLeave = async (req, res, next) => {
  try {
    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return sendError(res, { statusCode: 400, message: 'Start date, end date, and reason are required' });
    }

    const leave = await Leave.create({
      staff: req.user._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'PENDING',
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Leave request submitted',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject leave (Owner)
 * @route   PATCH /api/staff/leaves/:id/status
 * @access  Private (Owner)
 */
export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return sendError(res, { statusCode: 400, message: 'Status must be APPROVED or REJECTED' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return sendError(res, { statusCode: 404, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    await leave.save();

    return sendSuccess(res, {
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all leaves
 * @route   GET /api/staff/leaves
 * @access  Private
 */
export const getLeaves = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      query.staff = req.user._id;
    }

    const leaves = await Leave.find(query)
      .populate('staff', 'firstName lastName email phone role')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      message: 'Leaves fetched successfully',
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStaff,
  createStaff,
  getShifts,
  createShift,
  requestLeave,
  updateLeaveStatus,
  getLeaves,
};
