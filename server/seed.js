import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Models
import User from './src/models/User.js';
import MemberProfile from './src/models/MemberProfile.js';
import MembershipPlan from './src/models/MembershipPlan.js';
import Membership from './src/models/Membership.js';
import StaffProfile from './src/models/StaffProfile.js';
import Shift from './src/models/Shift.js';
import Leave from './src/models/Leave.js';
import Court from './src/models/Court.js';
import Booking from './src/models/Booking.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import Lead from './src/models/Lead.js';
import Activity from './src/models/Activity.js';
import Notification from './src/models/Notification.js';
import AuditLog from './src/models/AuditLog.js';

dotenv.config();

const connectWithFallback = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odoo_ldce_db';
  try {
    console.log(`Connecting to MongoDB (${uri.includes('mongodb.net') ? 'Atlas Cloud' : 'Local'})...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connection established successfully.');
  } catch (err) {
    console.warn(`Primary connection error: ${err.message}`);
    if (uri.includes('mongodb.net')) {
      console.log('Attempting local fallback: mongodb://127.0.0.1:27017/odoo_ldce_db');
      await mongoose.connect('mongodb://127.0.0.1:27017/odoo_ldce_db', { serverSelectionTimeoutMS: 3000 });
      console.log('Connected to local MongoDB.');
    } else {
      throw err;
    }
  }
};

const seedChampionsClub = async () => {
  try {
    await connectWithFallback();
    console.log('Connected to MongoDB. Clearing existing collections...');

    await Promise.all([
      User.deleteMany(),
      MemberProfile.deleteMany(),
      MembershipPlan.deleteMany(),
      Membership.deleteMany(),
      StaffProfile.deleteMany(),
      Shift.deleteMany(),
      Leave.deleteMany(),
      Court.deleteMany(),
      Booking.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
      Lead.deleteMany(),
      Activity.deleteMany(),
      Notification.deleteMany(),
      AuditLog.deleteMany(),
    ]);

    console.log('1. Creating Users & Password Hashes...');
    const salt = await bcrypt.genSalt(10);
    const ownerPassword = await bcrypt.hash('Owner@123', salt);
    const staffPassword = await bcrypt.hash('Staff@123', salt);
    const memberPassword = await bcrypt.hash('Member@123', salt);

    const users = await User.create([
      // Owner
      {
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'owner@championsclub.com',
        phone: '+91-9898000001',
        password: ownerPassword,
        role: 'OWNER',
        status: 'ACTIVE',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      // Front Desk Staff
      {
        firstName: 'Rahul',
        lastName: 'Shah',
        email: 'frontdesk@championsclub.com',
        phone: '+91-9898000002',
        password: staffPassword,
        role: 'FRONT_DESK',
        status: 'ACTIVE',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      // Shop Staff
      {
        firstName: 'Priya',
        lastName: 'Verma',
        email: 'shop@championsclub.com',
        phone: '+91-9898000003',
        password: staffPassword,
        role: 'SHOP_STAFF',
        status: 'ACTIVE',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      // Canteen & Bar Staff
      {
        firstName: 'Vikram',
        lastName: 'Malhotra',
        email: 'canteen@championsclub.com',
        phone: '+91-9898000004',
        password: staffPassword,
        role: 'CANTEEN_STAFF',
        status: 'ACTIVE',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
      // Members
      {
        firstName: 'Keni',
        lastName: 'Patel',
        email: 'keni@championsclub.com',
        phone: '+91-9898000011',
        password: memberPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      },
      {
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex@championsclub.com',
        phone: '+91-9898000012',
        password: memberPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
      {
        firstName: 'Rohan',
        lastName: 'Gupta',
        email: 'junior@championsclub.com',
        phone: '+91-9898000013',
        password: memberPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      },
    ]);

    const [owner, frontDeskUser, shopUser, canteenUser, keniMember, alexMember, rohanMember] = users;

    console.log('2. Creating Membership Plans...');
    const plans = await MembershipPlan.create([
      {
        name: 'GOLD',
        description: 'Premium All-Access: 100% free court access, priority booking, and maximum discounts at shop & bar.',
        price: 15000,
        durationInDays: 365,
        courtDiscount: 100,
        shopDiscount: 20,
        canteenDiscount: 15,
        priorityBooking: true,
        fullCourtAccess: true,
      },
      {
        name: 'SILVER',
        description: 'Standard Membership: 50% off all court bookings, 10% discount on gear and food.',
        price: 8000,
        durationInDays: 365,
        courtDiscount: 50,
        shopDiscount: 10,
        canteenDiscount: 10,
        priorityBooking: false,
        fullCourtAccess: false,
      },
      {
        name: 'JUNIOR',
        description: 'Discounted Youth Tier (Under 18): 60% court discount and special sports gear training rates.',
        price: 4500,
        durationInDays: 365,
        courtDiscount: 60,
        shopDiscount: 15,
        canteenDiscount: 10,
        priorityBooking: false,
        fullCourtAccess: false,
      },
    ]);

    const [goldPlan, silverPlan, juniorPlan] = plans;

    console.log('3. Creating Member Profiles & Active Memberships...');
    await MemberProfile.create([
      {
        user: keniMember._id,
        memberId: 'MEM-1001',
        gender: 'FEMALE',
        dateOfBirth: new Date('2001-05-15'),
        address: { street: '42 Club Drive', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
        emergencyContact: { name: 'Sanjay Patel', phone: '+91-9898000099', relation: 'Father' },
        notes: 'Preferred court: Clay Tennis Court 1. Plays weekly league.',
      },
      {
        user: alexMember._id,
        memberId: 'MEM-1002',
        gender: 'MALE',
        dateOfBirth: new Date('1998-08-22'),
        address: { street: '18 Stadium Rd', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' },
        emergencyContact: { name: 'Elena Morgan', phone: '+91-9898000098', relation: 'Spouse' },
      },
      {
        user: rohanMember._id,
        memberId: 'MEM-1003',
        gender: 'MALE',
        dateOfBirth: new Date('2008-11-10'),
        address: { street: '7 Park Avenue', city: 'Ahmedabad', state: 'Gujarat', pincode: '380054' },
        emergencyContact: { name: 'Deepak Gupta', phone: '+91-9898000097', relation: 'Guardian' },
        notes: 'Junior Academy trainee.',
      },
    ]);

    await Membership.create([
      {
        member: keniMember._id,
        plan: goldPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        amountPaid: goldPlan.price,
      },
      {
        member: alexMember._id,
        plan: silverPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        amountPaid: silverPlan.price,
      },
      {
        member: rohanMember._id,
        plan: juniorPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        amountPaid: juniorPlan.price,
      },
    ]);

    console.log('4. Creating Staff Profiles, Shifts & Leaves...');
    await StaffProfile.create([
      {
        user: frontDeskUser._id,
        employeeId: 'EMP-001',
        department: 'FRONT_DESK',
        designation: 'Senior Receptionist & Court Coordinator',
        salary: 28000,
        joiningDate: new Date('2024-01-10'),
      },
      {
        user: shopUser._id,
        employeeId: 'EMP-002',
        department: 'SPORTS_SHOP',
        designation: 'Pro Shop Inventory Manager',
        salary: 26000,
        joiningDate: new Date('2024-02-15'),
      },
      {
        user: canteenUser._id,
        employeeId: 'EMP-003',
        department: 'CANTEEN',
        designation: 'Cafeteria & Bar Lead Steward',
        salary: 25000,
        joiningDate: new Date('2024-03-01'),
      },
    ]);

    await Shift.create([
      {
        staff: frontDeskUser._id,
        date: new Date(),
        startTime: '06:00',
        endTime: '14:00',
        department: 'FRONT_DESK',
        status: 'SCHEDULED',
      },
      {
        staff: shopUser._id,
        date: new Date(),
        startTime: '10:00',
        endTime: '19:00',
        department: 'SPORTS_SHOP',
        status: 'SCHEDULED',
      },
      {
        staff: canteenUser._id,
        date: new Date(),
        startTime: '12:00',
        endTime: '22:00',
        department: 'CANTEEN',
        status: 'SCHEDULED',
      },
    ]);

    await Leave.create([
      {
        staff: shopUser._id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        reason: 'Attending regional sports gear supplier convention',
        status: 'PENDING',
      },
    ]);

    console.log('5. Creating Sports Courts...');
    const courts = await Court.create([
      {
        name: 'Center Court - Clay Tennis',
        type: 'TENNIS',
        hourlyRate: 600,
        walkInRate: 900,
        isIndoor: false,
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Indoor Synthetic Tennis Court',
        type: 'TENNIS',
        hourlyRate: 750,
        walkInRate: 1100,
        isIndoor: true,
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Padel Panoramic Court 1',
        type: 'PADEL',
        hourlyRate: 650,
        walkInRate: 950,
        isIndoor: false,
        image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Floodlit Cricket Turf Arena',
        type: 'CRICKET',
        hourlyRate: 1400,
        walkInRate: 1800,
        isIndoor: false,
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Badminton Court 1 (Teak Wood)',
        type: 'BADMINTON',
        hourlyRate: 450,
        walkInRate: 650,
        isIndoor: true,
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
      },
    ]);

    console.log('6. Creating Court Bookings (Member & Walk-ins)...');
    await Booking.create([
      {
        court: courts[0]._id,
        member: keniMember._id,
        bookingType: 'MEMBER',
        date: new Date(),
        startTime: '18:00',
        endTime: '19:00',
        durationMinutes: 60,
        price: courts[0].hourlyRate,
        discountApplied: courts[0].hourlyRate, // Gold member 100% free court access
        finalAmount: 0,
        paymentMethod: 'MEMBERSHIP_INCLUDED',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        bookedBy: keniMember._id,
      },
      {
        court: courts[2]._id,
        member: alexMember._id,
        bookingType: 'MEMBER',
        date: new Date(),
        startTime: '19:00',
        endTime: '20:00',
        durationMinutes: 60,
        price: courts[2].hourlyRate,
        discountApplied: courts[2].hourlyRate * 0.5, // Silver 50% discount
        finalAmount: courts[2].hourlyRate * 0.5,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        bookedBy: alexMember._id,
      },
      {
        court: courts[3]._id,
        bookingType: 'WALK_IN',
        walkInDetails: { name: 'Sameer Desai', phone: '+91-9922001122' },
        date: new Date(),
        startTime: '20:00',
        endTime: '21:00',
        durationMinutes: 60,
        price: courts[3].walkInRate,
        discountApplied: 0,
        finalAmount: courts[3].walkInRate,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        bookedBy: frontDeskUser._id,
      },
    ]);

    console.log('7. Creating Sports Gear & Canteen Bar Products...');
    const products = await Product.create([
      // Sports Shop
      {
        name: 'Pro Staff 97 Tennis Racket v14',
        type: 'sports',
        category: 'Rackets',
        price: 18500,
        stock: 8,
        lowStockThreshold: 3,
        image: 'https://images.unsplash.com/photo-1617083934555-563d4206e236?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Championship Extra Duty Tennis Balls (Can of 3)',
        type: 'sports',
        category: 'Balls',
        price: 450,
        stock: 120,
        lowStockThreshold: 20,
        image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Court Zoom Clay Tennis Shoes',
        type: 'sports',
        category: 'Shoes',
        price: 7200,
        stock: 14,
        lowStockThreshold: 4,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Pro Overgrip Tape (Pack of 3)',
        type: 'sports',
        category: 'Accessories',
        price: 320,
        stock: 45,
        lowStockThreshold: 10,
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=400&auto=format&fit=crop&q=80',
      },
      // Canteen & Bar
      {
        name: 'Whey Protein Recovery Shake (Chocolate / Banana)',
        type: 'canteen',
        category: 'Beverages',
        price: 220,
        stock: 80,
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Grilled Herb Chicken & Avocado Wrap',
        type: 'canteen',
        category: 'Meals',
        price: 280,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Artisan Wood-Fired Margherita Pizza',
        type: 'canteen',
        category: 'Meals',
        price: 420,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Freshly Brewed Cold Brew Tonic',
        type: 'canteen',
        category: 'Beverages',
        price: 180,
        stock: 65,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80',
      },
    ]);

    console.log('8. Creating Orders & Bar Table Tabs...');
    await Order.create([
      {
        member: keniMember._id,
        items: [
          {
            product: products[1]._id,
            name: products[1].name,
            quantity: 2,
            price: products[1].price,
          },
        ],
        type: 'sports',
        subtotal: 900,
        discount: 180, // Gold member 20% shop discount
        total: 720,
        fulfillment: 'counter',
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        status: 'completed',
      },
      {
        member: alexMember._id,
        customerName: 'Alex Morgan',
        items: [
          {
            product: products[4]._id,
            name: products[4].name,
            quantity: 2,
            price: products[4].price,
          },
          {
            product: products[5]._id,
            name: products[5].name,
            quantity: 2,
            price: products[5].price,
          },
        ],
        type: 'canteen',
        subtotal: 1000,
        discount: 100, // Silver 10% canteen discount
        total: 900,
        fulfillment: 'table',
        tableNumber: 'Table 4',
        isTab: true,
        tabStatus: 'OPEN', // Active bar tab
        paymentMethod: 'tab',
        paymentStatus: 'pending',
        status: 'preparing',
      },
    ]);

    console.log('9. Creating Website Visitor Leads...');
    await Lead.create([
      {
        name: 'Neha Kapoor',
        email: 'neha.k@gmail.com',
        phone: '+91-9876543210',
        interestedSport: 'PADEL',
        interestedPlan: 'GOLD',
        message: 'Looking for evening weekend padel slots and beginner coaching programs.',
        status: 'NEW',
      },
      {
        name: 'Tarun Mehra',
        email: 'tarun.m@outlook.com',
        phone: '+91-9876543211',
        interestedSport: 'CRICKET',
        interestedPlan: 'SILVER',
        message: 'Corporate weekend tournament turf booking query.',
        status: 'CONTACTED',
      },
    ]);

    console.log('=======================================================');
    console.log('🏆 THE CHAMPIONS CLUB DATABASE SEEDED SUCCESSFULLY!');
    console.log('=======================================================');
    console.log('🔑 Credentials for All Operational Roles:');
    console.log('👑 Owner / Admin:   owner@championsclub.com     | Owner@123');
    console.log('🎾 Front Desk:       frontdesk@championsclub.com | Staff@123');
    console.log('🛍️ Shop Staff:       shop@championsclub.com      | Staff@123');
    console.log('☕ Canteen / Bar:    canteen@championsclub.com   | Staff@123');
    console.log('🥇 Member (Gold):   keni@championsclub.com      | Member@123');
    console.log('🥈 Member (Silver): alex@championsclub.com      | Member@123');
    console.log('🥉 Member (Junior): junior@championsclub.com    | Member@123');
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedChampionsClub();
