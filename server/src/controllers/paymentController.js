import Payment from '../models/Payment.js';
import {
  createPaymentIntent,
  processPaymentConfirmation,
  getFinancialSummary,
} from '../services/paymentService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @desc    Create a payment intent for Court, Membership, Shop, or Canteen
 * @route   POST /api/payments or POST /api/payments/create
 * @access  Private / Public with reference
 */
export const createPayment = async (req, res, next) => {
  try {
    const { purpose, referenceId, paymentMethod = 'UPI', customerName, notes } = req.body;

    if (!purpose || !referenceId) {
      return sendError(res, {
        statusCode: 400,
        message: 'Payment purpose (COURT_BOOKING, MEMBERSHIP, SHOP_ORDER, CANTEEN_ORDER) and referenceId are required',
      });
    }

    const payment = await createPaymentIntent({
      userId: req.user?._id,
      customerName: customerName || (req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : 'Club Member'),
      purpose,
      referenceId,
      paymentMethod,
      notes,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Payment intent created successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm demo payment (simulate SUCCESS or FAILED)
 * @route   POST /api/payments/:id/confirm
 * @access  Private / Public
 */
export const confirmPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { simulateSuccess = true, status, paymentMethod } = req.body;

    const isSuccess = status ? status.toUpperCase() === 'PAID' : Boolean(simulateSuccess);

    const result = await processPaymentConfirmation({
      paymentId: id,
      simulateSuccess: isSuccess,
      paymentMethod,
      userId: req.user?._id,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: result.payment,
      });
    }

    return sendSuccess(res, {
      message: result.message,
      data: result.payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment details by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('user', 'firstName lastName email phone');
    if (!payment) {
      return sendError(res, { statusCode: 404, message: 'Payment record not found' });
    }

    return sendSuccess(res, {
      message: 'Payment details retrieved',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged in user's payment history
 * @route   GET /api/payments/my
 * @access  Private (Member / Staff)
 */
export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccess(res, {
      message: 'Your payment history retrieved',
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all payments for Manager / Staff
 * @route   GET /api/payments/manager
 * @access  Private (Manager / Staff / Owner)
 */
export const getManagerPayments = async (req, res, next) => {
  try {
    const { purpose, method, status, search } = req.query;
    const query = {};

    if (purpose && purpose !== 'ALL') query.purpose = purpose.toUpperCase();
    if (method && method !== 'ALL') query.paymentMethod = method.toUpperCase();
    if (status && status !== 'ALL') query.status = status.toUpperCase();
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(100);

    return sendSuccess(res, {
      message: 'All payment records fetched',
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get consolidated Payment & Revenue summary for Manager Dashboard
 * @route   GET /api/payments/summary or GET /api/payments/manager/summary
 * @access  Private (Manager / Owner)
 */
export const getPaymentSummary = async (req, res, next) => {
  try {
    const summary = await getFinancialSummary();
    return sendSuccess(res, {
      message: 'Financial payment overview retrieved',
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createPayment,
  confirmPayment,
  getPaymentById,
  getMyPayments,
  getManagerPayments,
  getPaymentSummary,
};
