import React, { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  Phone,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import leadService from '../services/leadService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';

export const LeadsCrmPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    interestedIn: 'MEMBERSHIP',
    message: '',
    source: 'WEBSITE',
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await leadService.getLeads();
      if (res.success) {
        setLeads(res.data || []);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to fetch prospective member enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await leadService.createLead(leadForm);
      if (res.success) {
        showSuccess('New prospective enquiry registered!');
        setIsAddLeadOpen(false);
        setLeadForm({
          name: '',
          email: '',
          phone: '',
          interestedIn: 'MEMBERSHIP',
          message: '',
          source: 'WEBSITE',
        });
        fetchLeads();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone?.includes(searchTerm)
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={28} color="var(--accent)" />
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>
              Website Enquiries & <span className="text-gradient">Visitor CRM</span>
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Never let a prospective member inquiry vanish. Track online trial session bookings, quote requests, and conversion pipelines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={RefreshCw} onClick={fetchLeads} loading={loading}>
            Refresh
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsAddLeadOpen(true)}>
            Record Inbound Enquiry
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Input
          placeholder="Search enquiries by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />
      </div>

      {loading ? (
        <Loader text="Fetching visitor leads..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredLeads.length === 0 ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <Card>
                <p style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)' }}>
                  No prospective enquiries found. Inbound website trial requests will appear here.
                </p>
              </Card>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <Card key={lead._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{lead.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Source: {lead.source || 'Website'}
                    </span>
                  </div>
                  <Badge variant={lead.status === 'NEW' ? 'primary' : 'success'}>
                    {lead.status}
                  </Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="var(--text-muted)" />
                    <span>{lead.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="var(--text-muted)" />
                    <span>{lead.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <span>
                      Interested in: <strong>{lead.interestedIn?.replace('_', ' ')}</strong>
                    </span>
                  </div>
                </div>

                {lead.message && (
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                      marginBottom: '1rem',
                    }}
                  >
                    "{lead.message}"
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Send}
                    onClick={() => showSuccess(`Follow-up quote invitation dispatched to ${lead.email}!`)}
                  >
                    Send Quote & Trial Pass
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal isOpen={isAddLeadOpen} onClose={() => setIsAddLeadOpen(false)} title="Record Website / Inbound Lead">
        <form onSubmit={handleAddLeadSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Visitor Name"
              placeholder="e.g. Ramesh Verma"
              value={leadForm.name}
              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Email"
                type="email"
                placeholder="ramesh@example.com"
                value={leadForm.email}
                onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                required
              />
              <Input
                label="Phone"
                placeholder="+91 98765 43210"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Select
                label="Interested In"
                value={leadForm.interestedIn}
                onChange={(e) => setLeadForm({ ...leadForm, interestedIn: e.target.value })}
                options={[
                  { value: 'MEMBERSHIP', label: 'Club Membership (Gold/Silver/Junior)' },
                  { value: 'TRIAL_SESSION', label: 'Free Trial Court Session' },
                  { value: 'COACHING', label: 'Tennis / Padel Coaching' },
                  { value: 'CORPORATE_EVENT', label: 'Corporate Tournament / Event' },
                ]}
                required
              />
              <Select
                label="Inquiry Source"
                value={leadForm.source}
                onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                options={[
                  { value: 'WEBSITE', label: 'Online Search / Website' },
                  { value: 'WALK_IN', label: 'Front Desk Walk-in' },
                  { value: 'REFERRAL', label: 'Existing Member Referral' },
                ]}
              />
            </div>

            <Input
              label="Inquiry Details / Message"
              placeholder="e.g. Looking for weekend padel court bookings for 4 friends"
              value={leadForm.message}
              onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" type="button" onClick={() => setIsAddLeadOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={actionLoading}>
              Save Lead & Dispatch Auto-Quote
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeadsCrmPage;
