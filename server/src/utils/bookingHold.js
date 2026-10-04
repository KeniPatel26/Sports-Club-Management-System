export const PENDING_BOOKING_HOLD_MS = 10 * 60 * 1000;

export const pendingBookingCutoff = (now = new Date()) =>
  new Date(now.getTime() - PENDING_BOOKING_HOLD_MS);

export const activeBookingStatusFilter = (now = new Date()) => ({
  $or: [
    { status: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] } },
    { status: 'PENDING', createdAt: { $gte: pendingBookingCutoff(now) } },
  ],
});
