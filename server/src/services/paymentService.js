import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Membership from '../models/Membership.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import DiningTable from '../models/DiningTable.js';
import { logActivity } from './activityService.js';

/**
 * Generate demo/production transaction ID
 */
export const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
};

/**
 * Create a new payment record by securely fetching the amount from the database
 */
export const createPaymentIntent = async ({
  userId,
  customerName,
  purpose,
  referenceId,
  paymentMethod = 'UPI',
  notes = '',
}) => {
  if (!purpose || !referenceId) {
    throw new Error('Payment purpose and referenceId are required');
  }

  let verifiedAmount = 0;
  let targetUser = userId || null;
  let targetCustomerName = customerName || 'Club Member';
  let purposeRef = 'Booking';

  switch (purpose) {
    case 'COURT_BOOKING': {
      purposeRef = 'Booking';
      const booking = await Booking.findById(referenceId).populate('court member');
      if (!booking) throw new Error('Court booking not found');
      if (booking.paymentStatus === 'PAID') throw new Error('Booking has already been paid');
      verifiedAmount = Number(booking.finalAmount ?? booking.price ?? 0);
      targetUser = targetUser || booking.member?._id || booking.member;
      targetCustomerName = customerName || (booking.walkInDetails?.name) || (booking.member?.firstName ? `${booking.member.firstName} ${booking.member.lastName || ''}`.trim() : 'Athlete');
      break;
    }

    case 'MEMBERSHIP': {
      purposeRef = 'Membership';
      const membership = await Membership.findById(referenceId).populate('plan member');
      if (!membership) throw new Error('Membership record not found');
      if (membership.paymentStatus === 'PAID') throw new Error('Membership has already been paid');
      verifiedAmount = Number(membership.amountPaid ?? membership.plan?.price ?? 0);
      targetUser = targetUser || membership.member?._id || membership.member;
      targetCustomerName = customerName || (membership.member?.firstName ? `${membership.member.firstName} ${membership.member.lastName || ''}`.trim() : 'Club Member');
      break;
    }

    case 'SHOP_ORDER':
    case 'CANTEEN_ORDER': {
      purposeRef = 'Order';
      const order = await Order.findById(referenceId).populate('member');
      if (!order) throw new Error('Order not found');
      if (order.paymentStatus === 'paid') throw new Error('Order has already been paid');
      verifiedAmount = Number(order.total ?? order.subtotal ?? 0);
      targetUser = targetUser || order.member?._id || order.member;
      targetCustomerName = customerName || order.customerName || 'Customer';
      break;
    }

    default:
      throw new Error(`Unsupported payment purpose: ${purpose}`);
  }

  // Create payment record
  const payment = await Payment.create({
    user: targetUser,
    customerName: targetCustomerName,
    amount: verifiedAmount,
    paymentMethod: paymentMethod.toUpperCase(),
    purpose,
    referenceId,
    purposeRef,
    status: 'PENDING',
    notes,
  });

  return payment;
};

/**
 * Process / Confirm Payment simulation
 */
