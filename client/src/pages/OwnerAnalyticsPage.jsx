import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  ShoppingBag,
  Coffee,
  Calendar,
  Award,
  Users,
  CreditCard,
  Download,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import financeService from '../services/financeService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';

export const OwnerAnalyticsPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await financeService.getOverview();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error(err);
      showError('Failed to fetch financial revenue analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportReport = () => {
    window.print();
  };

  if (loading) {
    return <Loader fullPage text="Aggregating club revenue & financial audits..." />;
  }

  const {
    courtRevenue = 0,
    membershipRevenue = 0,
    shopRevenue = 0,
    canteenRevenue = 0,
    totalRevenue = 0,
    monthlyPayroll = 0,
    paymentMethods = { cash: 0, card: 0, upi: 0, online: 0 },
    breakdown = [],
  } = analytics || {};

  const totalPaymentSum =
    (paymentMethods.cash || 0) +
    (paymentMethods.card || 0) +
    (paymentMethods.upi || 0) +
    (paymentMethods.online || 0) || 1;

  const netOperatingMargin = totalRevenue - monthlyPayroll;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <TrendingUp size={28} color="#10b981" />
            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>
              Owner & Executive <span className="text-gradient">Financial Hub</span>
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Unified financial consolidation: Court bookings, Pro Shop sales, Canteen bar tabs, and Member subscriptions.
            Replaces manual paper receipts and fragmented spreadsheets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={RefreshCw} onClick={fetchAnalytics}>
            Refresh Ledger
          </Button>
          <Button variant="primary" icon={Download} onClick={handleExportReport}>
            Print / Export P&L
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <Card
          style={{
            borderLeft: '4px solid #10b981',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              TOTAL GROSS REVENUE
            </span>
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10b981' }}>
            ₹{totalRevenue.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Consolidated across all 4 club streams
          </span>
        </Card>

        <Card
          style={{
            borderLeft: '4px solid var(--primary)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, var(--bg-card) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              COURTS & TURF INCOME
            </span>
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>₹{courtRevenue.toLocaleString()}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tennis, Padel & Cricket slots
          </span>
        </Card>

        <Card
          style={{
            borderLeft: '4px solid #f59e0b',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, var(--bg-card) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              PRO GEAR & BAR REVENUE
            </span>
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Coffee size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>
            ₹{(shopRevenue + canteenRevenue).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Shop: ₹{shopRevenue.toLocaleString()} • Bar: ₹{canteenRevenue.toLocaleString()}
          </span>
        </Card>

        <Card
          style={{
            borderLeft: '4px solid #8b5cf6',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, var(--bg-card) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              STAFF PAYROLL LIABILITY
            </span>
            <div style={{ padding: '6px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ef4444' }}>
            ₹{monthlyPayroll.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Net Operating: <strong>₹{netOperatingMargin.toLocaleString()}</strong>
          </span>
        </Card>
      </div>

      {/* Revenue Stream Breakdown & Payment Method Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Stream Breakdown */}
        <Card title="Revenue Channels Breakdown">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="#D9A65D" /> Memberships Subscriptions
                </span>
                <strong>
                  ₹{membershipRevenue.toLocaleString()} (
                  {totalRevenue ? Math.round((membershipRevenue / totalRevenue) * 100) : 0}%)
                </strong>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${totalRevenue ? (membershipRevenue / totalRevenue) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: '#D9A65D',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} color="var(--chart-court)" /> Court Booking & Walk-ins
                </span>
                <strong>
                  ₹{courtRevenue.toLocaleString()} (
                  {totalRevenue ? Math.round((courtRevenue / totalRevenue) * 100) : 0}%)
                </strong>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${totalRevenue ? (courtRevenue / totalRevenue) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: 'var(--chart-court)',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={16} color="var(--chart-shop)" /> Pro Gear Pro Shop
                </span>
                <strong>
                  ₹{shopRevenue.toLocaleString()} (
                  {totalRevenue ? Math.round((shopRevenue / totalRevenue) * 100) : 0}%)
                </strong>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${totalRevenue ? (shopRevenue / totalRevenue) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: 'var(--chart-shop)',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Coffee size={16} color="var(--chart-canteen)" /> Bar Lounge & Canteen Tabs
                </span>
                <strong>
                  ₹{canteenRevenue.toLocaleString()} (
                  {totalRevenue ? Math.round((canteenRevenue / totalRevenue) * 100) : 0}%)
                </strong>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${totalRevenue ? (canteenRevenue / totalRevenue) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: 'var(--chart-canteen)',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Channels (UPI, Card, Cash, Online) */}
        <Card title="Payment Methods Distribution">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                UPI / QR Pay
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{paymentMethods.upi?.toLocaleString() || 0}
              </span>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                Card POS
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                ₹{paymentMethods.card?.toLocaleString() || 0}
              </span>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                Cash Register
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>
                ₹{paymentMethods.cash?.toLocaleString() || 0}
              </span>
            </div>
            <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                Online Gateway
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#8b5cf6' }}>
                ₹{paymentMethods.online?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Eliminates lost bar tabs and paper receipt discrepancies by verifying daily end-of-shift drawer tallies against digital logs.
          </p>
        </Card>
      </div>

      {/* Operational Highlights for Owner */}
      <Card title="Business Control Center & Audit Checklist">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>
                Automatic Multi-Tier Discount Audits
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                System cross-verifies member Gold (100% court disc), Silver (50%), and Junior (70%) entitlements in real-time.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>
                Unified Shelf & Online Inventory
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Physical counter purchases and website customer orders draw from the single source of stock truth.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)' }}>
              <Coffee size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>
                Live Table & Bar Tab Reconciliation
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Unsettled table bills are tracked continuously to eliminate misplaced kitchen chits and uncollected payments.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OwnerAnalyticsPage;
