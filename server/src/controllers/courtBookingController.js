import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import Membership from '../models/Membership.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logActivity } from '../services/activityService.js';

const parseBookingDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
};

const isValidStartTime = (value) => {
  if (!/^\d{2}:(00|30)$/.test(value || '')) return false;
  const [hour, minute] = value.split(':').map(Number);
  return hour >= 6 && (hour < 21 || (hour === 21 && minute === 0));
};

/**
 * @desc    Get all courts with sport filters
 * @route   GET /api/courts
 * @access  Public
 */
export const getCourts = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    if (type && type !== 'ALL') query.type = type.toUpperCase();

    const courts = await Court.find(query).sort({ type: 1, name: 1 });
    return sendSuccess(res, {
      message: 'Courts fetched successfully',
      data: courts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available slots for a specific court and date
 * @route   GET /api/courts/:id/slots
 * @access  Public
 */
export const getCourtSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return sendError(res, { statusCode: 400, message: 'Please provide a date query parameter (YYYY-MM-DD)' });
    }

    const parsedDate = parseBookingDate(date);
    if (!parsedDate || parsedDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      return sendError(res, { statusCode: 400, message: 'Choose a valid date today or later' });
    }

    const court = await Court.findById(id);
    if (!court) {
      return sendError(res, { statusCode: 404, message: 'Court not found' });
    }

    const startOfDay = new Date(parsedDate);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all active bookings on this court for the day
    const existingBookings = await Booking.find({
      court: id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
    }).select('startTime endTime bookingType walkInDetails member');

    // Return only one-hour sessions that are still available. Slots start
    // every 30 minutes and the final session ends when the club closes at 22:00.
    const slots = [];
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    for (let minutes = 6 * 60; minutes <= 21 * 60; minutes += 30) {
      const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      const endMinutes = minutes + 60;
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
      const overlaps = existingBookings.some((booking) => booking.startTime < endTime && booking.endTime > time);
      const alreadyStarted = startOfDay.toDateString() === now.toDateString() && minutes <= nowMinutes;
      if (!overlaps && !alreadyStarted) slots.push({ time, available: true });
    }

    return sendSuccess(res, {
      message: 'Court slots generated',
      data: {
        court,
        date,
        slots,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a court booking (Member or Front Desk Walk-in)
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      courtId,
      date,
      startTime,
      bookingType = 'MEMBER',
      walkInDetails,
      paymentMethod = 'UPI',
    } = req.body;

    if (!courtId || !date || !startTime) {
      return sendError(res, { statusCode: 400, message: 'Court, date, and startTime are required' });
    }

    const court = await Court.findById(courtId);
    if (!court || !court.isActive) {
      return sendError(res, { statusCode: 404, message: 'Court is inactive or does not exist' });
    }

    const parsedDate = parseBookingDate(date);
    if (!parsedDate || parsedDate < new Date(new Date().setHours(0, 0, 0, 0)) || !isValidStartTime(startTime)) {
      return sendError(res, { statusCode: 400, message: 'Choose a valid future date and available session time' });
    }
    if (!['MEMBER', 'WALK_IN'].includes(bookingType) || (req.user.role === 'MEMBER' && bookingType !== 'MEMBER')) {
      return sendError(res, { statusCode: 403, message: 'You are not allowed to create this booking type' });
    }
    if (bookingType === 'WALK_IN' && (!walkInDetails?.name?.trim() || !walkInDetails?.phone?.trim())) {
      return sendError(res, { statusCode: 400, message: 'Walk-in name and phone are required' });
    }
    const bookingDate = parsedDate;
    const startOfDay = new Date(parsedDate);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const endMinutes = startHour * 60 + startMinute + 60;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
    const now = new Date();
    if (startOfDay.toDateString() === now.toDateString() && startHour * 60 + startMinute <= now.getHours() * 60 + now.getMinutes()) {
      return sendError(res, { statusCode: 400, message: 'This session time has already passed' });
    }

    // 1. Conflict Prevention: Ensure court slot is NOT already booked
    const conflict = await Booking.findOne({
      court: courtId,
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $in: ['CONFIRMED', 'COMPLETED'] },
    });

    if (conflict) {
      return sendError(res, {
        statusCode: 409,
        message: `Court ${court.name} is already booked at ${startTime} on this date. Please choose another slot.`,
      });
    }

    let targetUserId = bookingType === 'MEMBER' ? req.user._id : null;
    let basePrice = bookingType === 'WALK_IN' ? court.walkInRate : court.hourlyRate;
    let discountApplied = 0;

    // 2. Member Booking Rules
    if (bookingType === 'MEMBER' && targetUserId) {
      // Check max 2 bookings per day per member rule
      const memberDailyCount = await Booking.countDocuments({
        member: targetUserId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
      });

      if (memberDailyCount >= 2) {
        return sendError(res, {
          statusCode: 400,
          message: 'Member has reached the maximum allowance of 2 court bookings per day.',
        });
      }

      // Check active membership discount
      const activeMembership = await Membership.findOne({
        $or: [{ member: targetUserId }, { user: targetUserId }],
        status: 'ACTIVE',
      }).populate('plan');

      if (activeMembership && activeMembership.plan) {
        const plan = activeMembership.plan;
        const discountPct = plan.benefits?.courtDiscount ?? plan.courtDiscount ?? 0;
        if (discountPct > 0) {
          discountApplied = (basePrice * discountPct) / 100;
        }
      }
    }

    const finalAmount = Math.max(0, basePrice - discountApplied);

    const booking = await Booking.create({
      court: courtId,
      member: targetUserId,
      bookingType,
      walkInDetails: bookingType === 'WALK_IN' ? walkInDetails : undefined,
      date: bookingDate,
      startTime,
      endTime,
      durationMinutes: 60,
      price: basePrice,
      discountApplied,
      finalAmount,
      paymentMethod: finalAmount === 0 ? 'MEMBERSHIP_INCLUDED' : paymentMethod,
      paymentStatus: finalAmount === 0 ? 'PAID' : 'PAID',
      status: 'CONFIRMED',
      bookedBy: req.user._id,
    });

    await logActivity({
      userId: req.user._id,
      action: `Booked ${court.name} for ${startTime}`,
      entity: 'Booking',
      entityId: booking._id,
    });

    const populated = await Booking.findById(booking._id)
      .populate('court', 'name type hourlyRate walkInRate')
      .populate('member', 'firstName lastName email phone')
      .populate('bookedBy', 'firstName lastName role');

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Court booked successfully!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookings (Front desk sees all; Member sees own)
 * @route   GET /api/bookings
 * @access  Private
 */
export const getBookings = async (req, res, next) => {
  try {
    const { date, courtId, status } = req.query;
    const query = {};

    // Members only see their own bookings unless Staff/Owner
    const userRole = req.user.role?.toUpperCase();
    if (userRole === 'MEMBER') {
      query.member = req.user._id;
    }

    if (courtId) query.court = courtId;
    if (status && status !== 'ALL') query.status = status;

    if (date) {
      const d = new Date(date);
      query.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const bookings = await Booking.find(query)
      .populate('court', 'name type hourlyRate isIndoor')
      .populate('member', 'firstName lastName email phone')
      .sort({ date: -1, startTime: -1 });

    return sendSuccess(res, {
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel booking
 * @route   PATCH /api/bookings/:id/cancel
 * @access  Private
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return sendError(res, { statusCode: 404, message: 'Booking not found' });
    }

    if (req.user.role?.toUpperCase() === 'MEMBER' && String(booking.member) !== String(req.user._id)) {
      return sendError(res, { statusCode: 403, message: 'You can only cancel your own court bookings' });
    }
    const sessionStart = new Date(booking.date);
    const [sessionHour, sessionMinute] = booking.startTime.split(':').map(Number);
    sessionStart.setHours(sessionHour, sessionMinute, 0, 0);
    if (booking.status !== 'CONFIRMED' || sessionStart <= new Date()) {
      return sendError(res, { statusCode: 400, message: 'Only future confirmed bookings can be cancelled' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    await logActivity({
      userId: req.user._id,
      action: `Cancelled court booking #${booking._id}`,
      entity: 'Booking',
      entityId: booking._id,
    });

    return sendSuccess(res, {
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getCourts,
  getCourtSlots,
  createBooking,
  getBookings,
  cancelBooking,
};
