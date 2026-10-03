import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  History,
  ShoppingBag,
  Coffee,
  Crown,
  Users,
  Briefcase,
  TrendingUp,
  BarChart3,
  User,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Receipt,
  Package,
  UtensilsCrossed,
  SlidersHorizontal,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ collapsed = false, onToggleCollapse }) => {
  const { user, isManager, isOwner, isStaff, isFrontDesk, isShopStaff, isCanteenStaff, isMember, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine Nav Items based on Role (Member, Owner/Manager, Staff)
  const getNavItems = () => {
    // 1. Owner / Club Manager View (Business level: Members, Memberships, Employees, Courts, Shop, Settings)
    if (isManager || isOwner) {
      return [
        { label: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
        { label: 'Members', path: '/manager/members', icon: Users },
        { label: 'Memberships', path: '/manager/memberships', icon: Crown },
        { label: 'Employees', path: '/manager/employees', icon: Briefcase },
        { label: 'Courts', path: '/manager/courts', icon: Calendar },
        { label: 'Sports Shop', path: '/manager/shop', icon: ShoppingBag },
        { label: 'Canteen & Bar', path: '/manager/canteen', icon: Coffee },
        { label: 'Finance', path: '/manager/finance', icon: TrendingUp },
        { label: 'Reports', path: '/manager/reports', icon: BarChart3 },
        { label: 'Settings', path: '/manager/settings', icon: SlidersHorizontal },
      ];
    }

    // 2. Staff View (Department Specific)
    if (isStaff && !isMember) {
      if (isFrontDesk) {
        return [
          { label: 'Dashboard', path: '/staff/front-desk', icon: LayoutDashboard },
          { label: 'Member Lookup', path: '/staff/front-desk?tab=members', icon: Users },
          { label: 'Court Schedule', path: '/staff/front-desk?tab=courts', icon: Calendar },
          { label: 'Bookings & Walk-ins', path: '/staff/front-desk?tab=bookings', icon: CheckCircle2 },
          { label: 'Front Desk Payments', path: '/staff/front-desk?tab=payments', icon: Receipt },
          { label: 'My Profile & Shift', path: '/staff/profile', icon: User },
        ];
      }
      if (isShopStaff) {
        return [
          { label: 'Dashboard', path: '/staff/shop', icon: LayoutDashboard },
          { label: 'Products', path: '/staff/shop?tab=products', icon: ShoppingBag },
          { label: 'Inventory & Stock', path: '/staff/shop?tab=inventory', icon: Package },
          { label: 'Counter POS Sales', path: '/staff/shop?tab=sales', icon: Receipt },
          { label: 'Online Orders', path: '/staff/shop?tab=orders', icon: Package },
          { label: 'Shop Payments', path: '/staff/shop?tab=payments', icon: Receipt },
          { label: 'My Profile & Shift', path: '/staff/profile', icon: User },
        ];
      }
      if (isCanteenStaff) {
        return [
          { label: 'Dashboard', path: '/staff/canteen', icon: LayoutDashboard },
          { label: 'Menu Items', path: '/staff/canteen?tab=menu', icon: UtensilsCrossed },
          { label: 'Table Layout', path: '/staff/canteen?tab=tables', icon: Building2 },
          { label: 'Kitchen Queue', path: '/staff/canteen?tab=orders', icon: Coffee },
          { label: 'Table Tabs & Bills', path: '/staff/canteen?tab=tabs', icon: Receipt },
          { label: 'Canteen Payments', path: '/staff/canteen?tab=payments', icon: Receipt },
          { label: 'My Profile & Shift', path: '/staff/profile', icon: User },
        ];
      }

      // Generic Staff fallback
      return [
        { label: 'Staff Terminal', path: '/staff/front-desk', icon: LayoutDashboard },
        { label: 'My Profile & Shift', path: '/staff/profile', icon: User },
      ];
    }

    // 3. Member View (Default)
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Book Court', path: '/courts', icon: Calendar },
      { label: 'Booking History', path: '/booking-history', icon: History },
      { label: 'Shop', path: '/shop', icon: ShoppingBag },
      { label: 'My Orders', path: '/shop?view=orders', icon: Receipt },
      { label: 'Canteen & Bar', path: '/canteen', icon: Coffee },
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
            const isShopPage = location.pathname === '/shop';
            const isOrdersView = isShopPage && location.search.includes('view=orders');
            const isMyOrdersItem = item.label === 'My Orders' || item.path === '/shop?view=orders';
            const isShopItem = (item.label === 'Shop' || item.label === 'Sports Shop') && item.path === '/shop';

            const isActiveItem = isMyOrdersItem
              ? isOrdersView
              : isShopItem
                ? isShopPage && !isOrdersView
                : location.pathname === item.path.split('?')[0];

            return (
              <NavLink
                key={item.label + item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={isActiveItem ? 'sidebar-item-active' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActiveItem ? 600 : 500,
                  color: isActiveItem ? 'var(--sidebar-active-text, #ffffff)' : 'var(--sidebar-text)',
                  backgroundColor: isActiveItem ? 'var(--sidebar-active-bg, rgba(217, 142, 104, 0.22))' : 'transparent',
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-family-body)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={17} style={{ flexShrink: 0, color: isActiveItem ? 'var(--primary)' : 'inherit' }} />
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
