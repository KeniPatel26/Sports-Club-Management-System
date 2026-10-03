import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type) => {
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

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return { borderLeft: '4px solid var(--success)', bg: 'var(--bg-card)' };
      case 'warning':
        return { borderLeft: '4px solid var(--warning)', bg: 'var(--bg-card)' };
      case 'danger':
      case 'error':
        return { borderLeft: '4px solid var(--danger)', bg: 'var(--bg-card)' };
      case 'info':
      default:
        return { borderLeft: '4px solid var(--primary)', bg: 'var(--bg-card)' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        maxWidth: '380px',
        width: '100%',
      }}
    >
      {toasts.map((toast) => {
        const style = getToastStyle(toast.type);

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              backgroundColor: style.bg,
              borderLeft: style.borderLeft,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-color)',
              animation: 'fadeIn 0.25s ease forwards',
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>{getToastIcon(toast.type)}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {toast.title}
                </h5>
              )}
              <p
                style={{
                  margin: toast.title ? '0.15rem 0 0 0' : 0,
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
