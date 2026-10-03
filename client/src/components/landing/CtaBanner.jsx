import React from 'react';
import { ArrowRight, Sparkles, Shield, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CtaBanner = () => {
  const { isAuthenticated, openAuthModal } = useAuth();

  return (
    <section className="section section-blue" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative background shapes */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(245, 237, 226, 0.08)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-50%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(191, 151, 80, 0.12)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(245, 237, 226, 0.15)',
            padding: '0.35rem 1rem',
            borderRadius: '20px',
            color: 'var(--ivory)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Sparkles size={16} color="var(--gold)" />
          <span>PRODUCTION-READY STARTER</span>
        </div>

        {/* Heading in Ivory */}
        <h2
          style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
            color: 'var(--ivory)',
            lineHeight: 1.2,
            marginBottom: '1.25rem',
            fontWeight: 800,
          }}
        >
          Ready to Accelerate Your Next MERN Application?
        </h2>

        {/* Description in Ivory */}
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--ivory)',
            opacity: 0.92,
            lineHeight: 1.7,
            marginBottom: '2.5rem',
            maxWidth: '680px',
            marginInline: 'auto',
          }}
        >
          Skip weeks of configuring express routes, MongoDB schemas, JWT auth tokens, and CSS design variables.
          Launch with confidence today.
        </p>

        {/* Action Button in Gold */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => openAuthModal(isAuthenticated ? 'login' : 'register')}
            className="btn btn-lg btn-gold glow-gold"
          >
            <span>{isAuthenticated ? 'Open Control Panel' : 'Start Building Free'}</span>
            <ArrowRight size={18} />
          </button>

          <a
            href="#hero"
            className="btn btn-lg btn-outline-ivory"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span>Back to Top</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
