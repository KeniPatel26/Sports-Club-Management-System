/**
 * Standardized API Response Helpers for MERN Hackathon Projects
 */

export const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (res, { statusCode = 500, message = 'An error occurred', errors = null, data = null } = {}) => {
  const response = {
    success: false,
    message,
    data,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export default {
  sendSuccess,
  sendError,
};
