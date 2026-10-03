import Activity from '../models/Activity.js';
import AuditLog from '../models/AuditLog.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * @desc    Get recent activities for dashboard timeline
 * @route   GET /api/activities
 * @access  Private
 */
export const getActivities = async (req, res, next) => {
  try {
    const { limit = 15 } = req.query;
    const limitNum = parseInt(limit, 10) || 15;

    const activities = await Activity.find()
      .populate('user', 'name emailId avatar role')
      .sort({ createdAt: -1 })
      .limit(limitNum);

    return sendSuccess(res, {
      message: 'Recent activities fetched successfully',
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get enterprise audit logs (Admin only)
 * @route   GET /api/activities/audit-logs
 * @access  Private (Admin)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit, 10) || 20;

    const logs = await AuditLog.find()
      .populate('user', 'name emailId role')
      .sort({ createdAt: -1 })
      .limit(limitNum);

    return sendSuccess(res, {
      message: 'Audit logs fetched successfully',
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getActivities,
  getAuditLogs,
};
