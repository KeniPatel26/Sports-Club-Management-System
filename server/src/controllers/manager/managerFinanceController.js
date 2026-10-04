import Payment from '../../models/Payment.js';
import Invoice from '../../models/Invoice.js';
import Expense from '../../models/Expense.js';
import Order from '../../models/Order.js';
import Booking from '../../models/Booking.js';
import Membership from '../../models/Membership.js';

/**
 * GET /api/manager/finance/overview
 * Financial health overview: Revenue vs Expenses, Net Profit, Breakdown by Module & Payment Method
 */
export const getFinancialOverview = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [payments, todayPayments] = await Promise.all([
      Payment.find({ status: { $in: ['PAID', 'SUCCESS'] } }),
      Payment.find({ status: { $in: ['PAID', 'SUCCESS'] }, createdAt: { $gte: startOfToday } }),
    ]);

    let totalRevenue = 0;
    let membershipRevenue = 0;
    let courtRevenue = 0;
    let shopRevenue = 0;
    let canteenRevenue = 0;

    let upiRevenue = 0;
    let cardRevenue = 0;
    let cashRevenue = 0;

    payments.forEach((p) => {
      const amt = p.amount || 0;
      totalRevenue += amt;

      const pur = (p.purpose || p.type || '').toUpperCase();
      if (pur.includes('MEMBERSHIP')) membershipRevenue += amt;
      else if (pur.includes('BOOKING') || pur.includes('COURT')) courtRevenue += amt;
      else if (pur.includes('SHOP')) shopRevenue += amt;
      else if (pur.includes('CANTEEN')) canteenRevenue += amt;
      else courtRevenue += amt;

      const method = (p.paymentMethod || p.method || 'UPI').toUpperCase();
      if (method === 'UPI') upiRevenue += amt;
      else if (method === 'CARD') cardRevenue += amt;
      else if (method === 'CASH') cashRevenue += amt;
      else upiRevenue += amt;
    });

    const todayRevenue = todayPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Fallback baseline for initial hackathon display if DB is freshly seeded
    if (totalRevenue === 0) {
      membershipRevenue = 150000;
      courtRevenue = 80000;
      shopRevenue = 60000;
      canteenRevenue = 45000;
      totalRevenue = membershipRevenue + courtRevenue + shopRevenue + canteenRevenue;
      upiRevenue = 180000;
      cardRevenue = 110000;
      cashRevenue = 45000;
    }

    const expenses = await Expense.find();
    let totalExpenses = 0;
    const expenseByCategory = {
      MAINTENANCE: 18000,
      UTILITIES: 24000,
      SUPPLIES: 12000,
      SALARY: 110000,
      EQUIPMENT: 25000,
      OTHER: 8000,
    };

    if (expenses.length > 0) {
      totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    } else {
      totalExpenses = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);
    }

    const netOperatingProfit = totalRevenue - totalExpenses;

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        todayRevenue,
        totalExpenses,
        netOperatingProfit,
        profitMarginPct: totalRevenue > 0 ? Math.round((netOperatingProfit / totalRevenue) * 100) : 40,
        revenueBreakdown: {
          membership: membershipRevenue,
          court: courtRevenue,
          shop: shopRevenue,
          canteen: canteenRevenue,
        },
        methodBreakdown: {
          upi: upiRevenue,
          card: cardRevenue,
          cash: cashRevenue,
        },
        expenseByCategory,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch financial overview',
      error: error.message,
    });
  }
};

/**
 * GET /api/manager/finance/payments or /api/manager/payments
 * List payment transactions with filters
 */
export const getPayments = async (req, res) => {
  try {
    const { type, purpose, method, paymentMethod, status, search = '' } = req.query;

    const query = {};
    const targetType = purpose || type;
    if (targetType && targetType !== 'ALL') {
      query.$or = [{ purpose: targetType }, { type: targetType }];
    }

    const targetMethod = paymentMethod || method;
    if (targetMethod && targetMethod !== 'ALL') {
      query.$or = query.$or || [];
      query.paymentMethod = targetMethod.toUpperCase();
    }

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    let payments = await Payment.find(query)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      payments = payments.filter((p) => {
        const txn = (p.transactionId || p.paymentId || '').toLowerCase();
        const cName = (p.customerName || '').toLowerCase();
        const email = (p.user?.email || '').toLowerCase();
        const purp = (p.purpose || p.type || '').toLowerCase();
        return txn.includes(q) || cName.includes(q) || email.includes(q) || purp.includes(q);
      });
    }

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message,
    });
  }
};

/**
 * GET /api/manager/finance/invoices
 * List invoices
 */
export const getInvoices = async (req, res) => {
  try {
    const { type, paymentStatus, search = '' } = req.query;

    const query = {};
    if (type && type !== 'ALL') query.type = type;
    if (paymentStatus && paymentStatus !== 'ALL') query.paymentStatus = paymentStatus;

    let invoices = await Invoice.find(query)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      invoices = invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.user?.email?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message,
    });
  }
};

/**
 * GET /api/manager/finance/expenses
 * List club expenses
 */
export const getExpenses = async (req, res) => {
  try {
    let expenses = await Expense.find().sort({ date: -1 });

    // Seed default expenses if collection is empty
    if (expenses.length === 0) {
      const defaultExpenses = [
        {
          title: 'Staff Monthly Payroll (All Departments)',
          category: 'SALARY',
          amount: 110000,
          date: new Date(),
          paymentMethod: 'BANK_TRANSFER',
          vendor: 'Internal HR',
        },
        {
          title: 'Tennis Court Resurfacing & Net Maintenance',
          category: 'MAINTENANCE',
          amount: 18000,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          paymentMethod: 'BANK_TRANSFER',
          vendor: 'Apex Sports Surfaces',
        },
        {
          title: 'Floodlights Electricity & Water Utility',
          category: 'UTILITIES',
          amount: 24000,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          paymentMethod: 'BANK_TRANSFER',
          vendor: 'Torrent Power',
        },
        {
          title: 'Pro Shop Yonex Racket & Ball Restock',
          category: 'SUPPLIES',
          amount: 32000,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          paymentMethod: 'UPI',
          vendor: 'Yonex India Dist.',
        },
      ];
      expenses = await Expense.insertMany(defaultExpenses);
    }

    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/finance/expenses
 * Record a new operational expense
 */
export const createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, paymentMethod, vendor, notes } = req.body;

    if (!title || !category || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and amount are required',
      });
    }

    const expense = await Expense.create({
      title: title.trim(),
      category,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'BANK_TRANSFER',
      vendor: vendor || '',
      notes: notes || '',
      recordedBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record expense',
      error: error.message,
    });
  }
};

export default {
  getFinancialOverview,
  getPayments,
  getInvoices,
  getExpenses,
  createExpense,
};
