import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun,
  Moon,
  LogIn,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Coffee,
  Crown,
  ShieldCheck,
  Trophy,
  Menu,
} from 'lucide-react';
import NotificationDropdown from '../common/NotificationDropdown';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';

/**
 * Resolves clean, dynamic ERP Page Title matching user's active route & sub-tab
 */
const resolvePageTitle = (pathname, search) => {
  const searchParams = new URLSearchParams(search);
  const tab = searchParams.get('tab');

  // Staff Front Desk
  if (pathname === '/staff/front-desk') {
    if (tab === 'courts') return 'Court Availability Matrix';
    if (tab === 'bookings') return "Today's Bookings";
    if (tab === 'members') return 'Member Directory';
    if (tab === 'payments') return 'Booking Payments';
    if (tab === 'notifications') return 'Operational Alerts';
    return 'Front Desk Dashboard';
  }

  // Staff Sports Shop
  if (pathname === '/staff/shop') {
    if (tab === 'products') return 'Product Catalog';
    if (tab === 'inventory') return 'Inventory & Stock';
    if (tab === 'sales') return 'Counter POS Sales';
    if (tab === 'orders') return 'Online Orders';
    if (tab === 'payments') return 'Shop Payments';
    return 'Sports Shop Dashboard';
  }

  // Staff Canteen & Bar
  if (pathname === '/staff/canteen') {
    if (tab === 'menu') return 'Menu & Item Availability';
    if (tab === 'tables') return 'Table Floor Map';
    if (tab === 'orders') return 'Kitchen Order Queue';
    if (tab === 'tabs') return 'Open Tabs & Running Bills';
    if (tab === 'payments') return 'Canteen Payments';
    return 'Canteen & Bar Dashboard';
  }

  // Staff Profile & Shift
  if (pathname === '/staff/profile') {
    return 'My Profile & Shift';
  }

  // Manager ERP Dedicated Modules
  if (pathname === '/manager/dashboard') return 'Manager Dashboard';
  if (pathname === '/manager/members') return 'Member Directory';
  if (pathname === '/manager/memberships') return 'Membership Plans';
  if (pathname === '/manager/employees') {
    if (tab === 'attendance') return 'Employee Attendance';
    if (tab === 'shifts') return 'Staff Shifts';
    if (tab === 'leave') return 'Leave Requests';
    if (tab === 'payroll') return 'Payroll & Compensation';
    return 'Employees & Staff';
  }
  if (pathname === '/manager/courts') return 'Courts Management';
  if (pathname === '/manager/shop') return 'Sports Shop Management';
  if (pathname === '/manager/canteen') return 'Canteen & Bar Management';
  if (pathname === '/manager/finance') return 'Finance & Transactions';
  if (pathname === '/manager/reports') return 'Reports & Analytics';
  if (pathname === '/manager/leads') return 'CRM Leads';
  if (pathname === '/manager/settings') return 'Club Settings';

  // Member & Shared Portals
  if (pathname === '/dashboard') return 'Member Dashboard';
  if (pathname === '/courts') return 'Book a Court';
  if (pathname === '/booking-history') return 'Booking History';
  if (pathname === '/shop') return 'Pro Shop';
  if (pathname === '/canteen') return 'Canteen & Bar';
  if (pathname === '/memberships') return 'Membership Plans';
  if (pathname === '/projects') return 'Club Projects';
  if (pathname === '/ai-hub') return 'AI Assistant';
  if (pathname === '/profile') return 'My Profile';
  if (pathname === '/users') return 'User Management';

  return 'Dashboard';
};

