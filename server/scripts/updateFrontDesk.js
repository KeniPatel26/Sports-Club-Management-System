import fs from 'fs';

let content = fs.readFileSync('src/controllers/staff/frontDeskController.js', 'utf8');

// 1. Fix todayPayments query
content = content.replace(
  /Payment\.find\(\{\s*type:\s*'BOOKING'[^}]*status:\s*'SUCCESS'\s*\}\)/g,
  "Payment.find({ $or: [{ purpose: 'COURT_BOOKING' }, { type: 'BOOKING' }], createdAt: { $gte: todayStart, $lte: todayEnd }, status: { $in: ['PAID', 'SUCCESS'] } })"
);

// 2. Fix Payment.create in createFrontDeskBooking
content = content.replace(
  /const paymentId = `PAY-FD-\$\{Date\.now\(\)\.toString\(\)\.slice\(-6\)\}`;\s*await Payment\.create\(\{[\s\S]*?notes: `Front Desk booking for \$\{court\.name\} \[\$\{startTime\} - \$\{endTime\}\]`,[\s\S]*?\}\);/,
  `const transactionId = \`PAY-FD-\${Date.now().toString().slice(-6)}\`;
    const paymentId = transactionId;
    await Payment.create({
      transactionId,
      user: memberUser ? memberUser._id : null,
      customerName: memberUser ? \`\${memberUser.firstName} \${memberUser.lastName || ''}\`.trim() : (walkInName || 'Walk-in Guest'),
      purpose: 'COURT_BOOKING',
      amount: finalAmount,
      paymentMethod: paymentMethod || 'UPI',
      status: 'PAID',
      paidAt: new Date(),
      referenceId: booking._id,
      notes: \`Front Desk booking for \${court.name} [\${startTime} - \${endTime}]\`,
    }).catch((err) => console.error('Payment creation error:', err));`
);

// 3. Fix Invoice.create in createFrontDeskBooking
content = content.replace(
  /type:\s*'COURT',/,
  "type: 'BOOKING',"
);

// 4. Fix getFrontDeskPayments to query all relevant payments
content = content.replace(
  /export const getFrontDeskPayments = async \(req, res\) => \{[\s\S]*?return res\.status\(200\)\.json\(\{[\s\S]*?data: payments,[\s\S]*?\}\);[\s\S]*?\};/,
  `export const getFrontDeskPayments = async (req, res) => {
  try {
    const { purpose, method, search } = req.query;
    const query = {};

    if (purpose && purpose !== 'ALL') {
      query.$or = [{ purpose: purpose }, { type: purpose }];
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
};`
);

// 5. Add collectBookingPayment if not present
if (!content.includes('collectBookingPayment')) {
  const collectFunc = `
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

    const transactionId = \`PAY-FD-\${Date.now().toString().slice(-6)}\`;
    const payment = await Payment.create({
      transactionId,
      user: booking.member ? booking.member._id : null,
      customerName: booking.member
        ? \`\${booking.member.firstName} \${booking.member.lastName || ''}\`.trim()
        : (booking.walkInDetails?.name || 'Walk-in Guest'),
      purpose: 'COURT_BOOKING',
      amount: booking.finalAmount || booking.price || 0,
      paymentMethod,
      status: 'PAID',
      paidAt: new Date(),
      referenceId: booking._id,
      notes: notes || \`Counter payment collection for \${booking.court?.name || 'Court'}\`,
    });

    const invoiceNumber = \`INV-BK-\${Date.now().toString().slice(-6)}\`;
    await Invoice.create({
      invoiceNumber,
      user: booking.member ? booking.member._id : null,
      customerName: booking.member
        ? \`\${booking.member.firstName} \${booking.member.lastName || ''}\`.trim()
        : (booking.walkInDetails?.name || 'Walk-in Guest'),
      customerPhone: booking.member?.phone || booking.walkInDetails?.phone || '',
      type: 'BOOKING',
      items: [
        {
          description: \`\${booking.court?.name || 'Court'} Session (\${booking.startTime} - \${booking.endTime})\`,
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
      message: \`Payment of ₹\${booking.finalAmount} collected successfully via \${paymentMethod}!\`,
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
`;

  content = content.replace('export default {', collectFunc + '\nexport default {');
  content = content.replace('submitDailyClosingReport,', 'submitDailyClosingReport,\n  collectBookingPayment,');
}

fs.writeFileSync('src/controllers/staff/frontDeskController.js', content, 'utf8');
console.log('Successfully updated frontDeskController.js!');
