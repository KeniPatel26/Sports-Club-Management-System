import fs from 'fs';

let content = fs.readFileSync('src/pages/staff/frontdesk/FrontDeskDashboard.jsx', 'utf8');

// 1. Add states after line containing `paymentsList`
const newStates = `
  // Counter Payment & Membership States for Front Desk
  const [showCollectPaymentModal, setShowCollectPaymentModal] = useState(false);
  const [collectPaymentBooking, setCollectPaymentBooking] = useState(null);
  const [collectPaymentMethod, setCollectPaymentMethod] = useState('UPI');
  const [submittingCollectPayment, setSubmittingCollectPayment] = useState(false);

  const [showAssignMembershipModal, setShowAssignMembershipModal] = useState(false);
  const [assignMembershipMember, setAssignMembershipMember] = useState(null);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [assignMembershipPlanId, setAssignMembershipPlanId] = useState('');
  const [assignMembershipDuration, setAssignMembershipDuration] = useState('365');
  const [assignMembershipMethod, setAssignMembershipMethod] = useState('UPI');
  const [submittingAssignMembership, setSubmittingAssignMembership] = useState(false);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState(null);

  const [paymentFilterMethod, setPaymentFilterMethod] = useState('ALL');
  const [paymentFilterPurpose, setPaymentFilterPurpose] = useState('ALL');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
`;

if (!content.includes('showCollectPaymentModal')) {
  content = content.replace(
    /const \[paymentsList, setPaymentsList\] = useState\(\[\]\);/,
    `const [paymentsList, setPaymentsList] = useState([]);\n${newStates}`
  );
}

// 2. Add handler functions after `fetchPayments`
const newHandlers = `
  const fetchMembershipPlans = async () => {
    try {
      const res = await staffService.getMembershipPlans();
      if (res.success && res.data) {
        setMembershipPlans(res.data);
        if (res.data.length > 0 && !assignMembershipPlanId) {
          setAssignMembershipPlanId(res.data[0]._id || res.data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch membership plans:', e);
    }
  };

  const handleCollectPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!collectPaymentBooking) return;
    const bId = collectPaymentBooking.id || collectPaymentBooking._id;
    setSubmittingCollectPayment(true);
    try {
      const res = await staffService.collectBookingPayment(bId, {
        paymentMethod: collectPaymentMethod,
      });
      if (res.success) {
        setAlert({
          type: 'success',
          message: \`Payment of ₹\${collectPaymentBooking.finalAmount ?? collectPaymentBooking.price} collected successfully via \${collectPaymentMethod}!\`,
        });
        setShowCollectPaymentModal(false);
        if (selectedBookingDrawer) {
          setSelectedBookingDrawer((prev) => ({
            ...prev,
            paymentStatus: 'PAID',
            paymentMethod: collectPaymentMethod,
            status: 'CONFIRMED',
          }));
        }
        fetchOverview();
        fetchGrid(gridDate);
        fetchPayments();
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to collect payment.',
      });
    } finally {
      setSubmittingCollectPayment(false);
    }
  };

  const handleAssignMembershipSubmit = async (e) => {
    e.preventDefault();
    if (!assignMembershipMember) return;
    const mId = assignMembershipMember.id || assignMembershipMember._id;
    setSubmittingAssignMembership(true);
    try {
      const res = await staffService.assignOrRenewMembership({
        memberId: mId,
        planId: assignMembershipPlanId || membershipPlans[0]?._id,
        durationDays: Number(assignMembershipDuration),
        paymentMethod: assignMembershipMethod,
      });
      if (res.success) {
        setAlert({
          type: 'success',
          message: \`Membership successfully assigned/renewed for \${assignMembershipMember.name || assignMembershipMember.firstName}! (Payment: \${assignMembershipMethod})\`,
        });
        setShowAssignMembershipModal(false);
        if (selectedDirectoryMember) {
          fetchMemberDirectoryHistory(selectedDirectoryMember.id || selectedDirectoryMember._id);
        }
        fetchOverview();
        fetchPayments();
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to assign membership.',
      });
    } finally {
      setSubmittingAssignMembership(false);
    }
  };
`;

if (!content.includes('handleCollectPaymentSubmit')) {
  content = content.replace(
    /const fetchPayments = async \(\) => \{[\s\S]*?finally \{[\s\S]*?setLoadingPayments\(false\);[\s\S]*?\}[\s\S]*?\};/,
    (match) => `${match}\n${newHandlers}`
  );
}

