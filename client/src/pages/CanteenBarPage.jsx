import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Coffee,
  Utensils,
  Receipt,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  DollarSign,
  Beer,
  FileSpreadsheet,
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
import shopCanteenService from '../services/shopCanteenService';
import membershipService from '../services/membershipService';

export const CanteenBarPage = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [menuItems, setMenuItems] = useState([]);
  const [activeTabs, setActiveTabs] = useState([]);
  const [selectedTable, setSelectedTable] = useState('Table 1');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [isTab, setIsTab] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [userMembership, setUserMembership] = useState(null);

  const isStaffOrOwner = ['OWNER', 'ADMIN', 'CANTEEN_STAFF', 'STAFF'].includes(user?.role?.toUpperCase());

  useEffect(() => {
    fetchMenu();
    fetchTabs();
    fetchMembership();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await shopCanteenService.getProducts({ type: 'canteen' });
      if (res.success) {
        setMenuItems(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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

  const fetchMembership = async () => {
    try {
      const res = await membershipService.getMyMembership();
      if (res.success) {
        setUserMembership(res.data?.membership);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product._id === item._id);
      if (existing) {
        return prev.map((i) => (i.product._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { product: item, quantity: 1 }];
    });
    toastSuccess(`Added ${item.name} to order!`);
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const discountRate = userMembership?.plan?.canteenDiscount || 0;
  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * discountRate) / 100;
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      setSubmitting(true);
      const payload = {
        items: cart.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
        type: 'canteen',
        fulfillment: 'table',
        tableNumber: selectedTable,
        isTab,
        customerName: customerName || user?.name || 'Table Guest',
        paymentMethod: isTab ? 'tab' : paymentMethod,
      };

      await shopCanteenService.createOrder(payload);
      toastSuccess(isTab ? `Tab opened for ${selectedTable}!` : `Kitchen order placed for ${selectedTable}!`);
      setCart([]);
      setOrderModalOpen(false);
      fetchTabs();
    } catch (err) {
      toastError(err.response?.data?.message || 'Order failed');
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

  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8', 'Bar Counter'];

  const filteredMenu = menuItems.filter(
    (item) => selectedCategory === 'ALL' || item.category === selectedCategory
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="Cafeteria, Sports Bar & Lounge"
        subtitle="Post-match recovery meals, fresh shakes, pizzas, and drinks. Table service & running tab management."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Canteen & Bar' }]}
        action={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Button
              variant="primary"
              icon={Utensils}
              onClick={() => setOrderModalOpen(true)}
            >
              Order for {selectedTable} ({cart.reduce((sum, i) => sum + i.quantity, 0)})
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {tables.map((tbl) => {
                  const isSelected = selectedTable === tbl;
                  const hasTab = activeTabs.some((t) => t.tableNumber === tbl);

                  return (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => setSelectedTable(tbl)}
                      style={{
                        padding: '0.6rem 0.3rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: hasTab ? 'var(--warning-light)' : isSelected ? 'var(--primary-light)' : 'var(--bg-subtle)',
                        color: 'var(--text-main)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        position: 'relative',
                      }}
                    >
                      {tbl}
                      {hasTab && (
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--warning-text)', fontWeight: 800 }}>
                          TAB OPEN
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card.Content>
          </Card>

          {/* Active Running Tabs */}
          <Card>
            <Card.Header>
              <div>
                <Card.Title>Open Bar Tabs</Card.Title>
                <Card.Description>{activeTabs.length} active running bill(s)</Card.Description>
              </div>
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
            {['ALL', 'Meals', 'Beverages', 'Snacks', 'Desserts'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedCategory === cat ? '#ffffff' : 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {cat === 'ALL' ? '🍕 All Menu' : cat}
              </button>
            ))}
          </div>

          {/* Menu Items Cards */}
          {loading ? (
            <Loader text="Loading cafeteria menu..." />
          ) : (
            <div className="grid-cols-2">
              {filteredMenu.map((item) => (
                <Card key={item._id} hoverable>
                  <div style={{ display: 'flex', gap: '0.85rem', padding: '1rem' }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '85px', height: '85px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h5 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</h5>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>
                          ₹{item.price}
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => addToCart(item)}
                          icon={Plus}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Place Order / Open Tab Modal */}
      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title={`Order for ${selectedTable}`}
        subtitle={`${cart.length} item(s) selected`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOrderModalOpen(false)}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handlePlaceOrder}
              disabled={cart.length === 0}
              loading={submitting}
            >
              {isTab ? 'Open Running Tab' : `Settle & Pay ₹${totalAmount}`}
            </Button>
          </>
        }
      >
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No cafeteria items in order. Click "Add" on any menu item.
          </p>
        ) : (
          <form onSubmit={handlePlaceOrder}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
              {cart.map((item) => (
                <div
                  key={item.product._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <h5 style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{item.product.name}</h5>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.product.price} each</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product._id, -1)}
                      style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product._id, 1)}
                      style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Input
              label="Customer / Guest Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Alex Morgan (Table 4)"
            />

            {/* Price Calculations */}
            <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              {discountRate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--success-text)', marginBottom: '0.25rem' }}>
                  <span>{userMembership?.plan?.name} Member Discount ({discountRate}%):</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                <span>Total:</span>
                <span className="text-gradient">₹{totalAmount}</span>
              </div>
            </div>

            {/* Tab vs Instant Payment Toggle */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Billing Type</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <Button
                  variant={!isTab ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setIsTab(false)}
                >
                  Pay Now (Instant)
                </Button>
                <Button
                  variant={isTab ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setIsTab(true)}
                >
                  Run Bar Tab (Settle on Departure)
                </Button>
              </div>
            </div>

            {!isTab && (
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'upi', label: 'UPI (GPay / PhonePe / QR)' },
                  { value: 'card', label: 'Credit / Debit Card' },
                  { value: 'cash', label: 'Cash at Counter' },
                ]}
                placeholder=""
              />
            )}
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default CanteenBarPage;
