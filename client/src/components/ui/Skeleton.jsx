import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-md)',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--border-color)',
        backgroundImage: 'linear-gradient(90deg, var(--border-color) 0%, var(--bg-subtle) 50%, var(--border-color) 100%)',
        backgroundSize: '200% 100%',
        animation: 'pulseGlow 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div
    style={{
      padding: '1.5rem',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Skeleton width="48px" height="48px" borderRadius="var(--radius-full)" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton width="60%" height="18px" />
        <Skeleton width="40%" height="14px" />
      </div>
    </div>
    <Skeleton width="100%" height="14px" />
    <Skeleton width="85%" height="14px" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      padding: '1rem',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)',
    }}
  >
    <Skeleton width="100%" height="40px" borderRadius="var(--radius-md)" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} width="100%" height="32px" borderRadius="var(--radius-sm)" />
    ))}
  </div>
);

export default Object.assign(Skeleton, {
  Card: SkeletonCard,
  Table: SkeletonTable,
});