// 3. Update Payments Tab Rendering
const enhancedPaymentsTab = `      {/* ======================================================== */}
      {/* TAB 5: FRONT DESK PAYMENTS & REVENUE HUB */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Revenue KPI Summary Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div style={{ backgroundColor: '#FFFFFF', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL COLLECTED</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.2rem' }}>
                ₹{paymentsList.reduce((acc, p) => acc + (Number(p.amount) || 0), 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, marginTop: '0.25rem' }}>
                {paymentsList.length} Transactions Verified
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>UPI PAYMENTS</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB', marginTop: '0.2rem' }}>
                ₹{paymentsList.filter(p => (p.paymentMethod || p.method) === 'UPI').reduce((acc, p) => acc + (Number(p.amount) || 0), 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Instant QR & Handle
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CASH COLLECTIONS</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.2rem' }}>
                ₹{paymentsList.filter(p => (p.paymentMethod || p.method) === 'CASH').reduce((acc, p) => acc + (Number(p.amount) || 0), 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Counter Cash Drawer
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '1.15rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CARD & BANK</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem' }}>
                ₹{paymentsList.filter(p => ['CARD', 'NET_BANKING', 'BANK_TRANSFER'].includes(p.paymentMethod || p.method)).reduce((acc, p) => acc + (Number(p.amount) || 0), 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                POS Machine Swipes
              </div>
            </div>
          </div>

          {/* Payments Filter & Search Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Category / Purpose filter */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Payments' },
                { id: 'COURT_BOOKING', label: 'Courts' },
                { id: 'MEMBERSHIP', label: 'Memberships' },
                { id: 'CANTEEN_ORDER', label: 'Canteen & Bar' },
                { id: 'SHOP_ORDER', label: 'Pro Shop' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPaymentFilterPurpose(item.id)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: paymentFilterPurpose === item.id ? 'var(--primary-navy)' : 'var(--bg-main)',
                    color: paymentFilterPurpose === item.id ? '#FFFFFF' : 'var(--text-main)',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Method filter & Search */}
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <select
                value={paymentFilterMethod}
                onChange={(e) => setPaymentFilterMethod(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-main)',
                }}
              >
                <option value="ALL">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
              </select>

              <input
                type="text"
                placeholder="Search payment or customer..."
                value={paymentSearchQuery}
                onChange={(e) => setPaymentSearchQuery(e.target.value)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '0.825rem',
                  width: '210px',
                }}
              />

              <button
                type="button"
                onClick={fetchPayments}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Payments Table Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>TRANSACTION ID</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOMER</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>CATEGORY</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>METHOD</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>DATE & TIME</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>
                      AMOUNT
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsList
                    .filter((p) => {
                      const pur = (p.purpose || p.type || '').toUpperCase();
                      if (paymentFilterPurpose !== 'ALL' && !pur.includes(paymentFilterPurpose.replace('_ORDER', '').replace('_BOOKING', ''))) {
                        return false;
                      }
                      const met = (p.paymentMethod || p.method || '').toUpperCase();
                      if (paymentFilterMethod !== 'ALL' && met !== paymentFilterMethod) {
                        return false;
                      }
                      if (paymentSearchQuery.trim()) {
                        const q = paymentSearchQuery.trim().toLowerCase();
                        const txn = (p.transactionId || p.paymentId || '').toLowerCase();
                        const cName = (p.customerName || '').toLowerCase();
                        const email = (p.user?.email || '').toLowerCase();
                        if (!txn.includes(q) && !cName.includes(q) && !email.includes(q)) return false;
                      }
                      return true;
                    })
                    .map((p) => (
                      <tr key={p._id || p.transactionId} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                          {p.transactionId || p.paymentId || \`PAY-\${p._id.slice(-6)}\`}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {p.customerName || (p.user ? \`\${p.user.firstName || ''} \${p.user.lastName || ''}\`.trim() : 'Walk-in Guest')}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--bg-main)',
                              color: 'var(--primary-navy)',
                            }}
                          >
                            {(p.purpose || p.type || 'BOOKING').replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: (p.paymentMethod || p.method) === 'UPI' ? '#DBEAFE' : (p.paymentMethod || p.method) === 'CASH' ? '#D1FAE5' : 'var(--lavender)',
                              color: (p.paymentMethod || p.method) === 'UPI' ? '#1E40AF' : (p.paymentMethod || p.method) === 'CASH' ? '#065F46' : 'var(--primary-navy)',
                            }}
                          >
                            {p.paymentMethod || p.method || 'UPI'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(p.paidAt || p.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: ['PAID', 'SUCCESS'].includes(p.status) ? 'var(--light-green)' : p.status === 'PENDING' ? 'var(--light-warning)' : 'var(--light-danger)',
                              color: ['PAID', 'SUCCESS'].includes(p.status) ? 'var(--success)' : p.status === 'PENDING' ? 'var(--warning)' : 'var(--danger)',
                            }}
                          >
                            {p.status || 'PAID'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary-navy)' }}>
                          ₹{p.amount}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPaymentReceipt(p);
                              setShowReceiptModal(true);
                            }}
                            style={{
                              padding: '0.3rem 0.65rem',
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--primary-navy)',
                              cursor: 'pointer',
                            }}
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  {paymentsList.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loadingPayments ? 'Loading real-time payments...' : 'No payment records found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  /\{\/\* ======================================================== \*\/\}[\s\S]*?\{\/\* TAB 5: FRONT DESK PAYMENTS \*\/\}[\s\S]*?\{activeTab === 'payments' && \([\s\S]*?\)\s*\}\s*(?=\{\/\* ======================================================== \*\/|\{\/\* TAB|\{showBookingModal)/,
  enhancedPaymentsTab
);

// 4. Add "Assign / Renew Membership" button in member details drawer
content = content.replace(
  /<button\s*type="button"\s*onClick=\{\(\) => \{\s*setBookingCustomerType\('MEMBER'\);[\s\S]*?Book Court for Member\s*<\/button>/,
  (match) => `${match}
                  <button
                    type="button"
                    onClick={() => {
                      fetchMembershipPlans();
                      setAssignMembershipMember(selectedDirectoryMember);
                      setShowAssignMembershipModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1.1rem',
                      backgroundColor: 'var(--primary-navy)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(23, 38, 59, 0.25)',
                    }}
                  >
                    <Award size={16} /> Assign / Renew Membership
                  </button>`
);

// 5. Add "Collect Payment" button in selectedBookingDrawer
content = content.replace(
  /\{selectedBookingDrawer\.status === 'CONFIRMED' && \(\s*<button\s*type="button"\s*onClick=\{\(\) => handleStatusUpdate\(selectedBookingDrawer\.id, 'CHECKED_IN'\)\}/,
  `{selectedBookingDrawer.paymentStatus !== 'PAID' && (
                <button
                  type="button"
                  onClick={() => {
                    setCollectPaymentBooking(selectedBookingDrawer);
                    setCollectPaymentMethod('UPI');
                    setShowCollectPaymentModal(true);
                  }}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--success)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <CreditCard size={17} /> Collect Payment (₹{selectedBookingDrawer.finalAmount ?? 0})
                </button>
              )}
              {selectedBookingDrawer.status === 'CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedBookingDrawer.id, 'CHECKED_IN')}`
);

