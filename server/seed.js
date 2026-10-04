import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// All 25 Models Import
import User from './src/models/User.js';
import MemberProfile from './src/models/MemberProfile.js';
import MembershipPlan from './src/models/MembershipPlan.js';
import Membership from './src/models/Membership.js';
import StaffProfile from './src/models/StaffProfile.js';
import Shift from './src/models/Shift.js';
import Attendance from './src/models/Attendance.js';
import Leave from './src/models/Leave.js';
import Payroll from './src/models/Payroll.js';
import Court from './src/models/Court.js';
import Booking from './src/models/Booking.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';
import DiningTable from './src/models/DiningTable.js';
import InventoryTransaction from './src/models/InventoryTransaction.js';
import Payment from './src/models/Payment.js';
import Invoice from './src/models/Invoice.js';
import Expense from './src/models/Expense.js';
import Lead from './src/models/Lead.js';
import Task from './src/models/Task.js';
import Project from './src/models/Project.js';
import ClubSetting from './src/models/ClubSetting.js';
import Notification from './src/models/Notification.js';
import Activity from './src/models/Activity.js';
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

const seedAllChampionsClubData = async () => {
  try {
    await connectWithFallback();
    console.log('⚡ Clearing all existing collections for 25 schemas...');

    await Promise.all([
      User.deleteMany(),
      MemberProfile.deleteMany(),
      MembershipPlan.deleteMany(),
      Membership.deleteMany(),
      StaffProfile.deleteMany(),
      Shift.deleteMany(),
      Attendance.deleteMany(),
      Leave.deleteMany(),
      Payroll.deleteMany(),
      Court.deleteMany(),
      Booking.deleteMany(),
      Product.deleteMany(),
      Order.deleteMany(),
      DiningTable.deleteMany(),
      InventoryTransaction.deleteMany(),
      Payment.deleteMany(),
      Invoice.deleteMany(),
      Expense.deleteMany(),
      Lead.deleteMany(),
      Task.deleteMany(),
      Project.deleteMany(),
      ClubSetting.deleteMany(),
      Notification.deleteMany(),
      Activity.deleteMany(),
      AuditLog.deleteMany(),
    ]);

    // Drop legacy indexes if needed
    try {
      await User.collection.dropIndexes();
      await DiningTable.collection.dropIndexes();
      await Court.collection.dropIndexes();
      await Invoice.collection.dropIndexes();
      await Payment.collection.dropIndexes();
      await Payroll.collection.dropIndexes();
      await Attendance.collection.dropIndexes();
    } catch (e) {
      // Ignored
    }

    console.log('1. 👥 Creating Users & Password Hashes...');
    const salt = await bcrypt.genSalt(10);
    const ownerPassword = await bcrypt.hash('Owner@123', salt);
    const staffPassword = await bcrypt.hash('Staff@123', salt);
    const memberPassword = await bcrypt.hash('Member@123', salt);

    const users = await User.create([
      // Club Manager
      {
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'owner@championsclub.com',
        phone: '+91-9898000001',
        password: ownerPassword,
        role: 'CLUB_MANAGER',
        department: null,
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      // Front Desk Staff
      {
        firstName: 'Rahul',
        lastName: 'Shah',
        email: 'frontdesk@championsclub.com',
        phone: '+91-9898000002',
        password: staffPassword,
        role: 'STAFF',
        department: 'FRONT_DESK',
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      // Sports Shop Staff
      {
        firstName: 'Priya',
        lastName: 'Verma',
        email: 'shop@championsclub.com',
        phone: '+91-9898000003',
        password: staffPassword,
        role: 'STAFF',
        department: 'SPORTS_SHOP',
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
      // Canteen & Bar Staff
      {
        firstName: 'Vikram',
        lastName: 'Malhotra',
        email: 'canteen@championsclub.com',
        phone: '+91-9898000004',
        password: staffPassword,
        role: 'STAFF',
        department: 'CANTEEN',
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
      // Additional Maintenance / Coaching Staff
      {
        firstName: 'Dharmesh',
        lastName: 'Rathod',
        email: 'coach.dharmesh@championsclub.com',
        phone: '+91-9898000005',
        password: staffPassword,
        role: 'STAFF',
        department: 'FRONT_DESK',
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      },
      // Members
      {
        firstName: 'Keni',
        lastName: 'Patel',
        email: 'keni@championsclub.com',
        phone: '+91-9898000011',
        password: memberPassword,
        role: 'MEMBER',
        department: null,
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      },
      {
        firstName: 'Alex',
        lastName: 'Morgan',
        email: 'alex@championsclub.com',
        phone: '+91-9898000012',
        password: memberPassword,
        role: 'MEMBER',
        department: null,
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
      {
        firstName: 'Rohan',
        lastName: 'Gupta',
        email: 'junior@championsclub.com',
        phone: '+91-9898000013',
        password: memberPassword,
        role: 'MEMBER',
        department: null,
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      },
      {
        firstName: 'Meera',
        lastName: 'Deshmukh',
        email: 'meera.d@championsclub.com',
        phone: '+91-9898000014',
        password: memberPassword,
        role: 'MEMBER',
        department: null,
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
      {
        firstName: 'Kabir',
        lastName: 'Singhania',
        email: 'kabir.s@championsclub.com',
        phone: '+91-9898000015',
        password: memberPassword,
        role: 'MEMBER',
        department: null,
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
      },
      // Additional member for realistic booking history
      {
        firstName: 'Nisha',
        lastName: 'Shah',
        email: 'nisha.shah@championsclub.com',
        phone: '+91-9898000016',
        password: memberPassword,
        role: 'MEMBER',
        department: null,
        status: 'ACTIVE',
        isEmailVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=80',
      },
      {
        firstName: 'Farah', lastName: 'Khan', email: 'farah.khan@championsclub.com', phone: '+91-9898000017',
        password: memberPassword, role: 'MEMBER', department: null, status: 'ACTIVE', isEmailVerified: true,
      },
      {
        firstName: 'Dev', lastName: 'Mehta', email: 'dev.mehta@championsclub.com', phone: '+91-9898000018',
        password: memberPassword, role: 'MEMBER', department: null, status: 'ACTIVE', isEmailVerified: true,
      },
      {
        firstName: 'Isha', lastName: 'Rao', email: 'isha.rao@championsclub.com', phone: '+91-9898000019',
        password: memberPassword, role: 'MEMBER', department: null, status: 'ACTIVE', isEmailVerified: true,
      },
      {
        firstName: 'Arnav', lastName: 'Joshi', email: 'arnav.joshi@championsclub.com', phone: '+91-9898000020',
        password: memberPassword, role: 'MEMBER', department: null, status: 'ACTIVE', isEmailVerified: true,
      },
      {
        firstName: 'Tara', lastName: 'Desai', email: 'tara.desai@championsclub.com', phone: '+91-9898000021',
        password: memberPassword, role: 'MEMBER', department: null, status: 'ACTIVE', isEmailVerified: true,
      },
    ]);

    const [
      owner,
      frontDeskUser,
      shopUser,
      canteenUser,
      coachUser,
      keniMember,
      alexMember,
      rohanMember,
      meeraMember,
      kabirMember,
      nishaMember,
      farahMember,
      devMember,
      ishaMember,
      arnavMember,
      taraMember,
    ] = users;

    console.log('2. 📜 Creating Membership Plans...');
    const plans = await MembershipPlan.create([
      {
        name: 'PLATINUM',
        targetUser: 'VIP & Executive Club Members',
        description: 'All-inclusive VIP tier: 100% complimentary court hours, 25% shop & cafe discount, highest booking priority, dedicated locker & personal coach.',
        price: 24000,
        duration: 365,
        durationInDays: 365,
        benefits: {
          courtDiscount: 100,
          shopDiscount: 25,
          cafeDiscount: 20,
          canteenDiscount: 20,
          bookingPriority: 'HIGH',
          dailyBookingLimit: 4,
        },
        access: {
          courts: true,
          courtAccessType: 'ALL',
          shop: true,
          cafe: true,
          events: true,
          eventAccessType: 'ALL',
          training: true,
          trainingAccessType: 'PREMIUM',
          onlineShop: true,
          clubPickup: true,
          delivery: true,
        },
        courtDiscount: 100,
        shopDiscount: 25,
        canteenDiscount: 20,
        priorityBooking: true,
        fullCourtAccess: true,
        status: 'ACTIVE',
        isActive: true,
      },
      {
        name: 'GOLD',
        targetUser: 'Regular / Premium Enthusiasts',
        description: 'Complete club experience: all court access, 20% court discount, 15% shop & cafe discount, high booking priority, premium tournament entry.',
        price: 12000,
        duration: 365,
        durationInDays: 365,
        benefits: {
          courtDiscount: 20,
          shopDiscount: 15,
          cafeDiscount: 15,
          canteenDiscount: 15,
          bookingPriority: 'HIGH',
          dailyBookingLimit: 2,
        },
        access: {
          courts: true,
          courtAccessType: 'ALL',
          shop: true,
          cafe: true,
          events: true,
          eventAccessType: 'ALL',
          training: true,
          trainingAccessType: 'PREMIUM',
          onlineShop: true,
          clubPickup: true,
          delivery: true,
        },
        courtDiscount: 20,
        shopDiscount: 15,
        canteenDiscount: 15,
        priorityBooking: true,
        fullCourtAccess: true,
        status: 'ACTIVE',
        isActive: true,
      },
      {
        name: 'SILVER',
        targetUser: 'Regular Recreational Players',
        description: 'Standard membership: 10% court discount, 10% shop discount, 5% cafe discount, standard booking priority, access to regular events.',
        price: 8000,
        duration: 365,
        durationInDays: 365,
        benefits: {
          courtDiscount: 10,
          shopDiscount: 10,
          cafeDiscount: 5,
          canteenDiscount: 5,
          bookingPriority: 'STANDARD',
          dailyBookingLimit: 2,
        },
        access: {
          courts: true,
          courtAccessType: 'STANDARD',
          shop: true,
          cafe: true,
          events: true,
          eventAccessType: 'ALL',
          training: false,
          trainingAccessType: 'STANDARD',
          onlineShop: true,
          clubPickup: true,
          delivery: true,
        },
        courtDiscount: 10,
        shopDiscount: 10,
        canteenDiscount: 5,
        priorityBooking: false,
        fullCourtAccess: false,
        status: 'ACTIVE',
        isActive: true,
      },
      {
        name: 'JUNIOR',
        targetUser: 'Youth & Academy Under-18',
        description: 'Youth athlete tier: 15% court discount on junior courts, 10% shop & cafe discount, youth tournaments & dedicated academy coaching.',
        price: 5000,
        duration: 365,
        durationInDays: 365,
        benefits: {
          courtDiscount: 15,
          shopDiscount: 10,
          cafeDiscount: 10,
          canteenDiscount: 10,
          bookingPriority: 'STANDARD',
          dailyBookingLimit: 2,
        },
        access: {
          courts: true,
          courtAccessType: 'JUNIOR',
          shop: true,
          cafe: true,
          events: true,
          eventAccessType: 'JUNIOR',
          training: true,
          trainingAccessType: 'JUNIOR',
          onlineShop: true,
          clubPickup: true,
          delivery: true,
        },
        courtDiscount: 15,
        shopDiscount: 10,
        canteenDiscount: 10,
        priorityBooking: false,
        fullCourtAccess: false,
        status: 'ACTIVE',
        isActive: true,
      },
    ]);

    const [platinumPlan, goldPlan, silverPlan, juniorPlan] = plans;

    console.log('3. 💳 Creating Member Profiles & Subscriptions...');
    await MemberProfile.create([
      {
        user: keniMember._id,
        memberId: 'MEM-1001',
        gender: 'FEMALE',
        dateOfBirth: new Date('2001-05-15'),
        address: { street: '42 Club Drive, Bodakdev', city: 'Ahmedabad', state: 'Gujarat', pincode: '380054' },
        emergencyContact: { name: 'Sanjay Patel', phone: '+91-9898000099', relation: 'Father' },
        notes: 'Preferred court: Clay Tennis Center Court. Plays weekly tournament league.',
      },
      {
        user: alexMember._id,
        memberId: 'MEM-1002',
        gender: 'MALE',
        dateOfBirth: new Date('1998-08-22'),
        address: { street: '18 Stadium Rd, Navrangpura', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' },
        emergencyContact: { name: 'Elena Morgan', phone: '+91-9898000098', relation: 'Spouse' },
        notes: 'Padel and Box Cricket regular. Enjoys sports lounge dining.',
      },
      {
        user: rohanMember._id,
        memberId: 'MEM-1003',
        gender: 'MALE',
        dateOfBirth: new Date('2008-11-10'),
        address: { street: '7 Park Avenue, Satellite', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
        emergencyContact: { name: 'Deepak Gupta', phone: '+91-9898000097', relation: 'Guardian' },
        notes: 'Junior Tennis Academy squad captain. Trains Mon/Wed/Fri.',
      },
      {
        user: meeraMember._id,
        memberId: 'MEM-1004',
        gender: 'FEMALE',
        dateOfBirth: new Date('1995-03-12'),
        address: { street: '104 Sunrise Heights, Prahladnagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
        emergencyContact: { name: 'Rajesh Deshmukh', phone: '+91-9898000096', relation: 'Brother' },
        notes: 'Badminton & Squash player. Platinum VIP member.',
      },
      {
        user: kabirMember._id,
        memberId: 'MEM-1005',
        gender: 'MALE',
        dateOfBirth: new Date('1992-12-05'),
        address: { street: '55 Sindhu Bhavan Rd', city: 'Ahmedabad', state: 'Gujarat', pincode: '380059' },
        emergencyContact: { name: 'Aarti Singhania', phone: '+91-9898000095', relation: 'Spouse' },
        notes: 'Corporate weekend turf league organizer.',
      },
      {
        user: nishaMember._id,
        memberId: 'MEM-1006',
        gender: 'FEMALE',
        dateOfBirth: new Date('1999-07-21'),
        address: { street: '28 Riverfront Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380006' },
        emergencyContact: { name: 'Amit Shah', phone: '+91-9898000094', relation: 'Father' },
        notes: 'Regular badminton and tennis player.',
      },
      { user: farahMember._id, memberId: 'MEM-1007', gender: 'FEMALE', dateOfBirth: new Date('1997-02-18'), address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }, notes: 'Gold member; regular tennis player.' },
      { user: devMember._id, memberId: 'MEM-1008', gender: 'MALE', dateOfBirth: new Date('1996-09-04'), address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380002' }, notes: 'Silver member; plays tennis and padel.' },
      { user: ishaMember._id, memberId: 'MEM-1009', gender: 'FEMALE', dateOfBirth: new Date('2007-06-12'), address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380003' }, notes: 'Junior member; academy badminton player.' },
      { user: arnavMember._id, memberId: 'MEM-1010', gender: 'MALE', dateOfBirth: new Date('1998-04-25'), address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380004' }, notes: 'Gold member; box cricket regular.' },
      { user: taraMember._id, memberId: 'MEM-1011', gender: 'FEMALE', dateOfBirth: new Date('2000-11-30'), address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380005' }, notes: 'Silver member; padel player.' },
    ]);

    await Membership.create([
      {
        member: keniMember._id,
        user: keniMember._id,
        plan: goldPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        amountPaid: goldPlan.price,
      },
      {
        member: alexMember._id,
        user: alexMember._id,
        plan: silverPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        amountPaid: silverPlan.price,
      },
      {
        member: rohanMember._id,
        user: rohanMember._id,
        plan: juniorPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        amountPaid: juniorPlan.price,
      },
      {
        member: meeraMember._id,
        user: meeraMember._id,
        plan: platinumPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        paymentMethod: 'NET_BANKING',
        amountPaid: platinumPlan.price,
      },
      {
        member: kabirMember._id,
        user: kabirMember._id,
        plan: goldPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        amountPaid: goldPlan.price,
      },
      {
        member: nishaMember._id,
        user: nishaMember._id,
        plan: silverPlan._id,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        amountPaid: silverPlan.price,
      },
      { member: farahMember._id, user: farahMember._id, plan: goldPlan._id, startDate: new Date(), expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), status: 'ACTIVE', paymentStatus: 'PAID', paymentMethod: 'UPI', amountPaid: goldPlan.price },
      { member: devMember._id, user: devMember._id, plan: silverPlan._id, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), status: 'ACTIVE', paymentStatus: 'PAID', paymentMethod: 'CARD', amountPaid: silverPlan.price },
      { member: ishaMember._id, user: ishaMember._id, plan: juniorPlan._id, startDate: new Date(), expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), status: 'ACTIVE', paymentStatus: 'PAID', paymentMethod: 'UPI', amountPaid: juniorPlan.price },
      { member: arnavMember._id, user: arnavMember._id, plan: goldPlan._id, startDate: new Date(), expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), status: 'ACTIVE', paymentStatus: 'PAID', paymentMethod: 'CARD', amountPaid: goldPlan.price },
      { member: taraMember._id, user: taraMember._id, plan: silverPlan._id, startDate: new Date(), expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), status: 'ACTIVE', paymentStatus: 'PAID', paymentMethod: 'UPI', amountPaid: silverPlan.price },
    ]);

    console.log('4. 👔 Creating Staff Profiles, Shifts, Attendance, Leaves & Payroll...');
    await StaffProfile.create([
      {
        user: frontDeskUser._id,
        employeeId: 'EMP-001',
        department: 'FRONT_DESK',
        designation: 'Senior Receptionist & Court Coordinator',
        salary: 28000,
        joiningDate: new Date('2024-01-10'),
        employmentType: 'FULL_TIME',
        address: { street: '12 Green Park', city: 'Ahmedabad', state: 'Gujarat', pincode: '380052' },
        emergencyContact: { name: 'Pooja Shah', phone: '+91-9898111001', relation: 'Spouse' },
      },
      {
        user: shopUser._id,
        employeeId: 'EMP-002',
        department: 'SPORTS_SHOP',
        designation: 'Pro Shop Inventory Manager',
        salary: 26000,
        joiningDate: new Date('2024-02-15'),
        employmentType: 'FULL_TIME',
        address: { street: '84 Royal Plaza', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
        emergencyContact: { name: 'Mahesh Verma', phone: '+91-9898111002', relation: 'Father' },
      },
      {
        user: canteenUser._id,
        employeeId: 'EMP-003',
        department: 'CANTEEN',
        designation: 'Cafeteria & Sports Bar Lead Steward',
        salary: 25000,
        joiningDate: new Date('2024-03-01'),
        employmentType: 'FULL_TIME',
        address: { street: '307 River View', city: 'Ahmedabad', state: 'Gujarat', pincode: '380004' },
        emergencyContact: { name: 'Sunita Malhotra', phone: '+91-9898111003', relation: 'Mother' },
      },
      {
        user: coachUser._id,
        employeeId: 'EMP-004',
        department: 'FRONT_DESK',
        designation: 'Head Tennis Coach & Tournament Director',
        salary: 45000,
        joiningDate: new Date('2023-11-01'),
        employmentType: 'FULL_TIME',
        address: { street: '51 Elite Enclave', city: 'Ahmedabad', state: 'Gujarat', pincode: '380058' },
        emergencyContact: { name: 'Geeta Rathod', phone: '+91-9898111004', relation: 'Spouse' },
      },
    ]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const shifts = await Shift.create([
      {
        staff: frontDeskUser._id,
        date: todayStart,
        startTime: '06:00',
        endTime: '14:00',
        department: 'FRONT_DESK',
        status: 'SCHEDULED',
      },
      {
        staff: shopUser._id,
        date: todayStart,
        startTime: '10:00',
        endTime: '19:00',
        department: 'SPORTS_SHOP',
        status: 'SCHEDULED',
      },
      {
        staff: canteenUser._id,
        date: todayStart,
        startTime: '12:00',
        endTime: '22:00',
        department: 'CANTEEN',
        status: 'SCHEDULED',
      },
      {
        staff: coachUser._id,
        date: todayStart,
        startTime: '07:00',
        endTime: '16:00',
        department: 'FRONT_DESK',
        status: 'SCHEDULED',
      },
    ]);

    await Attendance.create([
      {
        staff: frontDeskUser._id,
        date: todayStart,
        shift: shifts[0]._id,
        checkInTime: '05:52 AM',
        checkOutTime: null,
        status: 'PRESENT',
        notes: 'Morning court readiness check completed.',
      },
      {
        staff: shopUser._id,
        date: todayStart,
        shift: shifts[1]._id,
        checkInTime: '09:58 AM',
        checkOutTime: null,
        status: 'PRESENT',
        notes: 'Inventory verification done.',
      },
      {
        staff: canteenUser._id,
        date: todayStart,
        shift: shifts[2]._id,
        checkInTime: '11:55 AM',
        checkOutTime: null,
        status: 'PRESENT',
        notes: 'Bar inventory and kitchen prep in order.',
      },
      {
        staff: coachUser._id,
        date: todayStart,
        shift: shifts[3]._id,
        checkInTime: '06:50 AM',
        checkOutTime: null,
        status: 'PRESENT',
        notes: 'Junior Academy morning drills conducted.',
      },
    ]);

    await Leave.create([
      {
        staff: shopUser._id,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        reason: 'Attending Wilson & Yonex sports gear supplier convention',
        status: 'PENDING',
      },
      {
        staff: canteenUser._id,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        reason: 'Personal family emergency',
        status: 'APPROVED',
        approvedBy: owner._id,
      },
    ]);

    await Payroll.create([
      {
        staff: frontDeskUser._id,
        monthYear: 'September 2026',
        basicSalary: 28000,
        bonus: 2000,
        deduction: 0,
        netSalary: 30000,
        status: 'PAID',
        paidDate: new Date('2026-09-30'),
        paymentMethod: 'BANK_TRANSFER',
        notes: 'September salary with high member satisfaction bonus.',
      },
      {
        staff: shopUser._id,
        monthYear: 'September 2026',
        basicSalary: 26000,
        bonus: 1500,
        deduction: 0,
        netSalary: 27500,
        status: 'PAID',
        paidDate: new Date('2026-09-30'),
        paymentMethod: 'BANK_TRANSFER',
        notes: 'September salary with gear sales incentives.',
      },
      {
        staff: canteenUser._id,
        monthYear: 'September 2026',
        basicSalary: 25000,
        bonus: 1000,
        deduction: 500,
        netSalary: 25500,
        status: 'PAID',
        paidDate: new Date('2026-09-30'),
        paymentMethod: 'BANK_TRANSFER',
        notes: 'September salary payout.',
      },
      {
        staff: coachUser._id,
        monthYear: 'September 2026',
        basicSalary: 45000,
        bonus: 5000,
        deduction: 0,
        netSalary: 50000,
        status: 'PAID',
        paidDate: new Date('2026-09-30'),
        paymentMethod: 'BANK_TRANSFER',
        notes: 'September salary with junior championship win incentive.',
      },
    ]);

    console.log('5. 🏟️ Creating Diverse Sports Courts...');
    const courts = await Court.create([
      {
        name: 'Center Court - Clay Tennis',
        type: 'TENNIS',
        hourlyRate: 600,
        walkInRate: 900,
        isIndoor: false,
        isActive: true,
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Court 2 - Synthetic Hard Tennis',
        type: 'TENNIS',
        hourlyRate: 750,
        walkInRate: 1100,
        isIndoor: true,
        isActive: true,
        image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Padel Panoramic Court 1',
        type: 'PADEL',
        hourlyRate: 650,
        walkInRate: 950,
        isIndoor: false,
        isActive: true,
        image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Padel Glass Court 2',
        type: 'PADEL',
        hourlyRate: 700,
        walkInRate: 1000,
        isIndoor: true,
        isActive: true,
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Floodlit Box Cricket Arena',
        type: 'CRICKET',
        hourlyRate: 1400,
        walkInRate: 1800,
        isIndoor: false,
        isActive: true,
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Teak Wood Badminton Court 1',
        type: 'BADMINTON',
        hourlyRate: 450,
        walkInRate: 650,
        isIndoor: true,
        isActive: true,
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'Synthetic Mat Badminton Court 2',
        type: 'BADMINTON',
        hourlyRate: 400,
        walkInRate: 600,
        isIndoor: true,
        isActive: true,
        image: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=600&auto=format&fit=crop&q=80',
      },
      {
        name: 'All-Weather Cricket Turf 2',
        type: 'CRICKET',
        hourlyRate: 1200,
        walkInRate: 1600,
        isIndoor: false,
        isActive: true,
        image: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?w=600&auto=format&fit=crop&q=80',
      },
    ]);

    console.log('6. 📅 Creating Court Bookings Across All Statuses...');
    const pastBookingDate = new Date(todayStart);
    pastBookingDate.setDate(pastBookingDate.getDate() - 1);
    const upcomingBookingDate = new Date(todayStart);
    upcomingBookingDate.setDate(upcomingBookingDate.getDate() + 1);
    const addBookingDays = (days) => {
      const date = new Date(todayStart);
      date.setDate(date.getDate() + days);
      return date;
    };
    await Booking.create([
      // 1. Center Court - Completed Morning Slot
      {
        court: courts[0]._id,
        member: keniMember._id,
        bookingType: 'MEMBER',
        bookingSource: 'ONLINE',
        date: todayStart,
        startTime: '07:00',
        endTime: '08:00',
        durationMinutes: 60,
        price: courts[0].hourlyRate,
        discountApplied: 120, // 20% gold discount
        finalAmount: 480,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        status: 'COMPLETED',
        checkInTime: new Date(todayStart.getTime() + 7 * 60 * 60 * 1000),
        checkOutTime: new Date(todayStart.getTime() + 8 * 60 * 60 * 1000),
        bookedBy: keniMember._id,
      },
      // 2. Court 2 Synthetic - Checked In Right Now
      {
        court: courts[1]._id,
        member: meeraMember._id,
        bookingType: 'MEMBER',
        bookingSource: 'FRONT_DESK',
        date: todayStart,
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60,
        price: courts[1].hourlyRate,
        discountApplied: courts[1].hourlyRate, // Platinum 100% free
        finalAmount: 0,
        paymentMethod: 'MEMBERSHIP_INCLUDED',
        paymentStatus: 'PAID',
        status: 'CHECKED_IN',
        checkInTime: new Date(todayStart.getTime() + 9 * 60 * 60 * 1000),
        bookedBy: frontDeskUser._id,
      },
      // 3. Padel Panoramic Court 1 - Confirmed Evening
      {
        court: courts[2]._id,
        member: alexMember._id,
        bookingType: 'MEMBER',
        bookingSource: 'ONLINE',
        date: todayStart,
        startTime: '18:00',
        endTime: '19:00',
        durationMinutes: 60,
        price: courts[2].hourlyRate,
        discountApplied: 65, // 10% silver discount
        finalAmount: 585,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        bookedBy: alexMember._id,
      },
      // 4. Box Cricket Arena - Walk-in Tonight
      {
        court: courts[4]._id,
        bookingType: 'WALK_IN',
        bookingSource: 'FRONT_DESK',
        walkInDetails: { name: 'Sameer Desai', phone: '+91-9922001122', email: 'sameer.d@gmail.com' },
        date: todayStart,
        startTime: '19:00',
        endTime: '20:00',
        durationMinutes: 60,
        price: courts[4].walkInRate,
        discountApplied: 0,
        finalAmount: courts[4].walkInRate,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        bookedBy: frontDeskUser._id,
      },
      // 5. Badminton Court 1 - Phone Booking Confirmed
      {
        court: courts[5]._id,
        bookingType: 'PHONE',
        bookingSource: 'PHONE',
        walkInDetails: { name: 'Dr. Harshil Shah', phone: '+91-9825012345', email: 'harshil.ortho@gmail.com' },
        date: todayStart,
        startTime: '17:00',
        endTime: '18:00',
        durationMinutes: 60,
        price: courts[5].walkInRate,
        discountApplied: 0,
        finalAmount: courts[5].walkInRate,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        bookedBy: frontDeskUser._id,
      },
      // 6. Center Court - Confirmed Night Slot
      {
        court: courts[0]._id,
        member: keniMember._id,
        bookingType: 'MEMBER',
        bookingSource: 'ONLINE',
        date: todayStart,
        startTime: '20:00',
        endTime: '21:00',
        durationMinutes: 60,
        price: courts[0].hourlyRate,
        discountApplied: 120,
        finalAmount: 480,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        bookedBy: keniMember._id,
      },
      // 7. Padel Glass Court 2 - Cancelled with Reason
      {
        court: courts[3]._id,
        member: kabirMember._id,
        bookingType: 'MEMBER',
        bookingSource: 'ONLINE',
        date: todayStart,
        startTime: '16:00',
        endTime: '17:00',
        durationMinutes: 60,
        price: courts[3].hourlyRate,
        discountApplied: 140,
        finalAmount: 560,
        paymentMethod: 'UPI',
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED',
        cancellationReason: 'Heavy rain in afternoon travel corridor; rescheduled.',
        bookedBy: kabirMember._id,
      },
      // 8. Badminton Court 2 - Junior Academy Training
      {
        court: courts[6]._id,
        member: rohanMember._id,
        bookingType: 'MEMBER',
        bookingSource: 'ONLINE',
        date: todayStart,
        startTime: '16:00',
        endTime: '17:00',
        durationMinutes: 60,
        price: courts[6].hourlyRate,
        discountApplied: 60,
        finalAmount: 340,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        bookedBy: rohanMember._id,
      },
      // 9. Nisha's completed session from yesterday
      {
        court: courts[5]._id,
        member: nishaMember._id,
        bookingType: 'MEMBER',
        bookingSource: 'ONLINE',
        date: pastBookingDate,
        startTime: '08:00',
        endTime: '09:00',
        durationMinutes: 60,
        price: courts[5].hourlyRate,
        discountApplied: courts[5].hourlyRate * 0.1,
        finalAmount: courts[5].hourlyRate * 0.9,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        status: 'COMPLETED',
        bookedBy: nishaMember._id,
      },
      // 10. Nisha's upcoming session tomorrow
      {
        court: courts[5]._id,
        member: nishaMember._id,
        bookingType: 'MEMBER',
        bookingSource: 'ONLINE',
        date: upcomingBookingDate,
        startTime: '08:00',
        endTime: '09:00',
        durationMinutes: 60,
        price: courts[5].hourlyRate,
        discountApplied: courts[5].hourlyRate * 0.1,
        finalAmount: courts[5].hourlyRate * 0.9,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        bookedBy: nishaMember._id,
      },
      {
        court: courts[0]._id, member: farahMember._id, bookingType: 'MEMBER', bookingSource: 'ONLINE',
        date: addBookingDays(2), startTime: '18:00', endTime: '19:00', durationMinutes: 60,
        price: courts[0].hourlyRate, discountApplied: courts[0].hourlyRate * 0.2, finalAmount: courts[0].hourlyRate * 0.8,
        paymentMethod: 'UPI', paymentStatus: 'PAID', status: 'CONFIRMED', bookedBy: farahMember._id,
      },
      {
        court: courts[1]._id, member: devMember._id, bookingType: 'MEMBER', bookingSource: 'ONLINE',
        date: addBookingDays(-2), startTime: '10:00', endTime: '11:00', durationMinutes: 60,
        price: courts[1].hourlyRate, discountApplied: courts[1].hourlyRate * 0.1, finalAmount: courts[1].hourlyRate * 0.9,
        paymentMethod: 'UPI', paymentStatus: 'PAID', status: 'COMPLETED', bookedBy: devMember._id,
      },
      {
        court: courts[6]._id, member: ishaMember._id, bookingType: 'MEMBER', bookingSource: 'ONLINE',
        date: addBookingDays(3), startTime: '11:00', endTime: '12:00', durationMinutes: 60,
        price: courts[6].hourlyRate, discountApplied: courts[6].hourlyRate * 0.15, finalAmount: courts[6].hourlyRate * 0.85,
        paymentMethod: 'UPI', paymentStatus: 'PAID', status: 'CONFIRMED', bookedBy: ishaMember._id,
      },
      {
        court: courts[4]._id, member: arnavMember._id, bookingType: 'MEMBER', bookingSource: 'ONLINE',
        date: addBookingDays(4), startTime: '13:00', endTime: '14:00', durationMinutes: 60,
        price: courts[4].hourlyRate, discountApplied: courts[4].hourlyRate * 0.2, finalAmount: courts[4].hourlyRate * 0.8,
        paymentMethod: 'UPI', paymentStatus: 'PAID', status: 'CONFIRMED', bookedBy: arnavMember._id,
      },
      {
        court: courts[2]._id, member: taraMember._id, bookingType: 'MEMBER', bookingSource: 'ONLINE',
        date: addBookingDays(5), startTime: '09:00', endTime: '10:00', durationMinutes: 60,
        price: courts[2].hourlyRate, discountApplied: courts[2].hourlyRate * 0.1, finalAmount: courts[2].hourlyRate * 0.9,
        paymentMethod: 'UPI', paymentStatus: 'PAID', status: 'CONFIRMED', bookedBy: taraMember._id,
      },
    ]);

    console.log('7. 🏷️ Creating Sports Gear & Canteen Products...');
    const products = await Product.create([
      // Sports Shop Products
      {
        name: 'Wilson Pro Staff 97 v14 Tennis Racket',
        type: 'sports',
        category: 'Rackets',
        price: 18500,
        stock: 6,
        lowStockThreshold: 3,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1617083934555-563d4206e236?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Wilson US Open Championship Tennis Balls (Can of 3)',
        type: 'sports',
        category: 'Balls',
        price: 450,
        stock: 150,
        lowStockThreshold: 25,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Nike Court Air Zoom Vapor Pro 2 Shoes',
        type: 'sports',
        category: 'Shoes',
        price: 8900,
        stock: 12,
        lowStockThreshold: 4,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Babolat Pure Aero Super Tour 9 Racket Bag',
        type: 'sports',
        category: 'Bags',
        price: 6500,
        stock: 8,
        lowStockThreshold: 3,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Yonex BG65 Titanium Badminton String Reel (200m)',
        type: 'sports',
        category: 'Accessories',
        price: 4200,
        stock: 18,
        lowStockThreshold: 5,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Bullpadel Vertex 04 Padel Racket 2026',
        type: 'sports',
        category: 'Rackets',
        price: 22000,
        stock: 2, // Low stock trigger!
        lowStockThreshold: 3,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&auto=format&fit=crop&q=80',
      },
      // Canteen & Bar Menu
      {
        name: 'Whey Isolate Protein Recovery Shake (Belgian Choc)',
        type: 'canteen',
        category: 'Beverages',
        price: 220,
        stock: 90,
        lowStockThreshold: 15,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Grilled Herb Chicken & Avocado Power Wrap',
        type: 'canteen',
        category: 'Meals',
        price: 290,
        stock: 45,
        lowStockThreshold: 10,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Wood-Fired Truffle Mushroom & Basil Pizza',
        type: 'canteen',
        category: 'Meals',
        price: 450,
        stock: 35,
        lowStockThreshold: 8,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Freshly Brewed Cold Brew Tonic & Orange Slice',
        type: 'canteen',
        category: 'Beverages',
        price: 180,
        stock: 75,
        lowStockThreshold: 15,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Mediterranean Quinoa Greek Salad Bowl',
        type: 'canteen',
        category: 'Healthy',
        price: 260,
        stock: 30,
        lowStockThreshold: 5,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80',
      },
      {
        name: 'Fresh Hydration Electrolyte Coconut Fizz',
        type: 'canteen',
        category: 'Beverages',
        price: 140,
        stock: 120,
        lowStockThreshold: 20,
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80',
      },
    ]);

    console.log('8. 🪑 Creating Dining Tables & Bar Layout...');
    const diningTables = await DiningTable.create([
      {
        tableNumber: 'Table 1',
        capacity: 4,
        section: 'INDOOR_CAFE',
        status: 'AVAILABLE',
        notes: 'Near glass display counter.',
      },
      {
        tableNumber: 'Table 2',
        capacity: 2,
        section: 'INDOOR_CAFE',
        status: 'AVAILABLE',
        notes: 'Cozy two-seater corner.',
      },
      {
        tableNumber: 'Table 3',
        capacity: 6,
        section: 'INDOOR_CAFE',
        status: 'RESERVED',
        notes: 'Reserved for Junior Academy coaches lunch.',
      },
      {
        tableNumber: 'Table 4',
        capacity: 4,
        section: 'OUTDOOR_TERRACE',
        status: 'OCCUPIED',
        currentCustomer: {
          name: 'Alex Morgan',
          phone: '+91-9898000012',
          memberId: alexMember._id,
        },
        notes: 'Active live bar tab.',
      },
      {
        tableNumber: 'Table 5',
        capacity: 4,
        section: 'OUTDOOR_TERRACE',
        status: 'AVAILABLE',
        notes: 'Overlooking Court 1 Clay Tennis.',
      },
      {
        tableNumber: 'Table 6',
        capacity: 8,
        section: 'OUTDOOR_TERRACE',
        status: 'CLEANING',
        notes: 'Turf team gathering just vacated.',
      },
      {
        tableNumber: 'VIP Lounge 1',
        capacity: 6,
        section: 'VIP_LOUNGE',
        status: 'OCCUPIED',
        currentCustomer: {
          name: 'Meera Deshmukh',
          phone: '+91-9898000014',
          memberId: meeraMember._id,
        },
        notes: 'Platinum member executive lounge.',
      },
      {
        tableNumber: 'VIP Lounge 2',
        capacity: 6,
        section: 'VIP_LOUNGE',
        status: 'AVAILABLE',
        notes: 'Leather recliners with 4K sports streaming screen.',
      },
      {
        tableNumber: 'Courtside Bar High 1',
        capacity: 2,
        section: 'COURTSIDE_BAR',
        status: 'OCCUPIED',
        currentCustomer: {
          name: 'Walk-in Guest',
          phone: '+91-9988112233',
        },
        notes: 'High stool seating directly overlooking Padel Court 1.',
      },
      {
        tableNumber: 'Courtside Bar High 2',
        capacity: 2,
        section: 'COURTSIDE_BAR',
        status: 'AVAILABLE',
        notes: 'Direct bar service.',
      },
    ]);

    console.log('9. 🛍️ Creating Orders, Bar Tabs & Counter Purchases...');
    const orders = await Order.create([
      // 1. Pro Shop Counter Sale - Completed
      {
        member: keniMember._id,
        customerName: 'Keni Patel',
        customerPhone: '+91-9898000011',
        items: [
          {
            product: products[1]._id,
            name: products[1].name,
            quantity: 2,
            price: products[1].price,
          },
          {
            product: products[4]._id,
            name: products[4].name,
            quantity: 1,
            price: products[4].price,
          },
        ],
        type: 'sports',
        subtotal: 5100,
        discount: 765, // Gold 15% discount
        total: 4335,
        fulfillment: 'counter',
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        status: 'completed',
      },
      // 2. Pro Shop Online Order - Delivery Ready
      {
        member: kabirMember._id,
        customerName: 'Kabir Singhania',
        customerPhone: '+91-9898000015',
        deliveryAddress: '55 Sindhu Bhavan Rd, Ahmedabad - 380059',
        items: [
          {
            product: products[2]._id,
            name: products[2].name,
            quantity: 1,
            price: products[2].price,
          },
        ],
        type: 'sports',
        subtotal: 8900,
        discount: 1335,
        total: 7565,
        fulfillment: 'delivery',
        paymentMethod: 'online',
        paymentStatus: 'paid',
        status: 'ready',
      },
      // 3. Canteen Active Bar Tab (Table 4 - Alex Morgan)
      {
        member: alexMember._id,
        customerName: 'Alex Morgan',
        customerPhone: '+91-9898000012',
        items: [
          {
            product: products[6]._id,
            name: products[6].name,
            quantity: 2,
            price: products[6].price,
          },
          {
            product: products[7]._id,
            name: products[7].name,
            quantity: 2,
            price: products[7].price,
          },
          {
            product: products[8]._id,
            name: products[8].name,
            quantity: 1,
            price: products[8].price,
          },
        ],
        type: 'canteen',
        subtotal: 1470,
        discount: 73.5, // Silver 5% discount
        total: 1396.5,
        fulfillment: 'table',
        tableNumber: 'Table 4',
        isTab: true,
        tabStatus: 'OPEN',
        paymentMethod: 'tab',
        paymentStatus: 'pending',
        status: 'preparing',
      },
      // 4. Canteen VIP Lounge Order (Meera Deshmukh)
      {
        member: meeraMember._id,
        customerName: 'Meera Deshmukh',
        customerPhone: '+91-9898000014',
        items: [
          {
            product: products[9]._id,
            name: products[9].name,
            quantity: 2,
            price: products[9].price,
          },
          {
            product: products[10]._id,
            name: products[10].name,
            quantity: 1,
            price: products[10].price,
          },
        ],
        type: 'canteen',
        subtotal: 620,
        discount: 124, // Platinum 20% discount
        total: 496,
        fulfillment: 'table',
        tableNumber: 'VIP Lounge 1',
        isTab: true,
        tabStatus: 'OPEN',
        paymentMethod: 'tab',
        paymentStatus: 'pending',
        status: 'ready',
      },
    ]);

    // Link active orders to tables
    await DiningTable.updateOne({ tableNumber: 'Table 4' }, { activeOrderId: orders[2]._id });
    await DiningTable.updateOne({ tableNumber: 'VIP Lounge 1' }, { activeOrderId: orders[3]._id });

    console.log('10. 📦 Creating Inventory Stock Transactions...');
    await InventoryTransaction.create([
      {
        product: products[0]._id,
        type: 'PURCHASE',
        quantity: 10,
        previousStock: 0,
        newStock: 10,
        supplier: 'Wilson Sports India Dist. Pvt Ltd',
        invoiceNumber: 'INV-WIL-8821',
        adjustmentType: 'RECEIVED',
        notes: 'Initial consignment received for Autumn 2026 season.',
        performedBy: shopUser._id,
      },
      {
        product: products[1]._id,
        type: 'PURCHASE',
        quantity: 200,
        previousStock: 0,
        newStock: 200,
        supplier: 'Wilson Sports India Dist. Pvt Ltd',
        invoiceNumber: 'INV-WIL-8821',
        adjustmentType: 'RECEIVED',
        notes: 'Championship ball cartons bulk delivery.',
        performedBy: shopUser._id,
      },
      {
        product: products[5]._id,
        type: 'DAMAGE',
        quantity: -1,
        previousStock: 3,
        newStock: 2,
        adjustmentType: 'DAMAGED',
        notes: 'Carbon frame dent detected on display unit during unpacking.',
        performedBy: shopUser._id,
      },
      {
        product: products[1]._id,
        type: 'COUNTER_SALE',
        quantity: -2,
        previousStock: 152,
        newStock: 150,
        adjustmentType: 'MANUAL',
        referenceOrder: orders[0]._id,
        notes: 'Sold at counter to Keni Patel (Gold member).',
        performedBy: shopUser._id,
      },
    ]);

    console.log('11. 💰 Creating Invoices, Payments & Operating Expenses...');
    await Payment.create([
      {
        paymentId: 'PAY-2026-001',
        user: keniMember._id,
        customerName: 'Keni Patel',
        type: 'MEMBERSHIP',
        amount: 12000,
        method: 'UPI',
        status: 'SUCCESS',
        referenceId: 'UPI-REF-99882201',
        notes: 'Gold Plan Annual Subscription 2026-2027.',
      },
      {
        paymentId: 'PAY-2026-002',
        user: alexMember._id,
        customerName: 'Alex Morgan',
        type: 'MEMBERSHIP',
        amount: 8000,
        method: 'CARD',
        status: 'SUCCESS',
        referenceId: 'CARD-TXN-449102',
        notes: 'Silver Plan Annual Subscription.',
      },
      {
        paymentId: 'PAY-2026-003',
        user: meeraMember._id,
        customerName: 'Meera Deshmukh',
        type: 'MEMBERSHIP',
        amount: 24000,
        method: 'NET_BANKING',
        status: 'SUCCESS',
        referenceId: 'HDFC-NEFT-883391',
        notes: 'Platinum VIP Plan Annual Subscription.',
      },
      {
        paymentId: 'PAY-2026-004',
        user: keniMember._id,
        customerName: 'Keni Patel',
        type: 'SHOP',
        amount: 4335,
        method: 'UPI',
        status: 'SUCCESS',
        referenceId: 'UPI-REF-771109',
        notes: 'Pro Shop gear purchase invoice payment.',
      },
    ]);

    await Invoice.create([
      {
        invoiceNumber: 'INV-2026-1001',
        user: keniMember._id,
        customerName: 'Keni Patel',
        customerEmail: 'keni@championsclub.com',
        customerPhone: '+91-9898000011',
        type: 'MEMBERSHIP',
        items: [
          {
            description: 'Annual Gold Membership Tier (365 Days Access)',
            quantity: 1,
            unitPrice: 12000,
            amount: 12000,
          },
        ],
        subtotal: 12000,
        tax: 0,
        discount: 0,
        totalAmount: 12000,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        paidDate: new Date(),
      },
      {
        invoiceNumber: 'INV-2026-1002',
        user: meeraMember._id,
        customerName: 'Meera Deshmukh',
        customerEmail: 'meera.d@championsclub.com',
        customerPhone: '+91-9898000014',
        type: 'MEMBERSHIP',
        items: [
          {
            description: 'Annual Platinum VIP Membership Tier (365 Days All-Inclusive)',
            quantity: 1,
            unitPrice: 24000,
            amount: 24000,
          },
        ],
        subtotal: 24000,
        tax: 0,
        discount: 0,
        totalAmount: 24000,
        paymentStatus: 'PAID',
        paymentMethod: 'NET_BANKING',
        paidDate: new Date(),
      },
      {
        invoiceNumber: 'INV-2026-1003',
        user: keniMember._id,
        customerName: 'Keni Patel',
        customerEmail: 'keni@championsclub.com',
        customerPhone: '+91-9898000011',
        type: 'SHOP',
        items: [
          {
            description: 'Wilson US Open Championship Tennis Balls (Can of 3)',
            quantity: 2,
            unitPrice: 450,
            amount: 900,
          },
          {
            description: 'Yonex BG65 Titanium Badminton String Reel (200m)',
            quantity: 1,
            unitPrice: 4200,
            amount: 4200,
          },
        ],
        subtotal: 5100,
        discount: 765,
        tax: 0,
        totalAmount: 4335,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        paidDate: new Date(),
      },
    ]);

    await Expense.create([
      {
        title: 'Center Court Red Clay Top Dressing & Rolling Refurbishment',
        category: 'MAINTENANCE',
        amount: 32000,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        paymentMethod: 'BANK_TRANSFER',
        vendor: 'Acro Surfaces India',
        recordedBy: owner._id,
        notes: 'Pre-tournament court conditioning and line painting.',
      },
      {
        title: 'Monthly High-Mast Arena Floodlight Electricity Bill',
        category: 'UTILITIES',
        amount: 48500,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        paymentMethod: 'BANK_TRANSFER',
        vendor: 'Torrent Power Ltd',
        recordedBy: owner._id,
        notes: 'Commercial sports facility monthly power consumption.',
      },
      {
        title: 'Spinshot Tennis Ball Machine Spare Battery & Wheels',
        category: 'EQUIPMENT',
        amount: 14500,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paymentMethod: 'CARD',
        vendor: 'Pro Tennis Gear Hub',
        recordedBy: coachUser._id,
        notes: 'Ball machine maintenance for morning coaching academy.',
      },
      {
        title: 'Sports Nutrition, Whey & Cold Brew Kitchen Supplies Restock',
        category: 'SUPPLIES',
        amount: 22000,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        paymentMethod: 'UPI',
        vendor: 'Metro Wholesale Cash & Carry',
        recordedBy: canteenUser._id,
        notes: 'Stock for cafeteria shakes, avocado wraps, and artisanal beans.',
      },
    ]);

    console.log('12. 🎯 Creating CRM Leads, Projects & Operations Tasks...');
    await Lead.create([
      {
        name: 'Neha Kapoor',
        email: 'neha.k@gmail.com',
        phone: '+91-9876543210',
        interestedSport: 'PADEL',
        interestedPlan: 'GOLD',
        message: 'Looking for evening weekend padel slots and beginner coaching programs.',
        status: 'TRIAL_BOOKED',
        assignedStaff: frontDeskUser._id,
        notes: 'Complimentary 30-min trial arranged on Padel Court 2.',
      },
      {
        name: 'Tarun Mehra',
        email: 'tarun.m@outlook.com',
        phone: '+91-9876543211',
        interestedSport: 'CRICKET',
        interestedPlan: 'SILVER',
        message: 'Corporate weekend tournament turf booking query for 40 employees.',
        status: 'CONTACTED',
        assignedStaff: frontDeskUser._id,
        notes: 'Sent turf rate card and catering options.',
      },
      {
        name: 'Dr. Siddharth Varma',
        email: 'dr.siddharth@gmail.com',
        phone: '+91-9876543212',
        interestedSport: 'TENNIS',
        interestedPlan: 'PLATINUM',
        message: 'Inquiring about executive VIP locker room and personal coaching slots.',
        status: 'NEW',
        assignedStaff: null,
      },
    ]);

    const project = await Project.create({
      title: 'Grand Autumn Padel & Tennis Championship 2026',
      description: 'Annual inter-club 3-day sports championship with prize pool, live streaming, sponsor exhibition booths and gourmet food court.',
      category: 'Events & Tournaments',
      status: 'in-progress',
      priority: 'high',
      budget: 350000,
      progress: 65,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      owner: owner._id,
      members: [frontDeskUser._id, shopUser._id, canteenUser._id, coachUser._id],
      tags: ['Tournament', 'Sponsorship', 'Padel', 'Tennis'],
    });

    await Task.create([
      {
        title: 'Confirm Wilson Ball Sponsorship & 500 Can Delivery',
        description: 'Ensure official match ball consignment arrives at least 5 days prior to tournament start.',
        project: project._id,
        assignee: shopUser._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        tags: ['Inventory', 'Wilson', 'Sponsorship'],
      },
      {
        title: 'Finalize Tournament Special Food & Smoothie Menu',
        description: 'Design high-protein athlete lunch boxes and courtside hydration stations.',
        project: project._id,
        assignee: canteenUser._id,
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        tags: ['Canteen', 'Catering'],
      },
      {
        title: 'Publish Fixtures & Send WhatsApp Schedule to 64 Players',
        description: 'Generate draw bracket on club portal and notify all registered doubles pairs.',
        project: project._id,
        assignee: coachUser._id,
        status: 'todo',
        priority: 'urgent',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        tags: ['Draws', 'Scheduling'],
      },
    ]);

    console.log('13. ⚙️ Creating Club Settings Singleton...');
    await ClubSetting.create({
      clubName: 'The Champions Sports Club',
      contactEmail: 'support@championsclub.com',
      contactPhone: '+91 98765 43210',
      address: '100 Olympic Boulevard, Sports Complex, SG Highway, Ahmedabad, Gujarat',
      sessionDurationMinutes: 60,
      slotIntervalMinutes: 30,
      maxBookingsPerMemberPerDay: 2,
      membershipGracePeriodDays: 7,
      taxRatePercent: 18,
      currencySymbol: '₹',
      allowWalkInBookings: true,
    });

    console.log('14. 🔔 Creating Notifications, Activities & Audit Logs...');
    await Notification.create([
      {
        recipient: owner._id,
        title: 'New Platinum VIP Subscription',
        message: 'Meera Deshmukh activated Platinum VIP Membership plan (₹24,000 paid).',
        type: 'success',
        link: '/manager/members',
      },
      {
        recipient: frontDeskUser._id,
        title: 'Court 2 Match In-Progress',
        message: 'Meera Deshmukh checked in at Court 2 Synthetic Hard Tennis.',
        type: 'info',
        link: '/staff/front-desk?tab=courts',
      },
      {
        recipient: shopUser._id,
        title: 'Low Stock Alert: Bullpadel Vertex 04',
        message: 'Stock level is 2 rackets remaining (threshold: 3). Reorder advised.',
        type: 'warning',
        link: '/staff/shop?tab=inventory',
      },
      {
        recipient: canteenUser._id,
        title: 'Active Tab on Table 4',
        message: 'Alex Morgan opened an active bar tab (₹1,396.50).',
        type: 'info',
        link: '/staff/canteen?tab=orders',
      },
      {
        recipient: keniMember._id,
        title: 'Booking Confirmed for Center Court',
        message: 'Your slot today at 20:00 - 21:00 is confirmed. See you on the clay!',
        type: 'success',
        link: '/courts',
      },
    ]);

    await Activity.create([
      {
        user: owner._id,
        action: 'System Database Initialized',
        entity: 'System',
        metadata: { info: 'Full operational data seeded for all 25 system models.' },
      },
      {
        user: keniMember._id,
        action: 'Court Slot Booked',
        entity: 'Booking',
        metadata: { court: 'Center Court - Clay Tennis', time: '20:00 - 21:00' },
      },
      {
        user: frontDeskUser._id,
        action: 'Member Checked In',
        entity: 'Booking',
        metadata: { court: 'Court 2 - Synthetic Hard Tennis', member: 'Meera Deshmukh' },
      },
      {
        user: alexMember._id,
        action: 'Opened Bar Tab',
        entity: 'Order',
        metadata: { table: 'Table 4', total: 1396.5 },
      },
      {
        user: shopUser._id,
        action: 'Processed Counter Sale',
        entity: 'Order',
        metadata: { invoice: 'INV-2026-1003', amount: 4335 },
      },
    ]);

    await AuditLog.create([
      {
        user: owner._id,
        action: 'ROLE_UPDATE',
        entity: 'User',
        entityId: coachUser._id.toString(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
        details: { role: 'STAFF', department: 'FRONT_DESK', title: 'Head Coach' },
      },
      {
        user: frontDeskUser._id,
        action: 'WALK_IN_BOOKING_CREATED',
        entity: 'Booking',
        ipAddress: '192.168.1.15',
        userAgent: 'ChampionsClubPOS/1.0 FrontDesk',
        details: { court: 'Floodlit Box Cricket Arena', customer: 'Sameer Desai', amount: 1800 },
      },
      {
        user: owner._id,
        action: 'PAYROLL_APPROVED_AND_PAID',
        entity: 'Payroll',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        details: { month: 'September 2026', totalStaffPaid: 4, totalDisbursed: 133000 },
      },
    ]);

    console.log('========================================================================');
    console.log('🏆 THE CHAMPIONS CLUB: ALL 25 SCHEMAS SEEDED WITH RICH OPERATIONAL DATA!');
    console.log('========================================================================');
    console.log('🔑 Operational Login Credentials:');
    console.log('👑 Club Manager:           owner@championsclub.com          | Owner@123');
    console.log('🎾 Front Desk (Staff):     frontdesk@championsclub.com      | Staff@123');
    console.log('🛍️ Sports Shop (Staff):   shop@championsclub.com           | Staff@123');
    console.log('☕ Canteen & Bar (Staff):  canteen@championsclub.com        | Staff@123');
    console.log('🥇 Member (Platinum VIP):  meera.d@championsclub.com        | Member@123');
    console.log('🥇 Member (Gold Tier):     keni@championsclub.com           | Member@123');
    console.log('🥈 Member (Silver Tier):   alex@championsclub.com           | Member@123');
    console.log('🥈 Member (Silver Tier):   nisha.shah@championsclub.com       | Member@123');
    console.log('🥉 Member (Junior Tier):   junior@championsclub.com         | Member@123');
    console.log('🏸 Member (Corporate):     kabir.s@championsclub.com        | Member@123');
    console.log('🥇 Member (Gold Tier):     farah.khan@championsclub.com      | Member@123');
    console.log('🥈 Member (Silver Tier):   dev.mehta@championsclub.com       | Member@123');
    console.log('🥉 Member (Junior Tier):   isha.rao@championsclub.com        | Member@123');
    console.log('🥇 Member (Gold Tier):     arnav.joshi@championsclub.com     | Member@123');
    console.log('🥈 Member (Silver Tier):   tara.desai@championsclub.com      | Member@123');
    console.log('========================================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedAllChampionsClubData();
