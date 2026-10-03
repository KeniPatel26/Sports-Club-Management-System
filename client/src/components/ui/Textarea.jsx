import React from 'react';

export const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  rows = 4,
  error = '',
  helperText = '',
  disabled = false,
  required = false,
  className = '',
  maxLength,
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <label className="form-label">
            {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
          </label>
        )}
        {maxLength && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {(value || '').length}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        className="form-textarea"
        style={{
          borderColor: error ? 'var(--danger)' : undefined,
          resize: 'vertical',
        }}
        {...props}
      />

      {error && <p className="form-error">{error}</p>}
      {helperText && !error && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Textarea;
