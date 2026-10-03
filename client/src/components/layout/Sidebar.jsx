import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Coffee,
  Crown,
  Users,
  Briefcase,
  TrendingUp,
  BarChart3,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Receipt,
  Package,
  UtensilsCrossed,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ collapsed = false, onToggleCollapse }) => {
  const { user, isManager, isOwner, isStaff, isFrontDesk, isShopStaff, isCanteenStaff, isMember, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine Nav Items based on Role (Member, Owner/Manager, Staff)
  const getNavItems = () => {
    // 1. Owner / Club Manager View
    if (isManager || isOwner) {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Members', path: '/users', icon: Users },
        { label: 'Courts', path: '/courts', icon: Calendar },
        { label: 'Bookings', path: '/courts', icon: Calendar, badge: 'Live' },
        { label: 'Shop', path: '/shop', icon: ShoppingBag },
        { label: 'Canteen', path: '/canteen', icon: Coffee },
        { label: 'Finance', path: '/finance-analytics', icon: TrendingUp },
        { label: 'Reports', path: '/finance-analytics', icon: BarChart3 },
        { label: 'Staff', path: '/staff-roster', icon: Briefcase },
        { label: 'Settings', path: '/profile', icon: SlidersHorizontal },
      ];
    }

    // 2. Staff View (Department Specific)
    if (isStaff && !isMember) {
      if (isFrontDesk) {
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Courts', path: '/courts', icon: Calendar },
          { label: 'Bookings', path: '/courts', icon: Calendar, badge: 'Live' },
          { label: 'Members', path: '/users', icon: Users },
          { label: 'Staff Roster', path: '/staff-roster', icon: Briefcase },
          { label: 'Settings', path: '/profile', icon: SlidersHorizontal },
        ];
      }
      if (isShopStaff) {
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Products', path: '/shop', icon: Package },
          { label: 'Orders', path: '/shop', icon: ShoppingBag },
          { label: 'Staff Roster', path: '/staff-roster', icon: Briefcase },
          { label: 'Settings', path: '/profile', icon: SlidersHorizontal },
        ];
      }
      if (isCanteenStaff) {
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Menu & Tables', path: '/canteen', icon: UtensilsCrossed },
          { label: 'Orders & Tabs', path: '/canteen', icon: Coffee },
          { label: 'Staff Roster', path: '/staff-roster', icon: Briefcase },
          { label: 'Settings', path: '/profile', icon: SlidersHorizontal },
        ];
      }

      // Generic Staff fallback
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Courts & Bookings', path: '/courts', icon: Calendar },
        { label: 'Shop Operations', path: '/shop', icon: ShoppingBag },
        { label: 'Canteen & Bar', path: '/canteen', icon: Coffee },
        { label: 'Staff Roster', path: '/staff-roster', icon: Briefcase },
        { label: 'Settings', path: '/profile', icon: SlidersHorizontal },
      ];
    }

    // 3. Member View (Default)
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Book Court', path: '/courts', icon: Calendar },
      { label: 'Shop', path: '/shop', icon: ShoppingBag },
      { label: 'Canteen', path: '/canteen', icon: Coffee },
      { label: 'My Orders', path: '/shop', icon: Receipt },
      { label: 'Membership', path: '/memberships', icon: Crown },
      { label: 'Profile', path: '/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className={`sidebar-wrapper ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.15rem',
          borderBottom: '1px solid var(--sidebar-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '64px',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}
            >
              <Dumbbell size={17} />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.04em',
                color: '#FFFFFF',
                fontFamily: 'var(--font-family-display)',
                textTransform: 'uppercase',
              }}
            >
              SPORTS CLUB
            </span>
          </div>
        )}

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--sidebar-text)',
              borderRadius: 'var(--radius-sm)',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: '0.85rem 0.65rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label + item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                  backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-family-body)',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={17} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      padding: '1px 6px',
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

      {/* Bottom User / Logout Section */}
      <div
        style={{
          padding: '0.85rem 0.85rem',
          borderTop: '1px solid var(--sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            border: 'none',
            color: 'var(--sidebar-text)',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'var(--transition)',
            justifyContent: collapsed ? 'center' : 'flex-start',
            fontFamily: 'var(--font-family-body)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--sidebar-hover-bg)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--sidebar-text)';
          }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
