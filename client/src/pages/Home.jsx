import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  ShoppingBag,
  Coffee,
  Crown,
  Trophy,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  Activity,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const facilities = [
    {
      icon: Calendar,
      badge: 'COURTS & ARENA',
      color: '#354962',
      title: 'Olympic-Standard Courts',
      desc: '8 tournament-grade synthetic & wooden courts with anti-glare LED lighting, automated slot scheduling, and instant reservations.',
      link: '/courts',
      actionText: 'Book Court Slot',
    },
    {
      icon: ShoppingBag,
      badge: 'PRO SHOP',
      color: '#D98E68',
      title: 'Athletic Equipment & Gear',
      desc: 'Top-tier racquets, shuttlecocks, balls, performance apparel, and professional racquet restringing service on-site.',
      link: '/shop',
      actionText: 'Browse Pro Shop',
    },
    {
      icon: Coffee,
      badge: 'CAFE & LOUNGE',
      color: '#8FAF98',
      title: 'Sports Cafe & Nutrition Bar',
      desc: 'Chef-crafted post-workout meals, cold-pressed protein smoothies, artisan espresso, and a panoramic court-view dining lounge.',
      link: '/canteen',
      actionText: 'View Cafe Menu',
    },
    {
      icon: Crown,
      badge: 'MEMBERSHIPS',
      color: '#D9A65D',
      title: 'Elite Club Privileges',
      desc: 'Exclusive booking windows, discounted court rates, priority tournament entry, guest passes, and personal locker amenities.',
      link: '/memberships',
      actionText: 'Compare Plans',
    },
  ];

  const stats = [
    { number: '8', label: 'International Courts' },
    { number: '1,400+', label: 'Active Club Members' },
    { number: '350+', label: 'Pro Shop Gear Items' },
    { number: '99.4%', label: 'Booking Satisfaction' },
  ];

  const membershipTiers = [
    {
      name: 'Silver Tier',
      price: '$49',
      period: '/month',
      desc: 'Ideal for weekend players and casual enthusiasts.',
      highlight: false,
      features: [
        'Up to 4 court bookings per week',
        'Standard 3-day advance booking window',
        '5% discount at Pro Shop',
        'Club cafe lounge access',
      ],
    },
    {
      name: 'Gold Member',
      price: '$89',
      period: '/month',
      desc: 'Our most popular plan for active athletes and regular players.',
      highlight: true,
      badge: 'MOST POPULAR',
      features: [
        'Unlimited weekday court bookings',
        'Priority 7-day advance booking window',
        '15% discount at Pro Shop & Cafe',
        '2 Complimentary monthly guest passes',
        'Free equipment stringing consultation',
      ],
    },
    {
      name: 'Platinum VIP',
      price: '$149',
      period: '/month',
      desc: 'The ultimate sports & country club experience with VIP perks.',
      highlight: false,
      features: [
        'Guaranteed prime-time court reservations',
        '14-day priority booking window',
        '25% discount across all club facilities',
        'Dedicated VIP locker & shower suite',
        'Free tournament entry & coaching session',
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F6FC' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 1.5rem 4rem 1.5rem',
          maxWidth: '1240px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(217, 142, 104, 0.15)',
            border: '1px solid rgba(217, 142, 104, 0.35)',
            color: '#D98E68',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          <Trophy size={16} color="#D98E68" />
          <span>PREMIER SPORTS & RECREATION COMPLEX</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#17263B',
            marginBottom: '1.25rem',
          }}
        >
          Elevate Your Game at <br />
          <span style={{ color: '#D98E68' }}>Champions Club.</span>
        </h1>

        <p
          style={{
            fontSize: '1.18rem',
            color: '#64748B',
            maxWidth: '740px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.65,
          }}
        >
          Experience world-class court reservations, athletic gear at our Pro Shop, chef-curated dining at our Sports Cafe, and vibrant community tournaments all in one seamless club management portal.
        </p>

        {/* CTA Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="lg"
              icon={Calendar}
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: '#D98E68',
                borderColor: '#D98E68',
                color: '#FFFFFF',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
              }}
            >
              Go to Your Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                size="lg"
                icon={Calendar}
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: '#D98E68',
                  borderColor: '#D98E68',
                  color: '#FFFFFF',
                  padding: '0.85rem 1.85rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                }}
              >
                Club Member Login
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => navigate('/courts')}
                style={{
                  padding: '0.85rem 1.85rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DDE2EC',
                  color: '#17263B',
                }}
              >
                Explore Courts & Times
              </Button>
            </>
          )}
        </div>

        {/* Club Quick Stats Bar */}
        <div
          style={{
            marginTop: '3.5rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DDE2EC',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            boxShadow: '0 10px 30px rgba(53, 73, 98, 0.05)',
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  color: '#17263B',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {s.number}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginTop: '0.2rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities & Services Grid */}
      <section
        style={{
          padding: '4.5rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #DDE2EC',
          borderBottom: '1px solid #DDE2EC',
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#D98E68',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              WORLD-CLASS AMENITIES
            </div>
            <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
              Complete Athletic & Social Experience
            </h2>
            <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '1rem' }}>
              From competitive courts to relaxation lounges, every aspect of our club is built for champions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.5rem' }}>
            {facilities.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{
                    backgroundColor: '#F4F6FC',
                    borderRadius: '16px',
                    padding: '2rem 1.75rem',
                    border: '1px solid #DDE2EC',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        color: f.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem',
                        boxShadow: '0 4px 12px rgba(53, 73, 98, 0.08)',
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: f.color,
                        letterSpacing: '0.06em',
                      }}
                    >
                      {f.badge}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#17263B', margin: '0.4rem 0 0.6rem 0' }}>
                      {f.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                      {f.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: '1.75rem' }}>
                    <Link
                      to={f.link}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: '#17263B',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                      }}
                    >
                      <span>{f.actionText}</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Membership Tiers Section */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#D98E68',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            MEMBERSHIP TIERS
          </div>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Choose Your Club Membership
          </h2>
          <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '1rem' }}>
            Flexible membership tiers designed for casual players, regular athletes, and competitive pros.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {membershipTiers.map((tier) => (
            <div
              key={tier.name}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '2.5rem 2rem',
                border: tier.highlight ? '2px solid #D98E68' : '1px solid #DDE2EC',
                boxShadow: tier.highlight ? '0 12px 36px rgba(217, 142, 104, 0.15)' : '0 6px 20px rgba(53, 73, 98, 0.04)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {tier.highlight && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#D98E68',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: '999px',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tier.badge}
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
                  {tier.name}
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.35rem', minHeight: '38px' }}>
                  {tier.desc}
                </p>

                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#17263B', fontFamily: "'JetBrains Mono', monospace" }}>
                    {tier.price}
                  </span>
                  <span style={{ color: '#64748B', fontSize: '0.9rem' }}>{tier.period}</span>
                </div>

                <div style={{ borderTop: '1px solid #DDE2EC', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {tier.features.map((feat) => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.88rem', color: '#2D4159' }}>
                      <CheckCircle2 size={17} color={tier.highlight ? '#D98E68' : '#8FAF98'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '2.5rem' }}>
                <Button
                  variant={tier.highlight ? 'primary' : 'outline'}
                  fullWidth
                  size="md"
                  onClick={() => navigate('/login')}
                  style={{
                    backgroundColor: tier.highlight ? '#D98E68' : '#FFFFFF',
                    borderColor: tier.highlight ? '#D98E68' : '#DDE2EC',
                    color: tier.highlight ? '#FFFFFF' : '#17263B',
                    fontWeight: 700,
                    borderRadius: '10px',
                    height: '44px',
                  }}
                >
                  Member Login
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section
        style={{
          backgroundColor: '#2B3A4F',
          color: '#FFFFFF',
          padding: '4.5rem 1.5rem',
          textAlign: 'center',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
            Ready to Experience Champions Club?
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#B2BFCF', lineHeight: 1.6, margin: '0 0 2rem 0' }}>
            All member and staff accounts are provisioned directly by the Club Manager at the Front Desk. Login with your credentials to access services.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#D98E68',
                borderColor: '#D98E68',
                color: '#FFFFFF',
                padding: '0.85rem 2.25rem',
                fontWeight: 700,
                borderRadius: '10px',
              }}
            >
              Sign In to Portal
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: 'transparent',
                borderColor: '#B2BFCF',
                color: '#FFFFFF',
                padding: '0.85rem 2.25rem',
                fontWeight: 600,
                borderRadius: '10px',
              }}
            >
              Member Sign In
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
