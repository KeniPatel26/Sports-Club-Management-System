import React from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'var(--danger-light)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--danger)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: 'var(--danger-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertOctagon size={28} />
      </div>

      <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--danger-text)' }}>{title}</h4>
      <p style={{ margin: '0.35rem 0 1.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '450px' }}>
        {message}
      </p>

      {onRetry && (
        <Button variant="danger" size="sm" icon={RotateCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
