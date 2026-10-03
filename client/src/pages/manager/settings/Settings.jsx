import React, { useState, useEffect } from 'react';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import {
  Settings as SettingsIcon,
  Save,
  Building,
  Calendar,
  Award,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

export const Settings = () => {
  const { toastSuccess, toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    clubName: 'Champions Sports Club & Complex',
    contactEmail: 'support@championsclub.com',
    contactPhone: '+91 98765 43210',
    address: '100 Olympic Boulevard, Sports Complex, SG Highway, Ahmedabad',
    sessionDurationMinutes: 60,
    slotIntervalMinutes: 30,
    maxBookingsPerMemberPerDay: 2,
    membershipGracePeriodDays: 7,
    taxRatePercent: 18,
    currencySymbol: '₹',
    allowWalkInBookings: true,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await managerService.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      toastError('Failed to fetch club settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await managerService.updateSettings(settings);
      if (res.success) {
        toastSuccess('Club rules & settings updated successfully!');
      }
    } catch (err) {
      toastError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
          Club Configuration & Business Rules
        </h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
          Configure court booking duration limits, membership grace policies, and complex contact credentials.
        </p>
      </div>

      <form onSubmit={handleSaveSettings}>
        {/* Section 1: Profile */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #DDE2EC', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#17263B' }}>
            <Building size={18} color="#D98E68" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Club Profile</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Club Legal Name</label>
              <input
                type="text"
                value={settings.clubName}
                onChange={(e) => setSettings({ ...settings, clubName: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Physical Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Section 2: Court Booking Rules */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #DDE2EC', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#17263B' }}>
            <Calendar size={18} color="#8FAF98" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Court Scheduling Rules</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Session Duration (Minutes)</label>
              <input
                type="number"
                value={settings.sessionDurationMinutes}
                onChange={(e) => setSettings({ ...settings, sessionDurationMinutes: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Slot Interval (Minutes)</label>
              <input
                type="number"
                value={settings.slotIntervalMinutes}
                onChange={(e) => setSettings({ ...settings, slotIntervalMinutes: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Max Bookings / Member / Day</label>
              <input
                type="number"
                value={settings.maxBookingsPerMemberPerDay}
                onChange={(e) => setSettings({ ...settings, maxBookingsPerMemberPerDay: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Membership & Tax Rules */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #DDE2EC', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#17263B' }}>
            <Award size={18} color="#0284c7" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Membership & Tax Policies</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Grace Period After Expiration (Days)</label>
              <input
                type="number"
                value={settings.membershipGracePeriodDays}
                onChange={(e) => setSettings({ ...settings, membershipGracePeriodDays: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>GST Tax Rate (%)</label>
              <input
                type="number"
                value={settings.taxRatePercent}
                onChange={(e) => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              backgroundColor: '#D98E68',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(217, 142, 104, 0.25)',
            }}
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
