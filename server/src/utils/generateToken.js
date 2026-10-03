import jwt from 'jsonwebtoken';

/**
 * Generate JSON Web Token (JWT)
 * @param {string|object} userOrId - User ID string or User document object
 * @returns {string} - Signed JWT Token
 */
export const generateToken = (userOrId) => {
  const payload =
    typeof userOrId === 'object' && userOrId !== null
      ? {
          id: userOrId._id || userOrId.id,
          emailId: userOrId.emailId || userOrId.email,
          role: userOrId.role || 'user',
        }
      : { id: userOrId };

  return jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_2026', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export default generateToken;
