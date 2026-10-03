import dotenv from 'dotenv';
import { hashPassword, comparePassword } from '../src/utils/password.js';
import generateToken from '../src/utils/generateToken.js';
import { PERMISSIONS, ROLE_PERMISSIONS, STAFF_DEPARTMENT_PERMISSIONS, getUserPermissions, hasPermission } from '../src/utils/permissions.js';

dotenv.config();

console.log('=== RUNNING AUTH & PERMISSION UNIT TESTS ===');

// 1. Test Password Hashing
const rawPw = 'Keni@12345';
const hashed = await hashPassword(rawPw);
const matches = await comparePassword(rawPw, hashed);
const wrongMatches = await comparePassword('WrongPassword', hashed);

console.log('1. Password Hashing:');
console.log('   Hash generated:', hashed.substring(0, 20) + '...');
console.log('   Correct password verified:', matches === true ? '✅ PASS' : '❌ FAIL');
console.log('   Wrong password rejected:', wrongMatches === false ? '✅ PASS' : '❌ FAIL');

// 2. Test JWT Token Generation
const mockUser = {
  _id: '65f1234567890abcdef12345',
  role: 'STAFF',
  department: 'FRONT_DESK',
};
const token = generateToken(mockUser);
console.log('\n2. JWT Token Generation:');
console.log('   Token generated:', token.substring(0, 35) + '...');

// 3. Test Permissions Matrix
console.log('\n3. Permissions Matrix Verification:');

// Club Manager tests
const managerUser = { role: 'CLUB_MANAGER', department: null };
console.log('   Club Manager EMPLOYEE_VIEW:', hasPermission(managerUser, 'EMPLOYEE_VIEW') === true ? '✅ PASS' : '❌ FAIL');
console.log('   Club Manager BOOKING_CREATE:', hasPermission(managerUser, 'BOOKING_CREATE') === true ? '✅ PASS' : '❌ FAIL');

// Member tests
const memberUser = { role: 'MEMBER', department: null };
console.log('   Member BOOKING_CREATE:', hasPermission(memberUser, 'BOOKING_CREATE') === true ? '✅ PASS' : '❌ FAIL');
console.log('   Member EMPLOYEE_VIEW (Forbidden):', hasPermission(memberUser, 'EMPLOYEE_VIEW') === false ? '✅ PASS' : '❌ FAIL');
console.log('   Member INVENTORY_MANAGE (Forbidden):', hasPermission(memberUser, 'INVENTORY_MANAGE') === false ? '✅ PASS' : '❌ FAIL');

// Front Desk Staff tests
const frontDeskStaff = { role: 'STAFF', department: 'FRONT_DESK' };
console.log('   Front Desk BOOKING_CREATE:', hasPermission(frontDeskStaff, 'BOOKING_CREATE') === true ? '✅ PASS' : '❌ FAIL');
console.log('   Front Desk COURT_VIEW:', hasPermission(frontDeskStaff, 'COURT_VIEW') === true ? '✅ PASS' : '❌ FAIL');
console.log('   Front Desk INVENTORY_MANAGE (Forbidden):', hasPermission(frontDeskStaff, 'INVENTORY_MANAGE') === false ? '✅ PASS' : '❌ FAIL');
console.log('   Front Desk SALARY_MANAGE (Forbidden):', hasPermission(frontDeskStaff, 'SALARY_MANAGE') === false ? '✅ PASS' : '❌ FAIL');

// Sports Shop Staff tests
const shopStaff = { role: 'STAFF', department: 'SPORTS_SHOP' };
console.log('   Shop Staff INVENTORY_MANAGE:', hasPermission(shopStaff, 'INVENTORY_MANAGE') === true ? '✅ PASS' : '❌ FAIL');
console.log('   Shop Staff SHOP_ORDER_MANAGE:', hasPermission(shopStaff, 'SHOP_ORDER_MANAGE') === true ? '✅ PASS' : '❌ FAIL');
console.log('   Shop Staff BOOKING_CREATE (Forbidden):', hasPermission(shopStaff, 'BOOKING_CREATE') === false ? '✅ PASS' : '❌ FAIL');

// Canteen Staff tests
const canteenStaff = { role: 'STAFF', department: 'CANTEEN' };
console.log('   Canteen Staff TABLE_MANAGE:', hasPermission(canteenStaff, 'TABLE_MANAGE') === true ? '✅ PASS' : '❌ FAIL');
console.log('   Canteen Staff CANTEEN_ORDER_MANAGE:', hasPermission(canteenStaff, 'CANTEEN_ORDER_MANAGE') === true ? '✅ PASS' : '❌ FAIL');
console.log('   Canteen Staff COURT_VIEW (Forbidden):', hasPermission(canteenStaff, 'COURT_VIEW') === false ? '✅ PASS' : '❌ FAIL');

console.log('\n=== ALL AUTH & PERMISSION CHECKS COMPLETED ===');
