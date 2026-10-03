import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  TrendingUp,
  FolderGit2,
  Database,
  CheckCircle2,
  ArrowUpRight,
  Bell,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { openAuthModal } = useAuth();

  return (
    <section id="preview" className="section section-ivory">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.5rem auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--champagne)',
              color: 'var(--navy)',
              padding: '0.35rem 0.95rem',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '1rem',
              border: '1px solid var(--border-color)',
            }}
          >
            <ShieldCheck size={14} color="#BF9750" />
            <span>INTERACTIVE DASHBOARD DEMO</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              color: 'var(--navy)',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            A Dashboard Experience Designed for Clarity
          </h2>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Experience how the Champagne, Ivory, French Blue, Gold, and Navy hierarchy seamlessly unifies
            complex data into an intuitive interface.
          </p>
        </div>

        {/* Mock Window Container */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '2px solid var(--champagne)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Window Titlebar */}
          <div
            style={{
              backgroundColor: 'var(--navy-dark)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(220, 203, 180, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F56' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FFBD2E' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#27C93F' }} />
              <span
                style={{
                  color: 'var(--ivory)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginLeft: '0.75rem',
                  opacity: 0.85,
                }}
              >
                AURA Cloud Dashboard &bull; Live Preview
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  backgroundColor: 'rgba(245, 237, 226, 0.1)',
                  color: 'var(--gold)',
                  padding: '2px 10px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Live Production Feed
              </span>
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '240px 1fr',
              minHeight: '520px',
              backgroundColor: 'var(--ivory)',
            }}
          >
            {/* Sidebar (Navy #25334E, Text #F5EDE2, Active #7A94AD) */}
            <div
              style={{
                backgroundColor: 'var(--navy)',
                padding: '1.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRight: '1px solid rgba(220, 203, 180, 0.15)',
              }}
            >
              <div>
                <div
                  style={{
                    color: 'var(--champagne)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '0 0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  Workspace
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
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
                    <LayoutDashboard size={18} color="var(--ivory)" />
                    <span>Overview</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: activeTab === 'users' ? 'var(--french-blue)' : 'transparent',
                      color: 'var(--ivory)',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: activeTab === 'users' ? 700 : 500,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'var(--transition)',
                    }}
                  >
                    <Users size={18} color="var(--ivory)" />
                    <span>User Management</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('api')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
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
                    <Database size={18} color="var(--ivory)" />
                    <span>API Endpoints</span>
                  </button>
                </div>
              </div>

              {/* Sidebar bottom info */}
              <div
                style={{
                  backgroundColor: 'rgba(245, 237, 226, 0.06)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  border: '1px solid rgba(220, 203, 180, 0.15)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--champagne)' }}>Storage Usage</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ivory)', marginTop: '2px' }}>
                  42.8 GB / 100 GB
                </div>
                {/* Progress bar in French Blue */}
                <div
                  style={{
                    height: '6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(245, 237, 226, 0.2)',
                    marginTop: '6px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: '43%',
                      backgroundColor: 'var(--french-blue)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Main Content Area (Ivory #F5EDE2 canvas, Cards #FFFFFF/Ivory with Champagne #DCCBB4 borders) */}
            <div style={{ padding: '1.75rem' }}>
              {/* Top search and user profile bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--navy)' }}>System Metric Control</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Active Environment: Production Cluster (v2.4)
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="btn btn-sm btn-primary"
                  >
                    + Add New Service
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards with Gold Numbers */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--champagne)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Active Throughput
                  </div>
                  <div
                    style={{
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    1.42M
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ArrowUpRight size={14} /> +12.4% vs last week
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--champagne)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Auth Verification Time
                  </div>
                  <div
                    style={{
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    14ms
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--french-blue)', fontWeight: 600 }}>
                    ⚡ Ultra-fast JWT crypto
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--champagne)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Database Health
                  </div>
                  <div
                    style={{
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: 'var(--gold)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    100%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                    ✓ All replicas in sync
                  </div>
                </div>
              </div>

              {/* Data Table Preview */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--champagne)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>
                    Recent API Transactions
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                    REST v1.0
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--champagne)' }}>
                        <th style={{ padding: '0.6rem 0.5rem', color: 'var(--navy)', fontWeight: 700 }}>Endpoint</th>
                        <th style={{ padding: '0.6rem 0.5rem', color: 'var(--navy)', fontWeight: 700 }}>Method</th>
                        <th style={{ padding: '0.6rem 0.5rem', color: 'var(--navy)', fontWeight: 700 }}>Status</th>
                        <th style={{ padding: '0.6rem 0.5rem', color: 'var(--navy)', fontWeight: 700 }}>Latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--champagne-light)' }}>
                        <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600, color: 'var(--navy)' }}>/api/auth/login</td>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <span style={{ color: '#2E7D32', fontWeight: 700 }}>POST</span>
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                            200 OK
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', color: 'var(--gold)', fontWeight: 600 }}>18ms</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--champagne-light)' }}>
                        <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600, color: 'var(--navy)' }}>/api/auth/me</td>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <span style={{ color: 'var(--french-blue)', fontWeight: 700 }}>GET</span>
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                            200 OK
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', color: 'var(--gold)', fontWeight: 600 }}>12ms</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600, color: 'var(--navy)' }}>/api/users/stats</td>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <span style={{ color: 'var(--french-blue)', fontWeight: 700 }}>GET</span>
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem' }}>
                          <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                            200 OK
                          </span>
                        </td>
                        <td style={{ padding: '0.65rem 0.5rem', color: 'var(--gold)', fontWeight: 600 }}>24ms</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
