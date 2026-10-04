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
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Receipt,
  FileText,
  CreditCard,
  Package,
  UtensilsCrossed,
  SlidersHorizontal,
  CheckCircle2,
  Bell,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const {
    user,
    isManager,
    isOwner,
    isStaff,
    isFrontDesk,
    isShopStaff,
    isCanteenStaff,
    isMember,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // =========================================================
  // ACTIVE NAVIGATION ITEM
  // Supports routes like:
  // /staff/front-desk
  // /staff/front-desk?tab=members
  // /staff/front-desk?tab=courts
  // /shop?view=orders
  // =========================================================

  const isItemActive = (itemPath) => {
    const [basePath, queryString] = itemPath.split('?');

    // Different pathname = not active
    if (location.pathname !== basePath) {
      return false;
    }

    const currentParams = new URLSearchParams(location.search);

    // ---------------------------------------------------------
    // Query parameter route
    // ---------------------------------------------------------

    if (queryString) {
      const itemParams = new URLSearchParams(queryString);

      // Support ?tab=...
      const itemTab = itemParams.get('tab');

      if (itemTab) {
        return currentParams.get('tab') === itemTab;
      }

      // Support ?view=...
      const itemView = itemParams.get('view');

      if (itemView) {
        return currentParams.get('view') === itemView;
      }

      return false;
    }

    // ---------------------------------------------------------
    // Normal route
    // ---------------------------------------------------------

    // If another query parameter is active, normal route should
    // not remain active.
    return currentParams.toString() === '';
  };

  // =========================================================
  // NAVIGATION ITEMS BASED ON ROLE
  // =========================================================

  const getNavItems = () => {
    // =======================================================
    // 1. CLUB MANAGER / OWNER
    // =======================================================

    if (isManager || isOwner) {
      return [
        {
          label: 'Dashboard',
          path: '/manager/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'Members',
          path: '/manager/members',
          icon: Users,
        },
        {
          label: 'Memberships',
          path: '/manager/memberships',
          icon: Crown,
        },
        {
          label: 'Employees',
          path: '/manager/employees',
          icon: Briefcase,
        },
        {
          label: 'Courts',
          path: '/manager/courts',
          icon: Calendar,
        },
        {
          label: 'Sports Shop',
          path: '/manager/shop',
          icon: ShoppingBag,
        },
        {
          label: 'Settings',
          path: '/manager/settings',
          icon: SlidersHorizontal,
        },
      ];
    }

    // =======================================================
    // 2. STAFF
    // =======================================================

    if (isStaff && !isMember) {
      // -----------------------------------------------------
      // FRONT DESK STAFF
      // -----------------------------------------------------

      if (isFrontDesk) {
        return [
          {
            label: 'Dashboard',
            path: '/staff/front-desk',
            icon: LayoutDashboard,
          },
          {
            label: 'Search Members',
            path: '/staff/front-desk?tab=members',
            icon: Users,
          },
          {
            label: 'Court Availability',
            path: '/staff/front-desk?tab=courts',
            icon: Calendar,
          },
          {
            label: "Today's Bookings",
            path: '/staff/front-desk?tab=bookings',
            icon: CheckCircle2,
          },
          {
            label: 'Booking Payments',
            path: '/staff/front-desk?tab=payments',
            icon: Receipt,
          },
          {
            label: 'My Profile & Shift',
            path: '/staff/profile',
            icon: User,
          },
        ];
      }

      // -----------------------------------------------------
      // SPORTS SHOP STAFF
      // -----------------------------------------------------

      if (isShopStaff) {
        return [
          {
            label: 'Dashboard',
            path: '/staff/shop',
            icon: LayoutDashboard,
          },
          {
            label: 'Products',
            path: '/staff/shop?tab=products',
            icon: ShoppingBag,
          },
          {
            label: 'Inventory & Stock',
            path: '/staff/shop?tab=inventory',
            icon: Package,
          },
          {
            label: 'Counter POS Sales',
            path: '/staff/shop?tab=sales',
            icon: Receipt,
          },
          {
            label: 'Online Orders',
            path: '/staff/shop?tab=orders',
            icon: Package,
          },
          {
            label: 'Shop Payments',
            path: '/staff/shop?tab=payments',
            icon: Receipt,
          },
          {
            label: 'My Profile & Shift',
            path: '/staff/profile',
            icon: User,
          },
        ];
      }

      // -----------------------------------------------------
      // CANTEEN STAFF
      // -----------------------------------------------------

      if (isCanteenStaff) {
        return [
          {
            label: 'Dashboard',
            path: '/staff/canteen',
            icon: LayoutDashboard,
          },
          {
            label: 'Menu Items',
            path: '/staff/canteen?tab=menu',
            icon: UtensilsCrossed,
          },
          {
            label: 'Kitchen Queue',
            path: '/staff/canteen?tab=orders',
            icon: Coffee,
          },
          {
            label: 'Bills',
            path: '/staff/canteen?tab=tabs',
            icon: FileText,
          },
          {
            label: 'Canteen Payments',
            path: '/staff/canteen?tab=payments',
            icon: CreditCard,
          },
          {
            label: 'My Profile & Shift',
            path: '/staff/profile',
            icon: User,
          },
        ];
      }

      // -----------------------------------------------------
      // GENERIC STAFF FALLBACK
      // -----------------------------------------------------

      return [
        {
          label: 'Staff Terminal',
          path: '/staff/front-desk',
          icon: LayoutDashboard,
        },
        {
          label: 'My Profile & Shift',
          path: '/staff/profile',
          icon: User,
        },
      ];
    }

    // =======================================================
    // 3. MEMBER
    // =======================================================

    return [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Book Court',
        path: '/courts',
        icon: Calendar,
      },
      {
        label: 'Booking History',
        path: '/booking-history',
        icon: History,
      },
      {
        label: 'Shop',
        path: '/shop',
        icon: ShoppingBag,
      },
      {
        label: 'My Orders',
        path: '/shop?view=orders',
        icon: Receipt,
      },
      {
        label: 'Canteen & Bar',
        path: '/canteen',
        icon: Coffee,
      },
      {
        label: 'Membership',
        path: '/memberships',
        icon: Crown,
      },
      {
        label: 'Profile',
        path: '/profile',
        icon: User,
      },
    ];
  };

  const navItems = getNavItems();

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <aside
      className={`sidebar-wrapper ${collapsed ? 'collapsed' : ''
        } ${mobileOpen ? 'mobile-open' : ''}`}
    >
      {/* =====================================================
          BRAND HEADER
      ====================================================== */}

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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            {/* Brand Icon */}

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

            {/* Brand Name */}

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

        {/* Header Controls */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          {/* Mobile Close Button */}

          {onCloseMobile && (
            <button
              type="button"
              className="sidebar-mobile-close-btn"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'var(--sidebar-text)',
                borderRadius: 'var(--radius-sm)',
                width: '28px',
                height: '28px',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}

          {/* Collapse Button */}

          {onToggleCollapse && (
            <button
              type="button"
              className="sidebar-collapse-toggle-btn"
              onClick={onToggleCollapse}
              aria-label={
                collapsed
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
              }
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
              {collapsed ? (
                <ChevronRight size={15} />
              ) : (
                <ChevronLeft size={15} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          NAVIGATION LINKS
      ====================================================== */}

      <div
        style={{
          flex: 1,
          padding: '0.85rem 0.65rem',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);

            return (
              <NavLink
                key={item.label + item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                onClick={() => onCloseMobile?.()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed
                    ? 'center'
                    : 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 500,
                  color: active
                    ? 'var(--sidebar-active-text)'
                    : 'var(--sidebar-text)',
                  backgroundColor: active
                    ? 'var(--sidebar-active-bg)'
                    : 'transparent',
                  borderLeft: active
                    ? '3px solid var(--primary)'
                    : '3px solid transparent',
                  transition: 'var(--transition)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-family-body)',
                }}
              >
                {/* Icon + Label */}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <Icon
                    size={17}
                    style={{
                      flexShrink: 0,
                      color: active
                        ? 'var(--primary)'
                        : 'inherit',
                    }}
                  />

                  {!collapsed && (
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Badge */}

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

      {/* =====================================================
          LOGOUT
      ====================================================== */}

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
          onClick={() => {
            onCloseMobile?.();
            handleLogout();
          }}
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
            justifyContent: collapsed
              ? 'center'
              : 'flex-start',
            fontFamily: 'var(--font-family-body)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'var(--sidebar-hover-bg)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              'transparent';
            e.currentTarget.style.color =
              'var(--sidebar-text)';
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
