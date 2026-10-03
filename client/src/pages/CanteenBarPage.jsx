import React, { useEffect, useMemo, useState } from 'react';
import { Coffee, Minus, Plus, RefreshCw, ShoppingBag, Utensils } from 'lucide-react';
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

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export const CanteenBarPage = () => {
  const { toastSuccess, toastError } = useToast();
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [menuRes, orderRes] = await Promise.all([
        shopCanteenService.getProducts({ type: 'canteen' }),
        shopCanteenService.getOrders({ type: 'canteen' }),
      ]);
      setMenuItems(menuRes.data || []);
      setOrders(orderRes.data || []);
    } catch (error) {
      toastError(error.response?.data?.message || 'Could not load the canteen menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const categories = useMemo(() => ['ALL', ...new Set(menuItems.map((item) => item.category).filter(Boolean))], [menuItems]);
  const visibleItems = menuItems.filter((item) => category === 'ALL' || item.category === category);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const addItem = (product) => setCart((current) => {
    const existing = current.find((item) => item.product._id === product._id);
    if (existing?.quantity >= product.stock) {
      toastError(`Only ${product.stock} available.`);
      return current;
    }
    return existing
      ? current.map((item) => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { product, quantity: 1 }];
  });

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
        title="Canteen Menu"
        subtitle="Browse available food and drinks, add them to your cart, and collect your order at the counter."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Canteen' }]}
        action={<Button variant="primary" icon={ShoppingBag} onClick={() => setCartOpen(true)}>Cart ({itemCount})</Button>}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((value) => (
            <button key={value} type="button" onClick={() => setCategory(value)} style={{ padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-full)', border: `1px solid ${category === value ? 'var(--primary)' : 'var(--border-color)'}`, background: category === value ? 'var(--primary)' : 'var(--bg-card)', color: category === value ? '#fff' : 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>
              {value === 'ALL' ? 'All items' : value}
            </button>
          ))}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Available items only · Counter pickup</span>
      </div>

      {loading ? <Loader text="Loading available menu items..." /> : visibleItems.length ? (
        <div className="grid-cols-3">
          {visibleItems.map((item) => (
            <Card key={item._id} hoverable>
              {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: 170, objectFit: 'cover', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }} /> : (
                <div style={{ height: 140, display: 'grid', placeItems: 'center', background: 'var(--bg-subtle)' }}><Coffee size={38} color="var(--text-muted)" /></div>
              )}
              <Card.Content>
                <Badge variant="primary">{item.category}</Badge>
                <Card.Title style={{ fontSize: '1rem', minHeight: 44, marginTop: '0.65rem' }}>{item.name}</Card.Title>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{money(item.price)}</strong>
                  <Button variant="primary" size="sm" icon={Plus} onClick={() => addItem(item)}>Add</Button>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      ) : (
        <Card><Card.Content><div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}><Utensils size={30} /><p>No available items in this category right now.</p></div></Card.Content></Card>
      )}

      <section style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div><h2 style={{ margin: 0, fontSize: '1.2rem' }}>Recent canteen orders</h2><p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Follow preparation and pickup status.</p></div>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData}>Refresh</Button>
        </div>
        {orders.length ? <div style={{ display: 'grid', gap: '0.65rem' }}>{orders.slice(0, 5).map((order) => (
          <Card key={order._id}><Card.Content><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div><strong>Order #{String(order._id).slice(-6).toUpperCase()}</strong><div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>{(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(' · ')}</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><strong>{money(order.total)}</strong><Badge variant={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>{order.status}</Badge></div>
          </div></Card.Content></Card>
        ))}</div> : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your orders will appear here after checkout.</p>}
      </section>

      <Modal isOpen={cartOpen} onClose={() => setCartOpen(false)} title="Your canteen order" subtitle={`${itemCount} item(s) · Counter pickup`} footer={<><Button variant="secondary" onClick={() => setCartOpen(false)}>Continue browsing</Button><Button variant="primary" onClick={placeOrder} disabled={!cart.length} loading={submitting}>Place order · {money(subtotal)}</Button></>}>
        {!cart.length ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>Your cart is empty. Add something from the available menu.</p> : <div style={{ display: 'grid', gap: '1rem' }}>
          {cart.map(({ product, quantity }) => <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
            <div><strong>{product.name}</strong><div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{money(product.price)} each</div></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}><button type="button" aria-label={`Remove one ${product.name}`} onClick={() => changeQuantity(product._id, -1)}><Minus size={15} /></button><strong>{quantity}</strong><button type="button" aria-label={`Add one ${product.name}`} disabled={quantity >= product.stock} onClick={() => changeQuantity(product._id, 1)}><Plus size={15} /></button></div>
          </div>)}
          <Select label="Payment method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} options={[{ value: 'upi', label: 'UPI' }, { value: 'card', label: 'Card' }, { value: 'cash', label: 'Cash at counter' }]} />
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontWeight: 800 }}><span>Total</span><span>{money(subtotal)}</span></div>
        </div>}
      </Modal>
    </DashboardLayout>
  );
};

export default CanteenBarPage;
