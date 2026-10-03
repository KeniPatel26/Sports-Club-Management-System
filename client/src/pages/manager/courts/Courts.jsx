import React, { useState, useEffect } from 'react';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import {
  Calendar,
  Plus,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  X,
  Filter,
} from 'lucide-react';

export const Courts = () => {
  const { toastSuccess, toastError } = useToast();
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('courts'); // 'courts' | 'bookings'
  const [loading, setLoading] = useState(true);
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);

  const [newCourt, setNewCourt] = useState({
    name: '',
    type: 'TENNIS',
    hourlyRate: 500,
    walkInRate: 800,
    isIndoor: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courtsRes, bookingsRes] = await Promise.all([
        managerService.getCourts(),
        managerService.getBookings(),
      ]);

      if (courtsRes.success) setCourts(courtsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
    } catch (err) {
      toastError('Failed to fetch courts and bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourt = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.createCourt(newCourt);
      if (res.success) {
        toastSuccess(`Court facility ${newCourt.name} created!`);
        setShowAddCourtModal(false);
        fetchData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create court');
    }
  };

  const handleToggleMaintenance = async (id) => {
    try {
      const res = await managerService.toggleCourtMaintenance(id);
      if (res.success) {
        toastSuccess(res.message);
        fetchData();
      }
    } catch (err) {
      toastError('Failed to toggle court maintenance');
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      const res = await managerService.cancelBooking(id);
      if (res.success) {
        toastSuccess(res.message);
        fetchData();
      }
    } catch (err) {
      toastError('Failed to cancel booking');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Courts & Booking Operations
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Court turf configurations, maintenance schedules, and live reservation monitoring.
          </p>
        </div>

        <button
          onClick={() => setShowAddCourtModal(true)}
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
          <Plus size={16} /> + Add Court
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #DDE2EC', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('courts')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            background: 'none',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: activeTab === 'courts' ? '#D98E68' : '#64748B',
            borderBottom: activeTab === 'courts' ? '2px solid #D98E68' : 'none',
            cursor: 'pointer',
          }}
        >
          Courts & Turfs ({courts.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            padding: '0.65rem 1.15rem',
            border: 'none',
            background: 'none',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: activeTab === 'bookings' ? '#D98E68' : '#64748B',
            borderBottom: activeTab === 'bookings' ? '2px solid #D98E68' : 'none',
            cursor: 'pointer',
          }}
        >
          Reservations & Bookings ({bookings.length})
        </button>
      </div>

      {/* 1. Courts Tab */}
      {activeTab === 'courts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {courts.map((c) => (
            <div
              key={c._id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #DDE2EC',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#0284c7',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      padding: '3px 10px',
                      borderRadius: '999px',
                    }}
                  >
                    {c.type}
                  </span>
                  <span
                    style={{
                      backgroundColor: c.isActive ? 'rgba(143, 175, 152, 0.2)' : '#F6DEDE',
                      color: c.isActive ? '#8FAF98' : '#D97979',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {c.isActive ? 'Active' : 'Maintenance'}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#17263B' }}>
                  {c.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
                  <div>• Member Hourly Rate: <strong style={{ color: '#17263B' }}>₹{c.hourlyRate}/hr</strong></div>
                  <div>• Walk-in Rate: <strong style={{ color: '#17263B' }}>₹{c.walkInRate}/hr</strong></div>
                  <div>• Facility Type: <strong style={{ color: '#17263B' }}>{c.isIndoor ? 'Indoor Air-Conditioned' : 'Outdoor Floodlit'}</strong></div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #EEF2F6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Capacity: 4 Players</span>
                <button
                  onClick={() => handleToggleMaintenance(c._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.45rem 0.85rem',
                    backgroundColor: c.isActive ? '#F6DEDE' : 'rgba(143, 175, 152, 0.2)',
                    color: c.isActive ? '#D97979' : '#8FAF98',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Wrench size={14} /> {c.isActive ? 'Place in Maintenance' : 'Set to Active'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Bookings Tab */}
      {activeTab === 'bookings' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Court</th>
                <th style={{ padding: '0.85rem 1rem' }}>Player / Member</th>
                <th style={{ padding: '0.85rem 1rem' }}>Date & Time</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                    {b.courtName}
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>{b.courtType}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962', fontWeight: 600 }}>
                    {b.memberName}
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{b.phone}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962' }}>
                    <div>{new Date(b.date).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{b.startTime} - {b.endTime}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ backgroundColor: '#E8EAF4', color: '#354962', fontWeight: 700, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px' }}>
                      {b.bookingType}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                    ₹{b.finalAmount}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        backgroundColor: b.status === 'CONFIRMED' ? 'rgba(143, 175, 152, 0.2)' : '#F6DEDE',
                        color: b.status === 'CONFIRMED' ? '#8FAF98' : '#D97979',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {b.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          backgroundColor: '#F6DEDE',
                          color: '#D97979',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Court Modal */}
      {showAddCourtModal && (
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
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#17263B' }}>
                Add New Court Facility
              </h3>
              <button
                onClick={() => setShowAddCourtModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourt}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Court Name *</label>
                <input
                  type="text"
                  required
                  value={newCourt.name}
                  onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                  placeholder="e.g. Center Court 1"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Sport Facility Type</label>
                <select
                  value={newCourt.type}
                  onChange={(e) => setNewCourt({ ...newCourt, type: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                >
                  <option value="TENNIS">Tennis Clay / Hard Court</option>
                  <option value="CRICKET">Box Cricket Turf</option>
                  <option value="PADEL">Padel Panoramic Glass Court</option>
                  <option value="BADMINTON">Badminton Wooden Court</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Member Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={newCourt.hourlyRate}
                    onChange={(e) => setNewCourt({ ...newCourt, hourlyRate: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Walk-in Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={newCourt.walkInRate}
                    onChange={(e) => setNewCourt({ ...newCourt, walkInRate: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCourtModal(false)}
                  style={{ padding: '0.6rem 1.25rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.5rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courts;
