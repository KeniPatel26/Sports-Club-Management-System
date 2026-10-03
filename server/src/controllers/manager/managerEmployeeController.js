import User from '../../models/User.js';
import StaffProfile from '../../models/StaffProfile.js';
import Shift from '../../models/Shift.js';
import Attendance from '../../models/Attendance.js';
import Leave from '../../models/Leave.js';
import Payroll from '../../models/Payroll.js';
import { hashPassword } from '../../utils/password.js';

/**
 * GET /api/manager/employees
 * List all club staff with their profiles and department designations
 */
export const getEmployees = async (req, res) => {
  try {
    const { department, status, search = '' } = req.query;

    const query = { role: 'STAFF' };

    if (department && department !== 'ALL') {
      query.department = department;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search.trim()) {
      query.$or = [
        { firstName: { $regex: search.trim(), $options: 'i' } },
        { lastName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const staffUsers = await User.find(query).sort({ createdAt: -1 });

    const staffList = await Promise.all(
      staffUsers.map(async (u) => {
        const profile = await StaffProfile.findOne({ user: u._id });
        const currentShift = await Shift.findOne({
          staff: u._id,
          date: { $gte: new Date().setHours(0, 0, 0, 0) },
        });

        return {
          id: u._id,
          _id: u._id,
          name: `${u.firstName} ${u.lastName || ''}`.trim(),
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          role: u.role,
          department: u.department || profile?.department || 'FRONT_DESK',
          designation: profile?.designation || 'Staff Associate',
          salary: profile?.salary || 25000,
          employeeId: profile?.employeeId || `EMP${u._id.toString().slice(-4).toUpperCase()}`,
          employmentType: profile?.employmentType || 'FULL_TIME',
          shift: currentShift
            ? `${currentShift.startTime} - ${currentShift.endTime}`
            : '09:00 AM - 05:00 PM',
          status: u.status,
          joiningDate: profile?.joiningDate || u.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: staffList.length,
      data: staffList,
    });
  } catch (error) {
    console.error('getEmployees error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/employees
 * Add a new staff member with department assignment & profile
 */
export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName = '',
      email,
      phone,
      password = 'Staff@123',
      department = 'FRONT_DESK',
      designation,
      salary = 25000,
      employmentType = 'FULL_TIME',
      shiftStartTime = '09:00 AM',
      shiftEndTime = '05:00 PM',
    } = req.body;

    if (!firstName || !email || !phone || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, department, and designation are required',
      });
    }

    const resolvedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({
      $or: [{ email: resolvedEmail }, { phone: phone.trim() }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Staff with this email or phone number already exists',
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: resolvedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: 'STAFF',
      department,
      status: 'ACTIVE',
    });

    const staffCount = await StaffProfile.countDocuments();
    const employeeId = `EMP${(staffCount + 101).toString()}`;

    const profile = await StaffProfile.create({
      user: user._id,
      employeeId,
      department,
      designation: designation.trim(),
      salary: Number(salary),
      employmentType,
      joiningDate: new Date(),
    });

    // Create default scheduled shift
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Shift.create({
      staff: user._id,
      date: today,
      startTime: shiftStartTime,
      endTime: shiftEndTime,
      department,
      status: 'SCHEDULED',
    });

    return res.status(201).json({
      success: true,
      message: `Employee ${user.firstName} created successfully for ${department}`,
      data: { user, profile },
    });
  } catch (error) {
    console.error('createEmployee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message,
    });
  }
};

/**
 * PUT /api/manager/employees/:id
 * Update staff details, department, designation, and salary
 */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      email,
      department,
      designation,
      salary,
      employmentType,
      status,
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (phone) user.phone = phone.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (department) user.department = department;
    if (status) user.status = status;

    await user.save();

    let profile = await StaffProfile.findOne({ user: user._id });
    if (!profile) {
      profile = new StaffProfile({
        user: user._id,
        employeeId: `EMP${user._id.toString().slice(-4).toUpperCase()}`,
      });
    }

    if (department) profile.department = department;
    if (designation) profile.designation = designation;
    if (salary !== undefined) profile.salary = Number(salary);
    if (employmentType) profile.employmentType = employmentType;

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: { user, profile },
    });
  } catch (error) {
    console.error('updateEmployee error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message,
    });
  }
};

// ============================================
// SHIFTS
// ============================================

export const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate('staff', 'firstName lastName email department')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: shifts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shifts',
      error: error.message,
    });
  }
};

