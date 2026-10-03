import React from 'react';
import { ArrowRight, Sparkles, Shield, Database, Cpu, Code2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Hero = () => {
  const { isAuthenticated, openAuthModal } = useAuth();

  return (
    <section id="hero" className="section section-ivory" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Hero Copy & CTA */}
          <div style={{ maxWidth: '580px' }}>
            {/* Top Pill / Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--champagne)',
                padding: '0.4rem 1rem',
                borderRadius: '30px',
                color: 'var(--navy)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span
                style={{
                  backgroundColor: 'var(--gold)',
                  color: 'var(--navy)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                ★ PREMIUM
              </span>
              <span>Enterprise MERN Architecture Starter</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                color: 'var(--navy)',
              }}
            >
              Build Something <span style={{ color: 'var(--gold)' }}>Meaningful</span> & Scalable.
            </h1>

            {/* Subtitle / Description */}
            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
              }}
            >
              A production-ready foundation designed with clean MVC architecture, robust JWT authentication,
              responsive UI components, and a sophisticated luxury design system.
            </p>

            {/* CTA Buttons */}
            <div
              className="btn-group-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '2.5rem',
              }}
            >
              <button
                onClick={() => openAuthModal('register')}
                className="btn btn-lg btn-primary"
              >
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </button>

              <a
                href="#preview"
                className="btn btn-lg btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Explore Showcase</span>
              </a>
            </div>

            {/* Value checklist */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                fontSize: '0.9rem',
                color: 'var(--navy)',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} color="#BF9750" />
                <span>Zero Configuration Needed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} color="#BF9750" />
                <span>JWT Secure Auth Built-in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} color="#BF9750" />
                <span>Universal Multi-Role Ready</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Feature Box */}
          <div style={{ position: 'relative' }}>
            {/* Background decorative glow */}
            <div
              style={{
                position: 'absolute',
                top: '10%',
                right: '10%',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(191,151,80,0.18) 0%, rgba(245,237,226,0) 70%)',
                filter: 'blur(30px)',
                zIndex: 0,
              }}
            />

            {/* Main Interactive Showcase Card */}
            <div
              className="card card-white"
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '2.5rem',
                boxShadow: 'var(--shadow-lg)',
                border: '1.5px solid var(--champagne)',
                borderRadius: '24px',
              }}
            >
              {/* Header inside card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#FF5F56',
                    }}
                  />
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#FFBD2E',
                    }}
                  />
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#27C93F',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)',
                      marginLeft: '0.5rem',
                    }}
                  >
                    mern-core-architecture.v1.0
                  </span>
                </div>

                <span className="badge badge-premium">Active</span>
              </div>

              {/* Stack items */}
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.15rem',
                    backgroundColor: 'var(--ivory)',
                    borderRadius: '12px',
                    border: '1px solid var(--champagne)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        padding: '6px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        color: 'var(--french-blue)',
                      }}
                    >
                      <Code2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>
                        Client (React 18 + Vite)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Tailored CSS variables, Auth Context & Router
                      </div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>
                    100%
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.15rem',
                    backgroundColor: 'var(--ivory)',
                    borderRadius: '12px',
                    border: '1px solid var(--champagne)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        padding: '6px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        color: 'var(--navy)',
                      }}
                    >
                      <Cpu size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>
                        Server (Express & Node.js)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        MVC Controllers, JWT verification, CORS
                      </div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>
                    100%
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.15rem',
                    backgroundColor: 'var(--ivory)',
                    borderRadius: '12px',
                    border: '1px solid var(--champagne)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        padding: '6px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        color: 'var(--french-blue)',
                      }}
                    >
                      <Database size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>
                        Database (MongoDB & Mongoose)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Schema validation, index optimization, Bcrypt
                      </div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>
                    100%
                  </span>
                </div>
              </div>

              {/* Card Footer Action */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--navy)',
                  color: 'var(--ivory)',
                  padding: '1rem 1.25rem',
                  borderRadius: '14px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--champagne)' }}>Authentication Status</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ivory)' }}>
                    {isAuthenticated ? 'Active User Session' : 'Ready to Authenticate'}
                  </div>
                </div>

                <button
                  onClick={() => openAuthModal(isAuthenticated ? 'login' : 'register')}
                  className="btn btn-sm btn-gold"
                  style={{ padding: '0.4rem 1rem' }}
                >
                  {isAuthenticated ? 'Switch Account' : 'Test Auth Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
