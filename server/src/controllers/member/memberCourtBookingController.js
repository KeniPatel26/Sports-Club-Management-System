import Court from '../../models/Court.js';
import Booking from '../../models/Booking.js';
import Membership from '../../models/Membership.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';
import { logActivity } from '../../services/activityService.js';
import { courtDiscountForPlan } from '../../utils/membershipDiscounts.js';

const generateBookingCode = (id) => `CHAMP-BK-${id.toString().slice(-6).toUpperCase()}`;
const generateQrUrl = (code) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code}`;

const formatBookingResponse = (booking) => {
  const b = booking.toObject ? booking.toObject() : booking;
  const bookingCode = generateBookingCode(b._id);
  return {
    ...b,
    bookingCode,
    qrCodeUrl: generateQrUrl(bookingCode)
  };
};

/**
 * @desc    Get courts list for Member
 * @route   GET /api/member/courts
 * @access  Private/Public
 */
export const getMemberCourts = async (req, res, next) => {
  try {
    const { type } = req.query;
    let query = { isActive: true };
    if (type && type !== 'ALL') {
      query.type = type.toUpperCase();
    }

    const courts = await Court.find(query).sort({ type: 1, name: 1 });

    return sendSuccess(res, {
      message: 'Member courts retrieved successfully',
      data: courts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get court timeslots for member with availability status
 * @route   GET /api/member/courts/:id/slots
 * @access  Private/Public
 */
export const getMemberCourtSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const queryDateStr = date || new Date().toISOString().split('T')[0];
    const court = await Court.findById(id);

    if (!court) {
      return sendError(res, { statusCode: 404, message: 'Court not found' });
    }

    const qDate = new Date(queryDateStr);
    const startOfDay = new Date(qDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(qDate.setHours(23, 59, 59, 999));

    const existingBookings = await Booking.find({
      court: court._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['CONFIRMED', 'COMPLETED'] },
    }).select('startTime endTime bookingType member');

    const bookedTimes = new Set([
      ...existingBookings.map((b) => b.startTime),
    ]);

    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      const hStr = hour.toString().padStart(2, '0');
      const timeSlots = [`${hStr}:00`, `${hStr}:30`];

      for (const time of timeSlots) {
        const isBooked = bookedTimes.has(time);
        const isPeak = hour >= 18 && hour <= 21;
        slots.push({
          time,
          available: !isBooked,
          isPeak,
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
        });
      }
    }

    return sendSuccess(res, {
      message: 'Member court timeslots loaded',
      data: {
        court,
        date: queryDateStr,
        slots,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new court booking for Member
 * @route   POST /api/member/bookings
 * @access  Private (Member)
 */
export const createMemberBooking = async (req, res, next) => {
  try {
    const {
      courtId,
      date,
      startTime,
      equipmentRented = [],
      paymentMethod = 'UPI',
    } = req.body;

    if (!courtId || !date || !startTime) {
      return sendError(res, {
        statusCode: 400,
        message: 'Court ID, booking date, and start time are required.',
      });
    }

    const memberId = req.user?._id;
    const court = await Court.findById(courtId);

    if (!court) {
      return sendError(res, { statusCode: 404, message: 'Court not found' });
    }

    const basePrice = court.hourlyRate || 600;
    let discountApplied = 0;

    const activeMem = await Membership.findOne({
      member: memberId,
      status: 'ACTIVE',
    }).populate('plan');

    if (activeMem && activeMem.plan) {
      const plan = activeMem.plan;
      if (plan.fullCourtAccess) {
        discountApplied = basePrice;
      } else if (plan.courtDiscount > 0) {
        discountApplied = (basePrice * plan.courtDiscount) / 100;
      }
    }

    const equipmentCost = equipmentRented.length * 100;
    const finalAmount = Math.max(0, basePrice - discountApplied) + equipmentCost;

    const [h, m] = startTime.split(':').map(Number);
    const endHour = (h + 1).toString().padStart(2, '0');
    const endTime = `${endHour}:${m === 0 ? '00' : m}`;

    const newBooking = await Booking.create({
      court: court._id,
      member: memberId,
      bookingType: 'MEMBER',
      date: new Date(date),
      startTime,
      endTime,
      durationMinutes: 60,
      price: basePrice,
      discountApplied,
      finalAmount,
      paymentMethod: finalAmount === 0 ? 'MEMBERSHIP_INCLUDED' : paymentMethod,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      bookedBy: memberId,
    });

    const createdBooking = await Booking.findById(newBooking._id)
      .populate('court', 'name type hourlyRate isIndoor image')
      .populate('member', 'firstName lastName email phone');

    if (memberId) {
      await logActivity({
        userId: memberId,
        action: `Member booked ${court.name} at ${startTime}`,
        entity: 'Booking',
        entityId: createdBooking._id,
      });
    }

    return sendSuccess(res, {
      statusCode: 201,
      message: `Court reservation confirmed for ${court.name} at ${startTime}!`,
      data: formatBookingResponse(createdBooking),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get member's court bookings
 * @route   GET /api/member/bookings
 * @access  Private (Member)
 */
export const getMemberBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { member: req.user._id };
    
    if (status && status !== 'ALL') {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('court', 'name type hourlyRate isIndoor image')
      .sort({ date: -1, startTime: -1 });

    const formattedBookings = bookings.map(formatBookingResponse);

    return sendSuccess(res, {
      message: 'Member bookings retrieved',
      data: formattedBookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel member's court booking
 * @route   PATCH /api/member/bookings/:id/cancel
 * @access  Private (Member)
 */
export const cancelMemberBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return sendError(res, { statusCode: 404, message: 'Booking not found' });
    }
    
    if (booking.member.toString() !== req.user._id.toString()) {
      return sendError(res, { statusCode: 403, message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    return sendSuccess(res, {
      message: 'Court booking cancelled successfully.',
      data: formatBookingResponse(booking),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get member court stats summary
 * @route   GET /api/member/stats
 * @access  Private (Member)
 */
export const getMemberCourtStats = async (req, res, next) => {
  try {
    const memberId = req.user?._id;
    let totalBookings = 0;
    let activeBookings = 0;
    let currentTier = 'BASIC';
    let courtDiscount = 0;

    if (memberId) {
      totalBookings = await Booking.countDocuments({ member: memberId });
      activeBookings = await Booking.countDocuments({ member: memberId, status: 'CONFIRMED' });
      const mem = await Membership.findOne({ member: memberId, status: 'ACTIVE' }).populate('plan');
      if (mem?.plan) {
        currentTier = mem.plan.name;
        courtDiscount = courtDiscountForPlan(mem.plan);
      }
    }

    return sendSuccess(res, {
      message: 'Member court statistics loaded',
      data: {
        currentTier,
        courtDiscount,
        dailyAllowance: currentTier === 'GOLD' ? 2 : 1,
        todayBookingsUsed: 0,
        activeBookings,
        totalBookingsPlayed: totalBookings,
        creditsAvailable: currentTier === 'GOLD' ? 'UNLIMITED' : '1',
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMemberCourts,
  getMemberCourtSlots,
  createMemberBooking,
  getMemberBookings,
  cancelMemberBooking,
  getMemberCourtStats,
};
