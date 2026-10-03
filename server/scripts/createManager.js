import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import { hashPassword } from '../src/utils/password.js';

dotenv.config();

const createManager = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sports-club';
  
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    const managerEmail = (process.env.INITIAL_MANAGER_EMAIL || 'manager@sportsclub.com').toLowerCase();
    const managerPhone = process.env.INITIAL_MANAGER_PHONE || '9876543200';
    const managerPassword = process.env.INITIAL_MANAGER_PASSWORD || 'Manager@12345';

    // Check if manager already exists
    const existing = await User.findOne({
      $or: [{ email: managerEmail }, { phone: managerPhone }],
    });

    if (existing) {
      console.log(`A manager account already exists for ${managerEmail}.`);
      process.exit(0);
    }

    const hashedPassword = await hashPassword(managerPassword);

    const manager = await User.create({
      firstName: 'Club',
      lastName: 'Manager',
      email: managerEmail,
      phone: managerPhone,
      password: hashedPassword,
      role: 'CLUB_MANAGER',
      department: null,
      status: 'ACTIVE',
      isEmailVerified: true,
    });

    console.log('====================================================');
    console.log('✅ CLUB MANAGER ACCOUNT INITIALIZED SUCCESSFULLY');
    console.log('====================================================');
    console.log(`Email:    ${manager.email}`);
    console.log(`Phone:    ${manager.phone}`);
    console.log(`Password: ${managerPassword}`);
    console.log(`Role:     ${manager.role}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize Club Manager:', error.message);
    process.exit(1);
  }
};

createManager();
