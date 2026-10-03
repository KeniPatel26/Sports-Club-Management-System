import {
  markLoginAttendance,
  markLogoutAttendance,
  getStaffAttendanceHistory,
  getManagerAttendanceList,
} from '../services/attendanceService.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

/**
 * GET /api/attendance/manager
 * Manager ERP: View employee attendance for selected date with filters & KPI metrics
 */
export const getManagerAttendance = async (req, res) => {
  try {
    const { date, department, status, search } = req.query;
    const data = await getManagerAttendanceList({ date, department, status, search });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('getManagerAttendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch manager attendance data',
      error: error.message,
    });
  }
};

/**
 * PUT /api/attendance/manager/:id
 * Manager ERP: Correct or edit employee attendance record (status, check-in, check-out, notes)
 */
export const updateManagerAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkInTime, checkOutTime, notes, staffId, dateKey } = req.body;

    let record = null;

    if (id && id.length === 24) {
      record = await Attendance.findById(id);
    }

    if (!record && staffId) {
      const dKey = dateKey || new Date().toISOString().slice(0, 10);
      record = await Attendance.findOne({
        $or: [{ staff: staffId }, { employee: staffId }],
        dateKey: dKey,
      });

      if (!record) {
        record = new Attendance({
          staff: staffId,
          employee: staffId,
          dateKey: dKey,
          date: new Date(),
        });
      }
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    if (status) record.status = status;
    if (checkInTime !== undefined) record.checkInTime = checkInTime;
    if (checkOutTime !== undefined) {
      record.checkOutTime = checkOutTime;
      if (checkInTime && checkOutTime) {
        // Estimate worked minutes
        record.workedMinutes = 480; // default 8 hours on manual set
      }
    }
    if (notes !== undefined) record.notes = notes;
    record.source = 'ADMIN';

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Attendance record updated by manager',
      data: record,
    });
  } catch (error) {
    console.error('updateManagerAttendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update attendance record',
      error: error.message,
    });
  }
};

/**
 * POST /api/attendance/manager/manual
 * Manager ERP: Manually log an attendance entry
 */
export const recordManualAttendance = async (req, res) => {
  try {
    const { staffId, dateKey, checkInTime, checkOutTime, status = 'PRESENT', notes } = req.body;

    if (!staffId) {
      return res.status(400).json({ success: false, message: 'Staff ID is required' });
    }

    const dKey = dateKey || new Date().toISOString().slice(0, 10);
    const dateObj = new Date(dKey);

    const record = await Attendance.findOneAndUpdate(
      {
        $or: [{ staff: staffId }, { employee: staffId }],
        dateKey: dKey,
      },
      {
        staff: staffId,
        employee: staffId,
        dateKey: dKey,
        date: dateObj,
        status,
        checkInTime: checkInTime || '09:00 AM',
        checkOutTime: checkOutTime || '06:00 PM',
        workedMinutes: 540,
        source: 'ADMIN',
        notes: notes || 'Manually logged by Manager',
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Manual attendance logged successfully',
      data: record,
    });
  } catch (error) {
    console.error('recordManualAttendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record manual attendance',
      error: error.message,
    });
  }
};

/**
 * GET /api/attendance/my
 * Staff Portal: View own shift, today's check-in status, month statistics & history table
 */
export const getMyAttendance = async (req, res) => {
  try {
    const data = await getStaffAttendanceHistory(req.user._id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('getMyAttendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personal attendance data',
      error: error.message,
    });
  }
};

/**
 * POST /api/attendance/check-out
 * Staff Portal: Record check-out timestamp on shift end or logout
 */
export const checkOutStaff = async (req, res) => {
  try {
    const record = await markLogoutAttendance(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Checked out successfully. Have a great day!',
      data: record,
    });
  } catch (error) {
    console.error('checkOutStaff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record check out',
      error: error.message,
    });
  }
};

/**
 * POST /api/attendance/check-in
 * Staff Portal: Manual/forced check-in trigger
 */
export const checkInStaff = async (req, res) => {
  try {
    const record = await markLoginAttendance(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: record,
    });
  } catch (error) {
    console.error('checkInStaff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record check in',
      error: error.message,
    });
  }
};

export default {
  getManagerAttendance,
  updateManagerAttendance,
  recordManualAttendance,
  getMyAttendance,
  checkOutStaff,
  checkInStaff,
};
