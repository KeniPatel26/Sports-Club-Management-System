import Booking from '../models/Booking.js';
import Order from '../models/Order.js';
import Membership from '../models/Membership.js';
import StaffProfile from '../models/StaffProfile.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * @desc    Comprehensive Financial & Operations Report (Owner)
 * @route   GET /api/finance/overview
 * @access  Private (Owner)
 */
export const getFinancialOverview = async (req, res, next) => {
  try {
    // 1. Court Bookings Revenue
    const courtBookings = await Booking.find({ status: { $in: ['CONFIRMED', 'COMPLETED'] } });
    const courtRevenue = courtBookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0);

    // 2. Sports Shop Revenue
    const shopOrders = await Order.find({ type: 'sports', paymentStatus: 'paid' });
    const shopRevenue = shopOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // 3. Canteen & Bar Revenue
    const canteenOrders = await Order.find({ type: 'canteen', paymentStatus: 'paid' });
    const canteenRevenue = canteenOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // 4. Membership Revenue
    const memberships = await Membership.find({ paymentStatus: 'PAID' });
    const membershipRevenue = memberships.reduce((sum, m) => sum + (m.amountPaid || 0), 0);

    // Total Gross Earnings
    const totalGrossRevenue = courtRevenue + shopRevenue + canteenRevenue + membershipRevenue;

    // 5. Staff Monthly Payroll
    const staffList = await StaffProfile.find({ status: 'ACTIVE' });
    const totalMonthlyPayroll = staffList.reduce((sum, s) => sum + (s.salary || 0), 0);

    // 6. Payment Method Aggregations
    const allPaidOrders = [...courtBookings, ...shopOrders, ...canteenOrders, ...memberships];
    let cashTotal = 0;
    let cardTotal = 0;
    let upiTotal = 0;
    let onlineTotal = 0;

    courtBookings.forEach((b) => {
      const amt = b.finalAmount || 0;
      if (b.paymentMethod === 'CASH') cashTotal += amt;
      else if (b.paymentMethod === 'CARD') cardTotal += amt;
      else if (b.paymentMethod === 'UPI') upiTotal += amt;
      else onlineTotal += amt;
    });

    [...shopOrders, ...canteenOrders].forEach((o) => {
      const amt = o.total || 0;
      if (o.paymentMethod === 'cash') cashTotal += amt;
      else if (o.paymentMethod === 'card') cardTotal += amt;
      else if (o.paymentMethod === 'upi') upiTotal += amt;
      else onlineTotal += amt;
    });

    // 7. Member Metrics
    const totalMembers = await User.countDocuments({ role: 'MEMBER' });
    const activeMemberships = await Membership.countDocuments({ status: 'ACTIVE' });

    return sendSuccess(res, {
      message: 'Financial overview generated successfully',
      data: {
        totalGrossRevenue,
        streams: {
          courts: { revenue: courtRevenue, count: courtBookings.length },
          shop: { revenue: shopRevenue, count: shopOrders.length },
          canteen: { revenue: canteenRevenue, count: canteenOrders.length },
          memberships: { revenue: membershipRevenue, count: memberships.length },
        },
        paymentMethods: {
          upi: upiTotal,
          card: cardTotal,
          cash: cashTotal,
          online: onlineTotal,
        },
        payroll: {
          activeStaffCount: staffList.length,
          monthlySalaryObligation: totalMonthlyPayroll,
        },
        netOperatingIncome: totalGrossRevenue - totalMonthlyPayroll,
        memberMetrics: {
          totalMembers,
          activeMemberships,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getFinancialOverview,
};
