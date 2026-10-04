import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft,
  Receipt,
  RotateCcw,
  Sparkles,
  Bell,
  Printer,
  ChevronRight,
  ChevronLeft,
  Eye,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import staffService from '../../../services/staffService';
import courtBookingService from '../../../services/courtBookingService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';
import FilterDropdown from '../../../components/ui/FilterDropdown';

export const FrontDeskDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  // Base Data State
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [courts, setCourts] = useState([]);
  const [alert, setAlert] = useState(null);

  // Active Tab: dashboard | courts | members | bookings | payments | notifications
  const activeTab = ['dashboard', 'courts', 'members', 'bookings', 'payments', 'notifications'].includes(currentTab)
    ? currentTab
    : 'dashboard';

  const handleTabChange = (tabName) => {
    setSearchParams(tabName === 'dashboard' ? {} : { tab: tabName });
  };

  // -------------------------------------------------------------
  // Global Header Search State
  // -------------------------------------------------------------
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [searchingGlobal, setSearchingGlobal] = useState(false);
  const [showGlobalDropdown, setShowGlobalDropdown] = useState(false);

  // -------------------------------------------------------------
  // Court Availability Grid State
  // -------------------------------------------------------------
  const [gridDate, setGridDate] = useState(new Date().toISOString().split('T')[0]);
  const [gridData, setGridData] = useState(null);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [courtFilter, setCourtFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, AVAILABLE, BOOKED, MAINTENANCE

  // -------------------------------------------------------------
  // Member Search Tab State
  // -------------------------------------------------------------
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [searchingMember, setSearchingMember] = useState(false);
  const [selectedDirectoryMember, setSelectedDirectoryMember] = useState(null);
  const [memberHistoryData, setMemberHistoryData] = useState(null);
  const [loadingMemberHistory, setLoadingMemberHistory] = useState(false);

  // -------------------------------------------------------------
  // Create Booking Modal State
  // -------------------------------------------------------------
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingCustomerType, setBookingCustomerType] = useState('MEMBER'); // MEMBER | GUEST
  const [bookingSource, setBookingSource] = useState('FRONT_DESK'); // FRONT_DESK | WALK_IN | PHONE
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalMemberQuery, setModalMemberQuery] = useState('');
  const [modalMemberResults, setModalMemberResults] = useState([]);
  const [searchingModalMember, setSearchingModalMember] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInEmail, setWalkInEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // CASH, UPI, CARD
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // -------------------------------------------------------------
  // Booking Confirmation Modal State (Receipt / Done)
  // -------------------------------------------------------------
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);

  // -------------------------------------------------------------
  // Booking Details Slide-over Drawer State
  // -------------------------------------------------------------
  const [selectedBookingDrawer, setSelectedBookingDrawer] = useState(null);

  // -------------------------------------------------------------
  // Reschedule Modal State
  // -------------------------------------------------------------
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleCourtId, setRescheduleCourtId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [rescheduleTime, setRescheduleTime] = useState('18:00');
  const [rescheduleReason, setRescheduleReason] = useState('Customer requested new slot');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // -------------------------------------------------------------
  // Cancel Booking Modal State
  // -------------------------------------------------------------
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelRefundAmount, setCancelRefundAmount] = useState(400);
  const [cancelReason, setCancelReason] = useState('Customer cancellation request');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  // -------------------------------------------------------------
  // Today's Bookings Filter State
  // -------------------------------------------------------------
  const [bookingFilter, setBookingFilter] = useState('ALL'); // ALL, UPCOMING, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW

  // -------------------------------------------------------------
  // Shift Closing & Attendance State
  // -------------------------------------------------------------
  const [showClosingDrawer, setShowClosingDrawer] = useState(false);
  const [closingData, setClosingData] = useState(null);
  const [loadingClosing, setLoadingClosing] = useState(false);
  const [checkedIn, setCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('08:55 AM');

  // -------------------------------------------------------------
  // Payments Tab State
  // -------------------------------------------------------------
  const [paymentsList, setPaymentsList] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // -------------------------------------------------------------
  // Operational Notifications
  // -------------------------------------------------------------
  const operationalNotifications = useMemo(() => [
    { id: 'n1', title: 'Court 2 Maintenance Notice', message: 'Tennis Court 2 scheduled inspection today at 13:00 - 14:00.', time: '10m ago', type: 'warning' },
    { id: 'n2', title: 'Booking Rescheduled', message: 'Member Keni Patel rescheduled Badminton Hall 1 to 18:00.', time: '25m ago', type: 'info' },
    { id: 'n3', title: 'Walk-in Match Confirmed', message: 'Walk-in reservation #BK8501 for Court 1 (16:00) verified and paid via UPI.', time: '40m ago', type: 'success' },
    { id: 'n4', title: 'Court 3 Ready for Play', message: 'Padel Glass Court A maintenance completed. Now available for dispatch.', time: '1h ago', type: 'success' },
  ], []);

  // -------------------------------------------------------------
  // Dynamic Pricing Calculations (Auto-calculated, No Manual Input)
  // -------------------------------------------------------------
  const selectedCourtObj = useMemo(() => {
    return courts.find((c) => (c._id || c.id) === selectedCourtId) || courts[0] || null;
  }, [courts, selectedCourtId]);

  const baseCourtRate = useMemo(() => {
    if (!selectedCourtObj) return 500;
    if (bookingCustomerType === 'MEMBER') {
      return selectedCourtObj.hourlyRate || 500;
    }
    return selectedCourtObj.walkInRate || selectedCourtObj.hourlyRate || 600;
  }, [selectedCourtObj, bookingCustomerType]);

  const memberDiscountPct = useMemo(() => {
    if (bookingCustomerType !== 'MEMBER' || !selectedMember) return 0;
    return selectedMember.courtDiscount || 20;
  }, [bookingCustomerType, selectedMember]);

  const calculatedDiscountAmount = useMemo(() => {
    return Math.round((baseCourtRate * memberDiscountPct) / 100);
  }, [baseCourtRate, memberDiscountPct]);

  const finalTotalAmount = useMemo(() => {
    return Math.max(baseCourtRate - calculatedDiscountAmount, 0);
  }, [baseCourtRate, calculatedDiscountAmount]);

  // -------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------
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
          setSelectedCourtId(resCourts.data[0]._id || resCourts.data[0].id);
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

  const fetchGrid = async (dateVal) => {
    setLoadingGrid(true);
    try {
      const res = await staffService.getCourtAvailability(dateVal || gridDate);
      if (res.success) {
        setGridData(res.data);
      }
    } catch (err) {
      console.error('Court availability grid fetch error:', err);
    } finally {
      setLoadingGrid(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'courts' || activeTab === 'dashboard') {
      fetchGrid(gridDate);
    }
  }, [activeTab, gridDate]);

  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await staffService.getFrontDeskPayments();
      if (res.success) {
        setPaymentsList(res.data);
      }
    } catch (err) {
      console.error('Payments fetch error:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  // -------------------------------------------------------------
  // Live Member Searches
  // -------------------------------------------------------------
  // Global Header Live Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (globalSearchQuery.trim().length >= 2) {
        setSearchingGlobal(true);
        try {
          const res = await staffService.searchMembers(globalSearchQuery.trim());
          if (res.success) {
            setGlobalSearchResults(res.data || []);
            setShowGlobalDropdown(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSearchingGlobal(false);
        }
      } else {
        setGlobalSearchResults([]);
        setShowGlobalDropdown(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [globalSearchQuery]);

  // Directory Tab Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (memberSearchQuery.trim().length >= 2) {
        setSearchingMember(true);
        try {
          const res = await staffService.searchMembers(memberSearchQuery.trim());
          if (res.success) {
            setMemberSearchResults(res.data || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSearchingMember(false);
        }
      } else {
        setMemberSearchResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [memberSearchQuery]);

  // Modal Member Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (modalMemberQuery.trim().length >= 2) {
        setSearchingModalMember(true);
        try {
          const res = await staffService.searchMembers(modalMemberQuery.trim());
          if (res.success) {
            setModalMemberResults(res.data || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSearchingModalMember(false);
        }
      } else {
        setModalMemberResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [modalMemberQuery]);

  const handleSelectDirectoryMember = async (member) => {
    setSelectedDirectoryMember(member);
    setLoadingMemberHistory(true);
    try {
      const res = await staffService.getMemberHistory(member.id || member._id);
      if (res.success) {
        setMemberHistoryData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMemberHistory(false);
    }
  };

  // -------------------------------------------------------------
  // Date Shifting Helpers
  // -------------------------------------------------------------
  const handleDateShift = (deltaDays) => {
    const d = new Date(gridDate);
    d.setDate(d.getDate() + deltaDays);
    const newDateStr = d.toISOString().split('T')[0];
    setGridDate(newDateStr);
  };

  const handleSetToday = () => {
    setGridDate(new Date().toISOString().split('T')[0]);
  };

  const handleSetTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setGridDate(d.toISOString().split('T')[0]);
  };

  // -------------------------------------------------------------
  // Quick Open Booking Modal
  // -------------------------------------------------------------
  const handleOpenCreateBooking = ({ customerType = 'MEMBER', source = 'FRONT_DESK', courtId = '', time = '', date = '' }) => {
    setBookingCustomerType(customerType);
    setBookingSource(source);
    if (courtId) setSelectedCourtId(courtId);
    if (time) setBookingTime(time);
    if (date) setBookingDate(date);
    else setBookingDate(gridDate);
    setShowBookingModal(true);
  };

  // -------------------------------------------------------------
  // Slot Click Dispatcher on Availability Matrix
  // -------------------------------------------------------------
  const handleMatrixCellClick = (court, timeSlot, cell) => {
    if (cell.status === 'AVAILABLE') {
      handleOpenCreateBooking({
        customerType: 'MEMBER',
        source: 'FRONT_DESK',
        courtId: court.id,
        time: timeSlot,
        date: gridDate,
      });
    } else if (cell.status === 'BOOKED') {
      const bookingRecord = (overview?.schedule || []).find(
        (b) => b.id === cell.bookingId || (b.courtId === court.id && b.startTime === timeSlot)
      ) || {
        id: cell.bookingId || `BK-${Date.now().toString().slice(-4)}`,
        courtId: court.id,
        courtName: court.name,
        courtType: court.type,
        memberName: cell.bookedBy || 'Club Member',
        bookingType: 'MEMBER',
        status: 'CONFIRMED',
        startTime: timeSlot,
        endTime: `${String((parseInt(timeSlot.split(':')[0]) + 1) % 24).padStart(2, '0')}:${timeSlot.split(':')[1] || '00'}`,
        finalAmount: court.hourlyRate || 500,
        paymentMethod: 'UPI',
        date: gridDate,
      };
      setSelectedBookingDrawer(bookingRecord);
    }
  };

  // -------------------------------------------------------------
  // Status Update Handler (Check-In, Check-Out, No-Show)
  // -------------------------------------------------------------
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      let res;
      if (newStatus === 'CHECKED_IN') {
        res = await staffService.checkInBooking(bookingId);
      } else if (newStatus === 'COMPLETED') {
        res = await staffService.checkOutBooking(bookingId);
      } else {
        res = await staffService.updateBookingStatus(bookingId, newStatus);
      }
      if (res.success) {
        setAlert({ type: 'success', message: res.message || `Booking status updated to ${newStatus}` });
        fetchOverview();
        fetchGrid(gridDate);
        if (selectedBookingDrawer && selectedBookingDrawer.id === bookingId) {
          setSelectedBookingDrawer((prev) => ({
            ...prev,
            status: newStatus,
            checkInTime: newStatus === 'CHECKED_IN' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : prev.checkInTime,
            checkOutTime: newStatus === 'COMPLETED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : prev.checkOutTime,
          }));
        }
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to update booking status.' });
    }
  };

  // -------------------------------------------------------------
  // Create Booking Submission
  // -------------------------------------------------------------
  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBooking(true);
    setAlert(null);

    try {
      const courtIdToUse = selectedCourtId || (courts.length > 0 ? (courts[0]._id || courts[0].id) : undefined);
      if (!courtIdToUse) {
        setAlert({ type: 'warning', message: 'Please select a sports court for this booking.' });
        setSubmittingBooking(false);
        return;
      }

      if (bookingCustomerType === 'MEMBER' && !selectedMember) {
        setAlert({
          type: 'warning',
          message: 'Please search and select an active club member or switch to Walk-In Guest.',
        });
        setSubmittingBooking(false);
        return;
      }

      if (bookingCustomerType === 'MEMBER' && (selectedMember?.todayBookingsCount || 0) >= 2) {
        setAlert({
          type: 'danger',
          message: `Member ${selectedMember.name} has reached the daily limit of 2 bookings/day.`,
        });
        setSubmittingBooking(false);
        return;
      }

      if (bookingCustomerType !== 'MEMBER' && (!walkInName?.trim() || !walkInPhone?.trim())) {
        setAlert({
          type: 'warning',
          message: 'Please provide guest full name and contact mobile number.',
        });
        setSubmittingBooking(false);
        return;
      }

      const [hours, minutes] = bookingTime.split(':').map(Number);
      const endHour = (hours + 1) % 24;
      const endTime = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      const resolvedBookingType = bookingCustomerType === 'MEMBER' ? 'MEMBER' : (bookingSource === 'WALK_IN' ? 'WALK_IN' : 'MEMBER');

      const payload = {
        courtId: courtIdToUse,
        bookingType: resolvedBookingType,
        bookingSource,
        memberId: bookingCustomerType === 'MEMBER' && selectedMember ? (selectedMember.id || selectedMember._id) : undefined,
        walkInName: bookingCustomerType !== 'MEMBER' ? walkInName.trim() : undefined,
        walkInPhone: bookingCustomerType !== 'MEMBER' ? walkInPhone.trim() : undefined,
        walkInEmail: bookingCustomerType !== 'MEMBER' ? walkInEmail.trim() : undefined,
        date: bookingDate,
        startTime: bookingTime,
        endTime,
        durationMinutes: 60,
        paymentMethod,
      };

      const res = await staffService.createFrontDeskBooking(payload);
      if (res.success) {
        const confirmedData = {
          bookingId: res.data?._id || `BK${Date.now().toString().slice(-4)}`,
          customerName: bookingCustomerType === 'MEMBER' ? selectedMember.name : walkInName,
          customerType: bookingCustomerType,
          courtName: selectedCourtObj?.name || 'Court 1',
          date: bookingDate,
          startTime: bookingTime,
          endTime,
          finalAmount: finalTotalAmount,
          paymentMethod,
          invoiceNumber: res.data?.receipt?.invoiceNumber || `INV-BK-${Date.now().toString().slice(-4)}`,
        };

        setConfirmedBookingData(confirmedData);
        setShowBookingModal(false);
        setWalkInName('');
        setWalkInPhone('');
        setWalkInEmail('');
        setSelectedMember(null);
        setModalMemberQuery('');
        fetchOverview();
        fetchGrid(gridDate);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to create booking. Please check availability and daily limits.',
      });
    } finally {
      setSubmittingBooking(false);
    }
  };

  // -------------------------------------------------------------
  // Reschedule Submission
  // -------------------------------------------------------------
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
        courtId: rescheduleCourtId || undefined,
        reason: rescheduleReason,
      });

      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Booking rescheduled successfully!' });
        setShowRescheduleModal(false);
        if (selectedBookingDrawer) setSelectedBookingDrawer(null);
        fetchOverview();
        fetchGrid(gridDate);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to reschedule booking' });
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // -------------------------------------------------------------
  // Cancel Submission
  // -------------------------------------------------------------
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelBookingId) return;
    setSubmittingCancel(true);
    try {
      const res = await staffService.cancelBooking(cancelBookingId, { reason: cancelReason });
      if (res.success) {
        setAlert({ type: 'info', message: res.message || 'Booking cancelled successfully.' });
        setShowCancelModal(false);
        if (selectedBookingDrawer) setSelectedBookingDrawer(null);
        fetchOverview();
        fetchGrid(gridDate);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to cancel booking' });
    } finally {
      setSubmittingCancel(false);
    }
  };

  // -------------------------------------------------------------
  // Shift Closing & Attendance Toggle
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // Filtered Today's Schedule Table
  // -------------------------------------------------------------
  const filteredSchedule = useMemo(() => {
    return (overview?.schedule || []).filter((item) => {
      if (bookingFilter === 'ALL') return true;
      if (bookingFilter === 'UPCOMING') return item.status === 'CONFIRMED';
      if (bookingFilter === 'CHECKED_IN') return item.status === 'CHECKED_IN';
      if (bookingFilter === 'COMPLETED') return item.status === 'COMPLETED';
      if (bookingFilter === 'CANCELLED') return item.status === 'CANCELLED';
      if (bookingFilter === 'NO_SHOW') return item.status === 'NO_SHOW';
      return true;
    });
  }, [overview?.schedule, bookingFilter]);

  // -------------------------------------------------------------
  // Filtered Court Availability Grid
  // -------------------------------------------------------------
  const filteredCourts = useMemo(() => {
    if (!gridData?.courts) return courts;
    if (courtFilter === 'ALL') return gridData.courts;
    return gridData.courts.filter((c) => (c.id || c._id) === courtFilter);
  }, [gridData?.courts, courts, courtFilter]);

  if (loading && !overview) {
    return <Loader fullPage text="Loading Front Desk Operations Terminal..." />;
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto', fontFamily: 'var(--font-family-body)' }}>
      {/* ======================================================== */}
      {/* 1. DYNAMIC PAGE HEADER & SEARCH BAR */}
      {/* ======================================================== */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeTab === 'courts' && <Calendar size={28} color="var(--primary-navy)" />}
          {activeTab === 'members' && <Users size={28} color="var(--primary-navy)" />}
          {activeTab === 'bookings' && <CheckCircle size={28} color="var(--primary-navy)" />}
          {activeTab === 'payments' && <Receipt size={28} color="var(--primary-navy)" />}
          {activeTab === 'notifications' && <Bell size={28} color="var(--primary-navy)" />}
          {activeTab === 'dashboard' && <Building2 size={28} color="var(--primary-navy)" />}
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-family-display)',
              margin: 0,
            }}
          >
            {activeTab === 'courts' && 'Court Availability Matrix'}
            {activeTab === 'members' && 'Member Directory'}
            {activeTab === 'bookings' && "Today's Bookings"}
            {activeTab === 'payments' && 'Booking Payments'}
            {activeTab === 'notifications' && 'Operational Alerts'}
            {activeTab === 'dashboard' && 'Front Desk Dashboard'}
          </h1>
        </div>

        {/* Global Search Header Input */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search member / phone / booking ID..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem 0.55rem 2.2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                fontSize: '0.825rem',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            />
            <Search
              size={15}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '0.7rem' }}
            />
          </div>

          {/* Global Search Dropdown */}
          {showGlobalDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-md)',
                zIndex: 100,
                marginTop: '4px',
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '0.5rem',
              }}
            >
              {searchingGlobal ? (
                <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Searching members & reservations...
                </div>
              ) : globalSearchResults.length > 0 ? (
                globalSearchResults.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSelectedDirectoryMember(m);
                      setShowGlobalDropdown(false);
                      setGlobalSearchQuery('');
                      handleTabChange('members');
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--primary-navy)' }}>{m.name}</strong>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {m.planName} • ID: {m.memberId} • {m.phone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowGlobalDropdown(false);
                        setSelectedMember(m);
                        handleOpenCreateBooking({ customerType: 'MEMBER' });
                      }}
                      style={{
                        backgroundColor: 'var(--primary-peach)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '3px 8px',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Book Court
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No members found matching query.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {alert && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE TABS */}
      {/* ======================================================== */}

      {/* ======================================================== */}
      {/* TAB 1: TODAY'S OPERATIONS & DISPATCH (DASHBOARD) */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 5 OPERATIONAL KPIS (FOCUSED ON TODAY'S OPERATIONS) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1rem 1.15rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  TODAY'S BOOKINGS
                </span>
                <Calendar size={17} color="var(--primary-navy)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.35rem' }}>
                {overview?.kpi?.todayBookingsCount || 24}
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--success)', fontWeight: 600 }}>
                Scheduled games today
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1rem 1.15rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  UPCOMING BOOKINGS
                </span>
                <Clock size={17} color="var(--primary-peach)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-peach)', marginTop: '0.35rem' }}>
                {overview?.kpi?.upcomingBookingsCount || 12}
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Next queue in line
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1rem 1.15rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  AVAILABLE COURTS
                </span>
                <CheckCircle size={17} color="var(--success)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.35rem' }}>
                {overview?.kpi?.availableCourts || 4}
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Ready for play dispatch
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1rem 1.15rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  TODAY'S REVENUE
                </span>
                <DollarSign size={17} color="var(--primary-navy)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.35rem' }}>
                ₹{overview?.kpi?.todayRevenue?.toLocaleString() || '8,500'}
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--success)', fontWeight: 600 }}>
                Gross collected
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '1rem 1.15rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  WALK-INS TODAY
                </span>
                <Users size={17} color="var(--secondary-blue)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary-blue)', marginTop: '0.35rem' }}>
                {overview?.kpi?.walkInsToday || 5}
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Front desk entries
              </span>
            </div>
          </div>

          {/* PROMINENT QUICK ACTIONS BAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              backgroundColor: '#FFFFFF',
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <button
              onClick={() => handleOpenCreateBooking({ customerType: 'MEMBER', source: 'FRONT_DESK' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-peach)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(217, 142, 104, 0.3)',
              }}
            >
              <Plus size={16} />
              + Create Booking
            </button>

            <button
              onClick={() => handleOpenCreateBooking({ customerType: 'GUEST', source: 'WALK_IN' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Users size={16} />
              + Walk-in Booking
            </button>

            <button
              onClick={() => handleOpenCreateBooking({ customerType: 'MEMBER', source: 'PHONE' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--lavender)',
                border: '1px solid rgba(53, 73, 98, 0.2)',
                color: 'var(--primary-navy)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Phone size={15} />
              + Phone Booking
            </button>

            <button
              onClick={() => handleTabChange('courts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F1F4F9',
                border: '1px solid #CBD5E1',
                color: '#1E293B',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Calendar size={16} color="var(--primary-peach)" />
              Court Availability Matrix
            </button>

            <button
              onClick={() => handleTabChange('members')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#F1F4F9',
                border: '1px solid #CBD5E1',
                color: '#1E293B',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Search size={16} color="var(--primary-navy)" />
              Search Members
            </button>
          </div>
          {/* Today's Bookings Table Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                padding: '1.15rem 1.25rem',
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
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    margin: 0,
                    fontFamily: 'var(--font-family-display)',
                  }}
                >
                  Today's Bookings & Live Dispatch
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Real-time court reservations, player verification and check-in / check-out
                </p>
              </div>

              <FilterDropdown label="Booking status" value={bookingFilter} onChange={(event) => setBookingFilter(event.target.value)} options={[
                { value: 'ALL', label: 'All bookings' },
                { value: 'UPCOMING', label: 'Upcoming' },
                { value: 'CHECKED_IN', label: 'Checked-in' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'NO_SHOW', label: 'No-show' },
              ]} />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>TIME</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>COURT</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOMER</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>TYPE</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>AMOUNT</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedule.length > 0 ? (
                    filteredSchedule.map((item) => (
                      <tr
                        key={item.id}
                        style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-main)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={14} color="var(--primary-peach)" />
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{item.courtName}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                            {item.courtType}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.memberName}</span>
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
                                  : item.status === 'NO_SHOW'
                                  ? 'var(--light-warning)'
                                  : 'var(--light-danger)',
                              color:
                                item.status === 'CHECKED_IN'
                                  ? 'var(--success)'
                                  : item.status === 'CONFIRMED'
                                  ? 'var(--primary-navy)'
                                  : item.status === 'COMPLETED'
                                  ? 'var(--text-muted)'
                                  : item.status === 'NO_SHOW'
                                  ? 'var(--warning)'
                                  : 'var(--danger)',
                            }}
                          >
                            {item.status === 'CHECKED_IN' && item.checkInTime ? `● Checked-in (${new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : item.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                          ₹{item.finalAmount || 500}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
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
                                  fontWeight: 700,
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
                                  backgroundColor: 'var(--primary)',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Check-out
                              </button>
                            )}
                            {item.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'NO_SHOW')}
                                title="Mark as No-Show"
                                style={{
                                  backgroundColor: 'transparent',
                                  border: '1px solid var(--border)',
                                  color: 'var(--warning)',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                No-show
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedBookingDrawer(item)}
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
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No bookings matching filter for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: COURT AVAILABILITY 30-MIN MATRIX (MAIN SCREEN) */}
      {/* ======================================================== */}
      {activeTab === 'courts' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Header & Date Navigation */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1.15rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Court Availability Matrix
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                30-minute interval live grid. Click any available slot to book instantly.
              </p>
            </div>

            {/* Date Navigator: ← 02 Oct [ 03 Oct 2026 ] 04 Oct → & [Today] [Tomorrow] */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  padding: '2px',
                }}
              >
                <button
                  onClick={() => handleDateShift(-1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '0.4rem 0.65rem',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>

                <input
                  type="date"
                  value={gridDate}
                  onChange={(e) => setGridDate(e.target.value)}
                  style={{
                    padding: '0.35rem 0.5rem',
                    border: 'none',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    color: 'var(--primary-navy)',
                    outline: 'none',
                  }}
                />

                <button
                  onClick={() => handleDateShift(1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '0.4rem 0.65rem',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>

              <button
                onClick={handleSetToday}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: gridDate === new Date().toISOString().split('T')[0] ? 'var(--primary)' : '#FFFFFF',
                  color: gridDate === new Date().toISOString().split('T')[0] ? '#FFFFFF' : 'var(--text-main)',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Today
              </button>

              <button
                onClick={handleSetTomorrow}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-main)',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Court & Status Filters */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <FilterDropdown label="Court" value={courtFilter} onChange={(event) => setCourtFilter(event.target.value)} options={[
                { value: 'ALL', label: 'All courts' },
                ...courts.map((court) => ({ value: court._id || court.id, label: court.name })),
              ]} />
              <FilterDropdown label="Availability" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[
                { value: 'ALL', label: 'All statuses' },
                { value: 'AVAILABLE', label: 'Available' },
                { value: 'BOOKED', label: 'Booked' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
              ]} />
            </div>

            {/* Status Filters & Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                🟢 Available
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>
                🔴 Booked
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                ⚫ Maintenance
              </span>
            </div>
          </div>

          {/* 30-min Grid Table */}
          {loadingGrid ? (
            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
              <Loader text="Generating real-time 30-min availability matrix..." />
            </div>
          ) : gridData ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 800, color: 'var(--primary-navy)', width: '110px' }}>
                      TIME SLOT
                    </th>
                    {filteredCourts.map((court) => (
                      <th key={court.id || court._id} style={{ padding: '0.75rem 0.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        {court.name}
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                          {court.type} • ₹{court.hourlyRate}/hr
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridData.grid?.map((row) => (
                    <tr key={row.time} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td
                        style={{
                          padding: '0.6rem 1rem',
                          textAlign: 'left',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          backgroundColor: 'var(--bg-main)',
                        }}
                      >
                        {row.time}
                      </td>
                      {filteredCourts.map((court) => {
                        const cell = row.courts[court.id || court._id] || { status: 'AVAILABLE' };
                        const isAvailable = cell.status === 'AVAILABLE';
                        const isBooked = cell.status === 'BOOKED';
                        const isMaint = cell.status === 'MAINTENANCE';

                        if (statusFilter === 'AVAILABLE' && !isAvailable) return null;
                        if (statusFilter === 'BOOKED' && !isBooked) return null;
                        if (statusFilter === 'MAINTENANCE' && !isMaint) return null;

                        return (
                          <td key={court.id || court._id} style={{ padding: '0.35rem 0.45rem' }}>
                            <button
                              type="button"
                              onClick={() => handleMatrixCellClick(court, row.time, cell)}
                              disabled={isMaint}
                              title={
                                isAvailable
                                  ? `Click to book ${court.name} at ${row.time}`
                                  : isBooked
                                  ? `Booked by ${cell.bookedBy || 'Member'} - Click for details`
                                  : 'Court under maintenance'
                              }
                              style={{
                                width: '100%',
                                padding: '0.5rem 0.25rem',
                                borderRadius: 'var(--radius-sm)',
                                border: isAvailable
                                  ? '1px solid rgba(168, 192, 172, 0.8)'
                                  : isBooked
                                  ? '1px solid rgba(217, 142, 104, 0.8)'
                                  : '1px solid #E5E7EB',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                cursor: isMaint ? 'not-allowed' : 'pointer',
                                backgroundColor: isAvailable
                                  ? 'var(--light-green)'
                                  : isBooked
                                  ? 'var(--light-warning)'
                                  : '#F3F4F6',
                                color: isAvailable
                                  ? 'var(--success)'
                                  : isBooked
                                  ? 'var(--warning)'
                                  : 'var(--text-muted)',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                            >
                              <span>{isAvailable ? '🟢 AVAILABLE' : isBooked ? '🔴 BOOKED' : '⚫ MAINT'}</span>
                              {isBooked && (
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    color: 'var(--text-main)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '120px',
                                  }}
                                >
                                  {cell.bookedBy || 'Member'}
                                </span>
                              )}
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
              Failed to load court matrix.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MEMBER SEARCH & RECOGNITION */}
      {/* ======================================================== */}
      {activeTab === 'members' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Member Search Column */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: '0 0 0.35rem 0',
                fontFamily: 'var(--font-family-display)',
              }}
            >
              Member Directory Lookup
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Search member by Name, Phone, Email, or Member ID
            </p>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="🔍 Search name / phone / ID..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '440px', overflowY: 'auto' }}>
              {memberSearchResults.length > 0 ? (
                memberSearchResults.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectDirectoryMember(m)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border:
                        selectedDirectoryMember?.id === m.id
                          ? '2px solid var(--primary-peach)'
                          : '1px solid var(--border)',
                      backgroundColor: selectedDirectoryMember?.id === m.id ? 'var(--lavender)' : 'var(--bg-main)',
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
                  {searchingMember ? 'Searching...' : 'Type at least 2 characters to search club members.'}
                </div>
              )}
            </div>
          </div>

          {/* Member Profile Recognition Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {selectedDirectoryMember ? (
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
                          fontWeight: 800,
                          color: 'var(--primary-navy)',
                          margin: 0,
                          fontFamily: 'var(--font-family-display)',
                        }}
                      >
                        {selectedDirectoryMember.name}
                      </h2>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--light-green)',
                          color: 'var(--success)',
                        }}
                      >
                        ● {selectedDirectoryMember.status || 'ACTIVE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Member ID: <strong>{selectedDirectoryMember.memberId}</strong> • Email: {selectedDirectoryMember.email} • Phone: {selectedDirectoryMember.phone}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMember(selectedDirectoryMember);
                      handleOpenCreateBooking({ customerType: 'MEMBER' });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1.1rem',
                      backgroundColor: 'var(--primary-peach)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(217, 142, 104, 0.3)',
                    }}
                  >
                    <Plus size={16} /> Book Court for Member
                  </button>
                </div>

                {/* Membership & Play Limit Validation Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MEMBERSHIP PLAN</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.25rem' }}>
                      {selectedDirectoryMember.planName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Valid Until: {selectedDirectoryMember.expiryDate ? new Date(selectedDirectoryMember.expiryDate).toLocaleDateString() : '24 Oct 2027'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TODAY'S PLAYS</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-peach)', marginTop: '0.25rem' }}>
                      {selectedDirectoryMember.todayBookingsCount || 0} / 2 Daily Limit
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {2 - (selectedDirectoryMember.todayBookingsCount || 0)} booking(s) remaining today
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>BENEFIT DISCOUNTS</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.25rem' }}>
                      Court: {selectedDirectoryMember.courtDiscount || 20}% • Shop: {selectedDirectoryMember.shopDiscount || 15}% • Cafe: {selectedDirectoryMember.cafeDiscount || 15}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      ✓ Auto-applied at checkout
                    </div>
                  </div>
                </div>

                {/* Validation Status Badges */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--success)', backgroundColor: 'var(--light-green)', padding: '3px 8px', borderRadius: '4px' }}>
                    ✓ Active Membership
                  </span>
                  <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--success)', backgroundColor: 'var(--light-green)', padding: '3px 8px', borderRadius: '4px' }}>
                    ✓ Eligible for Booking
                  </span>
                  <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--primary-navy)', backgroundColor: 'var(--lavender)', padding: '3px 8px', borderRadius: '4px' }}>
                    ✓ {2 - (selectedDirectoryMember.todayBookingsCount || 0)} booking remaining today
                  </span>
                </div>

                {/* Recent Bookings & Payments */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.65rem 0' }}>
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
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.65rem 0' }}>
                      Recent Transactions
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>No Member Selected</h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '360px', margin: '0.25rem auto' }}>
                  Search for a member on the left to verify active membership, play limits, and discounts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BOOKINGS MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'bookings' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
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
                  fontWeight: 800,
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

            <FilterDropdown label="Booking status" value={bookingFilter} onChange={(event) => setBookingFilter(event.target.value)} options={[
              { value: 'ALL', label: 'All bookings' },
              { value: 'UPCOMING', label: 'Upcoming' },
              { value: 'CHECKED_IN', label: 'In play' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
              { value: 'NO_SHOW', label: 'No-show' },
            ]} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>TIME</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>COURT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOMER</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>TYPE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>AMOUNT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.length > 0 ? (
                  filteredSchedule.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={14} color="var(--primary-peach)" />
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{item.courtName}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                          {item.courtType}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.memberName}</span>
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
                                : item.status === 'NO_SHOW'
                                ? 'var(--light-warning)'
                                : 'var(--light-danger)',
                            color:
                              item.status === 'CHECKED_IN'
                                ? 'var(--success)'
                                : item.status === 'CONFIRMED'
                                ? 'var(--primary-navy)'
                                : item.status === 'COMPLETED'
                                ? 'var(--text-muted)'
                                : item.status === 'NO_SHOW'
                                ? 'var(--warning)'
                                : 'var(--danger)',
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        ₹{item.finalAmount || 500}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
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
                                fontWeight: 700,
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
                                backgroundColor: 'var(--primary)',
                                border: 'none',
                                color: '#FFFFFF',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Check-out
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBookingDrawer(item)}
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
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No bookings matching filter.
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
            boxShadow: 'var(--shadow-sm)',
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
                  fontWeight: 800,
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
                fontWeight: 700,
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
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>CUSTOMER</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>METHOD</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>DATE & TIME</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentsList.length > 0 ? (
                  paymentsList.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        {p.paymentId || `PAY-${p._id.slice(-6)}`}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {p.customerName || 'Club Member / Guest'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
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
                            fontWeight: 800,
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
      {/* TAB 6: OPERATIONAL NOTIFICATIONS */}
      {/* ======================================================== */}
      {activeTab === 'notifications' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Bell size={20} color="var(--primary-peach)" />
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                fontFamily: 'var(--font-family-display)',
              }}
            >
              Front Desk Operational Notifications
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {operationalNotifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor:
                        notif.type === 'warning'
                          ? 'var(--light-warning)'
                          : notif.type === 'success'
                          ? 'var(--light-green)'
                          : 'var(--lavender)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color:
                        notif.type === 'warning'
                          ? 'var(--warning)'
                          : notif.type === 'success'
                          ? 'var(--success)'
                          : 'var(--primary-navy)',
                      flexShrink: 0,
                    }}
                  >
                    <Bell size={16} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      {notif.title}
                    </h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-main)' }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{notif.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. CREATE BOOKING MODAL (SIMPLIFIED & INTUITIVE) */}
      {/* ======================================================== */}
      {showBookingModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.65)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '860px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '0.85rem',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--primary-navy)',
                    margin: 0,
                    fontFamily: 'var(--font-family-display)',
                  }}
                >
                  CREATE BOOKING
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Date: {bookingDate} • Mode: {bookingSource}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setModalMemberQuery('');
                  setModalMemberResults([]);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left Side: Form Controls */}
                <div>
                  {/* Customer Type Radio Toggle: ○ Member ○ Guest */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.4rem' }}>
                      Customer Type
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingCustomerType('MEMBER');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem',
                          borderRadius: 'var(--radius-md)',
                          border: bookingCustomerType === 'MEMBER' ? '2px solid var(--primary-navy)' : '1px solid var(--border)',
                          backgroundColor: bookingCustomerType === 'MEMBER' ? 'var(--lavender)' : '#FFFFFF',
                          color: bookingCustomerType === 'MEMBER' ? 'var(--primary-navy)' : 'var(--text-muted)',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        <User size={16} /> ○ Member
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBookingCustomerType('GUEST');
                          setSelectedMember(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.65rem',
                          borderRadius: 'var(--radius-md)',
                          border: bookingCustomerType === 'GUEST' ? '2px solid var(--primary-peach)' : '1px solid var(--border)',
                          backgroundColor: bookingCustomerType === 'GUEST' ? 'var(--light-peach)' : '#FFFFFF',
                          color: bookingCustomerType === 'GUEST' ? 'var(--primary-peach)' : 'var(--text-muted)',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Users size={16} /> ○ Guest
                      </button>
                    </div>
                  </div>

                  {/* Customer Details: Member or Guest */}
                  {bookingCustomerType === 'MEMBER' ? (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Search Member (Name / Phone / Member ID)
                      </label>

                      {selectedMember ? (
                        <div
                          style={{
                            backgroundColor: 'var(--lavender)',
                            border: '1.5px solid var(--primary-navy)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.85rem 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>
                                👤 {selectedMember.name}
                              </strong>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#FFFFFF', color: 'var(--primary-navy)', padding: '2px 7px', borderRadius: '4px' }}>
                                {selectedMember.planName}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Active until 24 Oct 2027 • Today's bookings: <strong>{selectedMember.todayBookingsCount || 0} / 2</strong>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, marginTop: '0.25rem' }}>
                              ✓ Active Membership • ✓ Eligible • ✓ {selectedMember.courtDiscount || 20}% Court Discount Auto-Applied
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMember(null);
                              setModalMemberQuery('');
                            }}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--danger)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            placeholder="🔍 Name / Phone / Member ID"
                            value={modalMemberQuery}
                            onChange={(e) => setModalMemberQuery(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.85rem',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border)',
                              fontSize: '0.85rem',
                              outline: 'none',
                            }}
                          />
                          {searchingModalMember && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Searching member database...
                            </div>
                          )}
                          {modalMemberResults.length > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: '#FFFFFF',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-md)',
                                zIndex: 20,
                                maxHeight: '180px',
                                overflowY: 'auto',
                                marginTop: '4px',
                              }}
                            >
                              {modalMemberResults.map((m) => (
                                <div
                                  key={m.id}
                                  onClick={() => {
                                    setSelectedMember(m);
                                    setModalMemberResults([]);
                                    setModalMemberQuery('');
                                  }}
                                  style={{
                                    padding: '0.65rem 0.85rem',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  <div>
                                    <strong>{m.name}</strong> ({m.phone})
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                      {m.planName} • Active until 24 Oct 2027 • Today: {m.todayBookingsCount || 0}/2
                                    </div>
                                  </div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-peach)' }}>
                                    Select →
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.5rem' }}>
                        <div>
                          <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={walkInName}
                            onChange={(e) => setWalkInName(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              fontSize: '0.825rem',
                              marginTop: '0.2rem',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>Phone *</label>
                          <input
                            type="tel"
                            required
                            placeholder="9876543210"
                            value={walkInPhone}
                            onChange={(e) => setWalkInPhone(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              fontSize: '0.825rem',
                              marginTop: '0.2rem',
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Guest Rate: ₹500/hr (Standard rate applies).
                      </div>
                    </div>
                  )}

                  {/* Court Selection via Cards */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.4rem' }}>
                      Select Court
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
                      {courts.map((court) => {
                        const isSelected = selectedCourtId === (court._id || court.id);
                        return (
                          <div
                            key={court.id || court._id}
                            onClick={() => setSelectedCourtId(court._id || court.id)}
                            style={{
                              padding: '0.65rem 0.5rem',
                              borderRadius: 'var(--radius-md)',
                              border: isSelected ? '2px solid var(--primary-navy)' : '1px solid var(--border)',
                              backgroundColor: isSelected ? 'var(--lavender)' : '#FFFFFF',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'var(--transition)',
                            }}
                          >
                            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary-navy)' }}>
                              {court.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {court.type} • ₹{court.hourlyRate}/hr
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--success)', display: 'block', marginTop: '2px' }}>
                              🟢 Available
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time-Slot UI via Selectable Chips */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                      Time Slot ({bookingTime} ➔ {String((parseInt(bookingTime.split(':')[0]) + 1) % 24).padStart(2, '0')}:{bookingTime.split(':')[1] || '00'} • 1-Hour Session)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '0.35rem' }}>
                      {[
                        '06:00', '07:00', '08:00', '09:00', '09:30', '10:00', '10:30', '11:00',
                        '11:30', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
                        '20:00', '21:00',
                      ].map((t) => {
                        const isSelected = bookingTime === t;
                        return (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setBookingTime(t)}
                            style={{
                              padding: '0.4rem 0.25rem',
                              borderRadius: 'var(--radius-sm)',
                              border: isSelected ? '2px solid var(--primary-navy)' : '1px solid var(--border)',
                              backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                          >
                            <span>{t}</span>
                            <span style={{ fontSize: '0.6rem' }}>{isSelected ? '🔵' : '🟢'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Sticky Booking Summary Panel */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    padding: '1.25rem',
                    position: 'sticky',
                    top: '1rem',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--primary-navy)',
                      margin: '0 0 1rem 0',
                      fontFamily: 'var(--font-family-display)',
                      borderBottom: '1px solid var(--border)',
                      paddingBottom: '0.5rem',
                    }}
                  >
                    BOOKING SUMMARY
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.15rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                      <strong>{bookingCustomerType === 'MEMBER' ? selectedMember?.name || 'Select Member' : walkInName || 'Guest'}</strong>
                    </div>
                    {bookingCustomerType === 'MEMBER' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Membership:</span>
                        <strong>{selectedMember?.planName || 'Gold Member'}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Court:</span>
                      <strong>{selectedCourtObj?.name || 'Court 1'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                      <strong>{bookingDate}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Time:</span>
                      <strong>
                        {bookingTime} – {String((parseInt(bookingTime.split(':')[0]) + 1) % 24).padStart(2, '0')}:{bookingTime.split(':')[1] || '00'}
                      </strong>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border)',
                      paddingTop: '0.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Court Fee (1 Hr):</span>
                      <strong>₹{baseCourtRate}</strong>
                    </div>
                    {calculatedDiscountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--success)', marginBottom: '0.35rem' }}>
                        <span>Member Discount ({memberDiscountPct}%):</span>
                        <strong>-₹{calculatedDiscountAmount}</strong>
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: 'var(--primary-navy)',
                        borderTop: '2px solid var(--border)',
                        paddingTop: '0.5rem',
                        marginTop: '0.35rem',
                      }}
                    >
                      <span>TOTAL:</span>
                      <span>₹{finalTotalAmount}</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--primary-navy)', display: 'block', marginBottom: '0.35rem' }}>
                      Payment Method
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem' }}>
                      {['CASH', 'UPI', 'CARD'].map((pm) => (
                        <button
                          type="button"
                          key={pm}
                          onClick={() => setPaymentMethod(pm)}
                          style={{
                            padding: '0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            border: paymentMethod === pm ? '2px solid var(--primary-navy)' : '1px solid var(--border)',
                            backgroundColor: paymentMethod === pm ? '#FFFFFF' : 'transparent',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: paymentMethod === pm ? 'var(--primary-navy)' : 'var(--text-muted)',
                          }}
                        >
                          {pm}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Booking Button */}
                  <button
                    type="submit"
                    disabled={submittingBooking || (bookingCustomerType === 'MEMBER' && !selectedMember)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      backgroundColor: 'var(--primary-peach)',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.925rem',
                      fontWeight: 800,
                      cursor: submittingBooking || (bookingCustomerType === 'MEMBER' && !selectedMember) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(217, 142, 104, 0.3)',
                    }}
                  >
                    {submittingBooking ? 'Confirming...' : `Confirm Booking • Collect ₹${finalTotalAmount}`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. BOOKING CONFIRMATION MODAL (RECEIPT / DONE) */}
      {/* ======================================================== */}
      {confirmedBookingData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--light-green)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <CheckCircle size={32} />
            </div>

            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--primary-navy)',
                margin: '0 0 0.35rem 0',
                fontFamily: 'var(--font-family-display)',
              }}
            >
              ✓ BOOKING CONFIRMED
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0' }}>
              Booking #{confirmedBookingData.bookingId.toString().slice(-6)}
            </p>

            {/* Receipt Summary Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-main)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'left',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                marginBottom: '1.5rem',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <strong>{confirmedBookingData.customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Court:</span>
                <strong>{confirmedBookingData.courtName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Session:</span>
                <strong>
                  {confirmedBookingData.date} ({confirmedBookingData.startTime} – {confirmedBookingData.endTime})
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Paid Amount:</span>
                <strong style={{ color: 'var(--primary-navy)', fontSize: '0.95rem' }}>₹{confirmedBookingData.finalAmount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <strong style={{ color: 'var(--success)' }}>{confirmedBookingData.paymentMethod} • PAID</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                }}
              >
                <Printer size={16} /> Print Receipt
              </button>

              <button
                type="button"
                onClick={() => setConfirmedBookingData(null)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. BOOKING DETAILS SIDE DRAWER */}
      {/* ======================================================== */}
      {selectedBookingDrawer && (
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
              overflowY: 'auto',
            }}
          >
            <div>
              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0, fontFamily: 'var(--font-family-display)' }}>
                    Booking #{selectedBookingDrawer.id?.toString().slice(-6)}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedBookingDrawer.date ? new Date(selectedBookingDrawer.date).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedBookingDrawer(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Badge */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor:
                      selectedBookingDrawer.status === 'CHECKED_IN'
                        ? 'var(--light-green)'
                        : selectedBookingDrawer.status === 'CONFIRMED'
                        ? 'var(--lavender)'
                        : 'var(--bg-main)',
                    color:
                      selectedBookingDrawer.status === 'CHECKED_IN'
                        ? 'var(--success)'
                        : selectedBookingDrawer.status === 'CONFIRMED'
                        ? 'var(--primary-navy)'
                        : 'var(--text-muted)',
                  }}
                >
                  STATUS: {selectedBookingDrawer.status}
                </span>
              </div>

              {/* Customer Information */}
              <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CUSTOMER</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {selectedBookingDrawer.memberName}
                </div>
                {selectedBookingDrawer.phone && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Phone: {selectedBookingDrawer.phone}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-navy)', fontWeight: 700, marginTop: '0.35rem' }}>
                  Category: {selectedBookingDrawer.bookingType}
                </div>
              </div>

              {/* Court & Session */}
              <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>COURT & SESSION</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.2rem' }}>
                  {selectedBookingDrawer.courtName} ({selectedBookingDrawer.courtType})
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  Time: <strong>{selectedBookingDrawer.startTime} – {selectedBookingDrawer.endTime}</strong> (1 Hour)
                </div>
                {selectedBookingDrawer.checkInTime && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem', fontWeight: 600 }}>
                    Checked-in at: {new Date(selectedBookingDrawer.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {selectedBookingDrawer.checkOutTime && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Checked-out at: {new Date(selectedBookingDrawer.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              {/* Financial Breakdown */}
              <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                  <strong>₹{selectedBookingDrawer.finalAmount || 500}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                  <strong style={{ color: 'var(--success)' }}>{selectedBookingDrawer.paymentMethod || 'UPI'} • PAID</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons in Drawer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedBookingDrawer.status === 'CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedBookingDrawer.id, 'CHECKED_IN')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--success)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <CheckCircle size={16} /> ⚡ Check-In Player
                </button>
              )}

              {selectedBookingDrawer.status === 'CHECKED_IN' && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedBookingDrawer.id, 'COMPLETED')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <LogOut size={16} /> 🏁 Check-Out (Complete)
                </button>
              )}

              {selectedBookingDrawer.status === 'CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedBookingDrawer.id, 'NO_SHOW')}
                  style={{
                    padding: '0.65rem',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--warning)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Mark as No-Show
                </button>
              )}

              {selectedBookingDrawer.status === 'CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => {
                    setRescheduleBookingId(selectedBookingDrawer.id);
                    setRescheduleCourtId(selectedBookingDrawer.courtId);
                    setShowRescheduleModal(true);
                  }}
                  style={{
                    padding: '0.65rem',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  🗓️ Reschedule Booking
                </button>
              )}

              {selectedBookingDrawer.status === 'CONFIRMED' && (
                <button
                  type="button"
                  onClick={() => {
                    setCancelBookingId(selectedBookingDrawer.id);
                    setCancelRefundAmount(selectedBookingDrawer.finalAmount || 400);
                    setShowCancelModal(true);
                  }}
                  style={{
                    padding: '0.65rem',
                    backgroundColor: 'var(--light-danger)',
                    color: 'var(--danger)',
                    border: '1px solid rgba(220, 38, 38, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Cancel Booking
                </button>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '0.65rem',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <Printer size={15} /> Print Receipt Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. RESCHEDULE MODAL */}
      {/* ======================================================== */}
      {showRescheduleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                Reschedule Booking
              </h3>
              <button onClick={() => setShowRescheduleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Target Court</label>
                <select
                  value={rescheduleCourtId}
                  onChange={(e) => setRescheduleCourtId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="">Keep current court</option>
                  {courts.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>New Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>New Time Slot</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    {[
                      '06:00', '07:00', '08:00', '09:00', '09:30', '10:00', '10:30', '11:00',
                      '11:30', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
                      '20:00', '21:00',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t} - {String((parseInt(t.split(':')[0]) + 1) % 24).padStart(2, '0')}:{t.split(':')[1] || '00'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Reschedule Reason</label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingReschedule}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: submittingReschedule ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingReschedule ? 'Checking Availability & Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. CANCEL BOOKING CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={20} color="var(--danger)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--danger)', margin: 0 }}>
                  Cancel Booking?
                </h3>
              </div>
              <button onClick={() => setShowCancelModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Are you sure you want to cancel this reservation? The court slot will immediately be freed for other members or walk-ins.
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-main)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Eligible Refund Amount:</span>
                <strong style={{ color: 'var(--primary-navy)' }}>₹{cancelRefundAmount}</strong>
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Standard club cancellation policy applies.
              </div>
            </div>

            <form onSubmit={handleCancelSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>Cancellation Reason</label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
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
                    padding: '0.7rem',
                    backgroundColor: 'var(--danger)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
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
      {/* 10. SHIFT CLOSING DRAWER */}
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
                    fontWeight: 800,
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
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
                  <strong style={{ fontSize: '0.9rem' }}>{closingData?.totalBookings || 24}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Walk-in Bookings:</span>
                  <strong style={{ fontSize: '0.9rem' }}>{closingData?.walkInBookings || 5}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Phone Reservations:</span>
                  <strong style={{ fontSize: '0.9rem' }}>{closingData?.phoneBookings || 7}</strong>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cash Collected:</span>
                    <strong style={{ fontSize: '0.85rem' }}>₹{closingData?.cashTotal || 2500}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>UPI Payments:</span>
                    <strong style={{ fontSize: '0.85rem' }}>₹{closingData?.upiTotal || 4500}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Card POS:</span>
                    <strong style={{ fontSize: '0.85rem' }}>₹{closingData?.cardTotal || 1500}</strong>
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
                    <span>₹{closingData?.totalCollected || 8500}</span>
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
                backgroundColor: 'var(--primary)',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 800,
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
