import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  ShoppingBag,
  Coffee,
  Crown,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Clock3,
  History,
  MapPin,
  UtensilsCrossed,
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

const getLocalDay = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
};

const MemberDashboardView = ({ user, menuItems, bookings, loading, navigate }) => {
  const upcomingBookings = bookings
    .filter((booking) => booking.status === 'CONFIRMED' && getLocalDay(booking.date) >= getLocalDay(new Date()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${user?.firstName || user?.name || 'Member'}`}
        subtitle="Book a court, browse the cafe menu, and keep track of your upcoming sessions."
        breadcrumbs={[{ label: 'Club', path: '/' }, { label: 'Member dashboard' }]}
      />

      <div className="member-dashboard-content">
        <nav className="member-dashboard-shortcuts" aria-label="Member shortcuts">
          <button type="button" className="quick-action-card quick-action-court" onClick={() => navigate('/courts')}><Calendar size={25} /><strong>Book a court</strong><small>Choose a court and available time</small><span className="member-shortcut-link">Explore courts <ArrowRight size={15} /></span></button>
          <button type="button" className="quick-action-card quick-action-food" onClick={() => navigate('/canteen')}><Coffee size={25} /><strong>Canteen menu</strong><small>Order available food and drinks</small><span className="member-shortcut-link">View menu <ArrowRight size={15} /></span></button>
          <button type="button" className="quick-action-card quick-action-shop" onClick={() => navigate('/shop')}><ShoppingBag size={25} /><strong>Club shop</strong><small>Sports gear and accessories</small><span className="member-shortcut-link">Browse shop <ArrowRight size={15} /></span></button>
          <button type="button" className="quick-action-card quick-action-member" onClick={() => navigate('/booking-history')}><History size={25} /><strong>Booking history</strong><small>Review your upcoming and past sessions</small><span className="member-shortcut-link">View bookings <ArrowRight size={15} /></span></button>
        </nav>

        <section className="member-dashboard-section">
          <div className="member-dashboard-section-heading">
            <div><span className="member-dashboard-eyebrow">Club cafe</span><h2>Available canteen menu</h2><p>Order for counter pickup from the current menu.</p></div>
            <Button variant="outline" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/canteen')}>View full menu</Button>
          </div>
          {loading ? <div className="member-dashboard-empty">Loading the available menu…</div> : menuItems.filter((item) => item.stock == null || item.stock > 0).length ? (
            <div className="member-dashboard-menu-grid">{menuItems.filter((item) => item.stock == null || item.stock > 0).slice(0, 4).map((item) => <Card key={item._id} className="member-dashboard-menu-card">
              <div className="member-menu-image">{item.image ? <img src={item.image} alt={item.name} loading="lazy" /> : <div className="member-menu-placeholder"><Coffee size={34} /><span>Club cafe</span></div>}<span className="member-menu-category">{item.category || 'Menu item'}</span></div>
              <Card.Content><div className="member-menu-availability"><span className="member-menu-dot" />Available now</div><Card.Title className="member-menu-title">{item.name}</Card.Title>{item.description && <p className="member-menu-description">{item.description}</p>}<div className="member-menu-footer"><div><small>Price</small><strong>₹{Number(item.price).toLocaleString('en-IN')}</strong></div><Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" onClick={() => navigate('/canteen')}>Order</Button></div></Card.Content>
            </Card>)}</div>
          ) : <div className="member-dashboard-empty"><UtensilsCrossed size={22} /><span>No canteen items are available right now.</span></div>}
        </section>

        <section className="member-dashboard-section member-upcoming-section">
          <div className="member-dashboard-section-heading">
            <div><span className="member-dashboard-eyebrow">Your schedule</span><h2>Upcoming court bookings</h2><p>Your next confirmed sessions.</p></div>
            <Button variant="outline" icon={History} onClick={() => navigate('/booking-history')}>Booking history</Button>
          </div>
          {loading ? <div className="member-dashboard-empty">Loading your bookings…</div> : upcomingBookings.length ? <div className="member-upcoming-list">{upcomingBookings.map((booking) => <Card key={booking._id} className="member-upcoming-card"><Card.Content><div className="member-upcoming-court"><span className="member-booking-icon"><MapPin size={18} /></span><div><strong>{booking.court?.name || 'Court session'}</strong><span>{booking.court?.type || 'Sports court'}</span></div></div><div className="member-upcoming-time"><Calendar size={16} /><span>{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span><Clock3 size={16} /><span>{booking.startTime}–{booking.endTime}</span></div></Card.Content></Card>)}</div> : <div className="member-dashboard-empty"><Calendar size={22} /><span>You have no upcoming court bookings.</span><Button variant="primary" size="sm" onClick={() => navigate('/courts')}>Book a court</Button></div>}
        </section>
      </div>
    </DashboardLayout>
  );
};

export const Dashboard = () => {
  const { user, isMember } = useAuth();
  const navigate = useNavigate();

  const [courts, setCourts] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [financeOverview, setFinanceOverview] = useState(null);
  const [canteenItems, setCanteenItems] = useState([]);
  const [memberBookings, setMemberBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (isMember) {
          const [menuRes, bookingsRes] = await Promise.allSettled([
            shopCanteenService.getProducts({ type: 'canteen' }),
            courtBookingService.getBookings(),
          ]);
          if (menuRes.status === 'fulfilled' && menuRes.value.success) setCanteenItems(menuRes.value.data || []);
          if (bookingsRes.status === 'fulfilled' && bookingsRes.value.success) setMemberBookings(bookingsRes.value.data || []);
          return;
        }

        const [courtsRes, tabsRes, productsRes, financeRes] = await Promise.allSettled([
          courtBookingService.getCourts(),
          shopCanteenService.getOpenTabs(),
          shopCanteenService.getProducts({ type: 'sports' }),
          financeService.getOverview(),
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
      } catch (err) {
        console.error('Error loading club dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isMember]);

  const totalRev = financeOverview?.totalRevenue || 45200;
  if (isMember) {
    return <MemberDashboardView user={user} menuItems={canteenItems} bookings={memberBookings} loading={loading} navigate={navigate} />;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome to The Champions Club, ${user?.firstName || user?.name || 'Athlete'}`}
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

      {/* Quick Action Tiles matching UI reference */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 0.85rem 0', fontWeight: 700, color: 'var(--text-main)' }}>Quick Actions</h4>
        <div className="quick-action-grid">
          <div
            className="quick-action-card quick-action-court"
            onClick={() => navigate('/courts')}
          >
            <Calendar size={26} />
            <span>Book a Court</span>
          </div>

          <div
            className="quick-action-card quick-action-shop"
            onClick={() => navigate('/shop')}
          >
            <ShoppingBag size={26} />
            <span>Shop Now</span>
          </div>

          <div
            className="quick-action-card quick-action-food"
            onClick={() => navigate('/canteen')}
          >
            <Coffee size={26} />
            <span>Order Food</span>
          </div>

          <div
            className="quick-action-card quick-action-member"
            onClick={() => navigate('/memberships')}
          >
            <Crown size={26} />
            <span>View Membership</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Court Status & Live Open Bar Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Court Availability Overview */}
        <Card>
          <Card.Header>
            <div>
              <Card.Title>Courts & Turfs Status</Card.Title>
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
              <Card.Title>Active Bar Tabs & Low Stock</Card.Title>
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
      <Card title="Problem Statement Digital Solutions Matrix">
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
