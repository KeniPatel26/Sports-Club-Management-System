import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import MemberStatsSummary from '../../components/member/MemberStatsSummary';
import MemberCourtGrid from '../../components/member/MemberCourtGrid';
import MemberSlotSelector from '../../components/member/MemberSlotSelector';
import MemberBookingModal from '../../components/member/MemberBookingModal';
import memberCourtService from '../../services/member/memberCourtService';
import membershipService from '../../services/membershipService';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { courtDiscountForPlan } from '../../utils/membershipDiscounts';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  History,
  QrCode,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const MemberCourtBookingPage = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  // Wizard Step State: 1 = Choose Court, 2 = Pick Timeslot, 3 = Review & Submit, 4 = Success Screen
  const [currentStep, setCurrentStep] = useState(1);

  // Data States
  const [courts, setCourts] = useState([]);
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedCourt, setSelectedCourt] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotsData, setSlotsData] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotTime, setSelectedSlotTime] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Completed Booking Reference
  const [completedBooking, setCompletedBooking] = useState(null);

  // Member Stats & Membership Plan
  const [memberStats, setMemberStats] = useState(null);
  const [userMembership, setUserMembership] = useState(null);

  useEffect(() => {
    const initPageData = async () => {
      try {
        setLoading(true);
        const [courtsRes, statsRes, memRes] = await Promise.allSettled([
          memberCourtService.getMemberCourts(),
          memberCourtService.getMemberStats(),
          membershipService.getMyMembership(),
        ]);

        if (courtsRes.status === 'fulfilled' && courtsRes.value.success) {
          const list = courtsRes.value.data || [];
          setCourts(list);
          if (list.length > 0) {
            setSelectedCourt(list[0]);
          }
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.success) {
          setMemberStats(statsRes.value.data);
        }

        if (memRes.status === 'fulfilled' && memRes.value.success) {
          setUserMembership(memRes.value.data?.membership);
        }
      } catch (e) {
        console.error('Error loading member court booking page:', e);
      } finally {
        setLoading(false);
      }
    };

    initPageData();
  }, []);

  useEffect(() => {
    if (selectedCourt?._id && selectedDate) {
      fetchCourtSlots(selectedCourt._id, selectedDate);
    }
  }, [selectedCourt, selectedDate]);

  const fetchCourtSlots = async (courtId, date) => {
    try {
      setLoadingSlots(true);
      const res = await memberCourtService.getMemberCourtSlots(courtId, date);
      if (res.success) {
        setSlotsData(res.data?.slots || []);
      }
    } catch (e) {
      console.error('Error fetching slots:', e);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleCourtSelectAndProceed = (court) => {
    setSelectedCourt(court);
    setSelectedSlotTime('');
    setCurrentStep(2);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleSlotSelect = (time) => {
    setSelectedSlotTime(time);
  };

  const handleProceedToReview = () => {
    if (!selectedSlotTime) {
      toastError('Please select an available timeslot first.');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleConfirmBooking = async (bookingPayload) => {
    try {
      setSubmitting(true);
      const res = await memberCourtService.createMemberBooking(bookingPayload);
      toastSuccess(res.message || 'Court reservation confirmed!');
      setCompletedBooking(res.data);
      setCurrentStep(4); // Success view
      window.scrollTo({ top: 150, behavior: 'smooth' });
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to complete court reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetWizard = () => {
    setSelectedSlotTime('');
    setCompletedBooking(null);
    setCurrentStep(1);
  };

  const userPlanName = memberStats?.currentTier || userMembership?.plan?.name || 'GOLD';
  const userDiscount = courtDiscountForPlan(userPlanName);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '4rem 0' }}>
          <Loader fullPage text="Loading Champions Club Court Booking System..." />
        </div>
      </DashboardLayout>
    );
  }

  const steps = [
    { num: 1, label: '1. Choose Sports Court' },
    { num: 2, label: '2. Pick Available Timeslot' },
    { num: 3, label: '3. Review & Submit' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Court Booking Hub"
        subtitle="Reserve Tennis, Padel, Cricket, and Badminton courts with zero double-booking."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Member Hub' },
          { label: 'Court Booking' },
        ]}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/member/bookings')}
            >
              <History size={15} /> Booking History
            </Button>
            <Badge variant="gold">
              VIP {userPlanName} Member ({userDiscount}% Court Discount)
            </Badge>
          </div>
        }
      />

      {/* Member Statistics Summary */}
      <MemberStatsSummary stats={memberStats} userPlan={userMembership?.plan} />

      {/* Step Navigation Progress Stepper */}
      {currentStep < 4 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            overflowX: 'auto',
            gap: '1rem',
          }}
        >
          {steps.map((step, idx) => {
            const isCurrent = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <React.Fragment key={step.num}>
                <div
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.num);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: isCompleted ? 'pointer' : 'default',
                    opacity: isCurrent || isCompleted ? 1 : 0.5,
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isCompleted
                        ? 'var(--color-success)'
                        : isCurrent
                        ? 'var(--primary)'
                        : 'var(--border-color)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : step.num}
                  </div>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--color-primary)' : 'var(--text-main)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--border-subtle)',
                      minWidth: '20px',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* STEP 1: CHOOSE SPORTS COURT */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Step 1: Choose Sports Court
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Select a court to check available timeslots
            </span>
          </div>

          <MemberCourtGrid
            courts={courts}
            selectedSport={selectedSport}
            onSelectSport={setSelectedSport}
            selectedCourt={selectedCourt}
            onSelectCourt={(c) => setSelectedCourt(c)}
            userDiscount={userDiscount}
            onContinue={handleCourtSelectAndProceed}
          />
        </div>
      )}

      {/* STEP 2: PICK AVAILABLE TIMESLOT (ONLY AVAILABLE SLOTS, ANY DATE) */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Step 2: Pick Session Timeslot
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Court: <strong>{selectedCourt?.name}</strong>
            </span>
          </div>

          <MemberSlotSelector
            selectedCourt={selectedCourt}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            slots={slotsData}
            loading={loadingSlots}
            selectedSlotTime={selectedSlotTime}
            onSelectSlot={handleSlotSelect}
            onBack={() => setCurrentStep(1)}
            onContinue={handleProceedToReview}
          />
        </div>
      )}

      {/* STEP 3: REVIEW & SUBMIT RESERVATION */}
      {currentStep === 3 && selectedCourt && selectedSlotTime && (
        <MemberBookingModal
          isOpen={true}
          onClose={() => setCurrentStep(2)}
          court={selectedCourt}
          date={selectedDate}
          slotTime={selectedSlotTime}
          userDiscount={userDiscount}
          userPlanName={userPlanName}
          onConfirmBooking={handleConfirmBooking}
          submitting={submitting}
        />
      )}

      {/* STEP 4: BOOKING CONFIRMATION & DIGITAL PASS SCREEN */}
      {currentStep === 4 && completedBooking && (
        <Card style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <Card.Content style={{ padding: '2.5rem 2rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: 'var(--color-primary)' }}>
              Reservation Confirmed!
            </h2>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Your court booking has been registered in the Champions Club timetable.
            </p>

            {/* Summary Ticket Box */}
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Court:</span>
                <span style={{ color: 'var(--color-primary)' }}>{completedBooking.court?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                <span style={{ fontWeight: 600 }}>
                  {completedBooking.date ? completedBooking.date.split('T')[0] : selectedDate} at {completedBooking.startTime}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Digital Pass Code:</span>
                <strong style={{ color: 'var(--primary)', letterSpacing: '0.05em' }}>
                  {completedBooking.bookingCode || 'CHAMP-BK-991'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Final Amount Paid:</span>
                <strong style={{ color: 'var(--color-success-text)' }}>
                  {completedBooking.finalAmount === 0 ? 'Complimentary (₹0)' : `₹${completedBooking.finalAmount}`}
                </strong>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="outline" onClick={handleResetWizard}>
                Book Another Court
              </Button>
              <Button variant="primary" onClick={() => navigate('/member/bookings')}>
                <History size={16} /> View Booking History & Passes
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default MemberCourtBookingPage;
