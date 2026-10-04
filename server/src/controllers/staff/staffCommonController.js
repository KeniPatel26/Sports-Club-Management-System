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
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const shift = await Shift.findOne({ staff: user._id, date: { $gte: today, $lt: tomorrow }, status: 'SCHEDULED' }).sort({ startTime: 1 });
    const attendance = await Attendance.findOne({ staff: user._id, date: { $gte: today, $lt: tomorrow } });

    return res.status(200).json({
      success: true,
      data: {
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        department: user.department || profile?.department || null,
        designation: profile?.designation || null,
        employeeId: profile?.employeeId || null,
        employmentType: profile?.employmentType || null,
        joiningDate: profile?.joiningDate || null,
        currentShift: shift
          ? `${shift.startTime} - ${shift.endTime}`
          : null,
        attendanceToday: {
          checkIn: attendance?.checkInTime || null,
          checkOut: attendance?.checkOutTime || null,
          status: attendance?.status || null,
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
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

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
