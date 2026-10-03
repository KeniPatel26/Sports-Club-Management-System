import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--success-text)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--warning-text)" />;
      case 'danger':
      case 'error':
        return <AlertCircle size={18} color="var(--danger-text)" />;
      case 'info':
      default:
        return <Info size={18} color="var(--info-text)" />;
    }
  };

  const getStyle = () => {
    switch (type) {
      case 'success':
        return { bg: 'var(--success-light)', border: 'var(--success)', text: 'var(--success-text)' };
      case 'warning':
        return { bg: 'var(--warning-light)', border: 'var(--warning)', text: 'var(--warning-text)' };
      case 'danger':
      case 'error':
        return { bg: 'var(--danger-light)', border: 'var(--danger)', text: 'var(--danger-text)' };
      case 'info':
      default:
        return { bg: 'var(--info-light)', border: 'var(--info)', text: 'var(--info-text)' };
    }
  };

  const style = getStyle();

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        color: style.text,
        fontSize: '0.9rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ marginTop: '2px', flexShrink: 0 }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        {title && <h5 style={{ margin: 0, fontWeight: 700, color: style.text }}>{title}</h5>}
        <div style={{ margin: title ? '0.2rem 0 0 0' : 0 }}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: style.text,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
