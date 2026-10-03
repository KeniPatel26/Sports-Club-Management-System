import bcrypt from 'bcryptjs';

/**
 * Hash a plain text password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare entered plain text password with stored hashed password
 * @param {string} enteredPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from DB
 * @returns {Promise<boolean>} - Whether passwords match
 */
export const comparePassword = async (enteredPassword, hashedPassword) => {
  if (!enteredPassword || !hashedPassword) return false;
  return bcrypt.compare(enteredPassword, hashedPassword);
};

export default {
  hashPassword,
  comparePassword,
};
