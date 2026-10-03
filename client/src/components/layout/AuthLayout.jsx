import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, CheckCircle2, Award, Users } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#F4F6FC',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Left visual column */}
      <div
        style={{
          flex: '1 1 50%',
          background: 'linear-gradient(145deg, #2D4159 0%, #17263B 100%)',
          color: '#ffffff',
          padding: '3.5rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,142,104,0.18) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(143,175,152,0.15) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Header / Logo */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #D98E68 0%, #F0B08E 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(217,142,104,0.35)',
              }}
            >
              <Trophy size={24} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.35rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                CHAMPIONS<span style={{ color: '#F0B08E' }}>CLUB</span>
              </span>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>
                SPORTS & RECREATION COMPLEX
              </div>
            </div>
          </Link>
        </div>

        {/* Middle Feature Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '480px', margin: '2.5rem 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              backgroundColor: 'rgba(217, 142, 104, 0.18)',
              color: '#F0B08E',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(217, 142, 104, 0.35)',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={14} />
            <span>3-TIER ROLE-BASED ACCESS CONTROL</span>
          </div>

          <h1 style={{ color: '#ffffff', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Unified Sports & Club Management ERP.
          </h1>

          <p style={{ color: '#B2BFCF', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
            Automated court scheduling, live table dining, pro-shop POS, and granular staff department permissions in one unified high-performance platform.
          </p>

          <div style={{ marginTop: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: '#E2E8F0', fontSize: '0.92rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(143,175,152,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} color="#8FAF98" />
              </div>
              <span><strong>Club Manager:</strong> Full financials, payroll, employee shifts & reporting</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: '#E2E8F0', fontSize: '0.92rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(217,142,104,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} color="#F0B08E" />
              </div>
              <span><strong>Staff Departments:</strong> Front Desk, Sports Shop & Canteen Staff</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: '#E2E8F0', fontSize: '0.92rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={16} color="#38bdf8" />
              </div>
              <span><strong>Members:</strong> Instant court booking, gear purchasing & member billing</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 2, fontSize: '0.82rem', color: '#64748B' }}>
          &copy; 2026 Champions Club ERP. All rights reserved.
        </div>
      </div>

      {/* Right form column */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          backgroundColor: '#F4F6FC',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#FFFFFF',
            padding: '2.5rem',
            borderRadius: '18px',
            border: '1px solid #DDE2EC',
            boxShadow: '0 10px 30px rgba(53, 73, 98, 0.06)',
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.65rem', color: '#17263B', letterSpacing: '-0.02em' }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: '0.4rem 0 0 0', color: '#64748B', fontSize: '0.92rem' }}>
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
