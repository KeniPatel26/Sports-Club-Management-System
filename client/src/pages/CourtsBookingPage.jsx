import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Users,
  Shield,
  Search,
  Filter,
  Flame,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import courtBookingService from '../services/courtBookingService';
import membershipService from '../services/membershipService';
import { formatDate } from '../utils/formatDate';

export const CourtsBookingPage = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [courts, setCourts] = useState([]);
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [slotsData, setSlotsData] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [bookingType, setBookingType] = useState('MEMBER');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);

  // User Membership status
  const [userMembership, setUserMembership] = useState(null);

  // My recent bookings
  const [myBookings, setMyBookings] = useState([]);

  const isFrontDeskOrOwner = ['OWNER', 'ADMIN', 'FRONT_DESK'].includes(user?.role?.toUpperCase());

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [courtsRes, memRes, bookRes] = await Promise.allSettled([
          courtBookingService.getCourts(),
          membershipService.getMyMembership(),
          courtBookingService.getBookings(),
        ]);

        if (courtsRes.status === 'fulfilled' && courtsRes.value.success) {
          const courtsList = courtsRes.value.data || [];
          setCourts(courtsList);
          if (courtsList.length > 0) {
            setSelectedCourt(courtsList[0]);
          }
        }

        if (memRes.status === 'fulfilled' && memRes.value.success) {
          setUserMembership(memRes.value.data?.membership);
        }

        if (bookRes.status === 'fulfilled' && bookRes.value.success) {
          setMyBookings(bookRes.value.data || []);
        }
      } catch (e) {
        console.error('Error loading courts data:', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (selectedCourt?._id && selectedDate) {
      fetchCourtSlots(selectedCourt._id, selectedDate);
    }
  }, [selectedCourt, selectedDate]);

  const fetchCourtSlots = async (courtId, date) => {
    try {
      setLoadingSlots(true);
      const res = await courtBookingService.getCourtSlots(courtId, date);
      if (res.success) {
        setSlotsData(res.data?.slots || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleOpenBooking = (time) => {
    setSelectedSlotTime(time);
    setBookingType(isFrontDeskOrOwner ? 'WALK_IN' : 'MEMBER');
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedCourt || !selectedSlotTime || !selectedDate) return;

    if (bookingType === 'WALK_IN' && (!walkInName.trim() || !walkInPhone.trim())) {
      toastError('Please enter walk-in customer name and contact phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        courtId: selectedCourt._id,
        date: selectedDate,
        startTime: selectedSlotTime,
        bookingType,
        walkInDetails: bookingType === 'WALK_IN' ? { name: walkInName, phone: walkInPhone } : undefined,
        paymentMethod,
      };

      await courtBookingService.createBooking(payload);
      toastSuccess(`Slot ${selectedSlotTime} reserved on ${selectedCourt.name}!`);
      setBookingModalOpen(false);
      setWalkInName('');
      setWalkInPhone('');
      fetchCourtSlots(selectedCourt._id, selectedDate);

      // Refresh bookings
      const bookRes = await courtBookingService.getBookings();
      if (bookRes.success) setMyBookings(bookRes.data || []);
    } catch (err) {
      toastError(err.response?.data?.message || 'Court booking failed. Check daily limit or availability.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourts = courts.filter(
    (c) => selectedSport === 'ALL' || c.type === selectedSport
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Court Availability & Bookings"
        subtitle="Reserve Tennis, Cricket, Padel, and Badminton courts. Slots open every 30 minutes with zero double-booking."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Courts & Bookings' }]}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {userMembership?.plan && (
              <Badge variant="primary" dot>
                {userMembership.plan.name} Tier Active ({userMembership.plan.courtDiscount}% Court Discount)
              </Badge>
            )}
          </div>
        }
      />

      {/* Sport Selector Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {['ALL', 'TENNIS', 'CRICKET', 'PADEL', 'BADMINTON'].map((sport) => (
          <button
            key={sport}
            type="button"
            onClick={() => setSelectedSport(sport)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: selectedSport === sport ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              background: selectedSport === sport ? 'var(--primary)' : 'var(--bg-card)',
              color: selectedSport === sport ? '#ffffff' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            {sport === 'ALL' ? 'All Courts' : sport === 'TENNIS' ? 'Tennis' : sport === 'CRICKET' ? 'Cricket Arena' : sport === 'PADEL' ? 'Padel' : 'Badminton'}
          </button>
        ))}
      </div>

      <div className="grid-cols-3" style={{ alignItems: 'start' }}>
        {/* Left: Court Selection List (1 col) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ margin: 0, fontWeight: 700 }}>Select Sport Court</h4>

          {filteredCourts.map((court) => {
            const isSelected = selectedCourt?._id === court._id;
            return (
              <div
                key={court._id}
                onClick={() => setSelectedCourt(court)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  gap: '0.85rem',
                }}
              >
                {court.image && (
                  <img
                    src={court.image}
                    alt={court.name}
                    style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h5 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{court.name}</h5>
                    <Badge variant={court.isIndoor ? 'purple' : 'info'}>
                      {court.isIndoor ? 'Indoor' : 'Outdoor'}
                    </Badge>
                  </div>

                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Member: <strong>₹{court.hourlyRate}/hr</strong> &bull; Walk-in: <strong>₹{court.walkInRate}/hr</strong>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Date Picker & Slot Grid (2 cols) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card>
            <Card.Header>
              <div>
                <Card.Title>{selectedCourt?.name || 'Court Timeslots'}</Card.Title>
                <Card.Description>1-hour sessions starting every 30 minutes</Card.Description>
              </div>

              {/* Date Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--primary)" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </Card.Header>

            <Card.Content>
              {loadingSlots ? (
                <div style={{ padding: '3rem 0' }}>
                  <Loader text="Checking court timetable availability..." />
                </div>
              ) : (
                <div>
                  {/* Legend */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--court-available-bg)', border: '1px solid var(--court-available)' }} />
                      <span style={{ color: 'var(--color-text-secondary)' }}>Available</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--court-booked-bg)', border: '1px solid var(--court-booked)' }} />
                      <span style={{ color: 'var(--color-text-secondary)' }}>Booked</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--court-selected)' }} />
                      <span style={{ color: 'var(--color-text-secondary)' }}>Selected</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {slotsData.map((slot) => {
                      const isAvail = slot.available;
                      return (
                        <div
                          key={slot.time}
                          style={{
                            padding: '0.85rem 0.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: isAvail ? '1px solid rgba(168, 192, 172, 0.4)' : '1px solid rgba(217, 154, 117, 0.4)',
                            background: isAvail ? 'var(--court-available-bg)' : 'var(--court-booked-bg)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.4rem',
                          }}
                        >
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isAvail ? 'var(--court-available-text)' : 'var(--court-booked-text)' }}>
                            {slot.time}
                          </span>

                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isAvail ? 'var(--court-available-text)' : 'var(--court-booked-text)' }}>
                            {isAvail ? 'Available' : 'Booked'}
                          </span>

                          {isAvail ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenBooking(slot.time)}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: '100%', borderRadius: 'var(--radius-md)' }}
                            >
                              Book Slot
                            </Button>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--court-booked-text)', opacity: 0.85 }}>
                              {slot.booking?.bookingType === 'WALK_IN' ? 'Walk-in' : 'Member'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Bookings Overview Table */}
          <Card>
            <Card.Header>
              <Card.Title>Today's Active Reservations</Card.Title>
            </Card.Header>
            <Card.Content>
              {myBookings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  No active court bookings for today.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {myBookings.slice(0, 5).map((b) => (
                    <div
                      key={b._id}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700 }}>{b.court?.name}</span> &bull;{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          {b.startTime} - {b.endTime}
                        </span>
                        <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {b.member ? `Member: ${b.member.firstName} ${b.member.lastName}` : `Walk-in: ${b.walkInDetails?.name}`} &bull; Paid: ₹{b.finalAmount} ({b.paymentMethod})
                        </p>
                      </div>

                      <Badge variant={b.status === 'CONFIRMED' ? 'success' : 'secondary'}>
                        {b.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title={`Book Court: ${selectedCourt?.name}`}
        subtitle={`Session: ${selectedDate} at ${selectedSlotTime} (1 Hour)`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmBooking} loading={submitting}>
              Confirm Booking
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmBooking}>
          {isFrontDeskOrOwner && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Booking Category</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <Button
                  variant={bookingType === 'WALK_IN' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setBookingType('WALK_IN')}
                >
                  Walk-in Guest
                </Button>
                <Button
                  variant={bookingType === 'MEMBER' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setBookingType('MEMBER')}
                >
                  Club Member
                </Button>
                <Button
                  variant={bookingType === 'SOCIAL_PLAY' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setBookingType('SOCIAL_PLAY')}
                >
                  Social Play (Friday Night)
                </Button>
              </div>
            </div>
          )}

          {bookingType === 'WALK_IN' && (
            <div className="grid-cols-2">
              <Input
                label="Walk-in Guest Name"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                placeholder="e.g. Sameer Desai"
                required
              />
              <Input
                label="Phone Number"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                placeholder="e.g. 9898000000"
                required
              />
            </div>
          )}

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              border: '1px solid rgba(79,70,229,0.2)',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <span>Standard Hourly Rate:</span>
              <strong>₹{bookingType === 'WALK_IN' ? selectedCourt?.walkInRate : selectedCourt?.hourlyRate}</strong>
            </div>

            {bookingType === 'MEMBER' && userMembership?.plan && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success-text)', marginBottom: '0.35rem' }}>
                <span>{userMembership.plan.name} Member Discount:</span>
                <strong>
                  -{userMembership.plan.benefits?.courtDiscount ?? userMembership.plan.courtDiscount ?? 0}%
                </strong>
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(79,70,229,0.2)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem' }}>
              <span>Total Payable:</span>
              <span className="text-gradient">
                ₹{bookingType === 'WALK_IN'
                  ? selectedCourt?.walkInRate
                  : Math.max(
                      0,
                      (selectedCourt?.hourlyRate || 500) *
                        (1 - ((userMembership?.plan?.benefits?.courtDiscount ?? userMembership?.plan?.courtDiscount) || 0) / 100)
                    )}
              </span>
            </div>
          </div>

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            options={[
              { value: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)' },
              { value: 'CARD', label: 'Credit / Debit Card' },
              { value: 'CASH', label: 'Cash at Counter' },
            ]}
            placeholder=""
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default CourtsBookingPage;
