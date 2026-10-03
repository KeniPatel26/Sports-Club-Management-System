import React, { useState, useEffect } from 'react';
import {
  Crown,
  Shield,
  Sparkles,
  CheckCircle2,
  Calendar,
  CreditCard,
  Plus,
  RefreshCw,
  Search,
  Zap,
  Tag,
  Clock,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import membershipService from '../services/membershipService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';

export const MembershipsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [plans, setPlans] = useState([]);
  const [myMembership, setMyMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Subscribe modal state
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Create Plan modal state (Owner only)
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: 'GOLD',
    description: '',
    price: 10000,
    durationInDays: 365,
    courtDiscount: 100,
    shopDiscount: 20,
    canteenDiscount: 15,
    priorityBooking: true,
    fullCourtAccess: true,
  });

  const isOwner = user?.role === 'OWNER' || user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, myMemRes] = await Promise.allSettled([
        membershipService.getPlans(),
        membershipService.getMyMembership(),
      ]);

      if (plansRes.status === 'fulfilled' && plansRes.value.success) {
        setPlans(plansRes.value.data || []);
      }
      if (myMemRes.status === 'fulfilled' && myMemRes.value.success) {
        setMyMembership(myMemRes.value.data);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to load membership data');
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

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setActionLoading(true);
    try {
      const res = await membershipService.subscribeMembership({
        planId: selectedPlan._id,
        paymentMethod,
      });
      if (res.success) {
        showSuccess(`Successfully subscribed to ${selectedPlan.name} Membership! 🎉`);
        setIsSubscribeOpen(false);
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to process subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePlanSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await membershipService.createPlan({
        ...newPlan,
        price: Number(newPlan.price),
        durationInDays: Number(newPlan.durationInDays),
        courtDiscount: Number(newPlan.courtDiscount),
        shopDiscount: Number(newPlan.shopDiscount),
        canteenDiscount: Number(newPlan.canteenDiscount),
      });
      if (res.success) {
        showSuccess('New membership plan published!');
        setIsCreatePlanOpen(false);
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setActionLoading(false);
    }
  };

  const getPlanBadgeColor = (planName) => {
    switch (planName?.toUpperCase()) {
      case 'GOLD':
        return '#f59e0b';
      case 'SILVER':
        return '#94a3b8';
      case 'JUNIOR':
        return '#10b981';
      default:
        return 'var(--primary)';
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Hero Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Crown size={28} color="#f59e0b" />
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>
              The Champions Club <span className="text-gradient">Membership Tiers</span>
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '640px' }}>
            Gold (Full Access & Priority), Silver (Standard Club Member), and Junior (Under 18 Youth).
            Unlock court discounts, gear shop offers, and cafeteria lounge privileges.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={RefreshCw} onClick={fetchData} loading={loading}>
            Refresh
          </Button>
          {isOwner && (
            <Button variant="primary" icon={Plus} onClick={() => setIsCreatePlanOpen(true)}>
              Configure New Tier
            </Button>
          )}
        </div>
      </div>

      {/* Active Membership Status Banner */}
      {myMembership && (
        <Card
          style={{
            marginBottom: '2.5rem',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
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
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={32} color="#f59e0b" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                    Active Plan: {myMembership.plan?.name} Tier
                  </h3>
                  <Badge variant={myMembership.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {myMembership.status}
                  </Badge>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Valid until:{' '}
                  <strong>{new Date(myMembership.expiryDate).toLocaleDateString()}</strong> (
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(myMembership.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                    )
                  )}{' '}
                  days remaining)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                  Court Discount
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {myMembership.plan?.courtDiscount}% OFF
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                  Shop Discount
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>
                  {myMembership.plan?.shopDiscount}% OFF
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                  Bar / Canteen
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>
                  {myMembership.plan?.canteenDiscount}% OFF
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <Loader text="Loading membership plans..." />
      ) : (
        <>
          {/* Plan Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
              marginBottom: '3rem',
            }}
          >
            {plans.map((plan) => {
              const isCurrent = myMembership?.plan?._id === plan._id;
              const isGold = plan.name === 'GOLD';

              return (
                <div
                  key={plan._id}
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    backgroundColor: 'var(--bg-card)',
                    border: isGold
                      ? '2px solid rgba(245, 158, 11, 0.6)'
                      : '1px solid var(--border-color)',
                    boxShadow: isGold
                      ? '0 10px 25px -5px rgba(245, 158, 11, 0.15)'
                      : 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)',
                  }}
                >
                  {isGold && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '24px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        padding: '3px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                      }}
                    >
                      👑 MOST POPULAR
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Crown size={22} color={getPlanBadgeColor(plan.name)} />
                      <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>
                        {plan.name} PLAN
                      </h3>
                    </div>

                    <p style={{ margin: '0 0 1.25rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {plan.description ||
                        (isGold
                          ? 'Premium tier with zero court booking fees, 48h priority slots & VIP perks.'
                          : plan.name === 'SILVER'
                          ? 'Standard club membership with discounted courts and member pricing.'
                          : 'Under 18 youth athlete plan with special training rates.')}
                    </p>

                    <div style={{ marginBottom: '1.75rem' }}>
                      <span style={{ fontSize: '2.25rem', fontWeight: 900 }}>₹{plan.price}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {' '}
                        / {plan.durationInDays} days
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '1.25rem',
                        marginBottom: '1.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>
                          <strong>{plan.courtDiscount}% Court Fee Discount</strong>{' '}
                          {plan.courtDiscount === 100 && '(100% Free Sessions)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>
                          <strong>{plan.shopDiscount}% OFF</strong> at Pro Gear Shop
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>
                          <strong>{plan.canteenDiscount}% OFF</strong> at Bar Lounge & Canteen
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <CheckCircle2
                          size={16}
                          color={plan.priorityBooking ? '#10b981' : 'var(--text-subtle)'}
                        />
                        <span style={{ color: plan.priorityBooking ? 'inherit' : 'var(--text-subtle)' }}>
                          {plan.priorityBooking ? 'Priority 48-Hour Advanced Booking' : 'Standard 24-Hour Booking'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <CheckCircle2
                          size={16}
                          color={plan.fullCourtAccess ? '#10b981' : 'var(--text-subtle)'}
                        />
                        <span style={{ color: plan.fullCourtAccess ? 'inherit' : 'var(--text-subtle)' }}>
                          {plan.fullCourtAccess ? 'Full Multi-Court Access (Tennis + Turf + Padel)' : 'Restricted Court Access'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isCurrent ? (
                      <Button variant="outline" fullWidth disabled>
                        ✓ Current Active Plan
                      </Button>
                    ) : (
                      <Button
                        variant={isGold ? 'primary' : 'outline'}
                        fullWidth
                        onClick={() => handleSubscribeClick(plan)}
                      >
                        {myMembership ? 'Switch to this Plan' : 'Subscribe Now'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Operational FAQ / Problem Statement Highlights */}
          <Card title="🏆 Membership Policy & Automated Lifecycle">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700 }}>
                  📅 Automatic Expiry & WhatsApp Removal
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Expiry dates are calculated down to the exact second. Front desk and online booking systems automatically check validity at checkout, preventing unauthorized reservations.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700 }}>
                  🏸 Integrated Multi-Department Perks
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Discounts automatically apply across the Pro Gear Shop, Court Reservations, and Canteen Tabs without members having to present physical receipts or cards.
                </p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700 }}>
                  ⚡ Anti-Conflict 2-Booking Ceiling
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Every member is restricted to maximum 2 booking slots per day to ensure fair court distribution across all Champions Club athletes during peak evening hours.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Subscribe Modal */}
      <Modal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        title={`Subscribe: ${selectedPlan?.name} Tier`}
      >
        <form onSubmit={handleSubscribeSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              You are subscribing to <strong>{selectedPlan?.name}</strong> at <strong>₹{selectedPlan?.price}</strong> for{' '}
              {selectedPlan?.durationInDays} days.
            </p>

            <Select
              label="Select Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: 'upi', label: 'UPI / Google Pay / PhonePe' },
                { value: 'card', label: 'Credit / Debit Card' },
                { value: 'cash', label: 'Cash at Front Desk' },
                { value: 'online', label: 'Net Banking' },
              ]}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setIsSubscribeOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Pay ₹{selectedPlan?.price} & Activate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Owner Create Plan Modal */}
      <Modal
        isOpen={isCreatePlanOpen}
        onClose={() => setIsCreatePlanOpen(false)}
        title="Configure New Membership Tier"
      >
        <form onSubmit={handleCreatePlanSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Select
              label="Plan Tier Name"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              options={[
                { value: 'GOLD', label: 'GOLD' },
                { value: 'SILVER', label: 'SILVER' },
                { value: 'JUNIOR', label: 'JUNIOR' },
              ]}
              required
            />

            <Input
              label="Description"
              placeholder="e.g. Premium access with all court fees waived"
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Price (₹)"
                type="number"
                min="0"
                value={newPlan.price}
                onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                required
              />
              <Input
                label="Duration (Days)"
                type="number"
                min="1"
                value={newPlan.durationInDays}
                onChange={(e) => setNewPlan({ ...newPlan, durationInDays: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Court Disc (%)"
                type="number"
                min="0"
                max="100"
                value={newPlan.courtDiscount}
                onChange={(e) => setNewPlan({ ...newPlan, courtDiscount: e.target.value })}
              />
              <Input
                label="Shop Disc (%)"
                type="number"
                min="0"
                max="100"
                value={newPlan.shopDiscount}
                onChange={(e) => setNewPlan({ ...newPlan, shopDiscount: e.target.value })}
              />
              <Input
                label="Canteen (%)"
                type="number"
                min="0"
                max="100"
                value={newPlan.canteenDiscount}
                onChange={(e) => setNewPlan({ ...newPlan, canteenDiscount: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setIsCreatePlanOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembershipsPage;
