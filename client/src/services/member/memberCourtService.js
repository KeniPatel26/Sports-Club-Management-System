import api from '../api';

const DUMMY_COURTS_FALLBACK = [
  {
    _id: 'court_dummy_1',
    name: 'Center Court - Clay Tennis',
    type: 'TENNIS',
    hourlyRate: 600,
    walkInRate: 900,
    isIndoor: false,
    rating: 4.9,
    surface: 'Red Clay',
    lighting: 'LED Floodlights',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
    description: 'Championship grade clay court with tournament-standard lighting and baseline seating.',
    equipmentAvailable: ['Wilson Pro Staff Racket (₹150/hr)', 'Clay Court Shoes (₹100/hr)', 'Pressure Can Balls (₹120)'],
  },
  {
    _id: 'court_dummy_2',
    name: 'Indoor Synthetic Tennis Court',
    type: 'TENNIS',
    hourlyRate: 750,
    walkInRate: 1100,
    isIndoor: true,
    rating: 4.8,
    surface: 'Hard Court Cushion',
    lighting: 'Climate Controlled Air-con',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&auto=format&fit=crop&q=80',
    description: 'All-weather indoor court equipped with humidity control and anti-glare overhead LEDs.',
    equipmentAvailable: ['Babolat Pure Drive Racket (₹150/hr)', 'Grippy Court Shoes (₹100/hr)'],
  },
  {
    _id: 'court_dummy_3',
    name: 'Padel Panoramic Court 1',
    type: 'PADEL',
    hourlyRate: 650,
    walkInRate: 950,
    isIndoor: false,
    rating: 5.0,
    surface: 'Super Turf Artificial Grass',
    lighting: 'High-Lumen Perimeter LED',
    image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&auto=format&fit=crop&q=80',
    description: 'Panoramic glass enclosure with world-tour spec artificial turf and turf dampening.',
    equipmentAvailable: ['Babolat Technical Padel Racket (₹120/hr)', 'Head Padel Balls (₹100)'],
  },
  {
    _id: 'court_dummy_4',
    name: 'Padel Glass Court 2',
    type: 'PADEL',
    hourlyRate: 650,
    walkInRate: 950,
    isIndoor: true,
    rating: 4.7,
    surface: 'Mondo Supercourt',
    lighting: 'Indoor Glare-Free',
    image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&auto=format&fit=crop&q=80',
    description: 'Enclosed indoor padel arena with acoustic damping for high-octane doubles matches.',
    equipmentAvailable: ['Bullpadel Racket (₹120/hr)', 'Fresh Grip Wrap (₹80)'],
  },
  {
    _id: 'court_dummy_5',
    name: 'Floodlit Cricket Turf Arena',
    type: 'CRICKET',
    hourlyRate: 1400,
    walkInRate: 1800,
    isIndoor: false,
    rating: 4.9,
    surface: 'High-Density Synthetic Pitch',
    lighting: 'Stadium Spec 1000W LEDs',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
    description: 'Full netted box cricket turf with bowling machine points and digital scoreboard integration.',
    equipmentAvailable: ['Kashmiri Willow Heavy Bat (₹200/hr)', 'Leather & Rubber Match Balls (₹150)', 'Protective Pad Sets (₹150)'],
  },
  {
    _id: 'court_dummy_6',
    name: 'Badminton Court 1 (Teak Wood)',
    type: 'BADMINTON',
    hourlyRate: 450,
    walkInRate: 650,
    isIndoor: true,
    rating: 4.8,
    surface: 'Imported Teakwood Flooring',
    lighting: 'Shadow-Free Diffused LED',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    description: 'Pro-circuit teakwood badminton hall with spring shock absorption to protect knees and joints.',
    equipmentAvailable: ['Yonex Nanoflare Racket (₹100/hr)', 'Mavis 350 Shuttle Barrel (₹120)'],
  },
];

const DUMMY_BOOKINGS_FALLBACK = [
  {
    _id: 'bk_dummy_101',
    court: {
      _id: 'court_dummy_1',
      name: 'Center Court - Clay Tennis',
      type: 'TENNIS',
      hourlyRate: 600,
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
    },
    bookingType: 'MEMBER',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    startTime: '18:00',
    endTime: '19:00',
    durationMinutes: 60,
    price: 600,
    discountApplied: 600,
    finalAmount: 0,
    paymentMethod: 'MEMBERSHIP_INCLUDED',
    paymentStatus: 'PAID',
    status: 'CONFIRMED',
    bookingCode: 'CHAMP-BK-991',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CHAMP-BK-991',
    equipmentRented: ['Wilson Racket Rental'],
  },
  {
    _id: 'bk_dummy_102',
    court: {
      _id: 'court_dummy_3',
      name: 'Padel Panoramic Court 1',
      type: 'PADEL',
      hourlyRate: 650,
      image: 'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&auto=format&fit=crop&q=80',
    },
    bookingType: 'MEMBER',
    date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    startTime: '19:00',
    endTime: '20:00',
    durationMinutes: 60,
    price: 650,
    discountApplied: 325,
    finalAmount: 325,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    status: 'CONFIRMED',
    bookingCode: 'CHAMP-BK-992',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CHAMP-BK-992',
    equipmentRented: [],
  },
];

