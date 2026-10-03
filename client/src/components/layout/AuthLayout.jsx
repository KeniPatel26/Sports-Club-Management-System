import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Zap, Database, Lock } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--bg-main)',
      }}
    >
      {/* Left visual column */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow orb decorations */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={22} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#ffffff' }}>
              MERN<span style={{ color: '#38bdf8' }}>Sprint</span>
            </span>
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '460px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: 'rgba(79,70,229,0.3)',
              color: '#a5b4fc',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(165,180,252,0.2)',
            }}
          >
            HACKATHON LAUNCHPAD
          </span>

          <h1 style={{ color: '#ffffff', fontSize: '2.25rem', fontWeight: 800, margin: '1rem 0 0.75rem 0', lineHeight: 1.2 }}>
            Accelerate your hackathon project from Day 0.
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Pre-built JWT authentication, full CRUD entity controllers, dynamic UI kit, and automated activity streams so your team solves the real problem faster.
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <ShieldCheck size={18} color="#38bdf8" />
              <span>Role-Based Protected Routing (Admin & User)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <Zap size={18} color="#f59e0b" />
              <span>Fast 1-Click Demo Credentials for Instant Grading</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
              <Database size={18} color="#10b981" />
              <span>Standardized REST API with Mongoose Schemas</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, fontSize: '0.8rem', color: '#64748b' }}>
          &copy; 2026 MERN Hackathon Universal Starter Kit
        </div>
      </div>

      {/* Right form column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ margin: 0, fontWeight: 800 }}>{title}</h2>
            {subtitle && (
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {subtitle}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
