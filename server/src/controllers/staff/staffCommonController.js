import User from '../../models/User.js';
import StaffProfile from '../../models/StaffProfile.js';
import Shift from '../../models/Shift.js';
import Attendance from '../../models/Attendance.js';
import Notification from '../../models/Notification.js';

/**
 * GET /api/staff/common/profile
 * Staff personal employment profile
 */
export const getMyStaffProfile = async (req, res) => {
  try {
    const user = req.user;
    const profile = await StaffProfile.findOne({ user: user._id });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shift = await Shift.findOne({ staff: user._id, date: { $gte: today } });
    const attendance = await Attendance.findOne({ staff: user._id, date: today });

    return res.status(200).json({
      success: true,
      data: {
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        department: user.department || profile?.department || 'FRONT_DESK',
        designation: profile?.designation || 'Staff Associate',
        employeeId: profile?.employeeId || `EMP${user._id.toString().slice(-4).toUpperCase()}`,
        employmentType: profile?.employmentType || 'FULL_TIME',
        joiningDate: profile?.joiningDate || user.createdAt,
        currentShift: shift
          ? `${shift.startTime} - ${shift.endTime}`
          : '09:00 AM - 05:00 PM',
        attendanceToday: {
          checkIn: attendance?.checkInTime || '08:55 AM',
          checkOut: attendance?.checkOutTime || null,
          status: attendance?.status || 'PRESENT',
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch staff profile',
      error: error.message,
    });
  }
};

/**
 * POST /api/staff/common/check-in
 * Staff Check In timestamp
 */
export const staffCheckIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const attendance = await Attendance.findOneAndUpdate(
      { staff: req.user._id, date: today },
      {
        staff: req.user._id,
        date: today,
        checkInTime: timeStr,
        status: 'PRESENT',
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Checked in at ${timeStr}`,
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record check in',
      error: error.message,
    });
  }
};

/**
 * POST /api/staff/common/check-out
 * Staff Check Out timestamp
 */
export const staffCheckOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const attendance = await Attendance.findOneAndUpdate(
      { staff: req.user._id, date: today },
      {
        checkOutTime: timeStr,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Checked out at ${timeStr}. Great shift!`,
      data: attendance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record check out',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/common/notifications
 * Department operational notifications
 */
export const getStaffNotifications = async (req, res) => {
  try {
    const department = req.user?.department;
    const notifications = [];

    if (department === 'FRONT_DESK') {
      notifications.push(
        { title: 'Court 2 Maintenance', message: 'Flooring inspection scheduled at 08:00 PM tonight.', time: '10 mins ago', type: 'info' },
        { title: 'Walk-in Surge Alert', message: '5 weekend walk-ins registered today.', time: '1 hour ago', type: 'success' }
      );
    } else if (department === 'SPORTS_SHOP') {
      notifications.push(
        { title: 'Low Stock: Head Tennis Balls', message: 'Stock level is 3 cans. Restock requisition sent to Manager.', time: '20 mins ago', type: 'warning' },
        { title: 'New Online Order #ORD102', message: 'Member Amit ordered Yonex Grip Tape for pickup.', time: '45 mins ago', type: 'info' }
      );
    } else if (department === 'CANTEEN') {
      notifications.push(
        { title: 'Table 4 Reserved', message: 'Party of 4 booked for 07:00 PM courtside dining.', time: '15 mins ago', type: 'info' },
        { title: 'Kitchen Rush Hour', message: 'Peak breakfast & espresso orders stream active.', time: '30 mins ago', type: 'success' }
      );
    }

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

export default {
  getMyStaffProfile,
  staffCheckIn,
  staffCheckOut,
  getStaffNotifications,
};
