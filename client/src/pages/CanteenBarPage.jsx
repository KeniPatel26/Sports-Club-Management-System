import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock3,
  Coffee,
  Minus,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Utensils,
  Receipt,
  Percent,
  Trash2,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import shopCanteenService from '../services/shopCanteenService';
import membershipService from '../services/membershipService';
import managerService from '../services/managerService';

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const CanteenBarPage = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTabs, setActiveTabs] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [isTab, setIsTab] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [customerName, setCustomerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userMembership, setUserMembership] = useState(null);

  const isStaffOrOwner = ['OWNER', 'ADMIN', 'CANTEEN_STAFF', 'STAFF'].includes(user?.role?.toUpperCase());

  useEffect(() => {
    loadData();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const [menuRes, orderRes, memRes] = await Promise.all([
        shopCanteenService.getProducts({ type: 'canteen' }),
        shopCanteenService.getOrders({ type: 'canteen' }),
        membershipService.getMyMembership(),
      ]);
      setMenuItems(menuRes.data || []);
      setOrders(orderRes.data || []);
      if (memRes.success) {
        setUserMembership(memRes.data?.membership);
      }
    } catch (error) {
      toastError(error.response?.data?.message || 'Could not load the canteen menu.');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([fetchMenu(), fetchTabs(), fetchTables()]);
  };

  const fetchTabs = async () => {
    try {
      const res = await shopCanteenService.getOrders({ type: 'canteen', isTab: true, status: 'ALL' });
      if (res.success) {
        setActiveTabs(res.data?.filter((o) => o.tabStatus === 'OPEN') || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTables = async () => {
    try {
      setLoadingTables(true);
      const res = await managerService.getTables();
      if (res.success) {
        const rows = res.data || [];
        setTables(rows);
        setSelectedTable((current) => rows.some((table) => table.tableNumber === current)
          ? current
          : (rows.find((table) => table.status === 'AVAILABLE') || rows[0])?.tableNumber || '');
      }
    } catch (error) {
      console.error('Failed to load canteen tables:', error);
      toastError('Could not load dining tables from the database.');
    } finally {
      setLoadingTables(false);
    }
  };

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0);

  const discountRate = userMembership?.plan?.benefits?.cafeDiscount ?? userMembership?.plan?.benefits?.canteenDiscount ?? userMembership?.plan?.canteenDiscount ?? 0;
  const discountAmount = (subtotal * discountRate) / 100;
  const totalAmount = Math.max(0, subtotal - discountAmount);
  const userPlanName = userMembership?.plan?.name || 'Club Member';
  const activeOrderCount = orders.filter(
    (order) => !['completed', 'cancelled'].includes(order.status?.toLowerCase())
  ).length;

  const addItem = (product) => {
    if (product.stock <= 0) {
      toastError(`${product.name} is currently out of stock.`);
      return;
    }
    const existing = cart.find((item) => item.product._id === product._id);
    if (existing && existing.quantity >= product.stock) {
      toastError(`Only ${product.stock} available in stock.`);
      return;
    }
    setCart((prev) =>
      existing
        ? prev.map((item) => (item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...prev, { product, quantity: 1 }]
    );
    toastSuccess(`${product.name} added to your cart.`);
  };

  const changeQuantity = (productId, delta) => {
    setCart((current) => current
      .map((entry) => {
        if (entry.product._id !== productId) return entry;
        const quantity = entry.quantity + delta;
        return quantity > 0 ? { ...entry, quantity: Math.min(quantity, entry.product.stock) } : null;
      })
      .filter(Boolean));
  };

  const removeItem = (productId) => {
    setCart((current) => current.filter((entry) => entry.product._id !== productId));
  };

  const handlePlaceOrder = async (e) => {
    e?.preventDefault?.();
    if (cart.length === 0) return;
    if (!selectedTable) {
      toastError('Select a dining table before placing the order.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        items: cart.map(({ product, quantity }) => ({
          product: product._id,
          name: product.name,
          quantity,
          price: product.price,
        })),
        type: 'canteen',
        fulfillment: 'table',
        tableNumber: selectedTable,
        isTab,
        customerName: customerName || user?.name || 'Guest',
        paymentMethod: isTab ? 'tab' : paymentMethod,
      };

      await shopCanteenService.createOrder(payload);
      toastSuccess(isTab ? `Tab opened for ${selectedTable}!` : `Kitchen order placed for ${selectedTable}!`);
      setCart([]);
      setOrderModalOpen(false);
      await loadData();
    } catch (error) {
      toastError(error.response?.data?.message || 'Could not place your order. Please try again.');
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettleTab = async (tabId) => {
    try {
      await shopCanteenService.settleTab(tabId);
      toastSuccess('Bar tab settled and marked paid!');
      fetchTabs();
    } catch (e) {
      toastError('Failed to settle tab');
    }
  };

  const filteredMenu = menuItems.filter(
    (item) => selectedCategory === 'ALL' || item.category === selectedCategory
  );
  const menuCategories = ['ALL', ...new Set(menuItems.map((item) => item.category).filter(Boolean))];
  const visibleItems = useMemo(() => filteredMenu.filter((item) =>
    `${item.name || ''} ${item.description || ''} ${item.category || ''}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
  ), [filteredMenu, searchQuery]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Club Cafe & Bar"
        subtitle="Fresh meals, energizing drinks, and quick snacks ready for counter pickup."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Cafe & Bar' }]}
        action={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Button
              variant="primary"
              icon={Utensils}
              disabled={loadingTables || !selectedTable}
              onClick={() => setOrderModalOpen(true)}
            >
              {selectedTable ? `Order for ${selectedTable}` : 'No Table Available'} ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </Button>
          </div>
        }
      />

      <div className="grid-cols-3" style={{ alignItems: 'start' }}>
        {/* Left: Table Status & Active Tabs (1 col) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Table Selector */}
          <Card>
            <Card.Header>
              <Card.Title>Select Active Table</Card.Title>
            </Card.Header>
            <Card.Content>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.5rem' }}>
                {tables.map((table) => {
                  const tableNumber = table.tableNumber;
                  const isSelected = selectedTable === tableNumber;
                  const status = String(table.status || 'AVAILABLE').toUpperCase();
                  const hasTab = activeTabs.some((tab) => tab.tableNumber === tableNumber);

                  let bg = 'var(--table-available-bg)';
                  let color = 'var(--table-available-text)';
                  let border = '1px solid var(--border-color)';

                  if (hasTab || status === 'OCCUPIED') {
                    bg = 'var(--table-occupied-bg)';
                    color = 'var(--table-occupied-text)';
                    border = '1px solid var(--border-color)';
                  } else if (status !== 'AVAILABLE') {
                    bg = 'var(--bg-subtle)';
                    color = 'var(--text-muted)';
                    border = '1px solid var(--border-color)';
                  }
                  if (isSelected) {
                    bg = 'var(--court-selected)';
                    color = 'var(--court-selected-text)';
                    border = '1px solid var(--court-selected)';
                  }

                  return (
                    <button
                      key={table._id}
                      type="button"
                      onClick={() => setSelectedTable(tableNumber)}
                      style={{
                        padding: '0.65rem 0.35rem',
                        borderRadius: 'var(--radius-md)',
                        border,
                        background: bg,
                        color,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'var(--transition)',
                      }}
                    >
                      {tableNumber}
                      <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, opacity: 0.9 }}>
                        {hasTab ? 'Occupied' : status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                    </button>
                  );
                })}
                {!loadingTables && tables.length === 0 && (
                  <p style={{ gridColumn: '1 / -1', margin: 0, padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No dining tables are configured in the database.
                  </p>
                )}
                {loadingTables && <p style={{ gridColumn: '1 / -1', margin: 0, padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Loading tables…</p>}
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Active Orders</Card.Title>
            </Card.Header>
            <Card.Content>
            <div className="canteen-overview-stat">
              <Clock3 size={18} />
              <div>
                <span>Active Orders</span>
                <strong>{activeOrderCount}</strong>
              </div>
            </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Open Bar Tabs</Card.Title>
              <Card.Description>{activeTabs.length} active running bill(s)</Card.Description>
            </Card.Header>
            <Card.Content>
              {activeTabs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                  No open bar tabs currently.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeTabs.map((tab) => (
                    <div
                      key={tab._id}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800 }}>{tab.tableNumber}</span>
                        <Badge variant="warning">₹{tab.total}</Badge>
                      </div>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Guest: {tab.customerName} &bull; {tab.items?.length} item(s)
                      </p>
                      {isStaffOrOwner && (
                        <Button
                          variant="success"
                          size="sm"
                          fullWidth
                          onClick={() => handleSettleTab(tab._id)}
                          style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}
                        >
                          Settle Bill & Close Tab
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Right: Menu Grid & Quick Add (2 cols) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            {menuCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`court-filter ${selectedCategory === cat ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedCategory === cat ? 'var(--primary-text)' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat === 'ALL' ? 'All Menu' : cat}
              </button>
            ))}
          </div>

          <div className="shop-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search dishes, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Product Catalog Grid */}
        {loading ? (
          <div style={{ padding: '3rem 0' }}>
            <Loader text="Loading cafeteria menu..." />
          </div>
        ) : visibleItems.length ? (
          <div className="commerce-grid">
            {visibleItems.map((item) => {
              const cartEntry = cart.find((c) => c.product._id === item._id);
              const isOutOfStock = item.stock <= 0;

              return (
                <Card key={item._id} hoverable className="commerce-card">
                  <div className="commerce-card-media">
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <div className="commerce-image-placeholder">
                        <Utensils size={36} />
                        <span>Cafe Special</span>
                      </div>
                    )}
                    <Badge variant={isOutOfStock ? 'danger' : item.category === 'Beverages' ? 'purple' : 'primary'}>
                      {isOutOfStock ? 'Sold out' : item.category || 'Food'}
                    </Badge>
                  </div>

                  <Card.Content className="commerce-card-content">
                    <div className="commerce-card-meta">
                      <span className="commerce-stock">
                        {isOutOfStock ? (
                          <span style={{ color: 'var(--color-danger)' }}>Out of stock</span>
                        ) : (
                          <>
                            <CheckCircle2 size={13} color="var(--color-success-text)" /> {item.stock} ready
                          </>
                        )}
                      </span>
                    </div>

                    <Card.Title className="commerce-product-title">{item.name}</Card.Title>

                    {item.description && (
                      <p className="canteen-item-description">{item.description}</p>
                    )}

                    <div className="commerce-product-footer">
                      <div className="commerce-price">
                        <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {discountRate > 0 ? `${userPlanName}` : 'Price'}
                        </small>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                          {discountRate > 0 && (
                            <del style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{money(item.price)}</del>
                          )}
                          <span className="commerce-price-current">
                            {money(discountRate > 0 ? item.price * (1 - discountRate / 100) : item.price)}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant={cartEntry ? 'success' : 'primary'}
                        size="sm"
                        icon={cartEntry ? Check : Plus}
                        disabled={isOutOfStock || cartEntry?.quantity >= item.stock}
                        onClick={() => addItem(item)}
                      >
                        {isOutOfStock ? 'Sold out' : cartEntry ? `Added (${cartEntry.quantity})` : 'Add'}
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <Card.Content>
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <Utensils size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '1.1rem', margin: 0 }}>No menu items match your search or filter.</p>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Orders Section */}
        <section className="canteen-orders-section">
          <div className="canteen-orders-heading">
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={20} /> Recent Cafe Orders
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                Follow preparation and pickup status at the club counter.
              </p>
            </div>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData}>
              Refresh
            </Button>
          </div>

          {orders.length ? (
            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {orders.slice(0, 5).map((order) => (
                <Card key={order._id}>
                  <Card.Content style={{ padding: '1.15rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <strong style={{ fontSize: '1.02rem' }}>Order #{String(order._id).slice(-6).toUpperCase()}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {(order.items || []).map((item) => `${item.name || item.product?.name || 'Item'} × ${item.quantity}`).join(' · ')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <strong style={{ fontSize: '1.1rem' }}>{money(order.totalAmount || order.total)}</strong>
                        <Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <Card.Content>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', margin: 0, padding: '1.5rem 0' }}>
                  No recent cafe orders. Your orders will show up here after checkout.
                </p>
              </Card.Content>
            </Card>
          )}
        </section>
      </div>

      {/* Cart Modal */}
      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title={`Order for ${selectedTable || 'dining table'}`}
        subtitle={`${cart.length} item(s) selected`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOrderModalOpen(false)}>
              Continue Browsing
            </Button>
            <Button
              variant="primary"
              onClick={handlePlaceOrder}
              disabled={!cart.length}
              loading={submitting}
            >
              Place Order · {money(totalAmount)}
            </Button>
          </>
        }
      >
        {!cart.length ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 1rem' }}>
            <Coffee size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Your cart is empty</p>
            <span style={{ fontSize: '0.85rem' }}>Add food and drinks to enjoy at the club lounge.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Cart Items List */}
            <div className="cart-list">
              {cart.map(({ product, quantity }) => (
                <div key={product._id} className="cart-item-row">
                  <div className="cart-item-info">
                    {product.image ? (
                      <img src={product.image} alt="" className="cart-item-thumb" />
                    ) : (
                      <div className="cart-item-thumb">
                        <Coffee size={18} />
                      </div>
                    )}
                    <div className="cart-item-details">
                      <h5 className="cart-item-title">{product.name}</h5>
                      <span className="cart-item-unit-price">{money(product.price)} each</span>
                    </div>
                  </div>

                  <div className="cart-qty-stepper">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="cart-qty-btn"
                      onClick={() => changeQuantity(product._id, -1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="cart-qty-val">{quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="cart-qty-btn"
                      disabled={quantity >= product.stock}
                      onClick={() => changeQuantity(product._id, 1)}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove item"
                      className="cart-qty-btn"
                      style={{ marginLeft: '0.35rem', color: 'var(--color-danger)' }}
                      onClick={() => removeItem(product._id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Input
              label="Customer / Guest Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />

            {/* Price Calculations */}
            <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              {discountRate > 0 && (
                <div className="cart-summary-row cart-summary-discount">
                  <span>{userPlanName} Discount ({discountRate}%)</span>
                  <strong>−{money(discountAmount)}</strong>
                </div>
              )}
              <div className="cart-summary-total">
                <span>Final Total</span>
                <span className="text-gradient">{money(totalAmount)}</span>
              </div>
            </div>

            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: 'upi', label: 'UPI / Mobile Wallet (GPay, PhonePe, Paytm)' },
                { value: 'card', label: 'Credit / Debit Card' },
                { value: 'cash', label: 'Cash at Counter' },
              ]}
            />
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default CanteenBarPage;
