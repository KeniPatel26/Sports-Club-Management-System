import React, { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Clock3, Coffee, Minus, PackageCheck, Plus, RefreshCw, Search, ShoppingBag, Utensils, Receipt } from 'lucide-react';
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

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export const CanteenBarPage = () => {
  const { toastSuccess, toastError } = useToast();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
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

  useEffect(() => { loadData(); }, []);

  const categories = useMemo(() => ['ALL', ...new Set(menuItems.map((item) => item.category).filter(Boolean))], [menuItems]);
  const visibleItems = menuItems.filter((item) =>
    (category === 'ALL' || item.category === category)
    && (!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const discountRate = userMembership?.plan?.canteenDiscount || 0;
  const discountAmount = (subtotal * discountRate) / 100;
  const totalAmount = Math.max(0, subtotal - discountAmount);
  const userPlanName = userMembership?.plan?.name || 'Standard';
  const activeOrderCount = orders.filter((order) => !['completed', 'cancelled'].includes(order.status?.toLowerCase())).length;

  const addItem = (product) => {
    const existing = cart.find((item) => item.product._id === product._id);
    if (existing?.quantity >= product.stock) {
      toastError(`Only ${product.stock} available.`);
      return;
    }
    setCart(existing
      ? cart.map((item) => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { product, quantity: 1 }]);
    toastSuccess(`${product.name} added to your cart.`);
  };

  const changeQuantity = (productId, delta) => setCart((current) => current
    .map((item) => item.product._id !== productId ? item : { ...item, quantity: item.quantity + delta })
    .filter((item) => item.quantity > 0));

  const placeOrder = async () => {
    if (!cart.length) return;
    try {
      setSubmitting(true);
      await shopCanteenService.createOrder({
        type: 'canteen', fulfillment: 'pickup', paymentMethod,
        items: cart.map(({ product, quantity }) => ({ product: product._id, quantity })),
      });
      toastSuccess('Order placed. You can track its status below.');
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
        subtitle="Browse available food and drinks, add them to your cart, and collect your order at the counter."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Cafe' }]}
        action={<Button variant="primary" icon={ShoppingBag} onClick={() => setCartOpen(true)}>View Cart · {itemCount}</Button>}
      />

      <div className="commerce-page canteen-page">
      <section className="canteen-dashboard-overview">
        <div className="canteen-overview-heading">
          <div className="canteen-overview-icon"><Coffee size={22} /></div>
          <div><span className="canteen-eyebrow">Club cafe</span><h2>Menu & order dashboard</h2><p>Fresh food and drinks, ready for counter pickup.</p></div>
        </div>
        <div className="canteen-overview-stats">
          <div className="canteen-overview-stat"><Utensils size={18} /><div><span>Available menu items</span><strong>{menuItems.length}</strong></div></div>
          <div className="canteen-overview-stat"><ShoppingBag size={18} /><div><span>Items in cart</span><strong>{itemCount}</strong></div></div>
          <div className="canteen-overview-stat"><Clock3 size={18} /><div><span>Orders in progress</span><strong>{activeOrderCount}</strong></div></div>
        </div>
      </section>

      <div className="commerce-toolbar canteen-toolbar">
        <div className="commerce-category-list">
          {categories.map((value) => (
            <button key={value} type="button" onClick={() => setCategory(value)} style={{ padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)', border: `1px solid ${category === value ? 'var(--primary)' : 'var(--border-color)'}`, background: category === value ? 'var(--primary)' : 'var(--bg-card)', color: category === value ? '#fff' : 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              {value === 'ALL' ? 'All Menu Items' : value}
            </button>
          ))}
        </div>
        <div className="canteen-toolbar-meta">
          {discountRate > 0 && (
            <Badge variant="gold">VIP {userPlanName} Member ({discountRate}% Cafe Discount)</Badge>
          )}
          <span className="canteen-pickup-note"><PackageCheck size={15} /> Counter pickup</span>
        </div>
      </div>

      <div className="canteen-menu-heading"><div><span className="canteen-eyebrow">Browse menu</span><h2>Available today</h2></div><label className="canteen-search"><Search size={17} /><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the menu" aria-label="Search canteen menu" /></label></div>

      {loading ? <Loader text="Loading the fresh menu..." /> : visibleItems.length ? (
        <div className="commerce-grid">
          {visibleItems.map((item) => {
            const isOutOfStock = item.stock <= 0;
            const cartEntry = cart.find((entry) => entry.product._id === item._id);
            return (
              <Card key={item._id} hoverable className="commerce-card">
                <div className="commerce-card-media">{item.image ? <img src={item.image} alt={item.name} loading="lazy" /> : <div className="commerce-image-placeholder"><Coffee size={38} /><span>Menu item</span></div>}<Badge variant="primary">{item.category}</Badge></div>
                <Card.Content className="commerce-card-content">
                  <div className="commerce-card-meta">
                    {isOutOfStock ? (
                      <Badge variant="danger">Sold Out</Badge>
                    ) : (
                      <span className="commerce-stock"><CheckCircle2 size={14} /> Available · {item.stock} items</span>
                    )}
                  </div>
                  <Card.Title className="commerce-product-title">{item.name}</Card.Title>
                  {item.description && <p className="canteen-item-description">{item.description}</p>}
                  <div className="commerce-product-footer">
                    <div className="commerce-price">
                      {discountRate > 0 ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {money(item.price)}
                          </span>
                          <strong className="commerce-price-current">
                            {money(item.price - (item.price * discountRate / 100))}
                          </strong>
                        </>
                      ) : (
                        <strong className="commerce-price-current">
                          {money(item.price)}
                        </strong>
                      )}
                    </div>
                    <Button variant={cartEntry ? 'success' : 'primary'} size="sm" icon={cartEntry ? Check : Plus} disabled={isOutOfStock || cartEntry?.quantity >= item.stock} onClick={() => addItem(item)}>
                      {isOutOfStock ? 'Sold out' : cartEntry ? `Added · ${cartEntry.quantity}` : 'Add to order'}
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><Card.Content><div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}><Utensils size={40} style={{ marginBottom: '1rem' }} /><p style={{ fontSize: '1.1rem' }}>No menu items match your filters.</p></div></Card.Content></Card>
      )}

      <section className="canteen-orders-section">
        <div className="canteen-orders-heading">
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Receipt size={20} /> Recent Cafe Orders</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Follow preparation and pickup status at the counter.</p>
          </div>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData}>Refresh orders</Button>
        </div>
        {orders.length ? <div style={{ display: 'grid', gap: '0.85rem' }}>{orders.slice(0, 5).map((order) => (
          <Card key={order._id}>
            <Card.Content style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>Order #{String(order._id).slice(-6).toUpperCase()}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>{(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(' · ')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{money(order.total)}</strong>
                  <Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>{order.status}</Badge>
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}</div> : <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>Your orders will appear here after checkout.</p>}
      </section>

      </div>

      <Modal isOpen={cartOpen} onClose={() => setCartOpen(false)} title="Cafe & Bar Order" subtitle={`${itemCount} item(s) · Counter pickup`} footer={<><Button variant="secondary" onClick={() => setCartOpen(false)}>Continue browsing</Button><Button variant="primary" onClick={placeOrder} disabled={!cart.length} loading={submitting}>Confirm Order · {money(totalAmount)}</Button></>}>
        {!cart.length ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Your tray is empty. Add a drink or a snack.</p> : <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {cart.map(({ product, quantity }) => <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
              <div><strong style={{ fontSize: '1.05rem' }}>{product.name}</strong><div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{money(product.price)} each</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><button type="button" aria-label={`Remove one ${product.name}`} onClick={() => changeQuantity(product._id, -1)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button><strong style={{ width: '20px', textAlign: 'center' }}>{quantity}</strong><button type="button" aria-label={`Add one ${product.name}`} disabled={quantity >= product.stock} onClick={() => changeQuantity(product._id, 1)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button></div>
            </div>)}
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <span>Subtotal:</span>
              <span>{money(subtotal)}</span>
            </div>
            {discountRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--success-text)', marginBottom: '0.4rem' }}>
                <span>{userPlanName} Discount ({discountRate}%):</span>
                <span>-{money(discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
              <span>Final Total:</span>
              <span className="text-gradient">{money(totalAmount)}</span>
            </div>
          </div>

          <Select label="Payment method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} options={[{ value: 'upi', label: 'UPI / Mobile Wallet' }, { value: 'card', label: 'Credit / Debit Card' }, { value: 'cash', label: 'Cash at counter' }]} />
        </div>}
      </Modal>
    </DashboardLayout>
  );
};

export default CanteenBarPage;
