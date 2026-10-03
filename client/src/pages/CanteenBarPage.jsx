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
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import { useToast } from '../context/ToastContext';
import shopCanteenService from '../services/shopCanteenService';
import membershipService from '../services/membershipService';
import { readSavedCart, saveCart } from '../utils/cartStorage';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export const CanteenBarPage = () => {
  const { toastSuccess, toastError } = useToast();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState(() => readSavedCart('club-canteen-cart'));
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userMembership, setUserMembership] = useState(null);

  const loadData = async () => {
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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveCart('club-canteen-cart', cart);
  }, [cart]);

  const categories = useMemo(
    () => ['ALL', ...new Set(menuItems.map((item) => item.category).filter(Boolean))],
    [menuItems]
  );

  const visibleItems = menuItems.filter(
    (item) =>
      (category === 'ALL' || item.category === category) &&
      (!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0);

  const discountRate = userMembership?.plan?.benefits?.canteenDiscount ?? userMembership?.plan?.canteenDiscount ?? 0;
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
    setCart((current) =>
      current
        .map((item) => (item.product._id === productId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCart((current) => current.filter((item) => item.product._id !== productId));
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    try {
      setSubmitting(true);
      await shopCanteenService.createOrder({
        type: 'canteen',
        fulfillment: 'pickup',
        paymentMethod,
        items: cart.map(({ product, quantity }) => ({
          product: product._id,
          name: product.name,
          quantity,
          price: product.price,
        })),
      });
      toastSuccess('Order placed successfully! Collect at the cafe counter.');
      setCart([]);
      setCartOpen(false);
      await loadData();
    } catch (error) {
      toastError(error.response?.data?.message || 'Could not place your order. Please try again.');
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Club Cafe & Bar"
        subtitle="Fresh meals, energizing drinks, and quick snacks ready for counter pickup."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Cafe & Bar' }]}
        action={
          <Button variant="primary" icon={ShoppingBag} onClick={() => setCartOpen(true)}>
            View Cart ({itemCount})
          </Button>
        }
      />

      <div className="commerce-page canteen-page">
        {/* Overview Stats Header */}
        <section className="canteen-dashboard-overview">
          <div className="canteen-overview-heading">
            <div className="canteen-overview-icon">
              <Coffee size={24} />
            </div>
            <div>
              <span className="canteen-eyebrow">Club Cafe</span>
              <h2>Menu & Live Queue</h2>
              <p>Hand-crafted snacks, shakes & meals for members.</p>
            </div>
          </div>
          <div className="canteen-overview-stats">
            <div className="canteen-overview-stat">
              <Utensils size={18} />
              <div>
                <span>Menu Items</span>
                <strong>{menuItems.length}</strong>
              </div>
            </div>
            <div className="canteen-overview-stat">
              <ShoppingBag size={18} />
              <div>
                <span>In Cart</span>
                <strong>{itemCount}</strong>
              </div>
            </div>
            <div className="canteen-overview-stat">
              <Clock3 size={18} />
              <div>
                <span>Active Orders</span>
                <strong>{activeOrderCount}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Member Discount Banner */}
        {discountRate > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              marginBottom: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--text-main)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--color-success-bg, rgba(16, 185, 129, 0.2))',
                  color: 'var(--color-success-text, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Percent size={16} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.92rem' }}>{userPlanName} Privilege</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {discountRate}% membership discount is automatically applied to your orders.
                </span>
              </div>
            </div>
            <Badge variant="success">{discountRate}% OFF</Badge>
          </div>
        )}

        {/* Search & Category Filter Section */}
        <div className="commerce-toolbar">
          <div className="commerce-category-list">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`court-filter ${category === cat ? 'is-active' : ''}`}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-full)',
                  border: category === cat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: category === cat ? 'var(--primary)' : 'var(--bg-card)',
                  color: category === cat ? '#ffffff' : 'var(--text-main)',
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
                          <span style={{ color: 'var(--color-danger, #ef4444)' }}>Out of stock</span>
                        ) : (
                          <>
                            <CheckCircle2 size={13} color="var(--color-success-text, #10b981)" /> {item.stock} ready
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
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Your Cafe Order"
        subtitle={`${itemCount} item(s) · Counter pickup`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCartOpen(false)}>
              Continue Browsing
            </Button>
            <Button
              variant="primary"
              onClick={placeOrder}
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
                      style={{ marginLeft: '0.35rem', color: 'var(--color-danger, #ef4444)' }}
                      onClick={() => removeItem(product._id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="cart-summary-box">
              <div className="cart-summary-row">
                <span>Subtotal ({itemCount} items)</span>
                <strong>{money(subtotal)}</strong>
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
