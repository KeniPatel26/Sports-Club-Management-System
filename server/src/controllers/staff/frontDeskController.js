import Booking from '../../models/Booking.js';
import Court from '../../models/Court.js';
import User from '../../models/User.js';
import MemberProfile from '../../models/MemberProfile.js';
import Membership from '../../models/Membership.js';
import Payment from '../../models/Payment.js';
import Invoice from '../../models/Invoice.js';
import Order from '../../models/Order.js';
import Activity from '../../models/Activity.js';
import { logActivity } from '../../services/activityService.js';
import { activeBookingStatusFilter, pendingBookingCutoff } from '../../utils/bookingHold.js';
import { courtDiscountForPlan } from '../../utils/membershipDiscounts.js';

const toLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * GET /api/staff/front-desk/overview
 * Front Desk Dashboard KPIs & Today's Schedule Matrix
 */
export const getFrontDeskOverview = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayBookings, upcomingBookings, totalCourts, courts, todayPayments] = await Promise.all([Booking.find({
      date: { $gte: todayStart, $lte: todayEnd },
      $or: [
        { status: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] } },
        { status: 'PENDING', createdAt: { $gte: pendingBookingCutoff() } },
      ],
    })
      .populate('court')
      .populate('member', 'firstName lastName phone email')
      .sort({ startTime: 1 })
      .lean()
      .maxTimeMS(2500), Booking.countDocuments({
        $or: [{ date: { $gt: todayEnd } }, { date: { $gte: todayStart, $lte: todayEnd }, startTime: { $gt: new Date().toTimeString().slice(0, 5) } }],
        status: 'CONFIRMED',
      }).maxTimeMS(2500), Court.countDocuments({ isActive: true }).maxTimeMS(2000), Court.find({ isActive: true }).lean().maxTimeMS(2000), Payment.find({ purpose: 'COURT_BOOKING', createdAt: { $gte: todayStart, $lte: todayEnd }, status: 'PAID' }).select('amount').lean().maxTimeMS(2000)]);

    const walkInsCount = todayBookings.filter(
      (b) => b.bookingType === 'WALK_IN' || b.bookingSource === 'WALK_IN'
    ).length;

    const phoneCount = todayBookings.filter(
      (b) => b.bookingType === 'PHONE' || b.bookingSource === 'PHONE'
    ).length;

    const memberBookingsCount = todayBookings.filter(
      (b) => b.bookingType === 'MEMBER'
    ).length;

    const currentTime = new Date().toTimeString().slice(0, 5);
    const occupiedCourtIds = new Set(
      todayBookings
        .filter((b) => ['CONFIRMED', 'CHECKED_IN'].includes(b.status) && b.startTime <= currentTime && b.endTime > currentTime)
        .map((b) => b.court?._id?.toString() || b.court?.toString())
        .filter(Boolean)
    );
    const occupiedCourts = occupiedCourtIds.size;
    const availableCourts = Math.max(totalCourts - occupiedCourts, 0);

    const todayRevenue = todayPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

    const schedule = todayBookings.map((b) => ({
      id: b._id,
      courtId: b.court?._id || b.court,
      courtName: b.court?.name || 'Court',
      courtType: b.court?.type || '',
      memberName: b.member
        ? `${b.member.firstName} ${b.member.lastName || ''}`.trim()
        : b.walkInDetails?.name || 'Walk-in Guest',
      phone: b.member?.phone || b.walkInDetails?.phone || '',
      email: b.member?.email || b.walkInDetails?.email || '',
      startTime: b.startTime,
      endTime: b.endTime,
      bookingType: b.bookingType,
      bookingSource: b.bookingSource || 'FRONT_DESK',
      status: b.status, // CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW
      price: b.price,
      discountApplied: b.discountApplied || 0,
      finalAmount: b.finalAmount,
      paymentStatus: b.paymentStatus,
      paymentMethod: b.paymentMethod || '',
      checkInTime: b.checkInTime,
      checkOutTime: b.checkOutTime,
      notes: b.notes,
    }));

    return res.status(200).json({
      success: true,
      data: {
        kpi: {
          todayBookingsCount: todayBookings.filter((booking) => booking.status !== 'CANCELLED').length,
          upcomingBookingsCount: upcomingBookings,
          availableCourts,
          occupiedCourts,
          walkInsToday: walkInsCount,
          phoneBookings: phoneCount,
          memberBookings: memberBookingsCount,
          todayRevenue: todayRevenue,
          pendingActions: todayBookings.filter((booking) => booking.status === 'CONFIRMED' && booking.startTime <= currentTime).length,
        },
        schedule,
        courts: courts.map((court) => ({ id: court._id, name: court.name, type: court.type, status: court.status, hourlyRate: court.hourlyRate, walkInRate: court.walkInRate })),
      },
    });
  } catch (error) {
    console.error('getFrontDeskOverview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load Front Desk overview',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/front-desk/members/search
 * Search members by Name, Phone, Email, or Member ID
 */
export const searchMembers = async (req, res) => {
  try {
    const { query = '' } = req.query;

    if (!query.trim()) {
      return res.status(200).json({ success: true, data: [] });
    }

    const q = query.trim();
    const matchingProfiles = await MemberProfile.find({ memberId: { $regex: q, $options: 'i' } }).select('user').lean().maxTimeMS(2000);
    const profileUserIds = matchingProfiles.map((profile) => profile.user);
    const users = await User.find({
      role: 'MEMBER',
      status: 'ACTIVE',
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        ...(profileUserIds.length ? [{ _id: { $in: profileUserIds } }] : []),
      ],
    }).limit(10).lean().maxTimeMS(2500);

    const results = await Promise.all(
      users.map(async (u) => {
        const profile = await MemberProfile.findOne({ user: u._id }).lean().maxTimeMS(2000);
        const activeMembership = await Membership.findOne({
          $or: [{ user: u._id }, { member: u._id }],
          status: 'ACTIVE',
          expiryDate: { $gte: new Date() },
        }).populate('plan').lean().maxTimeMS(2000);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayBookingsCount = await Booking.countDocuments({
          member: u._id,
          date: { $gte: todayStart, $lte: new Date(todayStart.getTime() + 86400000 - 1) },
          status: { $ne: 'CANCELLED' },
        }).maxTimeMS(2000);

        return {
          id: u._id,
          name: `${u.firstName} ${u.lastName || ''}`.trim(),
          email: u.email,
          phone: u.phone,
          memberId: profile?.memberId || null,
          planName: activeMembership?.plan?.name || null,
          membershipTier: activeMembership?.plan?.name || null,
          membershipActive: Boolean(activeMembership),
          courtDiscount: courtDiscountForPlan(activeMembership?.plan),
          shopDiscount: activeMembership?.plan?.benefits?.shopDiscount ?? activeMembership?.plan?.shopDiscount ?? 0,
          cafeDiscount: activeMembership?.plan?.benefits?.cafeDiscount ?? activeMembership?.plan?.benefits?.canteenDiscount ?? activeMembership?.plan?.canteenDiscount ?? 0,
          status: u.status,
          expiryDate: activeMembership?.expiryDate || activeMembership?.endDate || null,
          todayBookingsCount,
          maxDailyPlays: 2,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to search members',
      error: error.message,
    });
  }
};

/**
 * POST /api/staff/front-desk/bookings
 * Operational Court Booking Creation with backend discount calculation & validation
 */
export const createFrontDeskBooking = async (req, res) => {
  try {
    const {
      courtId,
      memberId,
      walkInName,
      walkInPhone,
      walkInEmail = '',
      bookingType = 'MEMBER', // MEMBER | WALK_IN
      bookingSource = 'FRONT_DESK', // FRONT_DESK | PHONE | WALK_IN
      date,
      startTime,
      endTime,
      durationMinutes = 60,
      paymentMethod = 'UPI',
      notes = '',
    } = req.body;

    if (!courtId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Court, date, start time, and end time are required',
      });
    }

    if (!['MEMBER', 'WALK_IN'].includes(bookingType) || !['FRONT_DESK', 'PHONE', 'WALK_IN'].includes(bookingSource)) {
      return res.status(400).json({ success: false, message: 'Only member and walk-in bookings are supported.' });
    }

    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    if (!court.isActive || court.status === 'MAINTENANCE') {
      return res.status(400).json({
        success: false,
        message: `${court.name} is currently inactive or undergoing maintenance`,
      });
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const currentTime = new Date().toTimeString().slice(0, 5);
    if (Number.isNaN(bookingDate.getTime()) || bookingDate < todayStart || (bookingDate.getTime() === todayStart.getTime() && startTime <= currentTime)) {
      return res.status(400).json({ success: false, message: 'Choose a future date and timeslot.' });
    }

    // 1. Anti-Double Booking Conflict Check
    const overlapping = await Booking.findOne({
      court: court._id,
      date: bookingDate,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      ...activeBookingStatusFilter(),
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: `This slot (${startTime} - ${endTime}) is already booked for ${court.name}`,
      });
    }

    let memberUser = null;
    let discountPercent = 0;
    let planTierName = 'Standard';

    // 2. Member checks and automatic backend discount lookup
    if (bookingType === 'MEMBER' && memberId) {
      memberUser = await User.findById(memberId);
      if (!memberUser || memberUser.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Selected member account is inactive or not found',
        });
      }

      // Check daily limit (max 2 bookings / day)
      const dayBookingsCount = await Booking.countDocuments({
        member: memberUser._id,
        date: bookingDate,
        $or: [
          { status: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] } },
          { status: 'PENDING', createdAt: { $gte: pendingBookingCutoff() } },
        ],
      });

      if (dayBookingsCount >= 2) {
        return res.status(400).json({
          success: false,
          message: `Member ${memberUser.firstName} has reached the daily limit of 2 bookings/day.`,
        });
      }

      const activeMembership = await Membership.findOne({
        $or: [{ user: memberUser._id }, { member: memberUser._id }],
        status: 'ACTIVE',
        expiryDate: { $gte: new Date() },
      }).populate('plan');

      if (activeMembership && activeMembership.plan) {
        discountPercent = courtDiscountForPlan(activeMembership.plan);
        planTierName = activeMembership.plan.name;
      }
    }

    // 3. Price Calculation (Auto-calculated on backend)
    const baseRate = bookingType === 'MEMBER' ? Number(court.hourlyRate ?? 0) : Number(court.walkInRate ?? court.hourlyRate ?? 0);
    const discountAmount = Math.round((baseRate * discountPercent) / 100);
    const finalAmount = Math.max(baseRate - discountAmount, 0);

    const resolvedSource = bookingSource || (bookingType === 'PHONE' ? 'PHONE' : bookingType === 'WALK_IN' ? 'WALK_IN' : 'FRONT_DESK');

    const paymentRequired = finalAmount > 0;
    const booking = await Booking.create({
      court: court._id,
      member: memberUser ? memberUser._id : null,
      bookingType,
      bookingSource: resolvedSource,
      walkInDetails: {
        name: walkInName || '',
        phone: walkInPhone || '',
        email: walkInEmail || '',
      },
      date: bookingDate,
      startTime,
      endTime,
      durationMinutes,
      price: baseRate,
      discountApplied: discountAmount,
      finalAmount,
      paymentMethod: paymentRequired ? paymentMethod : 'MEMBERSHIP_INCLUDED',
      paymentStatus: paymentRequired ? 'PENDING' : 'PAID',
      status: paymentRequired ? 'PENDING' : 'CONFIRMED',
      notes,
      bookedBy: req.user._id,
    });

    const invoiceNumber = `INV-BK-${Date.now().toString().slice(-6)}`;
    await Invoice.create({
      invoiceNumber,
      booking: booking._id,
      user: memberUser ? memberUser._id : null,
      customerName: memberUser ? `${memberUser.firstName} ${memberUser.lastName || ''}`.trim() : (walkInName || 'Walk-in Guest'),
      customerPhone: memberUser ? memberUser.phone : (walkInPhone || ''),
      type: 'BOOKING',
      items: [
        {
          description: `${court.name} Reservation (${startTime} - ${endTime})`,
          quantity: 1,
          unitPrice: baseRate,
          amount: baseRate,
        },
      ],
      subtotal: baseRate,
      discount: discountAmount,
      totalAmount: finalAmount,
      paymentStatus: paymentRequired ? 'PENDING' : 'PAID',
      paymentMethod: paymentRequired ? paymentMethod : 'MEMBERSHIP_INCLUDED',
      paidDate: paymentRequired ? null : new Date(),
    });

    // Audit Log
    try {
      await logActivity({
        userId: req.user._id,
        action: `Front Desk ${paymentRequired ? 'created pending' : 'confirmed'} ${bookingType} booking #${booking._id.toString().slice(-4)} for ${court.name} (${startTime})`,
        entity: 'Booking',
        entityId: booking._id,
      });
    } catch (e) {
      // ignore
    }

    return res.status(201).json({
      success: true,
      message: paymentRequired
        ? `Booking #${booking._id.toString().slice(-4)} is held for payment for ${court.name} at ${startTime}.`
        : `Booking #${booking._id.toString().slice(-4)} confirmed for ${court.name} at ${startTime}!`,
      data: {
        ...booking.toObject(),
        court,
        receipt: {
          invoiceNumber,
          paymentId: null,
          baseRate,
          discountPercent,
          discountAmount,
          finalAmount,
          customerName: memberUser ? `${memberUser.firstName} ${memberUser.lastName || ''}`.trim() : walkInName,
          courtName: court.name,
          timeSlot: `${startTime} - ${endTime}`,
          paymentMethod: paymentRequired ? paymentMethod : 'MEMBERSHIP_INCLUDED',
          date,
          paymentRequired,
        },
      },
    });
  } catch (error) {
    console.error('createFrontDeskBooking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
};

/**
 * POST /api/staff/front-desk/bookings/:id/check-in
 * Member / Guest arrives at club - record checkInTime
 */
export const checkInBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('court member');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({ success: false, message: `Cannot check-in a ${booking.status.toLowerCase()} booking` });
    }

    booking.status = 'CHECKED_IN';
    booking.checkInTime = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Check-in recorded for ${booking.court?.name || 'Court'} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record check-in',
      error: error.message,
    });
  }
};

