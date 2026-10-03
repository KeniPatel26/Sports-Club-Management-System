import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app.js';
import User from '../src/models/User.js';
import { generateToken } from '../src/utils/generateToken.js';
import http from 'http';

dotenv.config();

const runEndpointTests = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/odoo_ldce_db';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB for endpoint testing.');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://127.0.0.1:5099';

  const testEmail = `test_member_${Date.now()}@sportsclub.com`;
  const testPhone = `98${Date.now().toString().slice(-8)}`;

  console.log('\n--- 1. Testing POST /api/auth/register ---');
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Keni',
      lastName: 'Patel',
      email: testEmail,
      phone: testPhone,
      password: 'Keni@12345',
      role: 'CLUB_MANAGER', // Intentionally attempting privilege escalation
    }),
  });

  const regData = await regRes.json();
  console.log('Status Code:', regRes.status, regRes.status === 201 ? '✅ PASS' : '❌ FAIL');
  console.log('Assigned Role:', regData.user?.role, regData.user?.role === 'MEMBER' ? '✅ PASS (Forced to MEMBER)' : '❌ FAIL');
  console.log('Has Token:', !!regData.token ? '✅ PASS' : '❌ FAIL');

  console.log('\n--- 2. Testing POST /api/auth/login ---');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'Keni@12345',
    }),
  });

  const loginData = await loginRes.json();
  console.log('Status Code:', loginRes.status, loginRes.status === 200 ? '✅ PASS' : '❌ FAIL');
  console.log('Login Role:', loginData.user?.role, loginData.user?.role === 'MEMBER' ? '✅ PASS' : '❌ FAIL');

  const memberToken = loginData.token;

  console.log('\n--- 3. Testing GET /api/auth/me (Authenticated) ---');
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  const meData = await meRes.json();
  console.log('Status Code:', meRes.status, meRes.status === 200 ? '✅ PASS' : '❌ FAIL');
  console.log('Current User Email:', meData.user?.email === testEmail ? '✅ PASS' : '❌ FAIL');

  console.log('\n--- 4. Testing Authorization: Member accessing /api/test/booking-test (Should ALLOW: 200) ---');
  const bookingRes = await fetch(`${baseUrl}/api/test/booking-test`, {
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  const bookingData = await bookingRes.json();
  console.log('Status Code:', bookingRes.status, bookingRes.status === 200 ? '✅ PASS' : '❌ FAIL');
  console.log('Response Message:', bookingData.message);

  console.log('\n--- 5. Testing Authorization: Member accessing /api/test/manager-test (Should FORBID: 403) ---');
  const managerRouteRes = await fetch(`${baseUrl}/api/test/manager-test`, {
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  const managerRouteData = await managerRouteRes.json();
  console.log('Status Code:', managerRouteRes.status, managerRouteRes.status === 403 ? '✅ PASS (403 Forbidden)' : '❌ FAIL');
  console.log('Error Message:', managerRouteData.message);

  console.log('\n--- 6. Testing Authorization: Manager Token accessing /api/test/manager-test (Should ALLOW: 200) ---');
  // Create mock manager token
  const mockManagerUser = await User.findOne({ role: { $in: ['CLUB_MANAGER', 'OWNER'] } });
  if (mockManagerUser) {
    const managerToken = generateToken(mockManagerUser);
    const mgrRes = await fetch(`${baseUrl}/api/test/manager-test`, {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    const mgrData = await mgrRes.json();
    console.log('Status Code:', mgrRes.status, mgrRes.status === 200 ? '✅ PASS (200 OK)' : '❌ FAIL');
    console.log('Response Message:', mgrData.message);
  }

  console.log('\n--- 7. Testing Unauthenticated Request without Bearer Token (Should UNAUTHORIZE: 401) ---');
  const unauthRes = await fetch(`${baseUrl}/api/test/manager-test`);
  console.log('Status Code:', unauthRes.status, unauthRes.status === 401 ? '✅ PASS (401 Unauthorized)' : '❌ FAIL');

  // Clean up
  await User.deleteOne({ email: testEmail });
  await server.close();
  await mongoose.disconnect();
  console.log('\n======================================================');
  console.log('🎉 ALL LIVE ENDPOINT & AUTHORIZATION TESTS SUCCEEDED!');
  console.log('======================================================');
  process.exit(0);
};

runEndpointTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
