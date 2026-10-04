import React, { useState, useEffect, useRef } from 'react';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import FilterDropdown from '../../../components/ui/FilterDropdown';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Shield,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  ShoppingBag,
  Coffee,
  CheckCircle2,
  XCircle,
  X,
  Award,
} from 'lucide-react';

export const Members = () => {
  const { toastSuccess, toastError } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const membersRequestId = useRef(0);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'MALE',
    street: '',
    city: 'Ahmedabad',
    pincode: '380015',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse',
    planName: 'GOLD',
  });

  const fetchMembers = async () => {
    const requestId = ++membersRequestId.current;
    try {
      setLoading(true);
      const res = await managerService.getMembers({ search, status: statusFilter });
      if (requestId === membersRequestId.current && res.success && res.data) {
        setMembers(res.data);
      }
    } catch (err) {
      if (requestId === membersRequestId.current) toastError('Failed to fetch members');
    } finally {
      if (requestId === membersRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => fetchMembers(), search.trim() ? 250 : 0);
    return () => {
      window.clearTimeout(timer);
      membersRequestId.current += 1;
    };
  }, [search, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.createMember(formData);
      if (res.success) {
        toastSuccess(`Member ${formData.firstName} added successfully with ${formData.planName} plan!`);
        setShowAddModal(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dob: '',
          gender: 'MALE',
          street: '',
          city: 'Ahmedabad',
          pincode: '380015',
          emergencyName: '',
          emergencyPhone: '',
          emergencyRelation: 'Spouse',
          planName: 'GOLD',
        });
        fetchMembers();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await managerService.toggleMemberStatus(id);
      if (res.success) {
        toastSuccess(res.message);
        fetchMembers();
      }
    } catch (err) {
      toastError('Failed to toggle status');
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setSelectedMemberId(id);
      setDetailTab('overview');
      const res = await managerService.getMemberById(id);
      if (res.success && res.data) {
        setMemberDetails(res.data);
      }
    } catch (err) {
      toastError('Failed to load member profile');
    }
  };

  const memberMemberships = memberDetails?.memberships || [];
  const membershipNow = new Date();
  const isCurrentMembership = (membership) => {
    const startsAt = membership.startDate ? new Date(membership.startDate) : null;
    const endsAt = membership.expiryDate || membership.endDate ? new Date(membership.expiryDate || membership.endDate) : null;
    return membership.status === 'ACTIVE'
      && (!startsAt || startsAt <= membershipNow)
      && (!endsAt || endsAt >= membershipNow);
  };
  const currentMemberships = memberMemberships.filter(isCurrentMembership);
  const pastMemberships = memberMemberships.filter((membership) => !isCurrentMembership(membership));

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Member Management
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Directory of club athletes, active memberships, emergency contacts, and usage history.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: '#D98E68',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(217, 142, 104, 0.25)',
          }}
        >
          <Plus size={16} /> + Add Member
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          backgroundColor: '#FFFFFF',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid #DDE2EC',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '0.5rem', minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, backgroundColor: '#F4F6FC', borderRadius: '8px', padding: '0 0.75rem', border: '1px solid #DDE2EC' }}>
            <Search size={16} color="#64748B" />
            <input
              type="text"
              placeholder="Search by name, email, phone or member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                padding: '0.6rem 0.5rem',
                fontSize: '0.88rem',
                width: '100%',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '0 1rem',
              backgroundColor: '#354962',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>

        <FilterDropdown label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
          { value: '', label: 'All statuses' },
          { value: 'ACTIVE', label: 'Active only' },
          { value: 'INACTIVE', label: 'Inactive only' },
        ]} />
      </div>

      {/* Members Datatable */}
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
              <th style={{ padding: '0.85rem 1rem' }}>Member</th>
              <th style={{ padding: '0.85rem 1rem' }}>Member ID</th>
              <th style={{ padding: '0.85rem 1rem' }}>Contact</th>
              <th style={{ padding: '0.85rem 1rem' }}>Plan Tier</th>
              <th style={{ padding: '0.85rem 1rem' }}>Plan Expiry</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                  Loading member directory...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>
                  No members found matching your search.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                    {m.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962', fontWeight: 600 }}>
                    <span style={{ backgroundColor: '#E8EAF4', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                      {m.memberId}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>
                    <div>{m.email}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{m.phone}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        backgroundColor: m.plan?.toUpperCase().includes('GOLD')
                          ? 'rgba(217, 142, 104, 0.18)'
                          : 'rgba(56, 189, 248, 0.15)',
                        color: m.plan?.toUpperCase().includes('GOLD') ? '#D98E68' : '#0284c7',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        padding: '3px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {m.plan}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962' }}>
                    {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Dec 2026'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        backgroundColor: m.status === 'ACTIVE' ? 'rgba(143, 175, 152, 0.2)' : '#F6DEDE',
                        color: m.status === 'ACTIVE' ? '#8FAF98' : '#D97979',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleViewDetails(m.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: '0.4rem 0.65rem',
                          backgroundColor: '#F4F6FC',
                          border: '1px solid #DDE2EC',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#354962',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={() => handleToggleStatus(m.id)}
                        style={{
                          padding: '0.4rem 0.65rem',
                          backgroundColor: m.status === 'ACTIVE' ? '#F6DEDE' : 'rgba(143, 175, 152, 0.2)',
                          color: m.status === 'ACTIVE' ? '#D97979' : '#8FAF98',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {m.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
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
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              border: '1px solid #DDE2EC',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#17263B' }}>
                  Register New Club Member
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Creates User, MemberProfile & Membership Plan Assignment
                </span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D98E68', marginBottom: '0.5rem' }}>
                1. PERSONAL INFORMATION
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Rahul"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g. Mehta"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@club.com"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D98E68', margin: '1rem 0 0.5rem 0' }}>
                2. MEMBERSHIP PLAN ASSIGNMENT
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Select Membership Plan</label>
                <select
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                >
                  <option value="GOLD">Gold Tier (₹20,000/yr - 50% Court Disc, 10% Shop/Cafe)</option>
                  <option value="SILVER">Silver Tier (₹12,000/yr - 25% Court Disc, 5% Shop)</option>
                  <option value="JUNIOR">Junior Tier (₹8,000/yr - Youth Program)</option>
                </select>
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#D98E68', margin: '1rem 0 0.5rem 0' }}>
                3. EMERGENCY CONTACT
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    placeholder="e.g. Anjali Mehta"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Emergency Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="e.g. 9825012345"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#F4F6FC',
                    border: '1px solid #DDE2EC',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.5rem',
                    backgroundColor: '#D98E68',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm & Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Drawer/Modal */}
      {selectedMemberId && memberDetails && (
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
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              border: '1px solid #DDE2EC',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#17263B' }}>
                    {memberDetails.user.name}
                  </h2>
                  <span style={{ backgroundColor: '#E8EAF4', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#354962' }}>
                    {memberDetails.profile?.memberId}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>
                  {memberDetails.user.email} • {memberDetails.user.phone}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedMemberId(null);
                  setMemberDetails(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #DDE2EC', marginBottom: '1.25rem', overflowX: 'auto' }}>
              {['overview', 'memberships', 'bookings', 'shop orders', 'canteen orders', 'invoices'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  style={{
                    padding: '0.5rem 0.85rem',
                    border: 'none',
                    background: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    color: detailTab === tab ? '#D98E68' : '#64748B',
                    borderBottom: detailTab === tab ? '2px solid #D98E68' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {detailTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ backgroundColor: '#F4F6FC', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#354962', marginBottom: '0.5rem' }}>CURRENT MEMBERSHIP</div>
                  {memberDetails.currentMembership ? <>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D98E68' }}>
                      {memberDetails.currentMembership.plan?.name || 'Membership'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.3rem' }}>
                      Status: <strong style={{ color: '#8FAF98' }}>{memberDetails.currentMembership.status}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
                      Valid through {new Date(memberDetails.currentMembership.expiryDate || memberDetails.currentMembership.endDate).toLocaleDateString()}
                    </div>
                  </> : <div style={{ fontSize: '0.9rem', color: '#64748B' }}>No active membership.</div>}
                </div>

                <div style={{ backgroundColor: '#F4F6FC', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#354962', marginBottom: '0.5rem' }}>EMERGENCY CONTACT</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#17263B' }}>
                    {memberDetails.profile?.emergencyContact?.name || '—'}{memberDetails.profile?.emergencyContact?.relation ? ` (${memberDetails.profile.emergencyContact.relation})` : ''}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.3rem' }}>
                    {memberDetails.profile?.emergencyContact?.phone || 'No emergency phone recorded'}
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'memberships' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {memberMemberships.length === 0 ? (
                  <div style={{ padding: '2.25rem 1rem', textAlign: 'center', color: '#64748B', backgroundColor: '#F4F6FC', borderRadius: '10px' }}>
                    <strong style={{ display: 'block', color: '#354962', marginBottom: '0.35rem' }}>No membership records</strong>
                    This member has no current or past memberships.
                  </div>
                ) : <>
                  <section>
                    <h3 style={{ margin: '0 0 0.65rem', fontSize: '0.95rem', color: '#17263B' }}>Current membership</h3>
                    {currentMemberships.length === 0 ? (
                      <div style={{ padding: '1rem', color: '#64748B', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>No active membership at this time.</div>
                    ) : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                      {currentMemberships.map((membership) => (
                        <div key={membership._id} style={{ padding: '0.9rem 1rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '9px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                            <strong style={{ color: '#17263B' }}>{membership.plan?.name || 'Membership'}</strong>
                            <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', backgroundColor: '#E7F2E9', color: '#527A5A', fontSize: '0.72rem', fontWeight: 700 }}>ACTIVE</span>
                          </div>
                          <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', lineHeight: 1.7, color: '#64748B' }}>
                            <div>Started: {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : '—'}</div>
                            <div>Expires: {membership.expiryDate || membership.endDate ? new Date(membership.expiryDate || membership.endDate).toLocaleDateString() : '—'}</div>
                            <div>Paid: ₹{Number(membership.amountPaid ?? 0).toLocaleString()} · {membership.paymentStatus || 'Payment status unavailable'}</div>
                          </div>
                        </div>
                      ))}
                    </div>}
                  </section>
                  <section>
                    <h3 style={{ margin: '0 0 0.65rem', fontSize: '0.95rem', color: '#17263B' }}>Past membership history</h3>
                    {pastMemberships.length === 0 ? (
                      <div style={{ padding: '1rem', color: '#64748B', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>No past memberships recorded.</div>
                    ) : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {pastMemberships.map((membership) => {
                        const expiryDate = membership.expiryDate || membership.endDate;
                        const derivedStatus = membership.status === 'ACTIVE' && expiryDate && new Date(expiryDate) < membershipNow
                          ? 'EXPIRED'
                          : membership.status || 'STATUS UNAVAILABLE';
                        return (
                          <div key={membership._id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '0.8rem 1rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                            <div>
                              <strong style={{ color: '#17263B' }}>{membership.plan?.name || 'Membership'}</strong>
                              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                                {membership.startDate ? new Date(membership.startDate).toLocaleDateString() : '—'} – {expiryDate ? new Date(expiryDate).toLocaleDateString() : '—'}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748B' }}>
                              <strong style={{ color: '#354962' }}>{derivedStatus}</strong>
                              <div>Paid: ₹{Number(membership.amountPaid ?? 0).toLocaleString()}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>}
                  </section>
                </>}
              </div>
            )}

            {detailTab === 'bookings' && (
              <div>
                {memberDetails.bookings?.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No court bookings found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {memberDetails.bookings?.map((b) => (
                      <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                        <div>
                          <strong>{b.court?.name || 'Tennis Court'}</strong> • {new Date(b.date).toLocaleDateString()}
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{b.startTime} - {b.endTime}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: '#17263B' }}>₹{b.finalAmount}</span>
                          <div style={{ fontSize: '0.75rem', color: '#8FAF98', fontWeight: 700 }}>{b.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {detailTab === 'invoices' && (
              <div>
                {memberDetails.invoices?.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>No invoices recorded yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {memberDetails.invoices?.map((inv) => (
                      <div key={inv._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                        <div>
                          <strong>{inv.invoiceNumber}</strong> ({inv.type})
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Paid on {new Date(inv.paidDate || inv.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: '#17263B' }}>₹{inv.totalAmount}</span>
                          <div style={{ fontSize: '0.75rem', color: '#8FAF98', fontWeight: 700 }}>{inv.paymentStatus}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
