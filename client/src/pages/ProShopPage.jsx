import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShoppingBag,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Search,
  Package,
  CreditCard,
  Truck,
  History,
  CalendarDays,
  Clock3,
  RefreshCw,
  ArrowLeft,
  PackageCheck,
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

export const ProShopPage = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const isMember = user?.role?.toUpperCase() === 'MEMBER';
  const showOrders = isMember && searchParams.get('view') === 'orders';

  // Fulfillment & payment options
  const [fulfillment, setFulfillment] = useState('counter');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Add Product Modal (Staff / Owner)
  const [addProductModal, setAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Rackets',
    price: '',
    stock: 10,
    lowStockThreshold: 3,
    image: '',
  });

  const [userMembership, setUserMembership] = useState(null);

  const isStaffOrOwner = ['OWNER', 'ADMIN', 'SHOP_STAFF', 'STAFF'].includes(user?.role?.toUpperCase());

  useEffect(() => {
    fetchProducts();
    fetchMembership();
    if (isMember) fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await shopCanteenService.getOrders({ type: 'sports' });
      if (res.success) setOrders(res.data || []);
    } catch (error) {
      toastError(error.response?.data?.message || 'Could not load your shop orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await shopCanteenService.getProducts({ type: 'sports' });
      if (res.success) {
        setProducts(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toastError(`${product.name} is currently out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toastError(`Cannot add more. Only ${product.stock} items available in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    toastSuccess(`Added ${product.name} to cart!`);
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

  const discountRate = userMembership?.plan?.shopDiscount || 0;
  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * discountRate) / 100;
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setSubmitting(true);
      const orderPayload = {
        items: cart.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
        type: 'sports',
        fulfillment,
        deliveryAddress: fulfillment === 'delivery' ? deliveryAddress : '',
        paymentMethod,
      };

      await shopCanteenService.createOrder(orderPayload);
      toastSuccess('Order placed successfully! Inventory updated.');
      setCart([]);
      setCartOpen(false);
      fetchProducts();
      if (isMember) fetchOrders();
    } catch (err) {
      toastError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await shopCanteenService.createProduct({
        ...newProduct,
        type: 'sports',
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
      });
      toastSuccess('New sports gear item added to stock!');
      setAddProductModal(false);
      setNewProduct({ name: '', category: 'Rackets', price: '', stock: 10, lowStockThreshold: 3, image: '' });
      fetchProducts();
    } catch (err) {
      toastError('Failed to add product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <DashboardLayout>
      <PageHeader
        title={showOrders ? 'My Shop Orders' : 'Champions Pro Gear Shop'}
        subtitle={showOrders ? 'Review your sports shop purchases, order status, and member savings.' : 'Rackets, extra duty balls, court shoes, apparel, and accessories. Unified inventory for counter & online orders.'}
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: showOrders ? 'My Orders' : 'Sports Shop' }]}
        action={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {isMember && <Button variant={showOrders ? 'outline' : 'secondary'} icon={showOrders ? ArrowLeft : History} onClick={() => setSearchParams(showOrders ? {} : { view: 'orders' })}>{showOrders ? 'Back to shop' : `My Orders${orders.length ? ` (${orders.length})` : ''}`}</Button>}
            {isStaffOrOwner && (
              <Button variant="outline" icon={Plus} onClick={() => setAddProductModal(true)}>
                Add Gear Stock
              </Button>
            )}
            {!showOrders && <Button
              variant="primary"
              icon={ShoppingCart}
              onClick={() => setCartOpen(true)}
            >
              Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </Button>}
          </div>
        }
      />

      {showOrders ? (
        <section className="shop-orders-page">
          <div className="shop-orders-heading"><div><span className="shop-orders-eyebrow">Order history</span><h2>Your shop orders</h2><p>Track gear orders placed from the sports shop.</p></div><Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchOrders}>Refresh</Button></div>
          {ordersLoading ? <Loader text="Loading your orders..." /> : orders.length ? <div className="shop-orders-list">{orders.map((order) => {
            const status = String(order.status || 'pending').toLowerCase();
            const statusVariant = status === 'completed' || status === 'ready' ? 'success' : status === 'cancelled' ? 'danger' : 'warning';
            return <Card key={order._id} className="shop-order-card"><Card.Content>
              <div className="shop-order-topline"><div><span className="shop-order-number">Order #{String(order._id).slice(-6).toUpperCase()}</span><span className="shop-order-date"><CalendarDays size={14} />{new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span></div><Badge variant={statusVariant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge></div>
              <div className="shop-order-items">{(order.items || []).map((item, index) => <div className="shop-order-item" key={`${item.product?._id || item.product || item.name}-${index}`}><span className="shop-order-item-icon">{item.product?.image ? <img src={item.product.image} alt="" loading="lazy" /> : <PackageCheck size={17} />}</span><div><strong>{item.name || item.product?.name || 'Sports gear'}</strong><small>Quantity {item.quantity}</small></div><span className="shop-order-item-price">₹{Number(item.price * item.quantity || 0).toLocaleString('en-IN')}</span></div>)}</div>
              <div className="shop-order-bottom"><div className="shop-order-fulfillment"><span><Truck size={15} />{String(order.fulfillment || 'counter').replace('-', ' ')}</span><span><Clock3 size={15} />Payment {order.paymentStatus || 'pending'}</span></div><div className="shop-order-total"><small>{Number(order.discount || 0) > 0 ? `Includes ₹${Number(order.discount).toLocaleString('en-IN')} member savings` : 'Order total'}</small><strong>₹{Number(order.total || 0).toLocaleString('en-IN')}</strong></div></div>
            </Card.Content></Card>;
          })}</div> : <Card className="shop-orders-empty"><Card.Content><span><History size={26} /></span><h3>No shop orders yet</h3><p>Orders you place from the sports shop will appear here.</p><Button variant="primary" onClick={() => setSearchParams({})}>Browse shop</Button></Card.Content></Card>}
        </section>
      ) : <div className="commerce-page shop-page">

      {/* Category Pills & Search */}
      <div className="commerce-toolbar shop-toolbar">
        <div className="commerce-category-list">
          {['ALL', 'Rackets', 'Balls', 'Shoes', 'Accessories', 'Apparel'].map((cat) => (
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
              {cat === 'ALL' ? 'All Gear' : cat}
            </button>
          ))}
        </div>

        <div className="shop-search">
          <Search size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rackets, shoes..."
            aria-label="Search shop products"
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <Loader text="Loading shelf inventory..." />
      ) : (
        <div className="commerce-grid">
          {filteredProducts.map((prod) => {
            const isLowStock = prod.stock <= prod.lowStockThreshold && prod.stock > 0;
            const isOutOfStock = prod.stock <= 0;

            return (
              <Card key={prod._id} hoverable className="commerce-card">
                <div className="commerce-card-media">{prod.image ? <img src={prod.image} alt={prod.name} loading="lazy" /> : <div className="commerce-image-placeholder"><Package size={38} /><span>Sports gear</span></div>}<Badge variant="primary">{prod.category}</Badge></div>

                <Card.Content className="commerce-card-content">
                  <div className="commerce-card-meta">
                    {isOutOfStock ? (
                      <Badge variant="danger">Out of Stock</Badge>
                    ) : isLowStock ? (
                      <Badge variant="warning">Low ({prod.stock} left)</Badge>
                    ) : (
                      <span className="commerce-stock"><CheckCircle size={14} /> In stock · {prod.stock} units</span>
                    )}
                  </div>

                  <Card.Title className="commerce-product-title">{prod.name}</Card.Title>
                  <div className="commerce-product-footer">
                    <div className="commerce-price">
                    {discountRate > 0 ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          ₹{prod.price.toLocaleString()}
                        </span>
                        <strong className="commerce-price-current">
                          ₹{(prod.price - (prod.price * discountRate / 100)).toLocaleString()}
                        </strong>
                      </>
                    ) : (
                      <strong className="commerce-price-current">
                        ₹{prod.price.toLocaleString()}
                      </strong>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isOutOfStock}
                    icon={ShoppingBag}
                    onClick={() => addToCart(prod)}
                  >
                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                  </Button>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}
      </div>}

      {/* Shopping Cart Drawer / Modal */}
      <Modal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Pro Shop Shopping Cart"
        subtitle={`${cart.length} item(s) selected`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCartOpen(false)}>
              Continue Shopping
            </Button>
            <Button
              variant="primary"
              onClick={handleCheckout}
              disabled={cart.length === 0}
              loading={submitting}
            >
              Checkout (₹{totalAmount.toLocaleString()})
            </Button>
          </>
        }
      >
        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            Your gear cart is empty. Browse items to add.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cart.map((item) => (
              <div
                key={item.product._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                }}
              >
                <div>
                  <h5 style={{ margin: 0, fontWeight: 700 }}>{item.product.name}</h5>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ₹{item.product.price} each
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product._id, -1)}
                    style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product._id, 1)}
                    style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            {/* Price Breakdown */}
            <div style={{ padding: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discountRate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success-text)', marginBottom: '0.35rem' }}>
                  <span>{userMembership?.plan?.name} Member Discount ({discountRate}%):</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <span>Final Total:</span>
                <span className="text-gradient">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Fulfillment Selector */}
            <Select
              label="Fulfillment Method"
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value)}
              options={[
                { value: 'counter', label: 'Over-the-Counter Pickup at Club' },
                { value: 'pickup', label: 'Club Locker Pickup' },
                { value: 'delivery', label: 'Home Delivery' },
              ]}
              placeholder=""
            />

            {fulfillment === 'delivery' && (
              <Input
                label="Delivery Address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter complete delivery street address..."
                required
              />
            )}

            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { value: 'upi', label: 'UPI (Instant QR / PhonePe / GPay)' },
                { value: 'card', label: 'Credit / Debit Card' },
                { value: 'cash', label: 'Cash at Counter' },
              ]}
              placeholder=""
            />
          </div>
        )}
      </Modal>

      {/* Add Product Modal */}
      <Modal
        isOpen={addProductModal}
        onClose={() => setAddProductModal(false)}
        title="Add Sports Gear to Shelf Inventory"
        subtitle="Unified inventory for counter & online orders"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddProductModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProduct}>
              Save Product
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProduct}>
          <Input
            label="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="e.g. Wilson Pro Overgrip 3-Pack"
            required
          />

          <div className="grid-cols-2">
            <Select
              label="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              options={['Rackets', 'Balls', 'Shoes', 'Accessories', 'Apparel']}
              placeholder=""
            />
            <Input
              label="Price (₹)"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder="e.g. 18500"
              required
            />
          </div>

          <div className="grid-cols-2">
            <Input
              label="Stock Quantity"
              type="number"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              required
            />
            <Input
              label="Low Stock Threshold"
              type="number"
              value={newProduct.lowStockThreshold}
              onChange={(e) => setNewProduct({ ...newProduct, lowStockThreshold: e.target.value })}
            />
          </div>

          <Input
            label="Image URL"
            value={newProduct.image}
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
            placeholder="https://..."
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ProShopPage;
