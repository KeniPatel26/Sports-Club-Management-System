import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Coffee,
  Crown,
  Users,
  Briefcase,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trophy,
  User,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ collapsed = false, onToggleCollapse }) => {
  const { user, isOwner, isAdmin, isStaff } = useAuth();

  const navItems = [
    {
      section: 'CLUB OPERATIONS',
      items: [
        { label: 'Operations Hub', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Courts & Bookings', path: '/courts', icon: Calendar, badge: 'Live' },
        { label: 'Pro Gear Shop', path: '/shop', icon: ShoppingBag },
        { label: 'Bar & Canteen', path: '/canteen', icon: Coffee },
      ],
    },
    {
      section: 'MEMBERSHIPS & CRM',
      items: [
        { label: 'Membership Plans', path: '/memberships', icon: Crown },
        { label: 'Website Leads & CRM', path: '/leads', icon: MessageSquare },
      ],
    },
    {
      section: 'MANAGEMENT & AUDIT',
      items: [
        { label: 'Staff Roster & Leaves', path: '/staff-roster', icon: Briefcase },
        { label: 'Revenue & Financials', path: '/finance-analytics', icon: TrendingUp, adminOnly: true },
        { label: 'Member Directory', path: '/users', icon: Users, adminOnly: true },
        { label: 'AI Operations Co-Pilot', path: '/ai-hub', icon: Sparkles, badge: 'AI' },
        { label: 'My Profile', path: '/profile', icon: User },
      ],
    },
  ];

  return (
    <aside className={`sidebar-wrapper ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand / Header */}
      <div
        style={{
          padding: '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '64px',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}
            >
              <Trophy size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              Champions<span className="text-gradient">Club</span>
            </span>
          </div>
        )}

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        {navItems.map((sec, secIdx) => (
          <div key={sec.section} style={{ marginBottom: '1.25rem' }}>
            {!collapsed && (
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--text-subtle)',
                  letterSpacing: '0.06em',
                  padding: '0 0.6rem 0.4rem 0.6rem',
                }}
              >
                {sec.section}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {sec.items.map((item) => {
                if (item.adminOnly && !isOwner && !isAdmin) return null;
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path + item.label}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      transition: 'var(--transition)',
                      textDecoration: 'none',
                    })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={18} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          backgroundColor: item.badge === 'Live' ? '#10b981' : 'var(--accent)',
                          color: '#ffffff',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Info footer in Sidebar */}
      {!collapsed && user && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <img
            src={
              user.profileImage ||
              user.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName || user.name || 'User'}`
            }
            alt={user.firstName || user.name}
            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: user.role === 'OWNER' ? '#f59e0b' : 'var(--primary)',
                  textTransform: 'capitalize',
                  fontWeight: 700,
                }}
              >
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
