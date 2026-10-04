import React from 'react';
import { Crown, CalendarCheck, Zap, Award, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { courtDiscountForPlan } from '../../utils/membershipDiscounts';

export const MemberStatsSummary = ({ stats, userPlan }) => {
  const tierName = stats?.currentTier || userPlan?.name || 'GOLD';
  const discount = courtDiscountForPlan(tierName);
  const activeCount = stats?.activeBookings ?? 1;
  const totalPlayed = stats?.totalBookingsPlayed ?? 14;

  const isGold = tierName.toUpperCase() === 'GOLD';
  const isSilver = tierName.toUpperCase() === 'SILVER';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Active Membership Tier Card */}
      <Card
        style={{
          background: isGold
            ? 'linear-gradient(135deg, #354962 0%, #2D4159 100%)'
            : 'var(--bg-card)',
          color: isGold ? '#FFFFFF' : 'var(--text-main)',
          border: isGold ? '1px solid #D98E68' : '1px solid var(--card-border)',
        }}
      >
        <Card.Content style={{ padding: '1.15rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: isGold ? 0.9 : 0.7 }}>
              MEMBERSHIP TIER
            </span>
            <Crown size={20} color={isGold ? '#D98E68' : 'var(--primary)'} />
          </div>
          <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: isGold ? '#FFFFFF' : 'var(--text-main)' }}>
              {tierName} VIP
            </h3>
            <Badge variant={isGold ? 'gold' : isSilver ? 'silver' : 'junior'}>
              {discount === 100 ? '100% Free Courts' : `${discount}% Off`}
            </Badge>
          </div>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', opacity: isGold ? 0.8 : 0.65 }}>
            {discount === 100
              ? 'Complimentary Court Access Included'
              : 'Member Discount Automatically Applied'}
          </p>
        </Card.Content>
      </Card>

      {/* Daily Booking Limit Card */}
      <Card>
        <Card.Content style={{ padding: '1.15rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              DAILY ALLOWANCE
            </span>
            <Zap size={20} color="var(--primary)" />
          </div>
          <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              2 Sessions / Day
            </h3>
          </div>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> 2 Slots Available Today (0/2 Used)
          </p>
        </Card.Content>
      </Card>

      {/* Active Reservations Card */}
      <Card>
        <Card.Content style={{ padding: '1.15rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              UPCOMING RESERVATIONS
            </span>
            <CalendarCheck size={20} color="var(--info)" />
          </div>
          <div style={{ marginTop: '0.4rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              {activeCount} Active
            </h3>
          </div>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Next: Center Clay Court Tomorrow 18:00
          </p>
        </Card.Content>
      </Card>

      {/* Total Matches Played */}
      <Card>
        <Card.Content style={{ padding: '1.15rem 1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              CLUB MATCHES
            </span>
            <Award size={20} color="var(--warning)" />
          </div>
          <div style={{ marginTop: '0.4rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
              {totalPlayed} Games Played
            </h3>
          </div>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Active Club Member Ranking
          </p>
        </Card.Content>
      </Card>
    </div>
  );
};

export default MemberStatsSummary;