/**
 * POST /api/staff/front-desk/bookings/:id/check-out
 * Member / Guest finishes court session - record checkOutTime and mark COMPLETED
 */
export const checkOutBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('court member');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'CHECKED_IN') {
      return res.status(400).json({ success: false, message: `Cannot check-out a ${booking.status.toLowerCase()} booking` });
    }

    booking.status = 'COMPLETED';
    booking.checkOutTime = new Date();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Check-out recorded for ${booking.court?.name || 'Court'} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to record check-out',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/staff/front-desk/bookings/:id/status
 * Update exceptional status: CONFIRMED ➔ NO_SHOW / CANCELLED
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'NO_SHOW' or 'CANCELLED'

    const booking = await Booking.findById(id).populate('court');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const allowedStatuses = ['NO_SHOW', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Unsupported booking status update' });
    }
    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({ success: false, message: `Cannot mark a ${booking.status.toLowerCase()} booking as ${status.toLowerCase()}` });
    }
    booking.status = status;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking for ${booking.court?.name || 'Court'} marked as ${status}`,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/front-desk/courts/availability
 * Real-time 30-minute interval court availability grid (06:00 - 22:00)
 */
export const getCourtAvailability = async (req, res) => {
  try {
    const { date = toLocalDateKey(new Date()) } = req.query;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'A valid availability date is required' });
    }
    const todayKey = toLocalDateKey(new Date());
    if (date < todayKey) {
      return res.status(400).json({ success: false, message: 'Past dates are not available for court scheduling.' });
    }

    const queryDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(queryDate.getTime()) || toLocalDateKey(queryDate) !== date) {
      return res.status(400).json({ success: false, message: 'A valid availability date is required' });
    }
    queryDate.setHours(0, 0, 0, 0);

    const dateEnd = new Date(queryDate);
    dateEnd.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const currentTime = new Date().toTimeString().slice(0, 5);

    const [courts, bookings] = await Promise.all([Court.find().sort({ name: 1 }).lean().maxTimeMS(2500), Booking.find({
      date: { $gte: queryDate, $lte: dateEnd },
      ...activeBookingStatusFilter(),
    }).populate('member', 'firstName lastName phone email').populate('court', 'name type hourlyRate').lean().maxTimeMS(2500)]);

    // 30-minute time slots from 06:00 to 22:00
    const timeSlots = [];
    for (let h = 6; h <= 21; h++) {
      const hourStr = String(h).padStart(2, '0');
      timeSlots.push(`${hourStr}:00`);
      timeSlots.push(`${hourStr}:30`);
    }

    const grid = timeSlots.map((slot) => {
      const courtStatuses = {};

      courts.forEach((court) => {
        if (!court.isActive && court.isActive !== undefined || court.status === 'MAINTENANCE') {
          courtStatuses[court._id] = {
            status: 'MAINTENANCE',
            label: 'Maintenance',
          };
          return;
        }

        // Check if court is booked in this slot
        const booked = bookings.find((b) => {
          if ((b.court?._id || b.court).toString() !== court._id.toString()) return false;
          return slot >= b.startTime && slot < b.endTime;
        });

        if (booked) {
          courtStatuses[court._id] = {
            status: 'BOOKED',
            label: 'Booked',
            bookingId: booked._id,
            bookedBy: booked.member
              ? `${booked.member.firstName} ${booked.member.lastName || ''}`.trim()
              : booked.walkInDetails?.name || 'Guest',
            booking: {
              id: booked._id,
              courtId: court._id,
              courtName: court.name,
              courtType: court.type,
              memberName: booked.member ? `${booked.member.firstName} ${booked.member.lastName || ''}`.trim() : booked.walkInDetails?.name || 'Guest',
              phone: booked.member?.phone || booked.walkInDetails?.phone || '',
              email: booked.member?.email || booked.walkInDetails?.email || '',
              bookingType: booked.bookingType,
              bookingSource: booked.bookingSource,
              status: booked.status,
              startTime: booked.startTime,
              endTime: booked.endTime,
              finalAmount: booked.finalAmount,
              paymentMethod: booked.paymentMethod,
              paymentStatus: booked.paymentStatus,
              checkInTime: booked.checkInTime,
              checkOutTime: booked.checkOutTime,
              date: booked.date,
            },
          };
        } else if (queryDate < todayStart || (queryDate.getTime() === todayStart.getTime() && slot <= currentTime)) {
          courtStatuses[court._id] = { status: 'PAST', label: 'Past time' };
        } else {
          courtStatuses[court._id] = {
            status: 'AVAILABLE',
            label: 'Available',
          };
        }
      });

      return {
        time: slot,
        courts: courtStatuses,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        date,
        courts: courts.map((c) => ({ id: c._id, name: c.name, type: c.type, status: c.status, hourlyRate: c.hourlyRate, walkInRate: c.walkInRate })),
        timeSlots,
        grid,
      },
    });
  } catch (error) {
    console.error('getCourtAvailability error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch court availability grid',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/staff/front-desk/bookings/:id/reschedule
 * Reschedule booking to new date/time/court
 */
export const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, courtId, reason = 'Customer request' } = req.body;

    const booking = await Booking.findById(id).populate('court');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${booking.status.toLowerCase()} booking`,
      });
    }

    const targetCourtId = courtId || booking.court._id;
    const targetDate = new Date(date || booking.date);
    targetDate.setHours(0, 0, 0, 0);

    const newStart = startTime || booking.startTime;
    const newEnd = endTime || booking.endTime;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (Number.isNaN(targetDate.getTime()) || targetDate < todayStart || (targetDate.getTime() === todayStart.getTime() && newStart <= new Date().toTimeString().slice(0, 5))) {
      return res.status(400).json({ success: false, message: 'Choose a future date and timeslot.' });
    }

    // Check collision
    const collision = await Booking.findOne({
      _id: { $ne: booking._id },
      court: targetCourtId,
      date: targetDate,
      startTime: { $lt: newEnd },
      endTime: { $gt: newStart },
      status: { $in: ['CONFIRMED', 'CHECKED_IN'] },
    });

    if (collision) {
      return res.status(409).json({
        success: false,
        message: `Slot ${newStart} - ${newEnd} is already occupied on selected court`,
      });
    }

    booking.court = targetCourtId;
    booking.date = targetDate;
    booking.startTime = newStart;
    booking.endTime = newEnd;
    booking.notes = `${booking.notes || ''} [Rescheduled by Front Desk: ${reason}]`.trim();
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking #${booking._id.toString().slice(-4)} rescheduled successfully!`,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking',
      error: error.message,
    });
  }
};