export const processPaymentConfirmation = async ({
  paymentId,
  simulateSuccess = true,
  paymentMethod,
  userId,
}) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('Payment record not found');
  }

  const method = (paymentMethod || payment.paymentMethod || 'UPI').toUpperCase();

  if (simulateSuccess) {
    const transactionId = generateTransactionId();
    payment.status = 'PAID';
    payment.transactionId = transactionId;
    payment.paidAt = new Date();
    payment.paymentMethod = method;
    await payment.save();

    // 1. COURT_BOOKING
    if (payment.purpose === 'COURT_BOOKING') {
      await Booking.findByIdAndUpdate(payment.referenceId, {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: method,
      });
      if (userId) {
        await logActivity({
          userId,
          action: `Payment of ₹${payment.amount} confirmed for Court Booking (Txn: ${transactionId})`,
          entity: 'Booking',
          entityId: payment.referenceId,
        });
      }
    }

    // 2. MEMBERSHIP
    if (payment.purpose === 'MEMBERSHIP') {
      const startDate = new Date();
      const membership = await Membership.findById(payment.referenceId).populate('plan');
      const durationDays = membership?.plan?.durationInDays || 365;
      const expiryDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

      await Membership.findByIdAndUpdate(payment.referenceId, {
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        paymentMethod: method,
        startDate,
        expiryDate,
      });

      if (userId) {
        await logActivity({
          userId,
          action: `Activated Membership after ₹${payment.amount} payment (Txn: ${transactionId})`,
          entity: 'Membership',
          entityId: payment.referenceId,
        });
      }
    }

    // 3. SHOP_ORDER
    if (payment.purpose === 'SHOP_ORDER') {
      await Order.findByIdAndUpdate(payment.referenceId, {
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: method.toLowerCase(),
      });
      if (userId) {
        await logActivity({
          userId,
          action: `Payment of ₹${payment.amount} received for Sports Shop Order (Txn: ${transactionId})`,
          entity: 'Order',
          entityId: payment.referenceId,
        });
      }
    }

    // 4. CANTEEN_ORDER
    if (payment.purpose === 'CANTEEN_ORDER') {
      const order = await Order.findByIdAndUpdate(
        payment.referenceId,
        {
          tabStatus: 'CLOSED',
          paymentStatus: 'paid',
          status: 'completed',
          paymentMethod: method.toLowerCase(),
        },
        { new: true }
      );

      // Clean/free table if applicable
      if (order?.tableNumber) {
        await DiningTable.findOneAndUpdate(
          { tableNumber: order.tableNumber },
          { status: 'CLEANING', activeOrderId: null }
        );
      }

      if (userId) {
        await logActivity({
          userId,
          action: `Settled Canteen bill of ₹${payment.amount} (Txn: ${transactionId})`,
          entity: 'Order',
          entityId: payment.referenceId,
        });
      }
    }

    return {
      success: true,
      payment,
      message: 'Payment completed and confirmed successfully',
    };
  } else {
    // Payment Simulation FAILED
    payment.status = 'FAILED';
    await payment.save();

    // Release court slots / cancel pending order
    if (payment.purpose === 'COURT_BOOKING') {
      await Booking.findByIdAndUpdate(payment.referenceId, {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
      });
    } else if (payment.purpose === 'MEMBERSHIP') {
      await Membership.findByIdAndUpdate(payment.referenceId, {
        status: 'EXPIRED',
        paymentStatus: 'FAILED',
      });
    } else if (payment.purpose === 'SHOP_ORDER') {
      const order = await Order.findById(payment.referenceId);
      if (order && order.items?.length) {
        // Return reserved inventory
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: Number(item.quantity || 1) },
            });
          }
        }
      }
      await Order.findByIdAndUpdate(payment.referenceId, {
        status: 'cancelled',
        paymentStatus: 'failed',
      });
    } else if (payment.purpose === 'CANTEEN_ORDER') {
      await Order.findByIdAndUpdate(payment.referenceId, {
        paymentStatus: 'failed',
      });
    }

    return {
      success: false,
      payment,
      message: 'Payment simulation failed or was declined',
    };
  }
};

/**
 * Get Consolidated Financial Revenue Summary
 */
export const getFinancialSummary = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [allPaidPayments, todayPaidPayments, recentPayments] = await Promise.all([
    Payment.find({ status: 'PAID' }).sort({ createdAt: -1 }),
    Payment.find({ status: 'PAID', createdAt: { $gte: startOfToday } }),
    Payment.find().sort({ createdAt: -1 }).limit(25).populate('user', 'firstName lastName email'),
  ]);

  const totalRevenue = allPaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const todayRevenue = todayPaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const moduleBreakdown = {
    courtBookings: 0,
    memberships: 0,
    shopOrders: 0,
    canteenOrders: 0,
  };

  const methodBreakdown = {
    upi: 0,
    card: 0,
    cash: 0,
  };

  for (const p of allPaidPayments) {
    const amt = p.amount || 0;
    if (p.purpose === 'COURT_BOOKING') moduleBreakdown.courtBookings += amt;
    else if (p.purpose === 'MEMBERSHIP') moduleBreakdown.memberships += amt;
    else if (p.purpose === 'SHOP_ORDER') moduleBreakdown.shopOrders += amt;
    else if (p.purpose === 'CANTEEN_ORDER') moduleBreakdown.canteenOrders += amt;

    const m = (p.paymentMethod || 'UPI').toUpperCase();
    if (m === 'UPI') methodBreakdown.upi += amt;
    else if (m === 'CARD') methodBreakdown.card += amt;
    else if (m === 'CASH') methodBreakdown.cash += amt;
    else methodBreakdown.upi += amt;
  }

  return {
    totalRevenue,
    todayRevenue,
    totalTransactions: allPaidPayments.length,
    moduleBreakdown,
    methodBreakdown,
    recentTransactions: recentPayments,
  };
};

export default {
  generateTransactionId,
  createPaymentIntent,
  processPaymentConfirmation,
  getFinancialSummary,
};
