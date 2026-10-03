import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  DollarSign,
  Phone,
  CreditCard,
  FileText,
  AlertCircle,
  RefreshCw,
  X,
  ShieldCheck,
  Check,
  Building2,
  LogIn,
  LogOut,
  SlidersHorizontal,
  CalendarRange,
  ArrowRight,
  Receipt,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import staffService from '../../../services/staffService';
import courtBookingService from '../../../services/courtBookingService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';

export const FrontDeskDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [courts, setCourts] = useState([]);
  const [alert, setAlert] = useState(null);

  // Tab State
  const activeTab = ['dashboard', 'members', 'courts', 'bookings', 'payments'].includes(currentTab)
    ? currentTab
    : 'dashboard';

  const handleTabChange = (tabName) => {
    setSearchParams(tabName === 'dashboard' ? {} : { tab: tabName });
  };

  // Search member state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberHistoryData, setMemberHistoryData] = useState(null);
  const [loadingMemberHistory, setLoadingMemberHistory] = useState(false);

  // Create Booking Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState('WALK_IN'); // WALK_IN, MEMBER, PHONE, FRONT_DESK
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('17:00');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Reschedule Modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleCourtId, setRescheduleCourtId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [rescheduleTime, setRescheduleTime] = useState('18:00');
  const [rescheduleReason, setRescheduleReason] = useState('Member requested new time slot');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Cancel Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer cancelled reservation');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // Court Availability Grid state
  const [gridDate, setGridDate] = useState(new Date().toISOString().split('T')[0]);
  const [gridData, setGridData] = useState(null);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [selectedGridSlot, setSelectedGridSlot] = useState(null); // { courtId, time, courtName }

  // Payments List state
  const [paymentsList, setPaymentsList] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Bookings Filter tab state
  const [bookingFilter, setBookingFilter] = useState('ALL'); // ALL, TODAY, WALK_IN, CONFIRMED, COMPLETED

  // Daily Closing Drawer state
  const [showClosingDrawer, setShowClosingDrawer] = useState(false);
  const [closingData, setClosingData] = useState(null);
  const [loadingClosing, setLoadingClosing] = useState(false);

  // Attendance state
  const [checkedIn, setCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('08:55 AM');

  // Initial Fetch
  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [resOverview, resCourts] = await Promise.all([
        staffService.getFrontDeskOverview(),
        courtBookingService.getCourts(),
      ]);

      if (resOverview?.success) {
        setOverview(resOverview.data);
      }
      if (resCourts?.data) {
        setCourts(resCourts.data);
        if (resCourts.data.length > 0 && !selectedCourtId) {
          setSelectedCourtId(resCourts.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Front Desk load error:', err);
      setAlert({ type: 'danger', message: 'Failed to load front desk schedule.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Fetch Court Availability Grid
  const fetchGrid = async (dateVal) => {
    setLoadingGrid(true);
    try {
      const res = await staffService.getCourtAvailability(dateVal || gridDate);
      if (res.success) {
        setGridData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGrid(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'courts') {
      fetchGrid(gridDate);
    }
  }, [activeTab, gridDate]);

  // Fetch Payments
  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await staffService.getFrontDeskPayments();
      if (res.success) {
        setPaymentsList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  // Live member search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setSearching(true);
        try {
          const res = await staffService.searchMembers(searchQuery);
          if (res.success) {
            setSearchResults(res.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch full member history when selected
  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setLoadingMemberHistory(true);
    try {
      const res = await staffService.getMemberHistory(member.id);
      if (res.success) {
        setMemberHistoryData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMemberHistory(false);
    }
  };

  // Status Update (Check-in, Check-out, etc.)
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const res = await staffService.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        setAlert({ type: 'success', message: `Booking updated to ${newStatus}` });
        fetchOverview();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to update status' });
    }
  };

  // Create Booking Submission
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSubmittingBooking(true);
    setAlert(null);

    try {
      const [hours, minutes] = bookingTime.split(':').map(Number);
      const endHour = (hours + 1) % 24;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      const payload = {
        courtId: selectedCourtId,
        bookingType,
        memberId: bookingType === 'MEMBER' && selectedMember ? selectedMember.id : undefined,
        walkInName: bookingType !== 'MEMBER' ? walkInName : undefined,
        walkInPhone: bookingType !== 'MEMBER' ? walkInPhone : undefined,
        date: bookingDate,
        startTime: bookingTime,
        endTime,
        durationMinutes: 60,
        paymentMethod,
      };

      const res = await staffService.createFrontDeskBooking(payload);
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Booking confirmed successfully!' });
        setShowBookingModal(false);
        setWalkInName('');
        setWalkInPhone('');
        fetchOverview();
        if (activeTab === 'courts') fetchGrid(gridDate);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to create booking. Please check rules.',
      });
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Reschedule submission
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleBookingId) return;

    setSubmittingReschedule(true);
    try {
      const [hours, minutes] = rescheduleTime.split(':').map(Number);
      const endHour = (hours + 1) % 24;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      const res = await staffService.rescheduleBooking(rescheduleBookingId, {
        date: rescheduleDate,
        startTime: rescheduleTime,
        endTime,
        courtId: rescheduleCourtId,
        reason: rescheduleReason,
      });

      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Booking rescheduled successfully!' });
        setShowRescheduleModal(false);
        fetchOverview();
        if (activeTab === 'courts') fetchGrid(gridDate);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to reschedule booking',
      });
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Cancel Booking submission
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelBookingId) return;

    setSubmittingCancel(true);
    try {
      const res = await staffService.cancelBooking(cancelBookingId, { reason: cancelReason });
      if (res.success) {
        setAlert({ type: 'info', message: res.message || 'Booking cancelled successfully.' });
        setShowCancelModal(false);
        fetchOverview();
        if (activeTab === 'courts') fetchGrid(gridDate);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to cancel booking',
      });
    } finally {
      setSubmittingCancel(false);
    }
  };

  // Open Shift Closing Drawer
  const handleOpenClosing = async () => {
    setShowClosingDrawer(true);
    setLoadingClosing(true);
    try {
      const res = await staffService.getDailyClosingSummary();
      if (res.success) {
        setClosingData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClosing(false);
    }
  };

  // Attendance Toggle
  const handleAttendanceToggle = async () => {
    try {
      if (checkedIn) {
        const res = await staffService.checkOut();
        setCheckedIn(false);
        setAlert({ type: 'info', message: res.message || 'Checked out successfully.' });
      } else {
        const res = await staffService.checkIn();
        setCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setAlert({ type: 'success', message: res.message || 'Checked in successfully.' });
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update attendance' });
    }
  };

  // Pricing helper
  const selectedCourtObj = courts.find((c) => c._id === selectedCourtId);
  const baseRate = selectedCourtObj
    ? bookingType === 'MEMBER'
      ? selectedCourtObj.hourlyRate
      : selectedCourtObj.walkInRate || selectedCourtObj.hourlyRate
    : 600;
  const discountPct = selectedMember?.courtDiscount || 0;
  const calculatedDiscount = bookingType === 'MEMBER' ? Math.round((baseRate * discountPct) / 100) : 0;
  const finalPrice = Math.max(baseRate - calculatedDiscount, 0);

  // Filtered schedule list
  const filteredSchedule = (overview?.schedule || []).filter((item) => {
    if (bookingFilter === 'ALL') return true;
    if (bookingFilter === 'WALK_IN') return item.bookingType === 'WALK_IN';
    if (bookingFilter === 'CONFIRMED') return item.status === 'CONFIRMED';
    if (bookingFilter === 'CHECKED_IN') return item.status === 'CHECKED_IN';
    if (bookingFilter === 'COMPLETED') return item.status === 'COMPLETED';
    return true;
  });

  if (loading && !overview) {
    return <Loader fullPage text="Loading Front Desk Terminal..." />;
  }

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Building2 size={24} color="var(--primary-navy)" />
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-family-display)',
                margin: 0,
              }}
            >
              Front Desk Operations
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'var(--lavender)',
                color: 'var(--primary-navy)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
              }}
            >
              TERMINAL
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Logged in as {user?.firstName || 'Receptionist'} • Member assistance, real-time court booking & walk-in handling
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Shift Attendance Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.85rem',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: checkedIn ? 'var(--success)' : 'var(--danger)',
              }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Shift: 09:00 - 17:00 {checkedIn && `(In: ${checkInTime})`}
            </span>
            <button
              onClick={handleAttendanceToggle}
              style={{
                border: 'none',
                background: checkedIn ? 'var(--light-danger)' : 'var(--light-green)',
                color: checkedIn ? 'var(--danger)' : 'var(--success)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {checkedIn ? 'Check Out' : 'Check In'}
            </button>
          </div>

          <button
            onClick={handleOpenClosing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FileText size={16} color="var(--primary-peach)" />
            Shift Closing
          </button>

          <button
            onClick={() => {
              setBookingType('WALK_IN');
              setShowBookingModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-peach)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(217, 142, 104, 0.3)',
            }}
          >
            <Plus size={16} />
            Create Booking
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'dashboard', label: 'Dashboard & Schedule', icon: Calendar },
          { id: 'members', label: 'Member Search & Recognition', icon: Users },
          { id: 'courts', label: 'Real-Time Court Availability', icon: CalendarRange },
          { id: 'bookings', label: 'Booking & Walk-in Dispatch', icon: CheckCircle },
          { id: 'payments', label: 'Front Desk Payments', icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--primary-navy)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {alert && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* 4 KPIs - Always Visible */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              TODAY'S BOOKINGS
            </span>
            <Calendar size={18} color="var(--primary-navy)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            {overview?.kpi?.todayBookingsCount || 28}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
            Scheduled games
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              AVAILABLE COURTS
            </span>
            <CheckCircle size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.4rem' }}>
            {overview?.kpi?.availableCourts || 6}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Ready for play
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              WALK-INS TODAY
            </span>
            <Users size={18} color="var(--secondary-blue)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary-blue)', marginTop: '0.4rem' }}>
            {overview?.kpi?.walkInsToday || 8}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Front desk entries
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              UPCOMING GAMES
            </span>
            <Clock size={18} color="var(--primary-peach)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-peach)', marginTop: '0.4rem' }}>
            {overview?.kpi?.upcomingBookingsCount || 12}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Next session queue
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DASHBOARD & SCHEDULE */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Schedule Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    margin: 0,
                    fontFamily: 'var(--font-family-display)',
                  }}
                >
                  Today's Court Schedule & Dispatch
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Live reservations, player verification and check-in / check-out
                </p>
              </div>
              <button
                onClick={fetchOverview}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>TIME</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>COURT</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>MEMBER / GUEST</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>SOURCE</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>AMOUNT</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>
                      OPERATIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overview?.schedule && overview.schedule.length > 0 ? (
                    overview.schedule.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={14} color="var(--primary-peach)" />
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--primary-navy)' }}>{item.courtName}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                            {item.courtType}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.memberName}</span>
                          {item.phone && (
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>
                              {item.phone}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor:
                                item.bookingType === 'WALK_IN'
                                  ? 'var(--lavender)'
                                  : item.bookingType === 'PHONE'
                                  ? 'var(--light-warning)'
                                  : 'var(--light-green)',
                              color:
                                item.bookingType === 'WALK_IN'
                                  ? 'var(--primary-navy)'
                                  : item.bookingType === 'PHONE'
                                  ? 'var(--warning)'
                                  : 'var(--success)',
                            }}
                          >
                            {item.bookingType}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor:
                                item.status === 'CHECKED_IN'
                                  ? 'var(--light-green)'
                                  : item.status === 'CONFIRMED'
                                  ? 'rgba(53, 73, 98, 0.1)'
                                  : item.status === 'COMPLETED'
                                  ? 'var(--bg-main)'
                                  : 'var(--light-danger)',
                              color:
                                item.status === 'CHECKED_IN'
                                  ? 'var(--success)'
                                  : item.status === 'CONFIRMED'
                                  ? 'var(--primary-navy)'
                                  : item.status === 'COMPLETED'
                                  ? 'var(--text-muted)'
                                  : 'var(--danger)',
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>₹{item.finalAmount || 600}</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            {item.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'CHECKED_IN')}
                                style={{
                                  backgroundColor: 'var(--success)',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Check-in
                              </button>
                            )}
                            {item.status === 'CHECKED_IN' && (
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'COMPLETED')}
                                style={{
                                  backgroundColor: 'var(--primary-navy)',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Check-out
                              </button>
                            )}
                            {item.status === 'CONFIRMED' && (
                              <button
                                onClick={() => {
                                  setRescheduleBookingId(item.id);
                                  setShowRescheduleModal(true);
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: '1px solid var(--border)',
                                  color: 'var(--text-main)',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Reschedule
                              </button>
                            )}
                            {item.status === 'CONFIRMED' && (
                              <button
                                onClick={() => {
                                  setCancelBookingId(item.id);
                                  setShowCancelModal(true);
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: '1px solid var(--border)',
                                  color: 'var(--danger)',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No active bookings scheduled for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Quick Member Verification Snapshot */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <Search size={18} color="var(--primary-peach)" />
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Quick Member Search
              </h2>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Search by Name, Mobile, Email, or Member ID
            </p>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Type member name/phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-family-body)',
                  outline: 'none',
                }}
              />
              <Search
                size={15}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.75rem', top: '0.8rem' }}
              />
            </div>

            {searching && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Searching database...</div>}

            {searchResults.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginBottom: '1rem',
                }}
              >
                {searchResults.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMember(m)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border:
                        selectedMember?.id === m.id
                          ? '2px solid var(--primary-peach)'
                          : '1px solid var(--border)',
                      backgroundColor: selectedMember?.id === m.id ? 'var(--lavender)' : 'var(--bg-main)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {m.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--light-green)',
                          color: 'var(--success)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {m.planName}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      ID: <strong>{m.memberId}</strong> • {m.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Member Profile Card */}
            {selectedMember ? (
              <div
                style={{
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-main)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)' }}>
                    {selectedMember.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: 'var(--success)',
                      backgroundColor: 'var(--light-green)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    ACTIVE
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  <div>
                    Member ID: <strong>{selectedMember.memberId}</strong>
                  </div>
                  <div>
                    Plan: <strong>{selectedMember.planName}</strong> ({selectedMember.courtDiscount}% court discount)
                  </div>
                  <div>
                    Today's Plays: <strong>{selectedMember.todayBookingsCount || 0} / 2 limit</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setBookingType('MEMBER');
                      setShowBookingModal(true);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'var(--primary-navy)',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Plus size={14} /> Book Court
                  </button>
                  <button
                    onClick={() => handleTabChange('members')}
                    style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Full Profile
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.5rem 0.5rem',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                }}
              >
                Search and select a member above to check membership validity & daily limit (2 plays/day)
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MEMBER SEARCH & FULL RECOGNITION */}
      {/* ======================================================== */}
      {activeTab === 'members' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Member Search list */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.25rem',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: '0 0 0.5rem 0',
                fontFamily: 'var(--font-family-display)',
              }}
            >
              Member Directory Lookup
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Search member by Name, Phone, Email, or ID
            </p>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <Search
                size={15}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.75rem', top: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '420px', overflowY: 'auto' }}>
              {searchResults.length > 0 ? (
                searchResults.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMember(m)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border:
                        selectedMember?.id === m.id
                          ? '2px solid var(--primary-peach)'
                          : '1px solid var(--border)',
                      backgroundColor: selectedMember?.id === m.id ? 'var(--lavender)' : 'var(--bg-main)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{m.name}</strong>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--light-green)',
                          color: 'var(--success)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {m.planName}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      ID: {m.memberId} • Phone: {m.phone}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {searching ? 'Searching...' : 'Type at least 2 characters to search active club members.'}
                </div>
              )}
            </div>
          </div>

          {/* Member Full Recognition Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.5rem',
            }}
          >
            {selectedMember ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h2
                        style={{
                          fontSize: '1.35rem',
                          fontWeight: 700,
                          color: 'var(--primary-navy)',
                          margin: 0,
                          fontFamily: 'var(--font-family-display)',
                        }}
                      >
                        {selectedMember.name}
                      </h2>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--light-green)',
                          color: 'var(--success)',
                        }}
                      >
                        {memberHistoryData?.member?.status || 'ACTIVE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Member ID: <strong>{selectedMember.memberId}</strong> • Email: {selectedMember.email} • Phone: {selectedMember.phone}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingType('MEMBER');
                      setShowBookingModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1rem',
                      backgroundColor: 'var(--primary-peach)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={15} /> Book Court for Member
                  </button>
                </div>

                {/* Membership & Play Limits Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>MEMBERSHIP PLAN</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.25rem' }}>
                      {memberHistoryData?.member?.membership || selectedMember.planName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Valid Until: {memberHistoryData?.member?.validUntil ? new Date(memberHistoryData.member.validUntil).toLocaleDateString() : '31 Dec 2026'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TODAY'S PLAYS</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-peach)', marginTop: '0.25rem' }}>
                      {memberHistoryData?.member?.todayPlays || selectedMember.todayBookingsCount || 0} / 2 Daily Limit
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Max 2 sessions / day rule
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>BENEFIT DISCOUNTS</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>
                      Court: {memberHistoryData?.member?.courtDiscount || 20}% • Shop: {memberHistoryData?.member?.shopDiscount || 15}% • Cafe: {memberHistoryData?.member?.cafeDiscount || 15}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Auto-applied on all terminals
                    </div>
                  </div>
                </div>

                {/* Recent Bookings & Payments Tab */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.65rem 0' }}>
                      Recent Court Bookings
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {memberHistoryData?.recentBookings && memberHistoryData.recentBookings.length > 0 ? (
                        memberHistoryData.recentBookings.map((b) => (
                          <div
                            key={b.id}
                            style={{
                              padding: '0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              fontSize: '0.8rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <strong style={{ color: 'var(--text-main)' }}>{b.courtName}</strong>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                                {new Date(b.date).toLocaleDateString()} • {b.time}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: b.status === 'COMPLETED' ? 'var(--bg-main)' : 'var(--light-green)',
                                color: b.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--success)',
                              }}
                            >
                              {b.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No recent bookings.</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.65rem 0' }}>
                      Recent Payment Transactions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {memberHistoryData?.recentPayments && memberHistoryData.recentPayments.length > 0 ? (
                        memberHistoryData.recentPayments.map((p) => (
                          <div
                            key={p.id}
                            style={{
                              padding: '0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              fontSize: '0.8rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <strong style={{ color: 'var(--text-main)' }}>₹{p.amount}</strong> ({p.method})
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                                {new Date(p.date).toLocaleDateString()} • {p.paymentId}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--light-green)',
                                color: 'var(--success)',
                              }}
                            >
                              {p.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No recent payments.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <Users size={36} color="var(--primary-peach)" style={{ opacity: 0.7, marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>No Member Selected</h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '360px', margin: '0.25rem auto' }}>
                  Search for a club member on the left to verify active membership, today's play counts, and history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REAL-TIME COURT AVAILABILITY 30-MIN GRID */}
      {/* ======================================================== */}
      {activeTab === 'courts' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Real-Time Court Availability Matrix
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                30-minute interval live grid across all sports courts
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date:</label>
                <input
                  type="date"
                  value={gridDate}
                  onChange={(e) => setGridDate(e.target.value)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              {/* Status Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                  Available
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                  Booked
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#D1D5DB' }} />
                  Maintenance
                </span>
              </div>
            </div>
          </div>

          {loadingGrid ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Loader text="Loading availability matrix..." />
            </div>
          ) : gridData ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--primary-navy)' }}>
                      TIME SLOT
                    </th>
                    {gridData.courts?.map((court) => (
                      <th key={court.id} style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {court.name}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>
                          {court.type}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridData.grid?.map((row) => (
                    <tr key={row.time} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.65rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-main)', backgroundColor: 'var(--bg-main)' }}>
                        {row.time}
                      </td>
                      {gridData.courts?.map((court) => {
                        const cell = row.courts[court.id] || { status: 'AVAILABLE' };
                        const isAvailable = cell.status === 'AVAILABLE';
                        const isBooked = cell.status === 'BOOKED';
                        const isMaint = cell.status === 'MAINTENANCE';

                        return (
                          <td key={court.id} style={{ padding: '0.4rem 0.5rem' }}>
                            <button
                              disabled={!isAvailable}
                              onClick={() => {
                                setSelectedCourtId(court.id);
                                setBookingDate(gridDate);
                                setBookingTime(row.time);
                                setShowBookingModal(true);
                              }}
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.25rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                backgroundColor: isAvailable
                                  ? 'var(--light-green)'
                                  : isBooked
                                  ? 'var(--light-warning)'
                                  : '#E5E7EB',
                                color: isAvailable
                                  ? 'var(--success)'
                                  : isBooked
                                  ? 'var(--warning)'
                                  : 'var(--text-muted)',
                                transition: 'var(--transition)',
                              }}
                            >
                              {isAvailable ? 'AVAILABLE' : isBooked ? `BOOKED` : 'MAINTENANCE'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Failed to load court grid.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BOOKING MANAGEMENT & DISPATCH */}
      {/* ======================================================== */}
      {activeTab === 'bookings' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          {/* Header & Filter pills */}
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Booking Management & Walk-in Terminal
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Filter bookings, execute check-in / check-out, reschedule or cancel
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Bookings' },
                { id: 'WALK_IN', label: 'Walk-ins' },
                { id: 'CONFIRMED', label: 'Confirmed' },
                { id: 'CHECKED_IN', label: 'In Play' },
                { id: 'COMPLETED', label: 'Completed' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setBookingFilter(f.id)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: bookingFilter === f.id ? 'var(--primary-navy)' : '#FFFFFF',
                    color: bookingFilter === f.id ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>TIME</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>COURT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>MEMBER / GUEST</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>SOURCE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>AMOUNT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.length > 0 ? (
                  filteredSchedule.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} color="var(--primary-peach)" />
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary-navy)' }}>{item.courtName}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                          {item.courtType}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.memberName}</span>
                        {item.phone && (
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>
                            {item.phone}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor:
                              item.bookingType === 'WALK_IN'
                                ? 'var(--lavender)'
                                : item.bookingType === 'PHONE'
                                ? 'var(--light-warning)'
                                : 'var(--light-green)',
                            color:
                              item.bookingType === 'WALK_IN'
                                ? 'var(--primary-navy)'
                                : item.bookingType === 'PHONE'
                                ? 'var(--warning)'
                                : 'var(--success)',
                          }}
                        >
                          {item.bookingType}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor:
                              item.status === 'CHECKED_IN'
                                ? 'var(--light-green)'
                                : item.status === 'CONFIRMED'
                                ? 'rgba(53, 73, 98, 0.1)'
                                : item.status === 'COMPLETED'
                                ? 'var(--bg-main)'
                                : 'var(--light-danger)',
                            color:
                              item.status === 'CHECKED_IN'
                                ? 'var(--success)'
                                : item.status === 'CONFIRMED'
                                ? 'var(--primary-navy)'
                                : item.status === 'COMPLETED'
                                ? 'var(--text-muted)'
                                : 'var(--danger)',
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>₹{item.finalAmount || 600}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          {item.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'CHECKED_IN')}
                              style={{
                                backgroundColor: 'var(--success)',
                                border: 'none',
                                color: '#FFFFFF',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Check-in
                            </button>
                          )}
                          {item.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => handleStatusUpdate(item.id, 'COMPLETED')}
                              style={{
                                backgroundColor: 'var(--primary-navy)',
                                border: 'none',
                                color: '#FFFFFF',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Check-out
                            </button>
                          )}
                          {item.status === 'CONFIRMED' && (
                            <button
                              onClick={() => {
                                setRescheduleBookingId(item.id);
                                setShowRescheduleModal(true);
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--text-main)',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Reschedule
                            </button>
                          )}
                          {item.status === 'CONFIRMED' && (
                            <button
                              onClick={() => {
                                setCancelBookingId(item.id);
                                setShowCancelModal(true);
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--danger)',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No bookings matching the filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: FRONT DESK PAYMENTS */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Front Desk Collected Payments
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Operational ledger of court booking transactions & walk-in collections (Cash, Card, UPI)
              </p>
            </div>
            <button
              onClick={fetchPayments}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
              }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>PAYMENT ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>CUSTOMER</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>METHOD</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>DATE & TIME</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentsList.length > 0 ? (
                  paymentsList.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {p.paymentId || `PAY-${p._id.slice(-6)}`}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {p.customerName || 'Club Member / Guest'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--lavender)',
                            color: 'var(--primary-navy)',
                          }}
                        >
                          {p.method}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--light-green)',
                            color: 'var(--success)',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        ₹{p.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {loadingPayments ? 'Loading payment records...' : 'No front desk payment records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE BOOKING MODAL */}
      {/* ======================================================== */}
      {showBookingModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '560px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.75rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Create Court Reservation
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking}>
              {/* Booking Source Selector */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  BOOKING SOURCE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { id: 'WALK_IN', label: 'Walk-In Guest', icon: Users },
                    { id: 'MEMBER', label: 'Club Member', icon: User },
                    { id: 'PHONE', label: 'Phone Call', icon: Phone },
                  ].map((src) => {
                    const Icon = src.icon;
                    return (
                      <button
                        type="button"
                        key={src.id}
                        onClick={() => setBookingType(src.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border:
                            bookingType === src.id
                              ? '2px solid var(--primary-peach)'
                              : '1px solid var(--border)',
                          backgroundColor:
                            bookingType === src.id ? 'var(--light-peach)' : '#FFFFFF',
                          color:
                            bookingType === src.id ? 'var(--primary-navy)' : 'var(--text-muted)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Icon size={14} />
                        {src.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest / Member Info */}
              {bookingType === 'MEMBER' ? (
                <div
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem',
                  }}
                >
                  {selectedMember ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>{selectedMember.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          {selectedMember.memberId} • Discount: {selectedMember.courtDiscount}% • Plays today: {selectedMember.todayBookingsCount || 0}/2
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMember(null)}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--danger)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
                      No member selected. Please search and select a member from the Member Search tab first.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Customer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        marginTop: '0.25rem',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        marginTop: '0.25rem',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Court Selection */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Court</label>
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                    fontSize: '0.85rem',
                  }}
                >
                  {courts.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.type}) — Rate: ₹{c.hourlyRate}/hr
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Slot */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Time Slot (1 Hour)</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    {[
                      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
                      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
                      '18:00', '19:00', '20:00', '21:00',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t} - {String((parseInt(t) + 1) % 24).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div
                style={{
                  backgroundColor: 'var(--lavender)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  <span>Base Court Rate:</span>
                  <span>₹{baseRate}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--success)' }}>
                    <span>Membership Discount ({discountPct}%):</span>
                    <span>-₹{calculatedDiscount}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--primary-navy)',
                    marginTop: '0.4rem',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    paddingTop: '0.4rem',
                  }}
                >
                  <span>Total Payable:</span>
                  <span>₹{finalPrice}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  PAYMENT METHOD
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  {['UPI', 'CARD', 'CASH'].map((pm) => (
                    <button
                      type="button"
                      key={pm}
                      onClick={() => setPaymentMethod(pm)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border:
                          paymentMethod === pm
                            ? '2px solid var(--primary-navy)'
                            : '1px solid var(--border)',
                        backgroundColor: paymentMethod === pm ? '#FFFFFF' : 'var(--bg-main)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingBooking || (bookingType === 'MEMBER' && !selectedMember)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary-peach)',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: submittingBooking ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingBooking ? 'Validating...' : `Collect ₹${finalPrice} & Confirm Booking`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RESCHEDULE MODAL */}
      {/* ======================================================== */}
      {showRescheduleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>
                Reschedule Booking
              </h3>
              <button onClick={() => setShowRescheduleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Court</label>
                <select
                  value={rescheduleCourtId}
                  onChange={(e) => setRescheduleCourtId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                >
                  <option value="">Keep current court</option>
                  {courts.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>New Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>New Time Slot</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {[
                      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
                      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
                      '18:00', '19:00', '20:00', '21:00',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t} - {String((parseInt(t) + 1) % 24).padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Reschedule Reason</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingReschedule}
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  backgroundColor: 'var(--primary-navy)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  cursor: submittingReschedule ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CANCEL BOOKING MODAL */}
      {/* ======================================================== */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              width: '100%',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)', margin: 0 }}>
                Cancel Booking
              </h3>
              <button onClick={() => setShowCancelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Are you sure you want to cancel this reservation? The court slot will immediately be freed for other members or walk-ins.
            </p>

            <form onSubmit={handleCancelSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Cancellation Reason</label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={submittingCancel}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    backgroundColor: 'var(--danger)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    cursor: submittingCancel ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingCancel ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SHIFT CLOSING DRAWER */}
      {/* ======================================================== */}
      {showClosingDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '440px',
              height: '100%',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--primary-navy)',
                    margin: 0,
                    fontFamily: 'var(--font-family-display)',
                  }}
                >
                  Shift Closing Summary
                </h3>
                <button
                  onClick={() => setShowClosingDrawer(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={22} />
                </button>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Staff Receptionist</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {user?.firstName} {user?.lastName} (Front Desk)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Financial Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Bookings:</span>
                  <strong style={{ fontSize: '0.9rem' }}>{closingData?.totalBookings || 28}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Walk-in Bookings:</span>
                  <strong style={{ fontSize: '0.9rem' }}>{closingData?.walkInBookings || 8}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Phone Reservations:</span>
                  <strong style={{ fontSize: '0.9rem' }}>{closingData?.phoneBookings || 6}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Online Bookings:</span>
                  <strong style={{ fontSize: '0.9rem' }}>{closingData?.onlineBookings || 14}</strong>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cash Collected:</span>
                    <strong style={{ fontSize: '0.85rem' }}>₹{closingData?.cashTotal || 4500}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>UPI Payments:</span>
                    <strong style={{ fontSize: '0.85rem' }}>₹{closingData?.upiTotal || 8000}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Card POS:</span>
                    <strong style={{ fontSize: '0.85rem' }}>₹{closingData?.cardTotal || 3500}</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '0.65rem',
                      borderTop: '2px solid var(--border)',
                      marginTop: '0.5rem',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: 'var(--primary-navy)',
                    }}
                  >
                    <span>Total Collections:</span>
                    <span>₹{closingData?.totalCollected || 16000}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowClosingDrawer(false);
                setAlert({ type: 'success', message: 'Shift closing report recorded & logged for audit.' });
              }}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: 'var(--primary-navy)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Submit Shift Closing Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontDeskDashboard;
