import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  ShoppingBag,
  Coffee,
  Crown,
  TrendingUp,
  Users,
  Briefcase,
  Trophy,
  ArrowRight,
  Plus,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Tag,
  Zap,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import StatsCard from '../components/ui/StatsCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import courtBookingService from '../services/courtBookingService';
import shopCanteenService from '../services/shopCanteenService';
import financeService from '../services/financeService';
import membershipService from '../services/membershipService';
import staffService from '../services/staffService';

export const Dashboard = () => {
  const { user, isOwner, isStaff } = useAuth();
  const navigate = useNavigate();

  const [courts, setCourts] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [financeOverview, setFinanceOverview] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [courtsRes, tabsRes, productsRes, financeRes, plansRes] = await Promise.allSettled([
          courtBookingService.getCourts(),
          shopCanteenService.getOpenTabs(),
          shopCanteenService.getProducts({ type: 'sports' }),
          financeService.getOverview(),
          membershipService.getPlans(),
        ]);

        if (courtsRes.status === 'fulfilled' && courtsRes.value.success) {
          setCourts(courtsRes.value.data || []);
        }
        if (tabsRes.status === 'fulfilled' && tabsRes.value.success) {
          setOpenTabs(tabsRes.value.data || []);
        }
        if (productsRes.status === 'fulfilled' && productsRes.value.success) {
          const prods = productsRes.value.data || [];
          setLowStockProducts(prods.filter((p) => p.stock <= (p.lowStockThreshold || 5)));
        }
        if (financeRes.status === 'fulfilled' && financeRes.value.success) {
          setFinanceOverview(financeRes.value.data);
        }
        if (plansRes.status === 'fulfilled' && plansRes.value.success) {
          setPlans(plansRes.value.data || []);
        }
      } catch (err) {
        console.error('Error loading club dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalRev = financeOverview?.totalRevenue || 45200;
  const courtRev = financeOverview?.courtRevenue || 14800;
  const shopRev = financeOverview?.shopRevenue || 12400;
  const canteenRev = financeOverview?.canteenRevenue || 6800;
  const memRev = financeOverview?.membershipRevenue || 11200;

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome to The Champions Club, ${user?.firstName || user?.name || 'Athlete'}! 🏆`}
        subtitle="Digital backbone for Court Reservations, Pro Gear Shop, Bar Lounge Tabs, and Multi-Tier Memberships."
        breadcrumbs={[{ label: 'Club OS', path: '/' }, { label: 'Operations Hub' }]}
        action={
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Calendar}
              onClick={() => navigate('/courts')}
            >
              Book Court
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ShoppingBag}
              onClick={() => navigate('/shop')}
            >
              Pro Shop
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        <StatsCard
          title="Consolidated Revenue"
          value={`₹${totalRev.toLocaleString()}`}
          icon={TrendingUp}
          color="success"
          trend="Courts + Shop + Bar + Plans"
          trendDirection="up"
          onClick={() => navigate('/finance-analytics')}
        />
        <StatsCard
          title="Sports Courts & Turfs"
          value={`${courts.length || 5} Available`}
          icon={Calendar}
          color="primary"
          trend="Tennis, Cricket, Padel"
          trendDirection="up"
          onClick={() => navigate('/courts')}
        />
        <StatsCard
          title="Open Bar & Cafe Tabs"
          value={`${openTabs.length} Active`}
          icon={Coffee}
          color="warning"
          trend="Table service live"
          onClick={() => navigate('/canteen')}
        />
        <StatsCard
          title="Membership Tiers"
          value="Gold • Silver • Junior"
          icon={Crown}
          color="secondary"
          subtitle="Tiered discounts active"
          onClick={() => navigate('/memberships')}
        />
      </div>

      {/* Quick Launchpad Operations Row */}
      <div style={{ marginBottom: '2rem' }}>
        <Card title="⚡ Operational Quick-Action Launchers">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <div
              onClick={() => navigate('/courts')}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Calendar size={20} color="var(--primary)" />
                <strong style={{ fontSize: '1rem' }}>Court Timetable</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                30-min slot openings, live conflict prevention & walk-in bookings.
              </p>
            </div>

            <div
              onClick={() => navigate('/shop')}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShoppingBag size={20} color="#10b981" />
                <strong style={{ fontSize: '1rem' }}>Pro Gear Shop</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Unified stock for in-person racket repair/sales & online orders.
              </p>
            </div>

            <div
              onClick={() => navigate('/canteen')}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Coffee size={20} color="#f59e0b" />
                <strong style={{ fontSize: '1rem' }}>Bar & Cafeteria</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Table 1–8 management, running member tabs, and UPI/Cash settling.
              </p>
            </div>

            <div
              onClick={() => navigate('/staff-roster')}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Briefcase size={20} color="#8b5cf6" />
                <strong style={{ fontSize: '1rem' }}>Staff Roster & Leave</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Front Desk, Shop, and Canteen shift assignments & approvals.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Court Status & Live Open Bar Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Court Availability Overview */}
        <Card>
          <Card.Header>
            <div>
              <Card.Title>🏸 Courts & Turfs Status</Card.Title>
              <Card.Description>Live facilities at The Champions Club</Card.Description>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/courts')}
            >
              Bookings Matrix
            </Button>
          </Card.Header>

          <Card.Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(courts.length > 0 ? courts : [
                { _id: '1', name: 'Centre Court (Tennis)', sport: 'Tennis', hourlyRate: 800, surfaceType: 'Clay' },
                { _id: '2', name: 'Cricket Box Turf A', sport: 'Cricket', hourlyRate: 1200, surfaceType: 'AstroTurf' },
                { _id: '3', name: 'Padel Glass Court 1', sport: 'Padel', hourlyRate: 1000, surfaceType: 'Panoramic Glass' },
              ]).map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{c.name}</strong>
                      <Badge variant="primary">{c.sport}</Badge>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Surface: {c.surfaceType || 'Standard'} • Rate: ₹{c.hourlyRate}/hr
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/courts')}
                  >
                    View Slots
                  </Button>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Live Bar Tabs & Inventory Alerts */}
        <Card>
          <Card.Header>
            <div>
              <Card.Title>🍸 Active Bar Tabs & Low Stock</Card.Title>
              <Card.Description>Real-time lounge reconciliation & shelf alert</Card.Description>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/canteen')}
            >
              Lounge Register
            </Button>
          </Card.Header>

          <Card.Content>
            {openTabs.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No open bar tabs currently. Orders taken at Table 1–8 will appear here in real-time.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {openTabs.map((tab) => (
                  <div
                    key={tab._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong>Table {tab.tableNumber}</strong>
                        <Badge variant="warning">{tab.tabStatus}</Badge>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Member: {tab.member?.firstName} {tab.member?.lastName} • {tab.items?.length || 0} items
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#f59e0b' }}>₹{tab.total}</strong>
                      <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-muted)' }}>
                        Discount: ₹{tab.discount || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Low stock alert snippet */}
            {lowStockProducts.length > 0 && (
              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <AlertTriangle size={20} color="#ef4444" />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.85rem', color: '#ef4444' }}>
                    Low Stock Alert ({lowStockProducts.length} Items)
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(', ')}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/shop')}>
                  Restock
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Problem Statement Solutions Walkthrough */}
      <Card title="🎯 Problem Statement Digital Solutions Matrix">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Crown size={16} color="#f59e0b" />
              <strong>1. Member Tiers & Perks</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Automatic expiry calculations and Gold/Silver/Junior discounts configured across courts, shop, and cafe without manual Excel entries.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Calendar size={16} color="var(--primary)" />
              <strong>2. Anti-Conflict Booking</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              1-hour slots opening every 30 mins, 2 bookings/day max limit, and unified reservation engine replacing WhatsApp chaos.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ShoppingBag size={16} color="#10b981" />
              <strong>3. Unified Pro Shop</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Single inventory database for counter sales and online orders preventing overselling of rackets, shoes, and strings.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Coffee size={16} color="#ec4899" />
              <strong>4. Running Bar Lounge Tabs</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Table orders, member discount deductions, and settlement via UPI/Card/Cash replacing lost paper chits.
            </p>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
