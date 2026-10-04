import MembershipPlan from '../../models/MembershipPlan.js';
import Membership from '../../models/Membership.js';
import User from '../../models/User.js';
import Invoice from '../../models/Invoice.js';
import Payment from '../../models/Payment.js';

/**
 * GET /api/manager/memberships/plans
 * List all membership plans
 */
export const getPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find().sort({ price: -1 });
    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch membership plans',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/memberships/plans
 * Create new membership plan tier
 */
export const createPlan = async (req, res) => {
  try {
    const {
      name,
      description = '',
      price,
      durationInDays = 365,
      courtDiscount = 0,
      shopDiscount = 0,
      canteenDiscount = 0,
      priorityBooking = false,
      fullCourtAccess = false,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Plan name and price are required',
      });
    }

    const plan = await MembershipPlan.create({
      name: name.trim().toUpperCase(),
      description,
      price: Number(price),
      durationInDays: Number(durationInDays),
      courtDiscount: Number(courtDiscount),
      shopDiscount: Number(shopDiscount),
      canteenDiscount: Number(canteenDiscount),
      priorityBooking: Boolean(priorityBooking),
      fullCourtAccess: Boolean(fullCourtAccess),
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Membership plan created successfully',
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create plan',
      error: error.message,
    });
  }
};

/**
 * PUT /api/manager/memberships/plans/:id
 * Update plan details & discounts
 */
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: error.message,
    });
  }
};

/**
 * GET /api/manager/memberships/list
 * List active, expiring soon, and expired memberships
 */
