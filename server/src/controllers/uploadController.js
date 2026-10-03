import path from 'path';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

/**
 * @desc    Upload general file (document, image, spreadsheet, zip)
 * @route   POST /api/upload
 * @access  Private
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, { statusCode: 400, message: 'Please select a file to upload' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    await logActivity({
      userId: req.user._id,
      action: `Uploaded file "${req.file.originalname}"`,
      entity: 'File',
      metadata: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/upload/avatar
 * @access  Private
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, { statusCode: 400, message: 'Please select an image for avatar' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Avatar uploaded successfully',
      data: {
        url: avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadFile,
  uploadAvatar,
};
