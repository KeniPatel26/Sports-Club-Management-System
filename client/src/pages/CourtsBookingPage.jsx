import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, History, MapPin, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import courtBookingService from '../services/courtBookingService';
import membershipService from '../services/membershipService';

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const CourtsBookingPage = () => {
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { user } = useAuth();
  const [courts, setCourts] = useState([]);
  const [sport, setSport] = useState('ALL');
  const [court, setCourt] = useState(null);
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [membership, setMembership] = useState(null);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [courtResult, membershipResult] = await Promise.allSettled([
          courtBookingService.getCourts(), membershipService.getMyMembership(),
        ]);
        if (courtResult.status === 'fulfilled' && courtResult.value.success) {
          const list = courtResult.value.data || [];
          setCourts(list);
          setCourt(list[0] || null);
        }
        if (membershipResult.status === 'fulfilled' && membershipResult.value.success) {
          setMembership(membershipResult.value.data?.membership || null);
        }
      } catch (error) {
        toastError('Could not load courts. Please refresh and try again.');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (step !== 2 || !court?._id || !date) return;
    let active = true;
    setLoadingSlots(true);
    setSlot('');
    courtBookingService.getCourtSlots(court._id, date)
      .then((result) => { if (active) setSlots((result.data?.slots || []).filter((item) => item.available)); })
      .catch((error) => { if (active) { setSlots([]); toastError(error.response?.data?.message || 'Could not load available timeslots.'); } })
      .finally(() => { if (active) setLoadingSlots(false); });
    return () => { active = false; };
  }, [court?._id, date, step]);

  const visibleCourts = courts.filter((item) => sport === 'ALL' || item.type === sport);
  const categories = useMemo(() => ['ALL', ...new Set(courts.map((item) => item.type).filter(Boolean))], [courts]);
  const isMember = user?.role?.toUpperCase() === 'MEMBER';
  const discount = isMember
    ? Number(membership?.plan?.benefits?.courtDiscount ?? membership?.plan?.courtDiscount ?? 0)
    : 0;
  const membershipPlanName = membership?.plan?.name || 'Member';
  const rate = (isMember ? court?.hourlyRate : court?.walkInRate) || court?.hourlyRate || 0;
  const savings = rate * discount / 100;
  const total = Math.max(0, rate * (1 - discount / 100));

  const chooseCourt = (selected) => { setCourt(selected); setSlot(''); setStep(2); };
  const submitBooking = async () => {
    if (!court || !slot || !date) return;
    if (!isMember && (!walkInName.trim() || !walkInPhone.trim())) {
      toastError('Enter the guest name and phone number to continue.');
      return;
    }
    try {
      setSubmitting(true);
      const bookingType = isMember ? 'MEMBER' : 'WALK_IN';
      const result = await courtBookingService.createBooking({ courtId: court._id, date, startTime: slot, bookingType, walkInDetails: bookingType === 'WALK_IN' ? { name: walkInName, phone: walkInPhone } : undefined, paymentMethod: 'UPI' });
      toastSuccess(result.message || 'Your court booking is confirmed.');
      setConfirmOpen(false);
      navigate('/booking-history', { state: { newBooking: result.data } });
    } catch (error) {
      toastError(error.response?.data?.message || 'This timeslot is no longer available. Select another slot.');
      setConfirmOpen(false);
      const result = await courtBookingService.getCourtSlots(court._id, date).catch(() => ({ data: { slots: [] } }));
      setSlots((result.data?.slots || []).filter((item) => item.available));
      setSlot('');
    } finally { setSubmitting(false); }
  };

  if (loading) return <DashboardLayout><div style={{ padding: '4rem 0' }}><Loader fullPage text="Loading courts..." /></div></DashboardLayout>;

  return <DashboardLayout>
    <PageHeader title="Book a Court" subtitle="Choose a court, select an available session time, and confirm your booking." breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Courts' }]} action={<Button variant="outline" icon={History} onClick={() => navigate('/booking-history')}>Booking history</Button>} />

    <div className="court-booking-page">
    <div className="court-booking-stepper">
      {[['1', 'Choose sports court'], ['2', 'Pick session timeslot'], ['3', 'Confirm booking']].map(([number, label], index) => <React.Fragment key={number}>
        {index > 0 && <div className="court-step-connector" />}
        <div className={`court-step ${step === Number(number) ? 'is-active' : ''}`}><span className="court-step-number">{step > Number(number) ? <CheckCircle2 size={16} /> : number}</span><span>{label}</span></div>
      </React.Fragment>)}
    </div>

    {isMember && discount > 0 && <div className="court-member-discount"><span className="court-member-discount-icon"><ShieldCheck size={19} /></span><div><strong>{membershipPlanName} court benefit</strong><span>{discount === 100 ? 'Your membership covers the full court fee.' : `${discount}% membership discount is applied automatically to your court booking.`}</span></div><b>{discount}% off</b></div>}

    {step === 1 && <>
      <div className="court-sport-filters">{categories.map((item) => <button className={`court-filter ${sport === item ? 'is-active' : ''}`} key={item} type="button" onClick={() => setSport(item)}>{item === 'ALL' ? 'All sports' : item}</button>)}</div>
      {visibleCourts.length ? <div className="court-card-grid">{visibleCourts.map((item) => <Card key={item._id} hoverable className="court-select-card">
        <div className="court-card-media">{item.image ? <img src={item.image} alt={`${item.name} court`} loading="lazy" /> : <div className="court-image-placeholder"><MapPin size={34} /><span>Club court</span></div>}<Badge variant="primary">{item.type}</Badge></div>
        <Card.Content className="court-card-content"><div className="court-card-meta"><Badge variant={item.isIndoor ? 'purple' : 'info'}>{item.isIndoor ? 'Indoor' : 'Outdoor'}</Badge><span>{item.isIndoor ? 'All-weather facility' : 'Open-air court'}</span></div><Card.Title className="court-card-title">{item.name}</Card.Title><div className="court-card-bottom"><div className="court-card-price"><small>{discount > 0 ? `${membershipPlanName} member price` : 'Starting at'}</small><div className="court-card-price-values">{discount > 0 && <del>{money(item.hourlyRate)}</del>}<strong>{money(Math.max(0, item.hourlyRate * (1 - discount / 100)))}</strong><span>/ hour</span></div></div><Button variant="primary" size="sm" onClick={() => chooseCourt(item)}>Choose court <ArrowRight size={15} /></Button></div></Card.Content>
      </Card>)}</div> : <Card><Card.Content><p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No active courts found.</p></Card.Content></Card>}
    </>}

    {step === 2 && <div className="court-timeslot-wrap"><Card className="court-timeslot-card"><div className="court-timeslot-heading"><div><span className="court-section-eyebrow">Selected court</span><Card.Title>{court?.name}</Card.Title><Card.Description>Choose a date to see open one-hour sessions.</Card.Description></div><Badge variant="primary">{court?.type}</Badge></div><Card.Content>
      <div className="court-date-field"><label htmlFor="booking-date"><CalendarDays size={18} /> Choose your date</label><input id="booking-date" type="date" min={today()} value={date} onChange={(event) => setDate(event.target.value)} /></div>
      <div className="court-slot-title"><div><span className="court-section-eyebrow">Session times</span><h3>Available timeslots</h3></div><span className="court-availability-count">{loadingSlots ? 'Checking…' : `${slots.length} available`}</span></div>
      {loadingSlots ? <div className="court-slots-loading"><Loader text="Checking available times..." /></div> : slots.length ? <div className="court-slot-grid">{slots.map((item) => <button key={item.time} type="button" aria-pressed={slot === item.time} className={`court-slot-button ${slot === item.time ? 'is-selected' : ''}`} onClick={() => setSlot(item.time)}><Clock3 size={17} /><span>{item.time}</span>{slot === item.time && <CheckCircle2 className="court-slot-check" size={17} />}</button>)}</div> : <div className="court-no-slots"><CalendarDays size={25} /><strong>No timeslots available</strong><span>Choose another date to view available sessions.</span></div>}
      <div className="court-timeslot-actions"><Button variant="outline" onClick={() => { setStep(1); setSlot(''); }}><ArrowLeft size={15} /> Change court</Button><Button variant="primary" disabled={!slot || loadingSlots} onClick={() => setConfirmOpen(true)}>Review booking <ArrowRight size={15} /></Button></div>
    </Card.Content></Card></div>}

    <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Review your booking" subtitle="Check your court and session details before confirming." maxWidth="620px" footer={<><Button variant="secondary" onClick={() => setConfirmOpen(false)}>Back to timeslots</Button><Button variant="primary" loading={submitting} onClick={submitBooking}><ShieldCheck size={16} /> Confirm booking</Button></>}>
      <div className="court-confirmation">
        <div className="court-confirmation-banner"><div className="court-confirmation-icon"><CheckCircle2 size={23} /></div><div><strong>Session selected</strong><span>Review the details before submitting your booking.</span></div></div>
        <div className="court-confirmation-details"><div className="court-confirmation-row"><span><MapPin size={17} /> Court</span><strong>{court?.name}</strong></div><div className="court-confirmation-row"><span><CalendarDays size={17} /> Date</span><strong>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></div><div className="court-confirmation-row"><span><Clock3 size={17} /> Session</span><strong>{slot}–{`${String(Number(slot?.slice(0, 2)) + 1).padStart(2, '0')}:${slot?.slice(3)}`}</strong></div></div>
        <div className="court-price-breakdown">{discount > 0 ? <div className="court-original-price"><span>Court fee · 1 hour</span><del>{money(rate)}</del></div> : <div><span>Court fee · 1 hour</span><strong>{money(rate)}</strong></div>}{discount > 0 && <div className="court-member-savings"><span>{membershipPlanName} discount ({discount}%)</span><strong>−{money(savings)}</strong></div>}<div className="court-confirmation-total"><div><span>{discount > 0 ? 'Member price' : 'Estimated total'}</span>{discount > 0 && <small>Membership pricing applied</small>}</div><strong>{money(total)}</strong></div></div>
        {!isMember && <div className="court-guest-fields"><Input label="Guest name" value={walkInName} onChange={(event) => setWalkInName(event.target.value)} required /><Input label="Guest phone" type="tel" value={walkInPhone} onChange={(event) => setWalkInPhone(event.target.value)} required /></div>}
      </div>
    </Modal>
    </div>
  </DashboardLayout>;
};

export default CourtsBookingPage;
