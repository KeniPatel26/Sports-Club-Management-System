import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import managerService from '../../services/managerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  TrendingUp,
  Users,
  Calendar,
  ShoppingBag,
  Coffee,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Trophy,
  CreditCard,
  UserCheck,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import ChartCard from '../../components/ui/ChartCard';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await managerService.getDashboardOverview();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      toastError('Failed to load live overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const kpi = data?.kpi || {
    totalRevenue: 335000,
    activeMembers: 426,
    todayBookings: 38,
    shopOrders: 23,
    canteenOrders: 17,
    lowStockCount: 7,
  };

  const revenueBreakdown = data?.revenueBreakdown || {
    total: 335000,
    membership: 150000,
    court: 80000,
    shop: 60000,
    canteen: 45000,
  };

  const courtUtilization = data?.courtUtilization || [
    { name: 'Center Court (Tennis)', type: 'TENNIS', utilization: 85 },
    { name: 'Court 2 (Tennis)', type: 'TENNIS', utilization: 72 },
    { name: 'Box Cricket Turf 1', type: 'CRICKET', utilization: 88 },
    { name: 'Padel Glass Court A', type: 'PADEL', utilization: 78 },
  ];

  const alerts = data?.alerts || [
    {
      type: 'WARNING',
      title: '7 products are low in stock',
      description: 'Items like Yonex Astrox Racket & Head Balls need restocking.',
      actionUrl: '/manager/shop',
    },
    {
      type: 'INFO',
      title: '5 memberships expire within 7 days',
      description: 'Send renewal reminders to maintain member privileges.',
      actionUrl: '/manager/memberships',
    },
    {
      type: 'ACTION_REQUIRED',
      title: '3 leave requests waiting for approval',
      description: 'Front Desk and Canteen staff submitted leave requests.',
      actionUrl: '/manager/employees',
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Top Greeting Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(217, 142, 104, 0.15)',
                color: '#D98E68',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Trophy size={12} /> CLUB MANAGER HUB
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
              • Today: 03 October 2026
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#17263B', margin: 0, letterSpacing: '-0.02em' }}>
            Good Morning, {user?.firstName || 'Manager'}
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748B', fontSize: '0.92rem' }}>
            Here is your live operations summary across Memberships, Courts, Pro-Shop, and Canteen.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchOverview}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DDE2EC',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#354962',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <Link
            to="/manager/members"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.15rem',
              backgroundColor: '#D98E68',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(217, 142, 104, 0.25)',
            }}
          >
            <Plus size={16} /> Add Member
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Total Revenue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Consolidated Revenue</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(217, 142, 104, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D98E68' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#17263B' }}>
            ₹{kpi.totalRevenue?.toLocaleString('en-IN') || '3,35,000'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', fontSize: '0.75rem', color: '#8FAF98', fontWeight: 700 }}>
            <ArrowUpRight size={14} /> +12.4% vs last month
          </div>
        </div>

        {/* Active Members */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Active Members</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(143, 175, 152, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8FAF98' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#17263B' }}>
            {kpi.activeMembers || 426}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', fontSize: '0.75rem', color: '#8FAF98', fontWeight: 700 }}>
            <ArrowUpRight size={14} /> +8.2% growth
          </div>
        </div>

        {/* Today's Bookings */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Today's Bookings</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#17263B' }}>
            {kpi.todayBookings || 38}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
            5 Courts active
          </div>
        </div>

        {/* Shop Orders */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Shop Orders</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(168, 192, 172, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#354962' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#17263B' }}>
            {kpi.shopOrders || 23}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
            Counter & Online
          </div>
        </div>

        {/* Cafe Orders */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Canteen Orders</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(240, 176, 142, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D98E68' }}>
              <Coffee size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#17263B' }}>
            {kpi.canteenOrders || 17}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
            6 Tables served
          </div>
        </div>

        {/* Low Stock Alert Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.25rem',
            borderRadius: '14px',
            border: '1px solid #F6DEDE',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D97979' }}>Low Stock Items</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F6DEDE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97979' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#D97979' }}>
            {kpi.lowStockCount || 7}
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#D97979', fontWeight: 600 }}>
            Requires restocking
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Overview & Court Utilization */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Revenue Breakdown */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#17263B' }}>
                Revenue by Department
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>October 2026 Consolidated</span>
            </div>
            <Link to="/manager/finance" style={{ fontSize: '0.8rem', color: '#D98E68', fontWeight: 700, textDecoration: 'none' }}>
              View Finance &rarr;
            </Link>
          </div>

          <ChartCard bare type="bar" height={230} currency data={[
            { label: 'Membership', value: revenueBreakdown.membership, color: '#D98E68' },
            { label: 'Courts', value: revenueBreakdown.court, color: '#8FAF98' },
            { label: 'Shop', value: revenueBreakdown.shop, color: '#38bdf8' },
            { label: 'Canteen', value: revenueBreakdown.canteen, color: '#F0B08E' },
          ]} />
        </div>

        {/* Court Utilization */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#17263B' }}>
                Court Utilization Today
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Peak hours 06:00 PM - 09:00 PM</span>
            </div>
            <Link to="/manager/courts" style={{ fontSize: '0.8rem', color: '#D98E68', fontWeight: 700, textDecoration: 'none' }}>
              Schedule &rarr;
            </Link>
          </div>

          <ChartCard bare type="bar" horizontal height={230} data={courtUtilization.map((c) => ({ label: c.name, value: c.utilization, color: c.utilization > 80 ? '#D98E68' : '#8FAF98' }))} />
        </div>
      </div>

      {/* Bottom Grid: System Alerts & Employee/Membership summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* System Attention Alerts */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertTriangle size={18} color="#D98E68" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#17263B' }}>
              Action Required & Alerts
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {alerts.map((a, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#F4F6FC',
                  borderRadius: '10px',
                  borderLeft: '4px solid #D98E68',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#17263B', marginBottom: '0.15rem' }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{a.description}</div>
                </div>
                {a.actionUrl && (
                  <Link
                    to={a.actionUrl}
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#D98E68',
                      textDecoration: 'none',
                      padding: '4px 8px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      border: '1px solid #DDE2EC',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Employee Operations Status */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid #DDE2EC',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#17263B' }}>
              Staff & Attendance Status
            </h3>
            <Link to="/manager/employees" style={{ fontSize: '0.8rem', color: '#D98E68', fontWeight: 700, textDecoration: 'none' }}>
              Roster &rarr;
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#F4F6FC', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#8FAF98' }}>20 / 24</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Staff Present Today</div>
            </div>
            <div style={{ padding: '0.85rem', backgroundColor: '#F4F6FC', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D98E68' }}>2 Staff</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Approved Leave</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#354962' }}>
              <span>• Front Desk Department:</span>
              <strong>8 Scheduled (Morning & Evening)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#354962' }}>
              <span>• Sports Pro-Shop:</span>
              <strong>6 Scheduled (Full Coverage)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#354962' }}>
              <span>• Canteen & Cafe Lounge:</span>
              <strong>10 Active on Shift</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
