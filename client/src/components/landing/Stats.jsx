import React from 'react';
import { Award, Users, Activity, Star } from 'lucide-react';

const statsData = [
  {
    icon: <Activity size={24} color="#BF9750" />,
    number: '99.98%',
    label: 'Platform Uptime',
    subtext: 'High-availability infrastructure',
  },
  {
    icon: <Users size={24} color="#BF9750" />,
    number: '10,000+',
    label: 'Developers & Users',
    subtext: 'Active community and teams',
  },
  {
    icon: <Award size={24} color="#BF9750" />,
    number: '98.6%',
    label: 'Customer Satisfaction',
    subtext: 'Verified enterprise rating',
  },
  {
    icon: <Star size={24} color="#BF9750" />,
    number: '4.9 / 5',
    label: 'Developer Experience',
    subtext: 'Clean code & ergonomics',
  },
];

export const Stats = () => {
  return (
    <section id="stats" className="section section-ivory" style={{ borderBottom: '1px solid var(--champagne)' }}>
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}
        >
          {statsData.map((stat, idx) => (
            <div
              key={idx}
              className="card card-white"
              style={{
                textAlign: 'center',
                padding: '2.25rem 1.5rem',
                border: '1.5px solid var(--champagne)',
                borderRadius: '18px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '12px',
                  backgroundColor: 'var(--ivory)',
                  marginBottom: '1rem',
                  border: '1px solid var(--champagne)',
                }}
              >
                {stat.icon}
              </div>

              {/* Stat Number in Highlighted Gold */}
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: 'var(--gold)',
                  fontFamily: 'var(--font-heading)',
                  lineHeight: 1.1,
                  marginBottom: '0.4rem',
                }}
              >
                {stat.number}
              </div>

              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--navy)',
                  marginBottom: '0.25rem',
                }}
              >
                {stat.label}
              </div>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                {stat.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