export const Navbar = ({ onToggleSidebar, title }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const dynamicTitle = title || resolvePageTitle(location.pathname, location.search);

  const userMenuItems = [
    {
      label: `${user?.firstName || user?.name || 'User'} (${user?.role || 'MEMBER'})`,
      icon: ShieldCheck,
      disabled: true,
    },
    { divider: true },
    {
      label: 'Club Dashboard',
      icon: LayoutDashboard,
      onClick: () => navigate(user?.role === 'STAFF' ? (user?.department === 'FRONT_DESK' ? '/staff/front-desk' : user?.department === 'SPORTS_SHOP' ? '/staff/shop' : '/staff/canteen') : user?.role === 'CLUB_MANAGER' ? '/manager/dashboard' : '/dashboard'),
    },
    {
      label: 'My Profile',
      icon: UserIcon,
      onClick: () => navigate(user?.role === 'STAFF' ? '/staff/profile' : '/profile'),
    },
    { divider: true },
    {
      label: 'Logout',
      icon: LogOut,
      danger: true,
      onClick: async () => {
        await logout();
        navigate('/login');
      },
    },
  ];

  // =========================================================================
  // 1. AUTHENTICATED ERP TOPBAR (Manager, Staff, Logged-in Members)
  // Layout: [Hamburger] [Dynamic Page Heading] ------------ [Theme] [Notifs] [Profile ▼]
  // =========================================================================
  if (isAuthenticated) {
    return (
      <header
        className="authenticated-erp-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'var(--bg-glass, rgba(255, 255, 255, 0.95))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color, #E2E8F0)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1.5rem',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Left: Mobile Drawer Trigger + Dynamic Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {onToggleSidebar && (
              <button
                type="button"
                className="navbar-hamburger-btn"
                onClick={onToggleSidebar}
                aria-label="Toggle Navigation Drawer"
                style={{
                  background: '#F4F6FC',
                  border: '1px solid var(--border-color, #E2E8F0)',
                  borderRadius: 'var(--radius-md, 8px)',
                  color: 'var(--text-main, #354962)',
                  width: '38px',
                  height: '38px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                <Menu size={20} />
              </button>
            )}

            <h1
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-main, #354962)',
                fontFamily: 'var(--font-family-display, inherit)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {dynamicTitle}
            </h1>
          </div>

          {/* Right: Theme Toggle + Notifications Dropdown + User Avatar Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md, 8px)',
                background: 'var(--bg-subtle, #F4F6FC)',
                border: '1px solid var(--border-color, #E2E8F0)',
                color: 'var(--text-main, #354962)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)',
              }}
            >
              {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* User Profile Dropdown */}
            <Dropdown
              trigger={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full, 9999px)',
                    background: 'var(--bg-subtle, #F4F6FC)',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <img
                    src={
                      user?.profileImage ||
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || user?.name || 'User'}`
                    }
                    alt={user?.firstName || user?.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main, #354962)' }}>
                    {user?.firstName || user?.name?.split(' ')[0] || 'Member'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)' }}>▼</span>
                </div>
              }
              items={userMenuItems}
            />
          </div>
        </div>
      </header>
    );
  }

  // =========================================================================
  // 2. PUBLIC WEBSITE HEADER (Unauthenticated Visitors & Landing Page)
  // Layout: [SportsClub Logo + LIVE OS] [Public Nav Links] ------ [Theme] [Club Login]
  // =========================================================================
  return (
    <header
      className="public-website-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-glass, rgba(255, 255, 255, 0.95))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color, #E2E8F0)',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        {/* Left: Brand Logo & Public Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md, 8px)',
                background: 'linear-gradient(135deg, #354962 0%, #D98E68 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Trophy size={20} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--text-main, #354962)' }}>
                Sports<span style={{ color: 'var(--primary, #D98E68)' }}>Club</span>
              </span>
              <span
                style={{
                  marginLeft: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(22, 163, 74, 0.12)',
                  color: '#16a34a',
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                LIVE OS
              </span>
            </div>
          </Link>

          <nav className="navbar-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link
              to="/"
              style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', textDecoration: 'none' }}
            >
              Home
            </Link>
            <Link
              to="/courts"
              style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', textDecoration: 'none' }}
            >
              Courts
            </Link>
            <Link
              to="/memberships"
              style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', textDecoration: 'none' }}
            >
              Memberships
            </Link>
            <Link
              to="/shop"
              style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', textDecoration: 'none' }}
            >
              Shop
            </Link>
            <Link
              to="/canteen"
              style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted, #64748B)', textDecoration: 'none' }}
            >
              Canteen
            </Link>
          </nav>
        </div>

        {/* Right: Theme Toggle & Login CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'var(--bg-subtle, #F4F6FC)',
              border: '1px solid var(--border-color, #E2E8F0)',
              color: 'var(--text-main, #354962)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
          </button>

          <Button
            variant="primary"
            size="sm"
            icon={LogIn}
            onClick={() => navigate('/login')}
          >
            Club Login
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
