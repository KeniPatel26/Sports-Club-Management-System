import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: 'var(--text-subtle)',
              marginBottom: '0.4rem',
            }}
          >
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.label || i}>
                {i > 0 && <ChevronRight size={12} />}
                {b.path ? (
                  <Link
                    to={b.path}
                    style={{
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {b.label}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <h1 style={{ margin: 0, fontWeight: 800, fontSize: '1.85rem', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            {subtitle}
          </p>
        )}
      </div>

      {action && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>{action}</div>}
    </div>
  );
};

export default PageHeader;
