import Activity from '../models/Activity.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Log user activity to universal activity timeline
 */
export const logActivity = async ({ userId, action, entity, entityId = null, metadata = {} }) => {
  try {
    if (!userId || !action || !entity) return;
    await Activity.create({
      user: userId,
      action,
      entity,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

/**
 * Log enterprise audit event
 */
export const logAudit = async ({ userId = null, action, entity, entityId = '', ipAddress = '', userAgent = '', details = {} }) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      entity,
      entityId,
      ipAddress,
      userAgent,
      details,
    });
  } catch (error) {
    console.error('Failed to log audit:', error.message);
  }
};

export default {
  logActivity,
  logAudit,
};