// 6. Add the 3 Modals before closing </div>
const modalsToAppend = `
      {/* ------------------------------------------------------------- */}
      {/* COLLECT PAYMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showCollectPaymentModal && collectPaymentBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                  Collect Counter Payment
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Booking #{collectPaymentBooking.id?.toString().slice(-6)} • {collectPaymentBooking.courtName}
                </p>
              </div>
              <button
                onClick={() => setShowCollectPaymentModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCollectPaymentSubmit}>
              {/* Amount Display */}
              <div
                style={{
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  textAlign: 'center',
                  marginBottom: '1.25rem',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL DUE AMOUNT</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.2rem' }}>
                  ₹{collectPaymentBooking.finalAmount ?? collectPaymentBooking.price ?? 0}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  SELECT PAYMENT METHOD
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {['UPI', 'CASH', 'CARD'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCollectPaymentMethod(m)}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: collectPaymentMethod === m ? '2px solid var(--primary-navy)' : '1px solid var(--border)',
                        backgroundColor: collectPaymentMethod === m ? '#FFFFFF' : 'var(--bg-main)',
                        color: collectPaymentMethod === m ? 'var(--primary-navy)' : 'var(--text-muted)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {m === 'UPI' && '📱 '}
                      {m === 'CASH' && '💵 '}
                      {m === 'CARD' && '💳 '}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {collectPaymentMethod === 'UPI' && (
                <div style={{ padding: '0.85rem', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '0.8rem', color: '#1E40AF', marginBottom: '1.25rem' }}>
                  <strong>QR / VPA Payment:</strong> Customer can scan counter UPI QR code or pay to <code>championsclub@hdfcbank</code>.
                </div>
              )}

              {collectPaymentMethod === 'CASH' && (
                <div style={{ padding: '0.85rem', backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0', fontSize: '0.8rem', color: '#065F46', marginBottom: '1.25rem' }}>
                  <strong>Cash Tender:</strong> Receive exact cash and provide printed transaction receipt.
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCollectPaymentModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCollectPayment}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'var(--success)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: submittingCollectPayment ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingCollectPayment ? 'Recording Payment…' : 'Confirm Payment & Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ASSIGN / RENEW MEMBERSHIP MODAL FOR FRONT DESK */}
      {/* ------------------------------------------------------------- */}
      {showAssignMembershipModal && assignMembershipMember && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                  Assign / Renew Membership
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Member: <strong>{assignMembershipMember.name || assignMembershipMember.firstName}</strong> ({assignMembershipMember.phone || assignMembershipMember.email})
                </p>
              </div>
              <button
                onClick={() => setShowAssignMembershipModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignMembershipSubmit}>
              {/* Select Plan */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  MEMBERSHIP TIER PLAN
                </label>
                <select
                  value={assignMembershipPlanId}
                  onChange={(e) => setAssignMembershipPlanId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {membershipPlans.map((plan) => (
                    <option key={plan._id || plan.id} value={plan._id || plan.id}>
                      {plan.name} — ₹{plan.price?.toLocaleString('en-IN') || plan.annualFee?.toLocaleString('en-IN')} / year ({plan.courtDiscount || 0}% court discount)
                    </option>
                  ))}
                  {membershipPlans.length === 0 && (
                    <>
                      <option value="gold">Gold Tier Membership (₹15,000/yr)</option>
                      <option value="platinum">Platinum VIP Membership (₹25,000/yr)</option>
                      <option value="silver">Silver Tier Membership (₹8,000/yr)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  MEMBERSHIP DURATION
                </label>
                <select
                  value={assignMembershipDuration}
                  onChange={(e) => setAssignMembershipDuration(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="365">1 Year (365 Days) — Standard Annual Term</option>
                  <option value="180">6 Months (180 Days)</option>
                  <option value="90">3 Months (90 Days)</option>
                  <option value="30">1 Month (30 Days)</option>
                </select>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  COUNTER PAYMENT METHOD
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {['UPI', 'CASH', 'CARD'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAssignMembershipMethod(m)}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: assignMembershipMethod === m ? '2px solid var(--primary-navy)' : '1px solid var(--border)',
                        backgroundColor: assignMembershipMethod === m ? '#FFFFFF' : 'var(--bg-main)',
                        color: assignMembershipMethod === m ? 'var(--primary-navy)' : 'var(--text-muted)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {m === 'UPI' && '📱 '}
                      {m === 'CASH' && '💵 '}
                      {m === 'CARD' && '💳 '}
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignMembershipModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssignMembership}
                  style={{
                    flex: 2,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'var(--primary-navy)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: submittingAssignMembership ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingAssignMembership ? 'Activating…' : 'Activate Membership & Settle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAYMENT RECEIPT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showReceiptModal && selectedPaymentReceipt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                CHAMPIONS CLUB
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Official Transaction Receipt & Tax Invoice
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                <strong style={{ color: 'var(--primary-navy)' }}>
                  {selectedPaymentReceipt.transactionId || selectedPaymentReceipt.paymentId || selectedPaymentReceipt._id}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <strong>{selectedPaymentReceipt.customerName || selectedPaymentReceipt.user?.firstName || 'Member'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                <strong>{(selectedPaymentReceipt.purpose || selectedPaymentReceipt.type || 'BOOKING').replace('_', ' ')}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <strong style={{ color: 'var(--success)' }}>
                  {selectedPaymentReceipt.paymentMethod || selectedPaymentReceipt.method || 'UPI'} • PAID
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                <span>{new Date(selectedPaymentReceipt.paidAt || selectedPaymentReceipt.createdAt).toLocaleString()}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.85rem',
                  borderTop: '1px dashed var(--border)',
                  marginTop: '0.5rem',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--primary-navy)',
                }}
              >
                <span>Total Paid:</span>
                <span>₹{selectedPaymentReceipt.amount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <Printer size={15} /> Print
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--primary-navy)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes('showCollectPaymentModal')) {
  content = content.replace(/\n\s*<\/div>\s*;\s*\}\s*;\s*export default FrontDeskDashboard;/, `\n${modalsToAppend}\n    </div>\n  );\n};\n\nexport default FrontDeskDashboard;`);
}

fs.writeFileSync('src/pages/staff/frontdesk/FrontDeskDashboard.jsx', content, 'utf8');
console.log('Successfully updated FrontDeskDashboard.jsx UI!');
