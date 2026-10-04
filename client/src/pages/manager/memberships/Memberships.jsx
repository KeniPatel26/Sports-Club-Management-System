import React, { useState, useEffect } from 'react';
import Pagination from '../../../components/common/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import {
  Award,
  RefreshCw,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  X,
  Search,
} from 'lucide-react';

const SUPPORTED_PLAN_TIERS = new Set(['GOLD', 'SILVER', 'JUNIOR']);
const isSupportedPlan = (plan) => {
  const tier = String(plan?.name || '').trim().toUpperCase().replace(/\s+(TIER|MEMBERSHIP)$/, '');
  return SUPPORTED_PLAN_TIERS.has(tier);
};

export const Memberships = () => {
  const { toastSuccess, toastError } = useToast();
  const [plans, setPlans] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'active' | 'expiring' | 'expired'
  const [loading, setLoading] = useState(true);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedMemberToRenew, setSelectedMemberToRenew] = useState(null);

  // Renewal State
  const [renewalData, setRenewalData] = useState({
    planId: '',
    durationDays: 365,
    paymentMethod: 'UPI',
    notes: 'Renewed by Club Manager',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, listRes] = await Promise.all([
        managerService.getPlans(),
        managerService.getMembershipsList(),
      ]);

      if (plansRes.success) setPlans((plansRes.data || []).filter(isSupportedPlan));
      if (listRes.success) setMemberships(listRes.data);
    } catch (err) {
      toastError('Failed to load memberships data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedMemberToRenew) return;
      const res = await managerService.assignOrRenewMembership({
        memberId: selectedMemberToRenew.memberId,
        planId: renewalData.planId || plans[0]?._id,
        durationDays: renewalData.durationDays,
        paymentMethod: renewalData.paymentMethod,
        notes: renewalData.notes,
      });

      if (res.success) {
        toastSuccess(`Membership renewed for ${selectedMemberToRenew.memberName}`);
        setShowRenewModal(false);
        fetchData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to renew membership');
    }
  };

  const expiringMemberships = memberships.filter(
    (m) => m.expiryCategory === 'EXPIRING_7_DAYS' || m.expiryCategory === 'EXPIRING_30_DAYS'
  );
  const activeMemberships = memberships.filter((m) => m.expiryCategory === 'ACTIVE');
  const expiredMemberships = memberships.filter((m) => m.expiryCategory === 'EXPIRED');
  const displayedMemberships = activeTab === 'active'
    ? activeMemberships
    : activeTab === 'expiring'
      ? expiringMemberships
      : expiredMemberships;
  const membershipPage = usePagination(displayedMemberships, 10, activeTab);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Membership Management
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Configure tier plans, track member renewal cycles, and manage expiration alerts.
          </p>
        </div>

      </div>

      {/* Overview KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#D98E68', textTransform: 'uppercase' }}>🥇 Gold Members</span>
            <Award size={18} color="#D98E68" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: '0.4rem 0 0.1rem 0' }}>
            {memberships.filter((m) => m.planName?.toUpperCase().includes('GOLD')).length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>20% Court • 15% Shop & Cafe</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#354962', textTransform: 'uppercase' }}>🥈 Silver Members</span>
            <Award size={18} color="#354962" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: '0.4rem 0 0.1rem 0' }}>
            {memberships.filter((m) => m.planName?.toUpperCase().includes('SILVER')).length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>10% Court • 10% Shop • 5% Cafe</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8FAF98', textTransform: 'uppercase' }}>🧒 Junior Members</span>
            <Award size={18} color="#8FAF98" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: '0.4rem 0 0.1rem 0' }}>
            {memberships.filter((m) => m.planName?.toUpperCase().includes('JUNIOR')).length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>15% Court • 10% Shop & Cafe</span>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>Active / Expiring</span>
            <Clock size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: '0.4rem 0 0.1rem 0' }}>
            {activeMemberships.length} <span style={{ fontSize: '0.9rem', color: '#EF4444', fontWeight: 600 }}>({expiringMemberships.length} expiring)</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Total enrolled members</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #DDE2EC', marginBottom: '1.5rem' }}>
        {[
          { id: 'plans', label: `Membership Plans (${plans.length})` },
          { id: 'active', label: `Active Memberships (${activeMemberships.length})` },
          { id: 'expiring', label: `Expiring Soon (${expiringMemberships.length})` },
          { id: 'expired', label: `Expired (${expiredMemberships.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              background: 'none',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: activeTab === tab.id ? '#D98E68' : '#64748B',
              borderBottom: activeTab === tab.id ? '2px solid #D98E68' : 'none',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Plans Grid Tab */}
      {activeTab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {plans.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#64748B', backgroundColor: '#FFFFFF', border: '1px solid #DDE2EC', borderRadius: '14px' }}>
              No Gold, Silver, or Junior membership plans are available.
            </div>
          ) : plans.map((p) => (
            <div
              key={p._id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #DDE2EC',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      backgroundColor: p.name.includes('GOLD') ? 'rgba(217, 142, 104, 0.18)' : 'rgba(56, 189, 248, 0.15)',
                      color: p.name.includes('GOLD') ? '#D98E68' : '#0284c7',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      padding: '4px 10px',
                      borderRadius: '999px',
                    }}
                  >
                    {p.name} TIER
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#8FAF98', fontWeight: 700 }}>
                    {p.isActive ? 'Active Plan' : 'Inactive'}
                  </span>
                </div>

                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#17263B', marginBottom: '0.25rem' }}>
                  ₹{p.price?.toLocaleString('en-IN')}{' '}
                  <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>/ {p.durationInDays || 365} days</span>
                </div>

                <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {p.description || 'Full sports complex access including tennis, padel, and clubhouse facilities.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid #EEF2F6', paddingTop: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#354962' }}>
                    <CheckCircle2 size={16} color="#8FAF98" />
                    <span><strong>{p.courtDiscount}% Court & Turf Booking Discount</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#354962' }}>
                    <CheckCircle2 size={16} color="#8FAF98" />
                    <span><strong>{p.shopDiscount}% Sports Pro-Shop Discount</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#354962' }}>
                    <CheckCircle2 size={16} color="#8FAF98" />
                    <span><strong>{p.canteenDiscount}% Canteen & Bar Lounge Discount</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Active / Expiring / Expired List Tab */}
      {activeTab !== 'plans' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Member Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Contact</th>
                <th style={{ padding: '0.85rem 1rem' }}>Plan Tier</th>
                <th style={{ padding: '0.85rem 1rem' }}>Start Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Expiry Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Discounts</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {membershipPage.paginatedItems.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                    {m.memberName}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>
                    <div>{m.email}</div>
                    <div style={{ fontSize: '0.78rem' }}>{m.phone}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: '#D98E68' }}>{m.planName}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962' }}>
                    {new Date(m.startDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962' }}>
                    {new Date(m.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748B' }}>
                    Courts {m.courtDiscount}% • Shop {m.shopDiscount}%
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedMemberToRenew(m);
                        setRenewalData({
                          planId: plans[0]?._id || '',
                          durationDays: 365,
                          paymentMethod: 'UPI',
                          notes: `Renewal for ${m.memberName}`,
                        });
                        setShowRenewModal(true);
                      }}
                      style={{
                        padding: '0.4rem 0.85rem',
                        backgroundColor: '#D98E68',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Renew
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '0 1rem' }}><Pagination {...membershipPage} onPageChange={membershipPage.setCurrentPage} /></div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && selectedMemberToRenew && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '1.75rem',
              border: '1px solid #DDE2EC',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#17263B' }}>
                Renew Membership: {selectedMemberToRenew.memberName}
              </h3>
              <button
                onClick={() => setShowRenewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Select Tier Plan</label>
                <select
                  value={renewalData.planId}
                  onChange={(e) => setRenewalData({ ...renewalData, planId: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                >
                  {plans.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (₹{p.price}/year)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Renewal Duration</label>
                <select
                  value={renewalData.durationDays}
                  onChange={(e) => setRenewalData({ ...renewalData, durationDays: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                >
                  <option value={365}>1 Year (365 Days)</option>
                  <option value={180}>6 Months (180 Days)</option>
                  <option value={90}>3 Months (90 Days)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Payment Method</label>
                <select
                  value={renewalData.paymentMethod}
                  onChange={(e) => setRenewalData({ ...renewalData, paymentMethod: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="CASH">Counter Cash</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  style={{ padding: '0.6rem 1.25rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.5rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Memberships;