export const getMembershipsList = async (req, res) => {
  try {
    const { filter = 'ALL', search = '' } = req.query;

    const memberships = await Membership.find()
      .populate('user', 'firstName lastName email phone status')
      .populate('member', 'firstName lastName email phone status')
      .populate('plan')
      .sort({ endDate: -1, expiryDate: -1 });

    const now = new Date();
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let goldCount = 0;
    let silverCount = 0;
    let juniorCount = 0;
    let activeCount = 0;
    let expiringCount = 0;
    let expiredCount = 0;
    let goldRevenue = 0;
    let silverRevenue = 0;
    let juniorRevenue = 0;

    const formatted = memberships
      .map((m) => {
        const u = m.user || m.member;
        if (!u) return null;

        const effectiveEndDate = m.endDate || m.expiryDate || new Date(Date.now() + 365 * 86400000);
        let expiryCategory = 'ACTIVE';

        if (effectiveEndDate < now || m.status === 'EXPIRED') {
          expiryCategory = 'EXPIRED';
          expiredCount++;
        } else if (effectiveEndDate <= sevenDaysLater) {
          expiryCategory = 'EXPIRING_7_DAYS';
          expiringCount++;
          activeCount++;
        } else if (effectiveEndDate <= thirtyDaysLater) {
          expiryCategory = 'EXPIRING_30_DAYS';
          expiringCount++;
          activeCount++;
        } else {
          activeCount++;
        }

        const planName = (m.plan?.name || 'SILVER').toUpperCase();
        const planPrice = m.amountPaid || m.plan?.price || 0;

        if (planName === 'GOLD') {
          goldCount++;
          goldRevenue += planPrice;
        } else if (planName === 'SILVER') {
          silverCount++;
          silverRevenue += planPrice;
        } else if (planName === 'JUNIOR') {
          juniorCount++;
          juniorRevenue += planPrice;
        }

        return {
          id: m._id,
          _id: m._id,
          memberId: u._id,
          memberName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          email: u.email,
          phone: u.phone,
          planName: m.plan?.name || 'Standard',
          price: m.plan?.price || 0,
          amountPaid: m.amountPaid || m.plan?.price || 0,
          startDate: m.startDate,
          endDate: effectiveEndDate,
          expiryDate: effectiveEndDate,
          status: m.status,
          expiryCategory,
          courtDiscount: m.plan?.benefits?.courtDiscount ?? m.plan?.courtDiscount ?? 0,
          shopDiscount: m.plan?.benefits?.shopDiscount ?? m.plan?.shopDiscount ?? 0,
          cafeDiscount: m.plan?.benefits?.cafeDiscount ?? m.plan?.canteenDiscount ?? 0,
        };
      })
      .filter(Boolean);

    let filteredResult = formatted;
    if (filter === 'EXPIRING') {
      filteredResult = formatted.filter(
        (m) => m.expiryCategory === 'EXPIRING_7_DAYS' || m.expiryCategory === 'EXPIRING_30_DAYS'
      );
    } else if (filter === 'EXPIRED') {
      filteredResult = formatted.filter((m) => m.expiryCategory === 'EXPIRED');
    } else if (filter === 'ACTIVE') {
      filteredResult = formatted.filter((m) => m.expiryCategory === 'ACTIVE');
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filteredResult = filteredResult.filter(
        (m) =>
          m.memberName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone?.includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: filteredResult.length,
      data: filteredResult,
      stats: {
        goldCount,
        silverCount,
        juniorCount,
        activeCount,
        expiringCount,
        expiredCount,
        goldRevenue,
        silverRevenue,
        juniorRevenue,
        totalRevenue: goldRevenue + silverRevenue + juniorRevenue,
      },
    });
  } catch (error) {
    console.error('getMembershipsList error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch memberships list',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/memberships/assign
 * Assign or renew membership plan for a member
 */
export const assignOrRenewMembership = async (req, res) => {
  try {
    const { memberId, planId, durationDays, paymentMethod = 'UPI', notes = '' } = req.body;

    if (!memberId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID and Plan ID are required',
      });
    }

    const user = await User.findById(memberId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Membership plan not found' });
    }

    const days = Number(durationDays) || plan.durationInDays || 365;

    // Expire any existing active memberships
    await Membership.updateMany(
      { user: user._id, status: 'ACTIVE' },
      { $set: { status: 'EXPIRED' } }
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const newMembership = await Membership.create({
      user: user._id,
      plan: plan._id,
      startDate,
      endDate,
      status: 'ACTIVE',
      paymentMethod,
    });

    // Auto-create Invoice & Payment
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    await Invoice.create({
      invoiceNumber,
      user: user._id,
      customerName: `${user.firstName} ${user.lastName}`.trim(),
      customerEmail: user.email,
      customerPhone: user.phone,
      type: 'MEMBERSHIP',
      items: [
        {
          description: `${plan.name} Membership Renewal (${days} Days)`,
          quantity: 1,
          unitPrice: plan.price,
          amount: plan.price,
        },
      ],
      subtotal: plan.price,
      totalAmount: plan.price,
      paymentStatus: 'PAID',
      paymentMethod,
      paidDate: new Date(),
    });

    const transactionId = `PAY-${Date.now().toString().slice(-6)}`;
    await Payment.create({
      transactionId,
      user: user._id,
      customerName: `${user.firstName} ${user.lastName || ''}`.trim(),
      purpose: 'MEMBERSHIP',
      amount: plan.price,
      paymentMethod,
      status: 'PAID',
      paidAt: new Date(),
      referenceId: newMembership._id,
      notes: notes || `Membership ${plan.name} renewal for ${days} days`,
    }).catch((err) => console.error('Membership payment creation error:', err));

    return res.status(201).json({
      success: true,
      message: `Successfully renewed ${plan.name} membership for ${user.firstName}`,
      data: {
        ...newMembership.toObject(),
        plan,
        invoiceNumber,
        transactionId,
      },
    });
  } catch (error) {
    console.error('assignOrRenewMembership error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign membership',
      error: error.message,
    });
  }
};

export default {
  getPlans,
  createPlan,
  updatePlan,
  getMembershipsList,
  assignOrRenewMembership,
};
