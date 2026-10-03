import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sun,
  Moon,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Coffee,
  Crown,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  Trophy,
  Building2,
  Award,
} from 'lucide-react';
import NotificationDropdown from '../common/NotificationDropdown';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout, isOwner } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
      onClick: () => navigate('/dashboard'),
    },
    {
      label: 'Court Bookings',
      icon: Calendar,
      onClick: () => navigate('/courts'),
    },
    {
      label: 'Pro Shop',
      icon: ShoppingBag,
      onClick: () => navigate('/shop'),
    },
    {
      label: 'Canteen & Bar',
      icon: Coffee,
      onClick: () => navigate('/canteen'),
    },
    {
      label: 'My Profile',
      icon: UserIcon,
      onClick: () => navigate('/profile'),
    },
    { divider: true },
    {
      label: 'Logout',
      icon: LogOut,
      danger: true,
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        height: '64px',
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
        }}
      >
        {/* Left: Brand Logo & Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #354962 0%, #D98E68 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Trophy size={19} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-main)', fontFamily: 'var(--font-family-display)' }}>
                Sports<span style={{ color: 'var(--primary)' }}>Club</span>
              </span>
              <span
                style={{
                  marginLeft: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success-text)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                LIVE OS
              </span>
            </div>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link
              to="/courts"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Courts
            </Link>
            <Link
              to="/shop"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Pro Shop
            </Link>
            <Link
              to="/canteen"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Bar Lounge
            </Link>
            <Link
              to="/memberships"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Crown size={14} color="#f59e0b" />
              Plans
            </Link>
          </nav>
        </div>

        {/* Right: Actions, Theme, Notifications & User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
            }}
          >
            {theme === 'dark' ? <Sun size={17} color="#f59e0b" /> : <Moon size={17} />}
          </button>

          {/* Notifications Dropdown (when authenticated) */}
          {isAuthenticated && <NotificationDropdown />}

          {/* Auth State Button / Profile Dropdown */}
          {isAuthenticated ? (
            <Dropdown
              trigger={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.35rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {user?.firstName || user?.name?.split(' ')[0] || 'Member'}
                  </span>
                </div>
              }
              items={userMenuItems}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Button
                variant="ghost"
                size="sm"
                icon={LogIn}
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
