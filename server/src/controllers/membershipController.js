import MembershipPlan from '../models/MembershipPlan.js';
import Membership from '../models/Membership.js';
import MemberProfile from '../models/MemberProfile.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity, logAudit } from '../services/activityService.js';

/**
 * @desc    Get all membership plans (Gold, Silver, Junior)
 * @route   GET /api/memberships/plans
 * @access  Public
 */
export const getMembershipPlans = async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true }).sort({ price: -1 });
    return sendSuccess(res, {
      message: 'Membership plans fetched successfully',
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new membership plan (Owner)
 * @route   POST /api/memberships/plans
 * @access  Private (Owner)
 */
export const createMembershipPlan = async (req, res, next) => {
  try {
    const { name, description, price, durationInDays, courtDiscount, shopDiscount, canteenDiscount, priorityBooking, fullCourtAccess } = req.body;

    if (!name || price === undefined) {
      return sendError(res, { statusCode: 400, message: 'Plan name and price are required' });
    }

    const plan = await MembershipPlan.create({
      name: name.toUpperCase(),
      description,
      price,
      durationInDays: durationInDays || 365,
      courtDiscount: courtDiscount || 0,
      shopDiscount: shopDiscount || 0,
      canteenDiscount: canteenDiscount || 0,
      priorityBooking: !!priorityBooking,
      fullCourtAccess: !!fullCourtAccess,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Membership plan created successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign or purchase membership for a member
 * @route   POST /api/memberships/subscribe
 * @access  Private
 */
export const subscribeMembership = async (req, res, next) => {
  try {
    const { memberId, planId, paymentMethod = 'UPI', autoRenew = false } = req.body;
    const targetUserId = memberId || req.user._id;

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return sendError(res, { statusCode: 404, message: 'Membership plan not found' });
    }

    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + plan.durationInDays * 24 * 60 * 60 * 1000);

    const isFree = Number(plan.price || 0) === 0;
    const initialPaymentStatus = req.body.paymentStatus || (isFree ? 'PAID' : 'PENDING');
    const initialStatus = initialPaymentStatus === 'PAID' ? 'ACTIVE' : 'PENDING';

    const membership = await Membership.create({
      member: targetUserId,
      plan: plan._id,
      startDate,
      expiryDate,
      status: initialStatus,
      autoRenew,
      paymentStatus: initialPaymentStatus,
      amountPaid: plan.price,
    });

    await logActivity({
      userId: req.user._id,
      action: `Purchased ${plan.name} Membership`,
      entity: 'Membership',
      entityId: membership._id,
      metadata: { planName: plan.name, price: plan.price },
    });

    const populated = await Membership.findById(membership._id)
      .populate('member', 'firstName lastName email phone role')
      .populate('plan');

    return sendSuccess(res, {
      statusCode: 201,
      message: `Successfully subscribed to ${plan.name} Plan`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get active membership of a user
 * @route   GET /api/memberships/member/:userId
 * @access  Private
 */
export const getMemberMembership = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;

    const membership = await Membership.findOne({
      $or: [{ member: userId }, { user: userId }],
      status: 'ACTIVE',
    }).populate('plan');

    const profile = await MemberProfile.findOne({ user: userId });

    return sendSuccess(res, {
      message: 'Member membership details retrieved',
      data: {
        membership,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMembershipPlans,
  createMembershipPlan,
  subscribeMembership,
  getMemberMembership,
};
