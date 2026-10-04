import React from 'react';
import {
  Trophy,
  Activity,
  Flame,
  Target,
  Star,
  Sun,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import FilterDropdown from '../ui/FilterDropdown';

export const MemberCourtGrid = ({
  courts = [],
  selectedSport = 'ALL',
  onSelectSport,
  selectedCourt,
  onSelectCourt,
  userDiscount = 100,
  onContinue,
}) => {
  const sportsList = ['ALL', ...new Set(courts.map((court) => court.type?.toUpperCase()).filter(Boolean))];

  const filteredCourts = courts.filter(
    (c) => selectedSport === 'ALL' || c.type?.toUpperCase() === selectedSport.toUpperCase()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <FilterDropdown
        label="Court type"
        value={selectedSport}
        onChange={(event) => onSelectSport(event.target.value)}
        options={sportsList.map((sport) => ({ value: sport, label: sport === 'ALL' ? 'All courts' : sport }))}
      />

      {/* Courts Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        {filteredCourts.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '2.5rem',
              textAlign: 'center',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--card-border)',
              color: 'var(--text-muted)',
            }}
          >
            No courts found for the selected category.
          </div>
        ) : (
          filteredCourts.map((court) => {
            const isSelected = selectedCourt?._id === court._id;
            const baseRate = court.hourlyRate || 600;
            const memberRate = Math.max(0, baseRate * (1 - userDiscount / 100));

            return (
              <div
                key={court._id}
                onClick={() => onSelectCourt(court)}
                style={{
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  position: 'relative',
                }}
              >
                {/* Top: Image & Tag Badges */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={court.image || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80'}
                    alt={court.name}
                    style={{
                      width: '100%',
                      height: '150px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                    }}
                  />
                  {court.rating && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(23, 38, 59, 0.9)',
                        color: '#F59E0B',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <Star size={12} fill="#F59E0B" /> {court.rating}
                    </div>
                  )}

                  <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                    <Badge variant={court.isIndoor ? 'info' : 'active'}>
                      {court.isIndoor ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Building2 size={12} /> Indoor AC
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Sun size={12} /> Floodlit
                        </span>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Middle: Name & Description */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {court.name}
                    </h4>
                  </div>

                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {court.description || `Surface: ${court.surface || 'Pro Turf'} with tournament lighting.`}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      marginTop: '0.5rem',
                      fontSize: '0.775rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Surface: <strong>{court.surface || 'Professional Turf'}</strong></span>
                  </div>
                </div>

                {/* Bottom: Pricing & Select CTA */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>
                      Member Hourly Rate
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                      {userDiscount > 0 && memberRate < baseRate && (
                        <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                          ₹{baseRate}
                        </span>
                      )}
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {memberRate === 0 ? 'Included' : `₹${memberRate}/hr`}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCourt(court);
                      if (onContinue) onContinue(court);
                    }}
                  >
                    {isSelected ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={15} /> Selected
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Select Court <ArrowRight size={14} />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MemberCourtGrid;
