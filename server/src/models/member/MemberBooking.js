import mongoose from 'mongoose';
import Booking from '../Booking.js';
import Court from '../Court.js';

/**
 * Member Booking Model utilities & schema wrappers
 * Encapsulates member-specific booking queries and validations
 */
export const MemberBooking = Booking;

export const getMemberBookingsQuery = (memberId, statusFilter = 'ALL') => {
  const query = { member: memberId };
  if (statusFilter && statusFilter !== 'ALL') {
    query.status = statusFilter;
  }
  return query;
};

export default MemberBooking;