export const createShift = async (req, res) => {
  try {
    const { staffId, date, startTime, endTime, department } = req.body;
    const shift = await Shift.create({
      staff: staffId,
      date: new Date(date),
      startTime,
      endTime,
      department,
      status: 'SCHEDULED',
    });

    return res.status(201).json({
      success: true,
      message: 'Shift scheduled successfully',
      data: shift,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule shift',
      error: error.message,
    });
  }
};

// ============================================
// ATTENDANCE
// ============================================

export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const staffUsers = await User.find({ role: 'STAFF', status: 'ACTIVE' });
    const attendanceRecords = await Attendance.find({ date: today }).populate('staff');

    const attendanceMap = new Map();
    attendanceRecords.forEach((a) => {
      if (a.staff?._id) attendanceMap.set(a.staff._id.toString(), a);
    });

    const result = staffUsers.map((u) => {
      const existing = attendanceMap.get(u._id.toString());
      return {
        id: existing?._id || u._id,
        staffId: u._id,
        employeeName: `${u.firstName} ${u.lastName || ''}`.trim(),
        department: u.department || 'FRONT_DESK',
        shift: '09:00 AM - 05:00 PM',
        status: existing?.status || 'PRESENT',
        checkInTime: existing?.checkInTime || '08:55 AM',
        checkOutTime: existing?.checkOutTime || null,
      };
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message,
    });
  }
};

export const recordAttendance = async (req, res) => {
  try {
    const { staffId, status, checkInTime, checkOutTime, notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOneAndUpdate(
      { staff: staffId, date: today },
      {
        staff: staffId,
        date: today,
        status: status || 'PRESENT',
        checkInTime: checkInTime || '09:00 AM',
        checkOutTime: checkOutTime || null,
        notes: notes || '',
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record attendance',
      error: error.message,
    });
  }
};

// ============================================
// LEAVE MANAGEMENT
// ============================================

export const getLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('staff', 'firstName lastName email department phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
      error: error.message,
    });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'

    const leave = await Leave.findById(id).populate('staff');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    await leave.save();

    return res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update leave status',
      error: error.message,
    });
  }
};

// ============================================
// PAYROLL
// ============================================

export const getPayroll = async (req, res) => {
  try {
    const currentMonth = 'October 2026';
    const staffUsers = await User.find({ role: 'STAFF' });

    const records = await Promise.all(
      staffUsers.map(async (u) => {
        const profile = await StaffProfile.findOne({ user: u._id });
        const existingPayroll = await Payroll.findOne({ staff: u._id, monthYear: currentMonth });

        const basic = profile?.salary || 25000;
        const bonus = existingPayroll?.bonus || (basic > 22000 ? 2000 : 1000);
        const deduction = existingPayroll?.deduction || 500;
        const net = basic + bonus - deduction;

        return {
          id: existingPayroll?._id || u._id,
          staffId: u._id,
          employeeName: `${u.firstName} ${u.lastName || ''}`.trim(),
          department: u.department || 'FRONT_DESK',
          designation: profile?.designation || 'Staff',
          monthYear: currentMonth,
          basicSalary: basic,
          bonus,
          deduction,
          netSalary: net,
          status: existingPayroll?.status || 'APPROVED',
          paidDate: existingPayroll?.paidDate || null,
        };
      })
    );

    return res.status(200).json({
      success: true,
      monthYear: currentMonth,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payroll',
      error: error.message,
    });
  }
};

export const markPayrollPaid = async (req, res) => {
  try {
    const { staffId, monthYear = 'October 2026', basicSalary, bonus = 0, deduction = 0 } = req.body;
    const net = (Number(basicSalary) || 25000) + Number(bonus) - Number(deduction);

    const payroll = await Payroll.findOneAndUpdate(
      { staff: staffId, monthYear },
      {
        staff: staffId,
        monthYear,
        basicSalary: Number(basicSalary) || 25000,
        bonus: Number(bonus),
        deduction: Number(deduction),
        netSalary: net,
        status: 'PAID',
        paidDate: new Date(),
        paymentMethod: 'BANK_TRANSFER',
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Salary marked as PAID successfully',
      data: payroll,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process payroll payout',
      error: error.message,
    });
  }
};

export default {
  getEmployees,
  createEmployee,
  updateEmployee,
  getShifts,
  createShift,
  getTodayAttendance,
  recordAttendance,
  getLeaveRequests,
  updateLeaveStatus,
  getPayroll,
  markPayrollPaid,
};
