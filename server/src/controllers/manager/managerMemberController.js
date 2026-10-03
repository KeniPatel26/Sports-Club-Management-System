import User from '../../models/User.js';
import MemberProfile from '../../models/MemberProfile.js';
import Membership from '../../models/Membership.js';
import MembershipPlan from '../../models/MembershipPlan.js';
import Booking from '../../models/Booking.js';
import Order from '../../models/Order.js';
import Payment from '../../models/Payment.js';
import Invoice from '../../models/Invoice.js';
import { hashPassword } from '../../utils/password.js';

/**
 * GET /api/manager/members
 * Search, filter and list all club members
 */
export const getMembers = async (req, res) => {
  try {
    const { search = '', status, plan } = req.query;

    const query = { role: 'MEMBER' };

    if (status) {
      query.status = status;
    }

    if (search.trim()) {
      query.$or = [
        { firstName: { $regex: search.trim(), $options: 'i' } },
        { lastName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const members = await User.find(query).sort({ createdAt: -1 });

    const memberList = await Promise.all(
      members.map(async (u) => {
        const profile = await MemberProfile.findOne({ user: u._id });
        const currentMembership = await Membership.findOne({
          $or: [{ user: u._id }, { member: u._id }],
          status: 'ACTIVE',
        })
          .populate('plan')
          .sort({ endDate: -1 });

        return {
          id: u._id,
          _id: u._id,
          name: `${u.firstName} ${u.lastName || ''}`.trim(),
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          status: u.status,
          memberId: profile?.memberId || `MEM${u._id.toString().slice(-4).toUpperCase()}`,
          plan: currentMembership?.plan?.name || 'Gold',
          planPrice: currentMembership?.plan?.price || 20000,
          startDate: currentMembership?.startDate || u.createdAt,
          expiryDate: currentMembership?.endDate || new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
          joinedAt: profile?.joinedAt || u.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: memberList.length,
      data: memberList,
    });
  } catch (error) {
    console.error('getMembers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message,
    });
  }
};

/**
 * GET /api/manager/members/:id
 * Retrieve detailed member profile with multi-tab history
 */
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const profile = await MemberProfile.findOne({ user: user._id });
    const memberships = await Membership.find({ $or: [{ user: user._id }, { member: user._id }] })
      .populate('plan')
      .sort({ createdAt: -1 });

    const bookings = await Booking.find({ member: user._id })
      .populate('court')
      .sort({ date: -1 });

    const shopOrders = await Order.find({ member: user._id, type: 'sports' })
      .populate('items.product')
      .sort({ createdAt: -1 });

    const canteenOrders = await Order.find({ member: user._id, type: 'canteen' })
      .populate('items.product')
      .sort({ createdAt: -1 });

    const payments = await Payment.find({ user: user._id }).sort({ createdAt: -1 });
    const invoices = await Invoice.find({ user: user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName || ''}`.trim(),
          email: user.email,
          phone: user.phone,
          status: user.status,
          role: user.role,
          createdAt: user.createdAt,
        },
        profile: profile || {
          memberId: `MEM${user._id.toString().slice(-4).toUpperCase()}`,
          address: { street: '', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
          emergencyContact: { name: '', phone: '', relation: '' },
          joinedAt: user.createdAt,
        },
        memberships,
        currentMembership: memberships[0] || null,
        bookings,
        shopOrders,
        canteenOrders,
        payments,
        invoices,
      },
    });
  } catch (error) {
    console.error('getMemberById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch member details',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/members
 * Create new member with profile and active membership plan
 */
export const createMember = async (req, res) => {
  let createdUser = null;
  let createdProfile = null;

  try {
    const {
      firstName,
      lastName = '',
      email,
      phone,
      password = 'Member@123',
      dob,
      gender = 'MALE',
      street = '',
      city = 'Ahmedabad',
      state = 'Gujarat',
      pincode = '380015',
      emergencyName = '',
      emergencyPhone = '',
      emergencyRelation = '',
      planId,
      planName = 'GOLD',
      durationDays = 365,
      paymentMethod = 'UPI',
    } = req.body;

    if (!firstName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'First name, email and phone number are required',
      });
    }

    const resolvedEmail = email.toLowerCase().trim();
    const resolvedPhone = phone.trim();

    const existing = await User.findOne({
      $or: [{ email: resolvedEmail }, { phone: resolvedPhone }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A member with this email or phone number already exists',
      });
    }

    const hashedPassword = await hashPassword(password);

    createdUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: resolvedEmail,
      phone: resolvedPhone,
      password: hashedPassword,
      role: 'MEMBER',
      department: null,
      status: 'ACTIVE',
    });

    const memberCount = await MemberProfile.countDocuments();
    const memberId = `MEM${(memberCount + 1001).toString()}`;

    createdProfile = await MemberProfile.create({
      user: createdUser._id,
      memberId,
      dateOfBirth: dob ? new Date(dob) : null,
      gender,
      address: { street, city, state, pincode, country: 'India' },
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relation: emergencyRelation,
      },
      joinedAt: new Date(),
    });

    // Find or create MembershipPlan
    let selectedPlan = null;
    if (planId) {
      selectedPlan = await MembershipPlan.findById(planId);
    }

    if (!selectedPlan && planName) {
      selectedPlan = await MembershipPlan.findOne({
        name: { $regex: new RegExp(planName, 'i') },
      });
    }

    if (!selectedPlan) {
      selectedPlan = await MembershipPlan.create({
        name: (planName || 'GOLD').toUpperCase(),
        price: (planName || 'GOLD').toUpperCase().includes('GOLD') ? 20000 : 12000,
        durationInDays: durationDays || 365,
        courtDiscount: 20,
        shopDiscount: 15,
        canteenDiscount: 15,
      });
    }

    const duration = selectedPlan.durationInDays || selectedPlan.duration || durationDays || 365;
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    const membership = await Membership.create({
      member: createdUser._id,
      user: createdUser._id,
      plan: selectedPlan._id,
      startDate,
      endDate: expiryDate,
      expiryDate,
      status: 'ACTIVE',
      paymentMethod,
      paymentStatus: 'PAID',
      amountPaid: selectedPlan.price || 0,
    });

    // Auto-generate initial invoice & payment log
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    await Invoice.create({
      invoiceNumber,
      user: createdUser._id,
      customerName: `${createdUser.firstName} ${createdUser.lastName || ''}`.trim(),
      customerEmail: createdUser.email,
      customerPhone: createdUser.phone,
      type: 'MEMBERSHIP',
      items: [
        {
          description: `${selectedPlan.name} Membership Fee (${duration} Days)`,
          quantity: 1,
          unitPrice: selectedPlan.price,
          amount: selectedPlan.price,
        },
      ],
      subtotal: selectedPlan.price,
      totalAmount: selectedPlan.price,
      paymentStatus: 'PAID',
      paidDate: new Date(),
    });

    await Payment.create({
      paymentId: `PAY-${Date.now().toString().slice(-6)}`,
      user: createdUser._id,
      customerName: `${createdUser.firstName} ${createdUser.lastName || ''}`.trim(),
      type: 'MEMBERSHIP',
      amount: selectedPlan.price,
      method: paymentMethod,
      status: 'SUCCESS',
      referenceId: invoiceNumber,
    });

    return res.status(201).json({
      success: true,
      message: 'Member registered and assigned membership successfully',
      data: {
        user: createdUser,
        profile: createdProfile,
        membership,
      },
    });
  } catch (error) {
    console.error('createMember error:', error);

    // Rollback partially created records to avoid 409 conflict on retry
    if (createdUser && createdUser._id) {
      await User.findByIdAndDelete(createdUser._id).catch(() => {});
    }
    if (createdProfile && createdProfile._id) {
      await MemberProfile.findByIdAndDelete(createdProfile._id).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create member',
      error: error.message,
    });
  }
};

/**
 * PUT /api/manager/members/:id
 * Update member details
 */
export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      email,
      status,
      street,
      city,
      state,
      pincode,
      emergencyName,
      emergencyPhone,
      emergencyRelation,
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (phone) user.phone = phone.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (status) user.status = status;

    await user.save();

    let profile = await MemberProfile.findOne({ user: user._id });
    if (!profile) {
      profile = new MemberProfile({ user: user._id });
    }

    if (street !== undefined || city || state || pincode) {
      profile.address = {
        street: street ?? profile.address?.street,
        city: city ?? profile.address?.city,
        state: state ?? profile.address?.state,
        pincode: pincode ?? profile.address?.pincode,
      };
    }

    if (emergencyName || emergencyPhone || emergencyRelation) {
      profile.emergencyContact = {
        name: emergencyName ?? profile.emergencyContact?.name,
        phone: emergencyPhone ?? profile.emergencyContact?.phone,
        relation: emergencyRelation ?? profile.emergencyContact?.relation,
      };
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      data: { user, profile },
    });
  } catch (error) {
    console.error('updateMember error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update member',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/manager/members/:id/toggle-status
 * Toggle member active/inactive status
 */
export const toggleMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Member status updated to ${user.status}`,
      data: { status: user.status },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle member status',
      error: error.message,
    });
  }
};

export default {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  toggleMemberStatus,
};
