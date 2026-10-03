import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, CheckCircle2, Award, Users } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle, maxWidth = '480px' }) => {
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
          flex: '1 1 45%',
          background: 'linear-gradient(145deg, #2B3A4F 0%, #17263B 100%)',
          color: '#ffffff',
          padding: '3rem 2.75rem',
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
            top: '-10%',
            right: '-10%',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217,142,104,0.18) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '380px',
            height: '380px',
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
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #D98E68 0%, #F0B08E 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(217,142,104,0.35)',
              }}
            >
              <Trophy size={22} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                CHAMPIONS<span style={{ color: '#F0B08E' }}>CLUB</span>
              </span>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>
                SPORTS & RECREATION COMPLEX
              </div>
            </div>
          </Link>
        </div>

        {/* Middle Feature Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '460px', margin: '2rem 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: 'rgba(217, 142, 104, 0.18)',
              color: '#F0B08E',
              padding: '5px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(217, 142, 104, 0.35)',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={13} />
            <span>PREMIER CLUB MANAGEMENT</span>
          </div>

          <h1 style={{ color: '#ffffff', fontSize: '2.1rem', fontWeight: 800, margin: '0 0 0.85rem 0', lineHeight: 1.18, letterSpacing: '-0.02em' }}>
            Elevate Your Athletic Journey.
          </h1>

          <p style={{ color: '#B2BFCF', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            Instant court reservations, championship leagues, high-performance pro-shop gear, and gourmet sports dining in one unified club experience.
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2E8F0', fontSize: '0.88rem' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '7px', backgroundColor: 'rgba(143,175,152,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={15} color="#8FAF98" />
              </div>
              <span><strong>8 Professional Courts:</strong> Real-time automated slot booking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2E8F0', fontSize: '0.88rem' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '7px', backgroundColor: 'rgba(217,142,104,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={15} color="#F0B08E" />
              </div>
              <span><strong>Athletic Community:</strong> Ranked tournaments & coaching clinics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2E8F0', fontSize: '0.88rem' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '7px', backgroundColor: 'rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={15} color="#38bdf8" />
              </div>
              <span><strong>Pro Privileges:</strong> Member discounts at Pro Shop & Sports Lounge</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 2, fontSize: '0.8rem', color: '#64748B' }}>
          &copy; 2026 Champions Sports & Country Club. All rights reserved.
        </div>
      </div>

      {/* Right form column */}
      <div
        style={{
          flex: '1 1 55%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          backgroundColor: '#F4F6FC',
          overflowY: 'auto',
          maxHeight: '100vh',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: maxWidth,
            backgroundColor: '#FFFFFF',
            padding: '2.25rem 2.25rem',
            borderRadius: '18px',
            border: '1px solid #DDE2EC',
            boxShadow: '0 10px 30px rgba(53, 73, 98, 0.06)',
            margin: 'auto 0',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.55rem', color: '#17263B', letterSpacing: '-0.02em' }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: '0.35rem 0 0 0', color: '#64748B', fontSize: '0.88rem', lineHeight: 1.45 }}>
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
