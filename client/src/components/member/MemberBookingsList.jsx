import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import {
  Calendar,
  Clock,
  QrCode,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  History,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import FilterDropdown from '../ui/FilterDropdown';

export const MemberBookingsList = ({
  bookings = [],
  onCancelBooking,
  refreshing = false,
  showSearch = true,
}) => {
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrModalBooking, setQrModalBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isUpcoming = (booking) => {
    const bookingDay = new Date(booking.date);
    bookingDay.setHours(0, 0, 0, 0);
    return booking.status === 'CONFIRMED' && bookingDay >= todayStart;
  };

  const filteredBookings = bookings.filter((b) => {
    // Tab Filter
    let matchesTab = true;
    if (activeTab === 'UPCOMING') matchesTab = isUpcoming(b);
    else if (activeTab === 'COMPLETED') matchesTab = b.status === 'COMPLETED';
    else if (activeTab === 'CANCELLED') matchesTab = b.status === 'CANCELLED';

    // Search Filter
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const courtName = (b.court?.name || '').toLowerCase();
      const code = (b.bookingCode || b._id || '').toLowerCase();
      matchesSearch = courtName.includes(q) || code.includes(q);
    }

    return matchesTab && matchesSearch;
  });

  const upcomingCount = bookings.filter(isUpcoming).length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  return (
    <Card>
      <Card.Header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Card.Title>Bookings History & Passes</Card.Title>
          </div>
          <Card.Description>Review future scheduled games and past match history.</Card.Description>
        </div>

        <FilterDropdown
          label="Booking status"
          value={activeTab}
          onChange={(event) => setActiveTab(event.target.value)}
          options={[
            { value: 'UPCOMING', label: `Future Reservations (${upcomingCount})` },
            { value: 'COMPLETED', label: `Past History (${completedCount})` },
            { value: 'CANCELLED', label: `Cancelled (${cancelledCount})` },
          ]}
        />
      </Card.Header>

      <Card.Content>
        {/* Search Bar if enabled */}
        {showSearch && (
          <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.45rem 0.85rem',
              }}
            >
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search by court name, sport type, or booking pass code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                >
                  <XCircle size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            <History size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ margin: '0 0 0.35rem 0', fontWeight: 700, color: 'var(--color-primary)' }}>
              No {activeTab.toLowerCase()} reservations recorded
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {activeTab === 'UPCOMING'
                ? 'You have no scheduled future court games. Choose a court and book a slot to get started.'
                : 'No match history recorded for this section.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredBookings.map((booking) => {
              const code = booking.bookingCode || `CHAMP-BK-${booking._id?.substring(0, 6)}`;
              const qrUrl =
                booking.qrCodeUrl ||
                `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${code}`;
              const isFuture = booking.status === 'CONFIRMED';

              return (
                <div
                  key={booking._id}
                  style={{
                    padding: '1.15rem',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'var(--transition)',
                  }}
                >
                  {/* Left: Court & Schedule Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {booking.court?.image && (
                      <img
                        src={booking.court.image}
                        alt={booking.court.name}
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)' }}>
                          {booking.court?.name || 'Sports Court'}
                        </h4>
                        <Badge
                          variant={
                            booking.status === 'CONFIRMED'
                              ? 'active'
                              : booking.status === 'COMPLETED'
                              ? 'info'
                              : 'danger'
                          }
                        >
                          {booking.status === 'CONFIRMED'
                            ? 'Confirmed Upcoming'
                            : booking.status === 'COMPLETED'
                            ? 'Completed Match'
                            : 'Cancelled'}
                        </Badge>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.9rem',
                          margin: '0.4rem 0 0.2rem 0',
                          fontSize: '0.825rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-main)' }}>
                          <Calendar size={14} color="var(--primary)" />
                          {booking.date ? formatDate(booking.date) : 'Scheduled Date'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--primary)' }}>
                          <Clock size={14} />
                          {booking.startTime} - {booking.endTime} (60m)
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        <span>Pass Code: <strong style={{ color: 'var(--color-primary)' }}>{code}</strong></span>
                        <span>&bull;</span>
                        <span>Paid: <strong>₹{booking.finalAmount}</strong> ({booking.paymentMethod})</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isFuture && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQrModalBooking(booking)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <QrCode size={15} /> Entry Pass
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancellingBooking(booking)}
                          style={{ color: 'var(--danger-text)' }}
                        >
                          Cancel Slot
                        </Button>
                      </>
                    )}

                    {!isFuture && (
                      <Badge variant="secondary">
                        {booking.status === 'COMPLETED' ? 'Archived Match' : 'Released Slot'}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card.Content>

      {/* Entry Pass QR Modal */}
      {qrModalBooking && (
        <Modal
          isOpen={!!qrModalBooking}
          onClose={() => setQrModalBooking(null)}
          title="Digital Court Entry Pass"
          subtitle="Scan at reception gate or present to court supervisor"
          footer={
            <Button variant="secondary" onClick={() => setQrModalBooking(null)}>
              Close Pass
            </Button>
          }
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--primary)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <img
                src={
                  qrModalBooking.qrCodeUrl ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrModalBooking.bookingCode || 'PASS'}`
                }
                alt="Entry QR Pass"
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>
            <h3 style={{ marginTop: '1.15rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.06em' }}>
              {qrModalBooking.bookingCode || 'CHAMP-BK-991'}
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {qrModalBooking.court?.name} &bull; {qrModalBooking.startTime}
            </p>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <Modal
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          title="Cancel Reservation?"
          subtitle="Are you sure you want to release this court timeslot?"
          footer={
            <>
              <Button variant="secondary" onClick={() => setCancellingBooking(null)}>
                Keep Reservation
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onCancelBooking(cancellingBooking._id);
                  setCancellingBooking(null);
                }}
              >
                Yes, Release Slot
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '0.5rem' }}>
            <AlertTriangle size={28} color="var(--danger)" />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Cancelling will release <strong>{cancellingBooking.court?.name}</strong> at{' '}
              <strong>{cancellingBooking.startTime}</strong> back to open club timetable.
            </p>
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default MemberBookingsList;
