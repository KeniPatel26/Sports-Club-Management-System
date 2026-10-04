import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  Calendar,
  CreditCard,
  Plus,
  RefreshCw,
  Clock,
  Award,
  ShoppingBag,
  Coffee,
  Check,
  X,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import membershipService from '../services/membershipService';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import PaymentModal from '../components/payment/PaymentModal';

const getMembershipTierKey = (name) => {
  const normalizedName = String(name || '').toUpperCase();
  if (normalizedName.includes('GOLD')) return 'GOLD';
  if (normalizedName.includes('SILVER')) return 'SILVER';
  if (normalizedName.includes('JUNIOR')) return 'JUNIOR';
  return null;
};

export const MembershipsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [plans, setPlans] = useState([]);
  const [myMembership, setMyMembership] = useState(null);
  const [pastMemberships, setPastMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Subscribe modal state
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const isOwner = user?.role === 'CLUB_MANAGER' || user?.role === 'OWNER' || user?.role === 'ADMIN';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, myMemRes] = await Promise.allSettled([
        membershipService.getPlans(),
        membershipService.getMyMembership(),
      ]);

      if (plansRes.status === 'fulfilled' && plansRes.value.success) {
        const activePlans = Array.isArray(plansRes.value.data) ? plansRes.value.data : [];
        const memberTierKeys = ['GOLD', 'SILVER', 'JUNIOR'];
        setPlans(memberTierKeys
          .map((tierKey) => activePlans.find((plan) => getMembershipTierKey(plan.name) === tierKey))
          .filter(Boolean));
      }
      if (myMemRes.status === 'fulfilled' && myMemRes.value.success) {
        setMyMembership(myMemRes.value.data?.membership || null);
        setPastMemberships(myMemRes.value.data?.pastMemberships || []);
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubscribeClick = (plan) => {
    setSelectedPlan(plan);
    setIsSubscribeOpen(true);
  };

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingMembership, setPendingMembership] = useState(null);

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setActionLoading(true);
    try {
      const res = await membershipService.subscribeMembership({
        planId: selectedPlan._id,
        paymentMethod,
      });
      if (res.success && res.data) {
        setIsSubscribeOpen(false);
        if (selectedPlan.price > 0) {
          setPendingMembership(res.data);
          setPaymentModalOpen(true);
        } else {
          toastSuccess(`Successfully subscribed to ${selectedPlan.name} Membership!`, 'Membership Active');
          fetchData();
        }
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to process subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const comparisonRows = [
    { label: 'Target User', gold: 'Regular / premium members', silver: 'Regular members', junior: 'Children / young players' },
    { label: 'Court Booking', gold: 'Yes (All eligible courts)', silver: 'Yes (Standard courts)', junior: 'Yes (Junior-eligible courts)' },
    { label: 'Booking Priority', gold: 'High Priority (48h advance)', silver: 'Standard (24h advance)', junior: 'Standard (24h advance)' },
    { label: 'Daily Booking Limit', gold: '2 plays / day', silver: '2 plays / day', junior: '2 plays / day' },
    { label: 'Court Booking Discount', gold: '20% OFF', silver: '10% OFF', junior: '15% OFF', highlight: true },
    { label: 'Sports Shop Discount', gold: '15% OFF', silver: '10% OFF', junior: '10% OFF', highlight: true },
    { label: 'Cafe & Canteen Discount', gold: '15% OFF', silver: '5% OFF', junior: '10% OFF', highlight: true },
    { label: 'Online Shop Ordering', gold: 'Yes', silver: 'Yes', junior: 'Yes' },
    { label: 'Club Pickup & Delivery', gold: 'Yes', silver: 'Yes', junior: 'Yes' },
    { label: 'Member Events', gold: 'All Club Events', silver: 'Standard Events', junior: 'Junior & Youth Events' },
    { label: 'Training / Coaching', gold: 'Premium VIP Access', silver: 'Standard Coaching', junior: 'Junior Programs' },
    { label: 'Recommended For', gold: 'Frequent players & athletes', silver: 'Casual & regular players', junior: 'Young players under 18' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Membership Plans & Benefits"
        subtitle="Automated access control, court discounts, sports shop privileges, and cafeteria savings."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Memberships' }]}
        action={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="secondary" icon={RefreshCw} onClick={fetchData} loading={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Active Membership Status Card */}
        {myMembership && myMembership.plan && (
        <Card
          style={{
            marginBottom: '2.5rem',
            border: '2px solid #D98E68',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(217, 142, 104, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(217, 142, 104, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={30} color="#D98E68" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#17263B' }}>
                    My Membership: {myMembership.plan?.name} Tier
                  </h3>
                  <Badge variant={myMembership.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {myMembership.status}
                  </Badge>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  Valid until:{' '}
                  <strong>{new Date(myMembership.expiryDate || myMembership.endDate).toLocaleDateString()}</strong> (
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(myMembership.expiryDate || myMembership.endDate) - new Date()) / (1000 * 60 * 60 * 24)
                    )
                  )}{' '}
                  days remaining)
                </p>
              </div>
            </div>

            {/* Active Plan Discount Metrics */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', padding: '0.5rem 1rem', backgroundColor: '#F4F6FC', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: 700 }}>
                  COURT DISCOUNT
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#354962', fontFamily: "'JetBrains Mono', monospace" }}>
                  {myMembership.plan?.benefits?.courtDiscount ?? myMembership.plan?.courtDiscount ?? 0}% OFF
                </span>
              </div>

              <div style={{ textAlign: 'center', padding: '0.5rem 1rem', backgroundColor: '#F4F6FC', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: 700 }}>
                  SHOP DISCOUNT
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D98E68', fontFamily: "'JetBrains Mono', monospace" }}>
                  {myMembership.plan?.benefits?.shopDiscount ?? myMembership.plan?.shopDiscount ?? 0}% OFF
                </span>
              </div>

              <div style={{ textAlign: 'center', padding: '0.5rem 1rem', backgroundColor: '#F4F6FC', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: 700 }}>
                  CAFE DISCOUNT
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#8FAF98', fontFamily: "'JetBrains Mono', monospace" }}>
                  {myMembership.plan?.benefits?.cafeDiscount ?? myMembership.plan?.canteenDiscount ?? 0}% OFF
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Past Memberships History Section */}
      {pastMemberships && pastMemberships.length > 0 && (
        <div style={{ marginBottom: '2.5rem', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#17263B' }}>
                Previous Membership Subscriptions & Renewals
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                Your completed and expired membership terms at Champions Club
              </p>
            </div>
            <Badge variant="secondary">{pastMemberships.length} Past Term(s)</Badge>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {pastMemberships.map((pm, idx) => (
              <div
                key={pm._id || idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1.15rem',
                  backgroundColor: '#F4F6FC',
                  borderRadius: '10px',
                  border: '1px solid #DDE2EC',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#17263B' }}>
                      {pm.plan?.name || 'Membership'} Tier
                    </strong>
                    <Badge variant="secondary" size="sm">
                      {pm.status || 'EXPIRED'}
                    </Badge>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Valid from {new Date(pm.startDate).toLocaleDateString()} to {new Date(pm.endDate || pm.expiryDate).toLocaleDateString()}
                    {pm.paymentMethod && ` • Paid via ${pm.paymentMethod}`}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '1rem', color: '#17263B' }}>₹{pm.amountPaid || pm.plan?.price || 0}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#137333', fontWeight: 700 }}>
                    Payment: {pm.paymentStatus || 'PAID'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <Loader text="Loading membership plans..." />
      ) : (
        <>
          {/* Plan Cards Grid: 🥇 Gold, 🥈 Silver, 🧒 Junior */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
              marginBottom: '3rem',
            }}
          >
            {plans.map((plan) => {
              const tierKey = getMembershipTierKey(plan.name);
              const planName = tierKey === 'GOLD' ? 'GOLDEN' : (tierKey || plan.name || '').toUpperCase();
              const isCurrent = myMembership?.plan?._id === plan._id;
              const isGold = tierKey === 'GOLD';
              const isJunior = tierKey === 'JUNIOR';

              const courtDisc = plan.benefits?.courtDiscount ?? plan.courtDiscount ?? 0;
              const shopDisc = plan.benefits?.shopDiscount ?? plan.shopDiscount ?? 0;
              const cafeDisc = plan.benefits?.cafeDiscount ?? plan.benefits?.canteenDiscount ?? plan.canteenDiscount ?? 0;

              return (
                <div
                  key={plan._id}
                  style={{
                    position: 'relative',
                    borderRadius: '18px',
                    padding: '2.25rem 2rem',
                    backgroundColor: '#FFFFFF',
                    border: isGold
                      ? '2px solid #D98E68'
                      : '1px solid #DDE2EC',
                    boxShadow: isGold
                      ? '0 12px 36px rgba(217, 142, 104, 0.15)'
                      : '0 6px 20px rgba(53, 73, 98, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isGold && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-13px',
                        right: '24px',
                        backgroundColor: '#D98E68',
                        color: '#FFFFFF',
                        padding: '4px 14px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                      }}
                    >
                      RECOMMENDED
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Crown size={22} color={isGold ? '#D98E68' : isJunior ? '#8FAF98' : '#354962'} />
                      <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#17263B' }}>
                        {planName} TIER
                      </h3>
                    </div>

                    <p style={{ margin: '0 0 1.25rem 0', color: '#64748B', fontSize: '0.88rem', lineHeight: 1.5, minHeight: '42px' }}>
                      {plan.description ||
                        (isGold
                          ? 'Full club experience for regular athletes & frequent players.'
                          : isJunior
                          ? 'Young athlete tier (under 18) with youth coaching and junior courts.'
                          : 'Standard membership with discounted courts and member pricing.')}
                    </p>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                      <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#17263B', fontFamily: "'JetBrains Mono', monospace" }}>
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span style={{ color: '#64748B', fontSize: '0.88rem' }}>
                        / {plan.durationInDays || plan.duration || 365} days
                      </span>
                    </div>

                    {/* Benefit Checklist */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        borderTop: '1px solid #DDE2EC',
                        paddingTop: '1.25rem',
                        marginBottom: '1.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#17263B' }}>
                        <CheckCircle2 size={16} color="#8FAF98" />
                        <span><strong>{courtDisc}% Court Booking Discount</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#17263B' }}>
                        <CheckCircle2 size={16} color="#8FAF98" />
                        <span><strong>{shopDisc}% OFF</strong> Pro Gear Shop</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#17263B' }}>
                        <CheckCircle2 size={16} color="#8FAF98" />
                        <span><strong>{cafeDisc}% OFF</strong> Sports Cafe & Lounge</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#17263B' }}>
                        <CheckCircle2 size={16} color="#8FAF98" />
                        <span><strong>Unlimited Court Bookings</strong> Allocation</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#17263B' }}>
                        <CheckCircle2 size={16} color="#8FAF98" />
                        <span>{isGold ? 'High Booking Priority (48h advance)' : 'Standard Booking Priority (24h)'}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#17263B' }}>
                        <CheckCircle2 size={16} color="#8FAF98" />
                        <span>{isGold ? 'Premium VIP Training & Clinics' : isJunior ? 'Junior Coaching Academy' : 'Regular Club Events'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <Button
                        variant="outline"
                        fullWidth
                        disabled
                        style={{ height: '44px', fontWeight: 700, borderRadius: '10px' }}
                      >
                        Current Active Plan
                      </Button>
                    ) : (
                      <Button
                        variant={isGold ? 'primary' : 'outline'}
                        fullWidth
                        onClick={() => handleSubscribeClick(plan)}
                        style={{
                          backgroundColor: isGold ? '#D98E68' : '#FFFFFF',
                          borderColor: isGold ? '#D98E68' : '#DDE2EC',
                          color: isGold ? '#FFFFFF' : '#17263B',
                          height: '44px',
                          fontWeight: 700,
                          borderRadius: '10px',
                        }}
                      >
                        {myMembership ? 'Switch to this Plan' : 'Subscribe Now'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Complete Feature Comparison Table */}
          <Card title="Detailed Membership Feature Comparison">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #DDE2EC', textAlign: 'left' }}>
                    <th style={{ padding: '1rem 0.75rem', color: '#64748B', fontWeight: 700 }}>Feature / Privilege</th>
                    <th style={{ padding: '1rem 0.75rem', color: '#D98E68', fontWeight: 800 }}>🥇 Golden Tier</th>
                    <th style={{ padding: '1rem 0.75rem', color: '#354962', fontWeight: 800 }}>🥈 Silver Tier</th>
                    <th style={{ padding: '1rem 0.75rem', color: '#8FAF98', fontWeight: 800 }}>🧒 Junior Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={row.label}
                      style={{
                        borderBottom: '1px solid #DDE2EC',
                        backgroundColor: row.highlight ? 'rgba(217, 142, 104, 0.05)' : idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                      }}
                    >
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: row.highlight ? 700 : 600, color: '#17263B' }}>
                        {row.label}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: row.highlight ? 800 : 500, color: row.highlight ? '#D98E68' : '#2D4159' }}>
                        {row.gold}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: row.highlight ? 800 : 500, color: row.highlight ? '#354962' : '#2D4159' }}>
                        {row.silver}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: row.highlight ? 800 : 500, color: row.highlight ? '#8FAF98' : '#2D4159' }}>
                        {row.junior}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pricing & Access Workflow Diagram */}
          <div style={{ marginTop: '2.5rem' }}>
            <Card title="How Membership Automatically Powers the System">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: '#F4F6FC', borderRadius: '12px', border: '1px solid #DDE2EC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#354962', fontWeight: 800 }}>
                    <Calendar size={18} color="#354962" />
                    <span>1. Court Bookings</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5 }}>
                    Court slots automatically apply the member discount (20% Gold, 10% Silver, 15% Junior) and enforce the daily maximum 2-booking ceiling.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#F4F6FC', borderRadius: '12px', border: '1px solid #DDE2EC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#D98E68', fontWeight: 800 }}>
                    <ShoppingBag size={18} color="#D98E68" />
                    <span>2. Sports Pro Shop</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5 }}>
                    Gear purchases apply member discount at checkout (15% Gold, 10% Silver, 10% Junior). Original inventory prices stay intact.
                  </p>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#F4F6FC', borderRadius: '12px', border: '1px solid #DDE2EC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#8FAF98', fontWeight: 800 }}>
                    <Coffee size={18} color="#8FAF98" />
                    <span>3. Cafe & Canteen</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5 }}>
                    Food, shakes, and dining tabs automatically calculate member discounts (15% Gold, 5% Silver, 10% Junior) on invoice generation.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Subscribe Modal */}
      <Modal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        title={`Subscribe to ${selectedPlan?.name} Tier`}
      >
        <form onSubmit={handleSubscribeSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748B' }}>
              You are subscribing to <strong>{selectedPlan?.name} Membership</strong> at <strong>₹{selectedPlan?.price?.toLocaleString()}</strong> for{' '}
              {selectedPlan?.durationInDays || selectedPlan?.duration || 365} days.
            </p>

            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: 'upi', label: 'UPI (Google Pay / PhonePe / Paytm)' },
                { value: 'card', label: 'Credit / Debit Card' },
                { value: 'cash', label: 'Cash at Front Desk' },
                { value: 'netbanking', label: 'Net Banking' },
              ]}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setIsSubscribeOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={actionLoading}
              style={{ backgroundColor: '#D98E68', borderColor: '#D98E68', color: '#FFFFFF', fontWeight: 700 }}
            >
              Pay ₹{selectedPlan?.price?.toLocaleString()} & Activate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reusable Payment Modal for Membership Subscription */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        amount={selectedPlan?.price || pendingMembership?.amountPaid || 0}
        purpose="MEMBERSHIP"
        referenceId={pendingMembership?._id}
        title="Activate Membership Plan"
        subtitle={`${selectedPlan?.name} Plan • ${selectedPlan?.durationInDays || 365} Days Validity`}
        itemDetails={{
          planName: selectedPlan?.name,
          duration: `${selectedPlan?.durationInDays || 365} Days`,
          courtDiscount: `${selectedPlan?.courtDiscount || selectedPlan?.benefits?.courtDiscount || 0}% OFF`,
          shopDiscount: `${selectedPlan?.shopDiscount || selectedPlan?.benefits?.shopDiscount || 0}% OFF`,
          cafeDiscount: `${selectedPlan?.canteenDiscount || selectedPlan?.benefits?.cafeDiscount || 0}% OFF`,
          totalAmount: `₹${Number(selectedPlan?.price || 0).toLocaleString('en-IN')}`,
        }}
        onSuccess={(payment) => {
          toastSuccess(`Payment confirmed! Your ${selectedPlan?.name} membership is now active!`, 'Membership Activated');
          setPaymentModalOpen(false);
          fetchData();
        }}
        onFailure={() => {
          toastError('Membership payment failed or was cancelled.');
        }}
      />
      </div>
    </DashboardLayout>
  );
};

export default MembershipsPage;
