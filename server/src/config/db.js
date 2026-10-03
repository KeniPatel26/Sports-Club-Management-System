import mongoose from 'mongoose';

/**
 * Connect to MongoDB with automatic fallback to local instance
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odoo_ldce_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Primary MongoDB Connection Failed]: ${error.message}`);
    // If Atlas failed, attempt local fallback
    if (uri.includes('mongodb.net')) {
      try {
        console.log('Attempting connection to local MongoDB (mongodb://127.0.0.1:27017/odoo_ldce_db)...');
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/odoo_ldce_db', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[Local MongoDB Connected]: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.warn('Local MongoDB is also not running. Server will continue with in-memory/mock fallback.');
      }
    }
    console.warn('💡 Tip: If using MongoDB Atlas, whitelist your IP address at: https://www.mongodb.com/docs/atlas/security-whitelist/ or use 0.0.0.0/0');
  }
};

export default connectDB;
