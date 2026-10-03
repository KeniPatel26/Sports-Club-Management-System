import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ size = 'md', text = 'Loading...', fullPage = false, inline = false }) => {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 36 : 24;

  const content = (
    <div
      style={{
        display: inline ? 'inline-flex' : 'flex',
        flexDirection: inline ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: inline ? 0 : '2rem',
        color: 'var(--primary)',
      }}
    >
      <Loader2 className="animate-spin" size={iconSize} />
      {text && (
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
