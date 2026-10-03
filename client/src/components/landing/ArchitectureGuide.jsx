import React, { useState } from 'react';
import { FolderTree, Server, Monitor, Database, FileCode, CheckCircle, Copy, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ArchitectureGuide = () => {
  const { showToast } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyStructure = () => {
    const text = `
odoo-ldce2/
├── package.json              # Root script runner (npm run dev, build, install:all)
├── .gitignore
├── README.md
├── server/                   # Express & MongoDB Backend
│   ├── package.json
│   ├── .env.example
│   ├── server.js             # Server entry point & middlewares
│   └── src/
│       ├── config/           # Database connection (db.js)
│       ├── controllers/      # Business logic (authController, userController)
│       ├── middlewares/      # JWT auth guard, error handling
│       ├── models/           # Mongoose schemas (User.js)
│       ├── routes/           # REST endpoints (authRoutes, userRoutes)
│       └── utils/            # JWT token helpers
└── client/                   # Vite + React Frontend
    ├── package.json
    ├── vite.config.js        # Configured proxy to :5000
    ├── index.html
    └── src/
        ├── components/       # UI layout, auth modal, landing sections
        ├── context/          # React AuthContext state
        ├── pages/            # LandingPage, DashboardPage
        ├── services/         # API fetch services
        └── styles/           # Design system tokens & CSS
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Folder structure copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="architecture" className="section section-champagne">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.5rem auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--ivory)',
              color: 'var(--navy)',
              padding: '0.35rem 0.95rem',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '1rem',
              border: '1px solid var(--border-color)',
            }}
          >
            <FolderTree size={14} color="#BF9750" />
            <span>PROJECT STRUCTURE</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              color: 'var(--navy)',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Professional Directory Organization
          </h2>

          <p style={{ fontSize: '1.1rem', color: '#4B5563' }}>
            Built with strict MVC architectural standards for the server and component-driven modularity for the client.
          </p>
        </div>

        {/* 2-Column Grid: Server vs Client */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Server Architecture Card */}
          <div
            className="card"
            style={{
              backgroundColor: 'var(--ivory)',
              border: '1.5px solid #C9B399',
              borderRadius: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: 'var(--navy)',
                  color: 'var(--ivory)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Server size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy)' }}>server/</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Express &bull; Node &bull; MongoDB</div>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>src/config/</span>
                <span style={{ color: 'var(--text-secondary)' }}>Database connection logic and environment loaders</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>src/controllers/</span>
                <span style={{ color: 'var(--text-secondary)' }}>Authentication & business route controllers</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>src/middlewares/</span>
                <span style={{ color: 'var(--text-secondary)' }}>JWT token validation & global error handlers</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>src/models/</span>
                <span style={{ color: 'var(--text-secondary)' }}>Mongoose User schemas with bcrypt hashing hooks</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>src/routes/</span>
                <span style={{ color: 'var(--text-secondary)' }}>Modular REST routing (/api/auth, /api/users)</span>
              </li>
            </ul>
          </div>

          {/* Client Architecture Card */}
          <div
            className="card"
            style={{
              backgroundColor: 'var(--ivory)',
              border: '1.5px solid #C9B399',
              borderRadius: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  backgroundColor: 'var(--french-blue)',
                  color: 'var(--ivory)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Monitor size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy)' }}>client/</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>React 18 &bull; Vite &bull; Vanilla CSS</div>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--french-blue)', fontWeight: 700 }}>src/context/</span>
                <span style={{ color: 'var(--text-secondary)' }}>Auth state, token persistence & global toast alerts</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--french-blue)', fontWeight: 700 }}>src/components/</span>
                <span style={{ color: 'var(--text-secondary)' }}>Layout, modals, protected routes & landing widgets</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--french-blue)', fontWeight: 700 }}>src/services/</span>
                <span style={{ color: 'var(--text-secondary)' }}>Centralized API communication client with token auto-header</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--french-blue)', fontWeight: 700 }}>src/pages/</span>
                <span style={{ color: 'var(--text-secondary)' }}>Universal Landing Page and interactive User Dashboard</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: 'var(--french-blue)', fontWeight: 700 }}>src/styles/</span>
                <span style={{ color: 'var(--text-secondary)' }}>CSS custom properties conforming to luxury palette</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Launch Commands Banner */}
        <div
          style={{
            backgroundColor: 'var(--navy)',
            borderRadius: '16px',
            padding: '1.5rem 2rem',
            color: 'var(--ivory)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Terminal size={24} color="var(--gold)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ivory)' }}>
                Concurrent Dev Server Command
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--champagne)' }}>
                Start both backend & frontend simultaneously with a single command
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <code
              style={{
                backgroundColor: 'rgba(0,0,0,0.35)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                color: 'var(--gold)',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                border: '1px solid rgba(220, 203, 180, 0.2)',
              }}
            >
              npm run dev
            </code>
            <button
              onClick={copyStructure}
              className="btn btn-sm btn-secondary"
              style={{ padding: '0.5rem 0.9rem' }}
            >
              <Copy size={14} />
              <span>{copied ? 'Copied' : 'Copy Tree'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureGuide;