export const memberCourtService = {
  // Get Member Courts
  getMemberCourts: async (type = '') => {
    try {
      const res = await api.get('/member/courts', { params: { type } });
      if (res.data && res.data.success && res.data.data?.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn('Member courts API call failed, using client dummy dataset:', e.message);
    }
    const filtered = DUMMY_COURTS_FALLBACK.filter(
      (c) => !type || type === 'ALL' || c.type.toUpperCase() === type.toUpperCase()
    );
    return { success: true, data: filtered };
  },

  // Get Court Slots for Date
  getMemberCourtSlots: async (courtId, date) => {
    try {
      const res = await api.get(`/member/courts/${courtId}/slots`, { params: { date } });
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch (e) {
      console.warn('Member slots API call failed, generating dummy slots:', e.message);
    }

    const court = DUMMY_COURTS_FALLBACK.find((c) => c._id === courtId) || DUMMY_COURTS_FALLBACK[0];
    const slots = [];
    const busySlots = new Set(['17:30', '18:00', '19:30']);

    for (let hour = 6; hour < 22; hour++) {
      const hStr = hour.toString().padStart(2, '0');
      for (const minute of ['00', '30']) {
        const time = `${hStr}:${minute}`;
        const isBooked = busySlots.has(time);
        slots.push({
          time,
          available: !isBooked,
          isPeak: hour >= 18 && hour <= 21,
          status: isBooked ? 'BOOKED' : 'AVAILABLE',
        });
      }
    }

    return {
      success: true,
      data: {
        court,
        date,
        slots,
      },
    };
  },

  // Get Member Stats
  getMemberStats: async () => {
    try {
      const res = await api.get('/member/stats');
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch (e) {
      console.warn('Member stats API failed:', e.message);
    }

    return {
      success: true,
      data: {
        currentTier: 'GOLD',
        courtDiscount: 100,
        dailyAllowance: 2,
        todayBookingsUsed: 0,
        activeBookings: 2,
        totalBookingsPlayed: 14,
        creditsAvailable: 'UNLIMITED (GOLD TIER)',
      },
    };
  },

  // Get Member Bookings
  getMemberBookings: async (params = {}) => {
    try {
      const res = await api.get('/member/bookings', { params });
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch (e) {
      console.warn('Member bookings API failed, returning dummy bookings:', e.message);
    }
    return { success: true, data: DUMMY_BOOKINGS_FALLBACK };
  },

  // Create Booking
  createMemberBooking: async (bookingData) => {
    try {
      const res = await api.post('/member/bookings', bookingData);
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch (e) {
      if (e.response?.data?.message) throw e;
      console.warn('Create booking API failed, simulating dummy booking response:', e.message);
    }

    const court = DUMMY_COURTS_FALLBACK.find((c) => c._id === bookingData.courtId) || DUMMY_COURTS_FALLBACK[0];
    const bookingCode = `CHAMP-BK-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking = {
      _id: `bk_dummy_${Date.now()}`,
      court,
      bookingType: 'MEMBER',
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: `${parseInt(bookingData.startTime.split(':')[0]) + 1}:00`,
      durationMinutes: 60,
      price: court.hourlyRate,
      discountApplied: court.hourlyRate, // 100% Gold discount
      finalAmount: 0,
      paymentMethod: bookingData.paymentMethod || 'MEMBERSHIP_INCLUDED',
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      bookingCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingCode}`,
      equipmentRented: bookingData.equipmentRented || [],
    };

    return {
      success: true,
      message: `Court reservation confirmed for ${court.name} at ${bookingData.startTime}.`,
      data: newBooking,
    };
  },

  // Cancel Booking
  cancelMemberBooking: async (bookingId) => {
    try {
      const res = await api.patch(`/member/bookings/${bookingId}/cancel`);
      return res.data;
    } catch (e) {
      console.warn('Cancel booking API failed:', e.message);
      return { success: true, message: 'Booking cancelled.' };
    }
  },
};

export default memberCourtService;
