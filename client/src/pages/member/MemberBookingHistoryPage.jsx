import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import MemberStatsSummary from '../../components/member/MemberStatsSummary';
import MemberBookingsList from '../../components/member/MemberBookingsList';
import memberCourtService from '../../services/member/memberCourtService';
import membershipService from '../../services/membershipService';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { Calendar, Plus, RefreshCw, History } from 'lucide-react';

export const MemberBookingHistoryPage = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [memberStats, setMemberStats] = useState(null);
  const [userMembership, setUserMembership] = useState(null);

  const loadData = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      else setRefreshing(true);

      const [bookRes, statsRes, memRes] = await Promise.allSettled([
        memberCourtService.getMemberBookings(),
        memberCourtService.getMemberStats(),
        membershipService.getMyMembership(),
      ]);

      if (bookRes.status === 'fulfilled' && bookRes.value.success) {
        setBookings(bookRes.value.data || []);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setMemberStats(statsRes.value.data);
      }

      if (memRes.status === 'fulfilled' && memRes.value.success) {
        setUserMembership(memRes.value.data?.membership);
      }
    } catch (e) {
      console.error('Error fetching member bookings history:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      await memberCourtService.cancelMemberBooking(bookingId);
      toastSuccess('Reservation cancelled.');
      loadData(false);
    } catch (e) {
      toastError('Failed to cancel reservation.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '4rem 0' }}>
          <Loader fullPage text="Loading your reservations and match history..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Court Reservations & History"
        subtitle="Track upcoming scheduled games, check entry QR passes, and review past match logs."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Member Hub', path: '/member/court-booking' },
          { label: 'Booking History' },
        ]}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(false)}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/member/court-booking')}
            >
              <Plus size={15} /> Book New Court
            </Button>
          </div>
        }
      />

      {/* Stats Summary */}
      <MemberStatsSummary stats={memberStats} userPlan={userMembership?.plan} />

      {/* Bookings List Component with Search and Tabs */}
      <MemberBookingsList
        bookings={bookings}
        onCancelBooking={handleCancelBooking}
        refreshing={refreshing}
        showSearch={true}
      />
    </DashboardLayout>
  );
};

export default MemberBookingHistoryPage;
