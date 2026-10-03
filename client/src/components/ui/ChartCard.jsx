import React, { useState } from 'react';
import Card from './Card';

export const ChartCard = ({
  title,
  subtitle,
  data = [],
  type = 'bar', // 'bar' | 'line' | 'progress'
  height = 200,
  action,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Calculate max value for auto scaling
  const maxValue = Math.max(...data.map((d) => d.value || 0), 1);

  return (
    <Card>
      <Card.Header>
        <div>
          <Card.Title>{title}</Card.Title>
          {subtitle && <Card.Description>{subtitle}</Card.Description>}
        </div>
        {action && <div>{action}</div>}
      </Card.Header>

      <Card.Content>
        {type === 'bar' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '0.5rem',
              height: `${height}px`,
              paddingTop: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            {data.map((item, idx) => {
              const heightPercent = Math.max((item.value / maxValue) * 100, 4);
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.label || idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative',
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-28px',
                        background: 'var(--text-main)',
                        color: 'var(--bg-main)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                      }}
                    >
                      {item.label}: {item.value}
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPercent}%`,
                      background: item.color || (isHovered ? 'var(--primary-hover)' : 'linear-gradient(180deg, var(--primary) 0%, #818cf8 100%)'),
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      transition: 'all 0.25s ease',
                      boxShadow: isHovered ? 'var(--shadow-glow)' : 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {type === 'progress' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            {data.map((item, idx) => (
              <div key={item.label || idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.value}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${item.value}%`,
                      height: '100%',
                      background: item.color || 'var(--primary)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Labels below chart */}
        {type === 'bar' && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.6rem',
              gap: '0.5rem',
            }}
          >
            {data.map((item, idx) => (
              <span
                key={item.label || idx}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default ChartCard;
