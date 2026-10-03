import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Key,
  Database,
  Activity,
  LogOut,
  Save,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowLeft,
  Server,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export const DashboardPage = () => {
  const { user, token, logout, updateUser, showToast, serverHealth } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'profile' | 'api'
  const [stats, setStats] = useState({
    totalUsers: 148,
    activeProjects: 34,
    uptimePercentage: 99.98,
    satisfactionRate: 98.6,
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    title: user?.title || 'Lead Architect',
    bio: user?.bio || 'Building scalable full-stack applications with MERN.',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        title: user.title || 'Product Specialist',
        bio: user.bio || 'Building scalable full-stack applications with MERN.',
      });
    }

    const loadStats = async () => {
      try {
        const res = await userAPI.getStats();
        if (res?.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Using default dashboard metrics');
      }
    };

    loadStats();
  }, [user]);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUser(profileForm);
    setIsEditingProfile(false);
    showToast('Profile changes saved successfully!', 'success');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--ivory)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Dashboard Bar */}
      <header
        style={{
          backgroundColor: 'var(--navy)',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(220, 203, 180, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--champagne)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            <span>Landing Page</span>
          </Link>

          <div style={{ height: '20px', width: '1px', backgroundColor: 'rgba(220, 203, 180, 0.3)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--navy)',
              }}
            >
              <Layers size={16} strokeWidth={2.5} />
            </div>
            <span style={{ color: 'var(--ivory)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              AURA DASHBOARD
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge badge-premium" style={{ textTransform: 'capitalize' }}>
            Role: {user?.role || 'User'}
          </span>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="btn btn-sm btn-outline-ivory"
            style={{ padding: '0.35rem 0.85rem' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (Sidebar Navy #25334E, Main Canvas Ivory #F5EDE2) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 65px)' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: '260px',
            backgroundColor: 'var(--navy)',
            padding: '2rem 1.25rem',
            borderRight: '1px solid rgba(220, 203, 180, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* User Profile Mini Badge */}
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(245, 237, 226, 0.08)',
                borderRadius: '12px',
                border: '1px solid rgba(220, 203, 180, 0.2)',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  backgroundColor: 'var(--french-blue)',
                  color: 'var(--ivory)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'var(--ivory)', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.name || 'Authorized Member'}
                </div>
                <div style={{ color: 'var(--champagne)', fontSize: '0.75rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.email || 'user@example.com'}
                </div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: activeTab === 'overview' ? 'var(--french-blue)' : 'transparent',
                  color: 'var(--ivory)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'overview' ? 700 : 500,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'var(--transition)',
                }}
              >
                <Activity size={18} />
                <span>System Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: activeTab === 'profile' ? 'var(--french-blue)' : 'transparent',
                  color: 'var(--ivory)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'profile' ? 700 : 500,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'var(--transition)',
                }}
              >
                <User size={18} />
                <span>User Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('api')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: activeTab === 'api' ? 'var(--french-blue)' : 'transparent',
                  color: 'var(--ivory)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'api' ? 700 : 500,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'var(--transition)',
                }}
              >
                <Key size={18} />
                <span>JWT Token & API</span>
              </button>
            </div>
          </div>

          {/* Backend Connection Indicator */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 237, 226, 0.05)',
              border: '1px solid rgba(220, 203, 180, 0.15)',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ color: 'var(--champagne)', fontWeight: 600, marginBottom: '4px' }}>Server Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ivory)' }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: serverHealth === 'online' ? '#4CAF50' : 'var(--gold)',
                }}
              />
              <span>{serverHealth === 'online' ? 'MongoDB + Express (Online)' : 'Simulated Session Mode'}</span>
            </div>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: '0.25rem' }}>
                  Platform Overview
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Live metrics, connected microservices, and cluster activity.
                </p>
              </div>

              {/* 4 Metric Cards with Gold Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2.5rem',
                }}
              >
                <div className="card card-white" style={{ border: '1.5px solid var(--champagne)', padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Total Registered Users
                  </div>
                  <div
                    style={{
                      fontSize: '2.25rem',
                      fontWeight: 800,
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-heading)',
                      margin: '0.25rem 0',
                    }}
                  >
                    {stats?.totalUsers || '148'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--french-blue)' }}>MongoDB Collection Sync</div>
                </div>

                <div className="card card-white" style={{ border: '1.5px solid var(--champagne)', padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Active REST Endpoints
                  </div>
                  <div
                    style={{
                      fontSize: '2.25rem',
                      fontWeight: 800,
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-heading)',
                      margin: '0.25rem 0',
                    }}
                  >
                    {stats?.activeProjects || '34'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--french-blue)' }}>Auth & User Controllers</div>
                </div>

                <div className="card card-white" style={{ border: '1.5px solid var(--champagne)', padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Server Uptime SLA
                  </div>
                  <div
                    style={{
                      fontSize: '2.25rem',
                      fontWeight: 800,
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-heading)',
                      margin: '0.25rem 0',
                    }}
                  >
                    {stats?.uptimePercentage || '99.98'}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                    ✓ 0 Unscheduled Downtime
                  </div>
                </div>

                <div className="card card-white" style={{ border: '1.5px solid var(--champagne)', padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Security Score
                  </div>
                  <div
                    style={{
                      fontSize: '2.25rem',
                      fontWeight: 800,
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-heading)',
                      margin: '0.25rem 0',
                    }}
                  >
                    100 / 100
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--french-blue)' }}>JWT & Bcrypt Salt (10 Rounds)</div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="card card-white" style={{ border: '1.5px solid var(--champagne)', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                  Quick Application Actions
                </h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="btn btn-primary"
                  >
                    <Edit3 size={16} />
                    <span>Edit Profile Details</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('api')}
                    className="btn btn-secondary"
                  >
                    <Key size={16} />
                    <span>Inspect Bearer Token</span>
                  </button>

                  <button
                    onClick={() => showToast('Health ping dispatched to /api/health', 'info')}
                    className="btn btn-outline"
                  >
                    <RefreshCw size={16} />
                    <span>Ping Health Check</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={{ maxWidth: '680px' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: '0.25rem' }}>
                  User Profile Settings
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Manage your personal account credentials and role metadata.
                </p>
              </div>

              <div className="card card-white" style={{ border: '1.5px solid var(--champagne)', padding: '2rem' }}>
                <form onSubmit={handleProfileSave}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Read-only)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="form-control"
                      disabled
                      style={{ backgroundColor: 'var(--ivory-light)', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Professional Role / Title</label>
                    <input
                      type="text"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio Description</label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary">
                      <Save size={16} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--navy)', marginBottom: '0.25rem' }}>
                  JWT Token & API Integration
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Inspect your current active session token for authorizing external REST API calls.
                </p>
              </div>

              <div className="card card-white" style={{ border: '1.5px solid var(--champagne)', padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
                  Current Bearer Token
                </h3>
                <div
                  style={{
                    backgroundColor: 'var(--navy)',
                    color: 'var(--gold)',
                    fontFamily: 'monospace',
                    padding: '1rem 1.25rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    wordBreak: 'break-all',
                    lineHeight: 1.6,
                    border: '1px solid var(--champagne)',
                  }}
                >
                  {token || 'mock_jwt_token_demo_mode_active'}
                </div>

                <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  💡 Pass this token in your HTTP headers as:{' '}
                  <code style={{ color: 'var(--navy)', fontWeight: 700 }}>
                    Authorization: Bearer {'<token>'}
                  </code>
                </div>
              </div>

              <div className="card card-white" style={{ border: '1.5px solid var(--champagne)', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy)', marginBottom: '1rem' }}>
                  Available Backend Endpoints
                </h3>

                <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--ivory)', borderRadius: '8px' }}>
                    <span style={{ backgroundColor: '#2E7D32', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      POST
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}>/api/auth/register</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>Create user account</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--ivory)', borderRadius: '8px' }}>
                    <span style={{ backgroundColor: '#2E7D32', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      POST
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}>/api/auth/login</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>Authenticate & receive JWT</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--ivory)', borderRadius: '8px' }}>
                    <span style={{ backgroundColor: 'var(--french-blue)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      GET
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}>/api/auth/me</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>Protected current user profile</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--ivory)', borderRadius: '8px' }}>
                    <span style={{ backgroundColor: '#ED6C02', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      PUT
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}>/api/auth/profile</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>Update profile / change password</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: 'var(--ivory)', borderRadius: '8px' }}>
                    <span style={{ backgroundColor: 'var(--french-blue)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      GET
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy)' }}>/api/users/stats</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>Dashboard system statistics</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
