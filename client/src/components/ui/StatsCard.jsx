import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from './Card';

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  subtitle,
  color = 'primary',
  onClick,
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'success':
        return { bg: 'var(--success-light)', text: 'var(--success-text)', border: 'var(--success)' };
      case 'warning':
        return { bg: 'var(--warning-light)', text: 'var(--warning-text)', border: 'var(--warning)' };
      case 'danger':
        return { bg: 'var(--danger-light)', text: 'var(--danger-text)', border: 'var(--danger)' };
      case 'secondary':
        return { bg: 'var(--secondary-light)', text: 'var(--secondary-hover)', border: 'var(--secondary)' };
      case 'primary':
      default:
        return { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'var(--primary)' };
    }
  };

  const style = getColorStyles();

  return (
    <Card hoverable={!!onClick} onClick={onClick}>
      <Card.Content>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {title}
            </p>
            <h2 style={{ margin: '0.35rem 0 0 0', fontWeight: 800, fontSize: '1.85rem' }}>{value}</h2>
          </div>

          {Icon && (
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: style.bg,
                color: style.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={22} />
            </div>
          )}
        </div>

        {(trend || subtitle) && (
          <div
            style={{
              marginTop: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
            }}
          >
            {trend && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: 700,
                  color: trendDirection === 'up' ? 'var(--success-text)' : 'var(--danger-text)',
                  backgroundColor: trendDirection === 'up' ? 'var(--success-light)' : 'var(--danger-light)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {trendDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}
              </span>
            )}
            {subtitle && <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
          </div>
        )}
      </Card.Content>
    </Card>
  );
};

export default StatsCard;