/**
 * POST /api/staff/front-desk/bookings/:id/cancel
 * Cancel booking with reason
 */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Member requested cancellation' } = req.body;

    const booking = await Booking.findById(id).populate('court member');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status.toLowerCase()} booking` });
    }

    booking.status = 'CANCELLED';
    if (booking.paymentStatus === 'PENDING') booking.paymentStatus = 'FAILED';
    booking.cancellationReason = reason;
    await booking.save();
    await Promise.all([
      Payment.updateMany({ referenceId: booking._id, purpose: 'COURT_BOOKING', status: 'PENDING' }, { status: 'FAILED' }),
      Invoice.updateOne({ booking: booking._id, paymentStatus: 'PENDING' }, { paymentStatus: 'CANCELLED' }),
    ]);

    return res.status(200).json({
      success: true,
      message: `Booking #${booking._id.toString().slice(-4)} cancelled successfully.`,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/front-desk/members/:id/history
 * Comprehensive member profile: 2-plays/day limit, bookings, payments, and order history
 */
export const getMemberHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean().maxTimeMS(2500);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const profile = await MemberProfile.findOne({ user: user._id }).lean().maxTimeMS(2000);
    const membership = await Membership.findOne({ $or: [{ user: user._id }, { member: user._id }], status: 'ACTIVE', expiryDate: { $gte: new Date() } }).populate('plan').lean().maxTimeMS(2000);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayBookingsCount = await Booking.countDocuments({
      member: user._id,
      date: { $gte: todayStart, $lte: new Date(todayStart.getTime() + 86400000 - 1) },
      status: { $ne: 'CANCELLED' },
    }).maxTimeMS(2000);

    const recentBookings = await Booking.find({ member: user._id })
      .populate('court')
      .sort({ date: -1, startTime: -1 })
      .limit(6)
      .lean()
      .maxTimeMS(2500);

    const recentPayments = await Payment.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()
      .maxTimeMS(2500);

    const recentOrders = await Order.find({ member: user._id })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()
      .maxTimeMS(2500);

    return res.status(200).json({
      success: true,
      data: {
        member: {
          id: user._id,
          name: `${user.firstName} ${user.lastName || ''}`.trim(),
          email: user.email,
          phone: user.phone,
          memberId: profile?.memberId || null,
          status: user.status,
          membership: membership?.plan?.name?.toUpperCase() || null,
          membershipTier: membership?.plan?.name || null,
          membershipActive: Boolean(membership),
          courtDiscount: courtDiscountForPlan(membership?.plan),
          shopDiscount: membership?.plan?.benefits?.shopDiscount ?? membership?.plan?.shopDiscount ?? 0,
          cafeDiscount: membership?.plan?.benefits?.cafeDiscount ?? membership?.plan?.benefits?.canteenDiscount ?? membership?.plan?.canteenDiscount ?? 0,
          validUntil: membership?.expiryDate || membership?.endDate || null,
          todayPlays: todayBookingsCount,
          maxDailyPlays: 2,
        },
        recentBookings: recentBookings.map((b) => ({
          id: b._id,
          courtName: b.court?.name || '',
          date: b.date,
          time: `${b.startTime} - ${b.endTime}`,
          status: b.status,
          amount: b.finalAmount,
        })),
        recentPayments: recentPayments.map((p) => ({
          id: p._id,
          paymentId: p.paymentId,
          amount: p.amount,
          method: p.method,
          status: p.status,
          date: p.createdAt,
        })),
        recentOrders: recentOrders.map((o) => ({
          id: o._id,
          type: o.type === 'sports' ? 'Pro Shop' : 'Canteen',
          total: o.total,
          status: o.status,
          itemCount: o.items?.length || 0,
          date: o.createdAt,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch member details',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/front-desk/payments
 * History of payments collected by Front Desk
 */
export const getFrontDeskPayments = async (req, res) => {
  try {
    const { purpose, method, search } = req.query;
    const query = { status: 'PAID' };

    if (purpose && purpose !== 'ALL') {
      query.purpose = purpose;
    }
    if (method && method !== 'ALL') {
      query.paymentMethod = method.toUpperCase();
    }

    let payments = await Payment.find(query)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      payments = payments.filter((p) => {
        const txn = (p.transactionId || p.paymentId || '').toLowerCase();
        const cName = (p.customerName || '').toLowerCase();
        const email = (p.user?.email || '').toLowerCase();
        return txn.includes(q) || cName.includes(q) || email.includes(q);
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
      message: 'Failed to fetch front desk payments',
      error: error.message,
    });
  }
};

/**
 * GET /api/staff/front-desk/daily-closing
 * End of shift summary of front desk transactions
 */
const buildDailyClosingSummary = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const [bookings, payments] = await Promise.all([
      Booking.find({ date: { $gte: todayStart, $lt: tomorrowStart } }).lean().maxTimeMS(2500),
      Payment.find({ type: 'BOOKING', createdAt: { $gte: todayStart, $lt: tomorrowStart }, status: 'SUCCESS' }).lean().maxTimeMS(2500),
    ]);

    const totalCollected = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const totalsByMethod = payments.reduce((totals, payment) => {
      const method = String(payment.method || '').toUpperCase();
      if (method === 'UPI') totals.upiTotal += Number(payment.amount) || 0;
      else if (method === 'CASH') totals.cashTotal += Number(payment.amount) || 0;
      else if (method === 'CARD') totals.cardTotal += Number(payment.amount) || 0;
      return totals;
    }, { upiTotal: 0, cashTotal: 0, cardTotal: 0 });
    const walkInBookings = bookings.filter((booking) => booking.bookingType === 'WALK_IN' || booking.bookingSource === 'WALK_IN').length;
    const phoneBookings = bookings.filter((booking) => booking.bookingType === 'PHONE' || booking.bookingSource === 'PHONE').length;

    return {
      date: todayStart,
      totalBookings: bookings.length,
      memberBookings: bookings.filter((booking) => booking.bookingType === 'MEMBER').length,
      walkInBookings,
      guestBookings: walkInBookings,
      phoneBookings,
      completedBookings: bookings.filter((booking) => ['COMPLETED', 'CHECKED_IN'].includes(booking.status)).length,
      cancelledBookings: bookings.filter((booking) => booking.status === 'CANCELLED').length,
      noShowBookings: bookings.filter((booking) => booking.status === 'NO_SHOW').length,
      totalCollected,
      ...totalsByMethod,
    };
};

export const getDailyClosingSummary = async (req, res) => {
  try {
    const summary = await buildDailyClosingSummary();
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get closing summary',
      error: error.message,
    });
  }
};

export const submitDailyClosingReport = async (req, res) => {
  try {
    const summary = await buildDailyClosingSummary();
    const report = await Activity.create({
      user: req.user._id,
      action: `Submitted Front Desk shift closing report for ${summary.date.toISOString().slice(0, 10)}`,
      entity: 'SHIFT_CLOSING_REPORT',
      metadata: summary,
    });
    return res.status(201).json({ success: true, message: 'Shift closing report submitted.', data: report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit shift closing report', error: error.message });
  }
};


/**
 * POST /api/staff/front-desk/bookings/:id/collect-payment
 * Collect payment on an unpaid / pending booking at the counter
 */
export const collectBookingPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'UPI', notes = '' } = req.body;

    const booking = await Booking.findById(id).populate('court member');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ success: false, message: 'This booking is already paid.' });
    }

    booking.paymentStatus = 'PAID';
    booking.paymentMethod = paymentMethod;
    if (booking.status === 'PENDING') {
      booking.status = 'CONFIRMED';
    }
    await booking.save();

    const transactionId = `PAY-FD-${Date.now().toString().slice(-6)}`;
    const payment = await Payment.create({
      transactionId,
      user: booking.member ? booking.member._id : null,
      customerName: booking.member
        ? `${booking.member.firstName} ${booking.member.lastName || ''}`.trim()
        : (booking.walkInDetails?.name || 'Walk-in Guest'),
      purpose: 'COURT_BOOKING',
      amount: booking.finalAmount || booking.price || 0,
      paymentMethod,
      status: 'PAID',
      paidAt: new Date(),
      referenceId: booking._id,
      notes: notes || `Counter payment collection for ${booking.court?.name || 'Court'}`,
    });

    const invoiceNumber = `INV-BK-${Date.now().toString().slice(-6)}`;
    await Invoice.create({
      invoiceNumber,
      user: booking.member ? booking.member._id : null,
      customerName: booking.member
        ? `${booking.member.firstName} ${booking.member.lastName || ''}`.trim()
        : (booking.walkInDetails?.name || 'Walk-in Guest'),
      customerPhone: booking.member?.phone || booking.walkInDetails?.phone || '',
      type: 'BOOKING',
      items: [
        {
          description: `${booking.court?.name || 'Court'} Session (${booking.startTime} - ${booking.endTime})`,
          quantity: 1,
          unitPrice: booking.price || booking.finalAmount,
          amount: booking.price || booking.finalAmount,
        },
      ],
      subtotal: booking.price || booking.finalAmount,
      discount: booking.discountApplied || 0,
      totalAmount: booking.finalAmount || booking.price,
      paymentStatus: 'PAID',
      paymentMethod,
      paidDate: new Date(),
    }).catch(() => null);

    return res.status(200).json({
      success: true,
      message: `Payment of ₹${booking.finalAmount} collected successfully via ${paymentMethod}!`,
      data: {
        booking,
        payment,
        invoiceNumber,
      },
    });
  } catch (error) {
    console.error('collectBookingPayment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to collect payment',
      error: error.message,
    });
  }
};

export default {
  getFrontDeskOverview,
  searchMembers,
  createFrontDeskBooking,
  checkInBooking,
  checkOutBooking,
  updateBookingStatus,
  getCourtAvailability,
  rescheduleBooking,
  cancelBooking,
  getMemberHistory,
  getFrontDeskPayments,
  getDailyClosingSummary,
  submitDailyClosingReport,
  collectBookingPayment,
};

