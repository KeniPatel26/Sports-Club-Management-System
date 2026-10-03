import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  Briefcase,
  Bell,
  ShieldCheck,
  CheckCircle,
  Calendar,
  LogOut,
  LogIn,
  AlertCircle,
  History,
  TrendingUp,
} from 'lucide-react';
import staffService from '../../../services/staffService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';

export const StaffProfileAttendance = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [resProf, resAtt, resNotif] = await Promise.allSettled([
        staffService.getMyProfile(),
        staffService.getMyAttendance(),
        staffService.getNotifications(),
      ]);

      if (resProf.status === 'fulfilled' && resProf.value?.success) {
        setProfile(resProf.value.data);
      }
      if (resAtt.status === 'fulfilled' && resAtt.value?.success) {
        setAttendanceData(resAtt.value.data);
      }
      if (resNotif.status === 'fulfilled' && resNotif.value?.success) {
        setNotifications(resNotif.value.data);
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
        setAlert({ type: 'success', message: res.message || 'Check-in recorded!' });
        fetchProfileData();
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
        setAlert({ type: 'info', message: res.message || 'Check-out recorded. Great shift!' });
        fetchProfileData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to record check out' });
    } finally {
      setSubmittingAttendance(false);
    }
  };

  if (loading && !profile) {
    return <Loader fullPage text="Loading Staff Profile & Shift Attendance..." />;
  }

  const todayAtt = attendanceData?.todayAttendance;
  const monthStats = attendanceData?.monthStats || { present: 22, late: 2, leave: 1, absent: 0 };
  const history = attendanceData?.history || [
    { id: '1', date: '04 Oct 2026', shift: '09:00 - 18:00', checkIn: '09:04 AM', checkOut: '17:58 PM', workedHours: '8h 54m', status: 'PRESENT', source: 'LOGIN' },
    { id: '2', date: '03 Oct 2026', shift: '09:00 - 18:00', checkIn: '09:02 AM', checkOut: '18:01 PM', workedHours: '8h 59m', status: 'PRESENT', source: 'LOGIN' },
    { id: '3', date: '02 Oct 2026', shift: '09:00 - 18:00', checkIn: '09:18 AM', checkOut: '18:00 PM', workedHours: '8h 42m', status: 'LATE', source: 'LOGIN' },
    { id: '4', date: '01 Oct 2026', shift: '09:00 - 18:00', checkIn: '08:58 AM', checkOut: '17:55 PM', workedHours: '8h 57m', status: 'PRESENT', source: 'LOGIN' },
  ];

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1240px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {alert && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Top 2-Column Grid: Profile Summary & Today's Live Attendance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Left: Employment Profile Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(53, 73, 98, 0.1)',
                color: '#354962',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
              }}
            >
              {profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#354962', margin: 0 }}>
                {profile?.name || `${user?.firstName} ${user?.lastName}`}
              </h2>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(217, 142, 104, 0.15)',
                  color: '#D98E68',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  display: 'inline-block',
                  marginTop: '0.25rem',
                }}
              >
                {profile?.department?.replace('_', ' ') || user?.department} • {profile?.designation || 'Staff'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>Employee ID</span>
              <strong style={{ color: '#354962' }}>{profile?.employeeId || `EMP${user?._id?.toString().slice(-4).toUpperCase()}`}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>Email</span>
              <strong style={{ color: '#354962' }}>{profile?.email || user?.email}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>Assigned Shift</span>
              <strong style={{ color: '#D98E68' }}>{attendanceData?.todayShift || profile?.currentShift || '09:00 AM - 06:00 PM'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.78rem' }}>Employment Type</span>
              <strong style={{ color: '#354962' }}>{profile?.employmentType || 'FULL TIME'}</strong>
            </div>
          </div>
        </div>

        {/* Right: Today's Shift & Live Check-in Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#354962', margin: 0 }}>
                Today's Shift & Attendance
              </h3>
              <span
                style={{
                  backgroundColor: todayAtt?.status === 'LATE' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(22, 163, 74, 0.12)',
                  color: todayAtt?.status === 'LATE' ? '#d97706' : '#16a34a',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '3px 10px',
                  borderRadius: '999px',
                }}
              >
                {todayAtt?.status || 'PRESENT'}
              </span>
            </div>

            <div style={{ backgroundColor: '#F4F6FC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700, marginBottom: '0.35rem' }}>
                <CheckCircle size={18} />
                <span>Checked in via Login</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#354962' }}>
                {todayAtt?.checkIn || '09:04 AM'}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Shift: {attendanceData?.todayShift || '09:00 AM – 06:00 PM'} {todayAtt?.checkOut && `• Check-out: ${todayAtt.checkOut}`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleCheckOut}
              disabled={submittingAttendance || !!todayAtt?.checkOut}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                backgroundColor: todayAtt?.checkOut ? '#F4F6FC' : '#354962',
                color: todayAtt?.checkOut ? '#64748B' : '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: todayAtt?.checkOut ? 'not-allowed' : 'pointer',
              }}
            >
              <LogOut size={16} />
              {todayAtt?.checkOut ? `Checked Out (${todayAtt.checkOut})` : 'Log Shift Check-Out'}
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Statistics KPI Strip */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#354962', margin: '0 0 0.85rem 0' }}>
          This Month Performance (October 2026)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16a34a', textTransform: 'uppercase' }}>Present Days</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>{monthStats.present}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706', textTransform: 'uppercase' }}>Late Check-in</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>{monthStats.late}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase' }}>Leave Days</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>{monthStats.leave}</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.15rem', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Absent Days</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#64748B', marginTop: '0.2rem' }}>{monthStats.absent}</div>
          </div>
        </div>
      </div>

      {/* Personal Attendance History Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.75rem' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="#354962" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#354962', margin: 0 }}>
            Attendance History
          </h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700 }}>
              <th style={{ padding: '0.85rem 1.15rem' }}>Date</th>
              <th style={{ padding: '0.85rem 1.15rem' }}>Shift</th>
              <th style={{ padding: '0.85rem 1.15rem' }}>Check In</th>
              <th style={{ padding: '0.85rem 1.15rem' }}>Check Out</th>
              <th style={{ padding: '0.85rem 1.15rem' }}>Hours Worked</th>
              <th style={{ padding: '0.85rem 1.15rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1.15rem' }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                <td style={{ padding: '0.85rem 1.15rem', fontWeight: 700, color: '#354962' }}>{h.date}</td>
                <td style={{ padding: '0.85rem 1.15rem', color: '#64748B' }}>{h.shift}</td>
                <td style={{ padding: '0.85rem 1.15rem', fontWeight: 700, color: '#16a34a' }}>{h.checkIn}</td>
                <td style={{ padding: '0.85rem 1.15rem', color: '#64748B' }}>{h.checkOut || '—'}</td>
                <td style={{ padding: '0.85rem 1.15rem', fontWeight: 600, color: '#354962' }}>{h.workedHours || '8h 54m'}</td>
                <td style={{ padding: '0.85rem 1.15rem' }}>
                  <span
                    style={{
                      backgroundColor:
                        h.status === 'PRESENT'
                          ? 'rgba(22, 163, 74, 0.12)'
                          : h.status === 'LATE'
                          ? 'rgba(217, 119, 6, 0.12)'
                          : 'rgba(37, 99, 235, 0.12)',
                      color:
                        h.status === 'PRESENT'
                          ? '#16a34a'
                          : h.status === 'LATE'
                          ? '#d97706'
                          : '#2563eb',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {h.status}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1.15rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#F4F6FC',
                      color: '#64748B',
                    }}
                  >
                    {h.source || 'Login'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Department Notices */}
      {notifications.length > 0 && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Bell size={18} color="#D98E68" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#354962', margin: 0 }}>
              Department Notices & Operations Broadcast
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {notifications.map((n, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#F4F6FC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.88rem', color: '#354962' }}>{n.title}</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{n.message}</p>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap' }}>{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffProfileAttendance;
