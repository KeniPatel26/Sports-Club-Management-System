import Court from '../../models/Court.js';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import Payment from '../../models/Payment.js';
import Invoice from '../../models/Invoice.js';

/**
 * GET /api/manager/courts
 * List all sports courts and turf facilities
 */
export const getCourts = async (req, res) => {
  try {
    const courts = await Court.find().sort({ type: 1, name: 1 });
    return res.status(200).json({
      success: true,
      data: courts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch courts',
      error: error.message,
    });
  }
};

/**
 * POST /api/manager/courts
 * Add a new sports court facility
 */
export const createCourt = async (req, res) => {
  try {
    const { name, type, hourlyRate, walkInRate, isIndoor, image } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Court name and sport type are required',
      });
    }

    const court = await Court.create({
      name: name.trim(),
      type: type.toUpperCase(),
      hourlyRate: Number(hourlyRate) || 500,
      walkInRate: Number(walkInRate) || 800,
      isIndoor: Boolean(isIndoor),
      isActive: true,
      image: image || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Court facility created successfully',
      data: court,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create court',
      error: error.message,
    });
  }
};

/**
 * PUT /api/manager/courts/:id
 * Update court rates and parameters
 */
export const updateCourt = async (req, res) => {
  try {
    const { id } = req.params;
    const court = await Court.findByIdAndUpdate(id, req.body, { new: true });

    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Court updated successfully',
      data: court,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update court',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/manager/courts/:id/maintenance
 * Toggle maintenance mode for a court
 */
export const toggleCourtMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    court.isActive = !court.isActive;
    await court.save();

    return res.status(200).json({
      success: true,
      message: court.isActive
        ? `${court.name} is now ACTIVE and available for booking`
        : `${court.name} is placed under MAINTENANCE`,
      data: court,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle court maintenance',
      error: error.message,
    });
  }
};

/**
 * GET /api/manager/courts/bookings
 * List club reservations with filters
 */
export const getBookings = async (req, res) => {
  try {
    const { courtId, date, status, search } = req.query;

    const query = {};

    if (courtId && courtId !== 'ALL') {
      query.court = courtId;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      query.date = { $gte: d, $lt: nextD };
    }

    const bookings = await Booking.find(query)
      .populate('court')
      .populate('member', 'firstName lastName email phone')
      .sort({ date: -1, startTime: 1 });

    const formatted = bookings.map((b) => ({
      id: b._id,
      _id: b._id,
      courtName: b.court?.name || 'Tennis Court 1',
      courtType: b.court?.type || 'TENNIS',
      memberName: b.member
        ? `${b.member.firstName} ${b.member.lastName || ''}`.trim()
        : b.walkInDetails?.name || 'Walk-in Guest',
      phone: b.member?.phone || b.walkInDetails?.phone || '',
      email: b.member?.email || '',
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      durationMinutes: b.durationMinutes,
      bookingType: b.bookingType,
      price: b.price,
      finalAmount: b.finalAmount,
      paymentMethod: b.paymentMethod,
      paymentStatus: b.paymentStatus,
      status: b.status,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('getBookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/manager/courts/bookings/:id/cancel
 * Cancel a court booking
 */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('court');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = 'CANCELLED';
    if (booking.paymentStatus === 'PAID') {
      booking.paymentStatus = 'REFUNDED';
    }
    await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking for ${booking.court?.name || 'Court'} has been cancelled`,
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

export default {
  getCourts,
  createCourt,
  updateCourt,
  toggleCourtMaintenance,
  getBookings,
  cancelBooking,
};
