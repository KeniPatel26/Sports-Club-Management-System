import React from 'react';
import { formatTimeAgo } from '../../utils/formatDate';
import { Activity as ActivityIcon } from 'lucide-react';

export const ActivityTimeline = ({ activities = [], limit = 10, className = '' }) => {
  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No recent activities recorded.
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative', paddingLeft: '1.5rem' }}>
      {/* Vertical line connecting nodes */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          bottom: '12px',
          left: '11px',
          width: '2px',
          backgroundColor: 'var(--border-color)',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {displayActivities.map((act, idx) => {
          const userName = act.user?.name || 'System';
          const userAvatar = act.user?.avatar;

          return (
            <div
              key={act._id || idx}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
              }}
            >
              {/* Node dot / avatar */}
              <div
                style={{
                  position: 'absolute',
                  left: '-1.5rem',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <ActivityIcon size={12} color="var(--primary)" />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>
                    {userName}{' '}
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                      {act.action}
                    </span>
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                    {formatTimeAgo(act.createdAt || act.timestamp)}
                  </span>
                </div>

                {act.entity && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '0.25rem',
                      fontSize: '0.75rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {act.entity}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
