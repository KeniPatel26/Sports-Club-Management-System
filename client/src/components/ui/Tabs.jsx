import React, { useState } from 'react';

export const Tabs = ({ tabs = [], defaultActiveTab = 0, onChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) onChange(index, tabs[index]);
  };

  return (
    <div className={className}>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.25rem',
          marginBottom: '1.25rem',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab, idx) => {
          const isActive = activeTab === idx;
          const Icon = tab.icon;

          return (
            <button
              key={tab.label || idx}
              type="button"
              onClick={() => handleTabClick(idx)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
              }}
            >
              {Icon && <Icon size={16} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--primary)' : 'var(--bg-subtle)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>{tabs[activeTab]?.content}</div>
    </div>
  );
};

export default Tabs;
