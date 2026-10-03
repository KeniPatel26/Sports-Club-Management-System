import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  Briefcase,
  Bell,
  Key,
  ShieldCheck,
  CheckCircle,
  Calendar,
  LogOut,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import staffService from '../../../services/staffService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';

export const StaffProfileAttendance = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Shift & Attendance state
  const [checkedIn, setCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('08:55 AM');
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  // Password modal state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [resProf, resNotif] = await Promise.all([
        staffService.getMyProfile(),
        staffService.getNotifications(),
      ]);

      if (resProf?.success) {
        setProfile(resProf.data);
        if (resProf.data?.attendanceToday?.checkIn) {
          setCheckedIn(true);
          setCheckInTime(resProf.data.attendanceToday.checkIn);
        }
        if (resProf.data?.attendanceToday?.checkOut) {
          setCheckedIn(false);
          setCheckOutTime(resProf.data.attendanceToday.checkOut);
        }
      }
      if (resNotif?.success) {
        setNotifications(resNotif.data);
      }
    } catch (err) {
      console.error('Staff profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleCheckIn = async () => {
    setSubmittingAttendance(true);
    try {
      const res = await staffService.checkIn();
      if (res.success) {
        setCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setAlert({ type: 'success', message: res.message || 'Check-in recorded!' });
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to record check in' });
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const handleCheckOut = async () => {
    setSubmittingAttendance(true);
    try {
      const res = await staffService.checkOut();
      if (res.success) {
        setCheckedIn(false);
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setCheckOutTime(timeNow);
        setAlert({ type: 'info', message: res.message || 'Check-out recorded. Great shift!' });
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to record check out' });
    } finally {
      setSubmittingAttendance(false);
    }
  };

  if (loading && !profile) {
    return <Loader fullPage text="Loading Staff Profile & Attendance..." />;
  }

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            fontFamily: 'var(--font-family-display)',
            margin: 0,
          }}
        >
          Staff Profile & Shift Attendance
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
          Personal employment details, live shift attendance punch, and department notices
        </p>
      </div>

      {alert && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Grid: Profile & Attendance Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Left: Employment Profile Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--lavender)',
                color: 'var(--primary-navy)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              {profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'S'}
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                {profile?.name || `${user?.firstName} ${user?.lastName}`}
              </h2>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--light-peach)',
                  color: 'var(--primary-navy)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: '0.25rem',
                }}
              >
                {profile?.department || user?.department} • {profile?.designation || 'Staff Associate'}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
            }}
          >
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>EMPLOYEE ID</span>
              <strong>{profile?.employeeId || 'EMP004'}</strong>
            </div>

            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>STATUS</span>
              <strong style={{ color: 'var(--success)' }}>ACTIVE FULL-TIME</strong>
            </div>

            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>EMAIL</span>
              <span>{profile?.email || user?.email}</span>
            </div>

            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>PHONE</span>
              <span>{profile?.phone || '9876543210'}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>ASSIGNED SHIFT</span>
              <strong>{profile?.currentShift || '09:00 AM - 05:00 PM'}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>JOINING DATE</span>
              <span>01 Jan 2025</span>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <ShieldCheck size={16} color="var(--primary-navy)" />
            <span>
              Payroll, salary, and club configuration settings remain manager-only ERP functions.
            </span>
          </div>
        </div>

        {/* Right: Live Shift Attendance Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Today's Shift Attendance
              </h3>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: checkedIn ? 'var(--light-green)' : 'var(--bg-main)',
                  color: checkedIn ? 'var(--success)' : 'var(--text-muted)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {checkedIn ? 'PRESENT' : 'NOT PUNCHED'}
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shift Hours:</span>
                <strong>09:00 AM - 05:00 PM</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Check In:</span>
                <strong style={{ color: 'var(--success)' }}>{checkInTime || '--'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Check Out:</span>
                <strong style={{ color: 'var(--danger)' }}>{checkOutTime || '--'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={handleCheckIn}
              disabled={submittingAttendance || checkedIn}
              style={{
                padding: '0.65rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--success)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: submittingAttendance || checkedIn ? 'not-allowed' : 'pointer',
                opacity: checkedIn ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <LogIn size={15} /> Check In
            </button>

            <button
              onClick={handleCheckOut}
              disabled={submittingAttendance || !checkedIn}
              style={{
                padding: '0.65rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--danger)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: submittingAttendance || !checkedIn ? 'not-allowed' : 'pointer',
                opacity: !checkedIn ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <LogOut size={15} /> Check Out
            </button>
          </div>
        </div>
      </div>

      {/* Operational Notifications Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Bell size={18} color="var(--primary-peach)" />
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              margin: 0,
              fontFamily: 'var(--font-family-display)',
            }}
          >
            Operational Department Notifications
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n, idx) => (
            <div
              key={idx}
              style={{
                borderLeft: `4px solid ${
                  n.type === 'warning'
                    ? 'var(--warning)'
                    : n.type === 'success'
                    ? 'var(--success)'
                    : 'var(--primary-navy)'
                }`,
                backgroundColor: 'var(--bg-main)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)', display: 'block' }}>
                  {n.title}
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {n.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffProfileAttendance;
