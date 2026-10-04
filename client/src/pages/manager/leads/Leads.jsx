import React, { useState, useEffect } from 'react';
import Pagination from '../../../components/common/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import {
  Users,
  Plus,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  X,
  Search,
  ArrowRight,
} from 'lucide-react';

export const LeadsManagement = () => {
  const { toastSuccess, toastError } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const leadsPage = usePagination(leads, 10);

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    interestedSport: 'TENNIS',
    interestedPlan: 'GOLD',
    message: '',
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await managerService.getLeads();
      if (res.success && res.data) {
        setLeads(res.data);
      }
    } catch (err) {
      toastError('Failed to fetch CRM leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.createLead(newLead);
      if (res.success) {
        toastSuccess(`Inquiry lead for ${newLead.name} created!`);
        setShowAddModal(false);
        fetchLeads();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create lead');
    }
  };

  const handleStatusUpdate = async (id, nextStatus) => {
    try {
      const res = await managerService.updateLeadStatus(id, { status: nextStatus });
      if (res.success) {
        toastSuccess(`Lead advanced to ${nextStatus}`);
        fetchLeads();
      }
    } catch (err) {
      toastError('Failed to update lead status');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Leads & Inquiries CRM
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Pipeline tracking for visitor enquiries, coaching trials, and membership conversions.
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
          <Plus size={16} /> + Add Inquiry Lead
        </button>
      </div>

      {/* Leads Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
              <th style={{ padding: '0.85rem 1rem' }}>Prospect Name</th>
              <th style={{ padding: '0.85rem 1rem' }}>Contact Details</th>
              <th style={{ padding: '0.85rem 1rem' }}>Interest</th>
              <th style={{ padding: '0.85rem 1rem' }}>Target Plan</th>
              <th style={{ padding: '0.85rem 1rem' }}>Inquiry Message</th>
              <th style={{ padding: '0.85rem 1rem' }}>Pipeline Status</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Advance Stage</th>
            </tr>
          </thead>
          <tbody>
            {leadsPage.paginatedItems.map((l) => (
              <tr key={l._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>{l.name}</td>
                <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>
                  <div>{l.email}</div>
                  <div style={{ fontSize: '0.78rem' }}>{l.phone}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontWeight: 600, color: '#354962' }}>{l.interestedSport}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ fontWeight: 700, color: '#D98E68' }}>{l.interestedPlan}</span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#64748B', maxWidth: '200px' }}>{l.message || '-'}</td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span
                    style={{
                      backgroundColor: l.status === 'CONVERTED_MEMBER'
                        ? 'rgba(143, 175, 152, 0.2)'
                        : l.status === 'TRIAL_BOOKED'
                        ? 'rgba(56, 189, 248, 0.15)'
                        : '#F7EBD4',
                      color: l.status === 'CONVERTED_MEMBER'
                        ? '#8FAF98'
                        : l.status === 'TRIAL_BOOKED'
                        ? '#0284c7'
                        : '#D9A65D',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {l.status?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                    {l.status === 'NEW' && (
                      <button
                        onClick={() => handleStatusUpdate(l._id, 'CONTACTED')}
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Contacted
                      </button>
                    )}
                    {l.status === 'CONTACTED' && (
                      <button
                        onClick={() => handleStatusUpdate(l._id, 'TRIAL_BOOKED')}
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Book Trial
                      </button>
                    )}
                    {l.status === 'TRIAL_BOOKED' && (
                      <button
                        onClick={() => handleStatusUpdate(l._id, 'CONVERTED_MEMBER')}
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: '#8FAF98', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Convert Member
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '0 1rem' }}><Pagination {...leadsPage} onPageChange={leadsPage.setCurrentPage} /></div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(23, 38, 59, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem', border: '1px solid #DDE2EC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#17263B' }}>
                Create Inquiry Lead
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Prospect Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="e.g. Karan Sharma"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Email *</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="e.g. karan@gmail.com"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="e.g. 9825012345"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Sport Interest</label>
                  <select
                    value={newLead.interestedSport}
                    onChange={(e) => setNewLead({ ...newLead, interestedSport: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  >
                    <option value="TENNIS">Tennis</option>
                    <option value="CRICKET">Box Cricket</option>
                    <option value="PADEL">Padel</option>
                    <option value="BADMINTON">Badminton</option>
                    <option value="ALL_SPORTS">All Sports</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Target Plan</label>
                  <select
                    value={newLead.interestedPlan}
                    onChange={(e) => setNewLead({ ...newLead, interestedPlan: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  >
                    <option value="GOLD">Gold VIP</option>
                    <option value="SILVER">Silver Standard</option>
                    <option value="JUNIOR">Junior Youth</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Message / Inquiry Notes</label>
                <input
                  type="text"
                  value={newLead.message}
                  onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                  placeholder="e.g. Inquiring for weekend private coaching"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManagement;
