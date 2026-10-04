import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Clock3, History, RefreshCw, XCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import FilterDropdown from '../components/ui/FilterDropdown';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import courtBookingService from '../services/courtBookingService';

const bookingDate = (booking) => new Date(booking.date).getTime();
const bookingDay = (booking) => {
  const value = new Date(booking.date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
};
const today = () => {
  const value = new Date();
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
};
const dateLabel = (value) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toastSuccess, toastError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('UPCOMING');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = async (initial = false) => {
    initial ? setLoading(true) : setRefreshing(true);
    try {
      const result = await courtBookingService.getBookings();
      setBookings(result.data || []);
    } catch (error) {
      toastError(error.response?.data?.message || 'Could not load booking history.');
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadBookings(true); }, []);

  const grouped = useMemo(() => {
    const currentDay = today();
    return {
      UPCOMING: bookings.filter((item) => item.status === 'CONFIRMED' && bookingDay(item) >= currentDay).sort((a, b) => bookingDate(a) - bookingDate(b)),
      PAST: bookings.filter((item) => item.status === 'COMPLETED' || (item.status === 'CONFIRMED' && bookingDay(item) < currentDay)).sort((a, b) => bookingDate(b) - bookingDate(a)),
      CANCELLED: bookings.filter((item) => item.status === 'CANCELLED').sort((a, b) => bookingDate(b) - bookingDate(a)),
    };
  }, [bookings]);

  const cancelBooking = async (id) => {
    try {
      await courtBookingService.cancelBooking(id);
      toastSuccess('Booking cancelled. The timeslot is available again.');
      await loadBookings();
    } catch (error) {
      toastError(error.response?.data?.message || 'Could not cancel this booking.');
    }
  };

  if (loading) return <DashboardLayout><div style={{ padding: '4rem 0' }}><Loader fullPage text="Loading your court bookings..." /></div></DashboardLayout>;
  const list = grouped[filter];

  return <DashboardLayout>
    <PageHeader title="Court Booking History" subtitle="Review your future court sessions and past bookings." breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Courts', path: '/courts' }, { label: 'Booking history' }]} action={<div style={{ display: 'flex', gap: '0.5rem' }}><Button variant="outline" icon={RefreshCw} disabled={refreshing} onClick={() => loadBookings()}>{refreshing ? 'Refreshing' : 'Refresh'}</Button><Button variant="primary" onClick={() => navigate('/courts')}>Book a court</Button></div>} />

    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <FilterDropdown label="Booking status" value={filter} onChange={(event) => setFilter(event.target.value)} options={[
        { value: 'UPCOMING', label: `Upcoming (${grouped.UPCOMING.length})` },
        { value: 'PAST', label: `Past bookings (${grouped.PAST.length})` },
        { value: 'CANCELLED', label: `Cancelled (${grouped.CANCELLED.length})` },
      ]} />
    </div>

    {location.state?.newBooking && <Card style={{ marginBottom: '1rem', borderColor: 'var(--primary)' }}><Card.Content><div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}><Badge variant="success">Confirmed</Badge><strong>Your booking has been added to upcoming sessions.</strong></div></Card.Content></Card>}

    {list.length ? <div style={{ display: 'grid', gap: '0.75rem' }}>{list.map((booking) => <Card key={booking._id}><Card.Content><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>{booking.court?.image && <img src={booking.court.image} alt="" style={{ width: 70, height: 70, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />}<div><div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}><h3 style={{ margin: 0, fontSize: '1rem' }}>{booking.court?.name || 'Sports court'}</h3><Badge variant={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'CANCELLED' ? 'danger' : 'secondary'}>{booking.status}</Badge></div><div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}><span style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}><CalendarDays size={14} />{dateLabel(booking.date)}</span><span style={{ display: 'inline-flex', gap: '0.3rem', alignItems: 'center' }}><Clock3 size={14} />{booking.startTime}–{booking.endTime}</span></div><div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>{booking.court?.type || ''} · {money(booking.finalAmount)} · {booking.bookingCode || `Booking ${String(booking._id).slice(-6)}`}</div></div></div>
      {filter === 'UPCOMING' && booking.status === 'CONFIRMED' && <Button variant="outline" size="sm" onClick={() => cancelBooking(booking._id)}>Cancel booking</Button>}
    </div></Card.Content></Card>)}</div> : <Card><Card.Content><div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}><History size={30} /><h3 style={{ color: 'var(--text-main)' }}>No {filter.toLowerCase()} bookings</h3><p>{filter === 'UPCOMING' ? 'Choose a court and available timeslot to get started.' : 'Bookings in this section will appear here.'}</p>{filter === 'UPCOMING' && <Button variant="primary" onClick={() => navigate('/courts')}>Find an available court</Button>}</div></Card.Content></Card>}
  </DashboardLayout>;
};

export default BookingHistoryPage;
