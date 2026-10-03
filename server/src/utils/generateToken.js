import jwt from 'jsonwebtoken';

/**
 * Generate JSON Web Token (JWT) containing minimal authorization data
 * @param {object} user - User document or object with _id, role, and department
 * @returns {string} - Signed JWT string
 */
export const generateToken = (user) => {
  const userId = (user._id || user.id || user.userId || user).toString();
  const role = user.role || 'MEMBER';
  const department = user.department || null;

  return jwt.sign(
    {
      userId,
      id: userId, // legacy fallback support
      role,
      department,
    },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_this',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '1d',
    }
  );
};

export default generateToken;
