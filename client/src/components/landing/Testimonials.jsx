import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const reviews = [
  {
    name: 'Sarah Jenkins',
    role: 'Principal Software Architect',
    company: 'Vanguard Cloud Systems',
    content:
      'The folder structure and design tokens are pristine. Having full JWT authentication and an enterprise-grade color system ready on day one saved our team at least three weeks of boilerplate setup.',
    rating: 5,
  },
  {
    name: 'Devon Patel',
    role: 'Full-Stack Team Lead',
    company: 'Apex SaaS Labs',
    content:
      'The balance of Champagne, Ivory, French Blue, Gold, and Navy gives the entire application a genuinely luxurious feel. The clean MVC architecture on Node/Express makes scaling effortless.',
    rating: 5,
  },
  {
    name: 'Marcus Lindqvist',
    role: 'Product Engineering Lead',
    company: 'Nordic Digital',
    content:
      'The best MERN starter I have worked with. Responsive, modular, and cleanly decoupled. The simulated demo fallback is exceptionally clever for staging and client demos.',
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="section section-ivory">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem auto' }}>
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
            <Star size={14} color="#BF9750" fill="#BF9750" />
            <span>TESTIMONIALS & REVIEWS</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              color: 'var(--navy)',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            Trusted by Modern Developers
          </h2>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            See why engineering teams choose this boilerplate for mission-critical client projects and internal tools.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {reviews.map((item, idx) => (
            <div
              key={idx}
              className="card card-white"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.25rem 2rem',
                border: '1.5px solid var(--champagne)',
                borderRadius: '20px',
              }}
            >
              <div>
                {/* Rating stars in Gold */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem' }}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={18} color="#BF9750" fill="#BF9750" />
                  ))}
                </div>

                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: 'var(--text-primary)',
                    fontStyle: 'italic',
                    marginBottom: '1.75rem',
                  }}
                >
                  "{item.content}"
                </p>
              </div>

              {/* User info footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: 'var(--navy)',
                    color: 'var(--gold)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.role} &bull; {item.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
