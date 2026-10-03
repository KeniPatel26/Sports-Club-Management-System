import React from 'react';
import { Shield, Key, LayoutGrid, Zap, RefreshCw, Smartphone, Layers, Lock, Cpu } from 'lucide-react';

const featureList = [
  {
    icon: <Lock size={28} />,
    title: 'JWT Authentication',
    description: 'Stateless secure authentication with JSON Web Tokens, bcrypt password hashing, and role verification.',
    tag: 'Security',
  },
  {
    icon: <LayoutGrid size={28} />,
    title: 'Clean MVC Structure',
    description: 'Enterprise-grade separation of concerns with controllers, models, middlewares, routes, and config.',
    tag: 'Architecture',
  },
  {
    icon: <Smartphone size={28} />,
    title: 'Adaptive Responsive UI',
    description: 'Mobile-first layout engineered to look flawless on smartphones, tablets, laptops, and ultra-wide displays.',
    tag: 'Frontend',
  },
  {
    icon: <Zap size={28} />,
    title: 'Vite Speed & Hot Reload',
    description: 'Lightning-fast instantaneous development feedback powered by modern ESM bundling with Vite.',
    tag: 'Tooling',
  },
  {
    icon: <RefreshCw size={28} />,
    title: 'Universal Multipurpose',
    description: 'Easily customizable for SaaS platforms, ERP systems, Admin Portals, Portfolios, or eCommerce apps.',
    tag: 'Flexibility',
  },
  {
    icon: <Shield size={28} />,
    title: 'Centralized Error Handling',
    description: 'Unified Mongoose schema validation, CastError handling, and production-safe status responses.',
    tag: 'Reliability',
  },
];

export const Features = () => {
  return (
    <section id="features" className="section section-champagne">
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem auto' }}>
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
            <Layers size={14} color="#BF9750" />
            <span>MODULAR ARCHITECTURE</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              color: 'var(--navy)',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Engineered for Modern Full-Stack Excellence
          </h2>

          <p style={{ fontSize: '1.1rem', color: '#4B5563' }}>
            Every component and endpoint is crafted following industry best practices, ensuring scalability,
            security, and effortless maintainability.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {featureList.map((feature, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                backgroundColor: 'var(--ivory)',
                borderColor: '#c9b399',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Top bar inside card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: '14px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--french-blue)',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid var(--champagne)',
                    }}
                  >
                    {feature.icon}
                  </div>

                  <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>
                    {feature.tag}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.35rem',
                    color: 'var(--navy)',
                    marginBottom: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    marginBottom: '1.5rem',
                  }}
                >
                  {feature.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--gold)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <span>Explore Details</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
