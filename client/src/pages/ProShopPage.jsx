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
import shopCanteenService from '../services/shopCanteenService';
import membershipService from '../services/membershipService';
import { readSavedCart, saveCart } from '../utils/cartStorage';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export const ProShopPage = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState(() => readSavedCart('club-shop-cart'));
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const isMember = user?.role?.toUpperCase() === 'MEMBER';
  const showOrders = searchParams.get('view') === 'orders';

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
  const isStaffOrOwner = ['OWNER', 'ADMIN', 'SHOP_STAFF', 'STAFF', 'MANAGER'].includes(user?.role?.toUpperCase());

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await shopCanteenService.getOrders({ type: 'sports' });
      if (res.success) {
        setOrders(res.data || []);
      }
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

  useEffect(() => {
    fetchProducts();
    fetchMembership();
  }, []);

  useEffect(() => {
    saveCart('club-shop-cart', cart);
  }, [cart]);

  useEffect(() => {
    if (isMember || showOrders || user) {
      fetchOrders();
    }
  }, [isMember, showOrders, user]);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      toastError(`${product.name} is currently out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toastError(`Cannot add more. Only ${product.stock} items in stock.`);
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

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  };

  const discountRate = userMembership?.plan?.benefits?.shopDiscount ?? userMembership?.plan?.shopDiscount ?? 0;
  const subtotal = calculateSubtotal();
  const discountAmount = (subtotal * discountRate) / 100;
  const totalAmount = Math.max(0, subtotal - discountAmount);
  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);

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
      fetchOrders();
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
        subtitle={
          showOrders
            ? 'Track your equipment purchases, order delivery status, and invoice totals.'
            : 'Rackets, tournament balls, court footwear, apparel, and training accessories.'
        }
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: showOrders ? 'My Orders' : 'Sports Shop' }]}
        action={
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Button
              variant={showOrders ? 'outline' : 'secondary'}
              icon={showOrders ? ArrowLeft : History}
              onClick={() => setSearchParams(showOrders ? {} : { view: 'orders' })}
            >
              {showOrders ? 'Back to Shop' : `My Orders${orders.length ? ` (${orders.length})` : ''}`}
            </Button>
            {isStaffOrOwner && (
              <Button variant="outline" icon={Plus} onClick={() => setAddProductModal(true)}>
                Add Gear Stock
              </Button>
            )}
            {!showOrders && (
              <Button variant="primary" icon={ShoppingCart} onClick={() => setCartOpen(true)}>
                Cart ({totalItemsCount})
              </Button>
            )}
          </div>
        }
      />

      {showOrders ? (
        <section className="shop-orders-page">
          <div className="shop-orders-heading">
            <div>
              <span className="shop-orders-eyebrow">Order History</span>
              <h2>Your Sports Shop Orders</h2>
              <p>Track order fulfillment, payment status, and invoices.</p>
            </div>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchOrders}>
              Refresh Orders
            </Button>
          </div>

          {ordersLoading ? (
            <div style={{ padding: '3rem 0' }}>
              <Loader text="Loading your orders..." />
            </div>
          ) : orders.length ? (
            <div className="shop-orders-list">
              {orders.map((order) => {
                const status = String(order.status || 'pending').toLowerCase();
                const statusVariant =
                  status === 'completed' || status === 'ready'
                    ? 'success'
                    : status === 'cancelled'
                    ? 'danger'
                    : 'warning';

                return (
                  <Card key={order._id} className="shop-order-card">
                    <Card.Content>
                      <div className="shop-order-topline">
                        <div>
                          <span className="shop-order-number">
                            Order #{String(order._id).slice(-6).toUpperCase()}
                          </span>
                          <span className="shop-order-date">
                            <CalendarDays size={14} />
                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <Badge variant={statusVariant}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </div>

                      <div className="shop-order-items">
                        {(order.items || []).map((item, index) => (
                          <div
                            className="shop-order-item"
                            key={`${item.product?._id || item.product || item.name}-${index}`}
                          >
                            <span className="shop-order-item-icon">
                              {item.product?.image ? (
                                <img src={item.product.image} alt="" loading="lazy" />
                              ) : (
                                <PackageCheck size={17} />
                              )}
                            </span>
                            <div>
                              <strong>{item.name || item.product?.name || 'Sports gear'}</strong>
                              <small>Qty: {item.quantity}</small>
                            </div>
                            <span className="shop-order-item-price">
                              {money((item.price || 0) * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="shop-order-bottom">
                        <div className="shop-order-fulfillment">
                          <span>
                            <Truck size={15} />
                            {String(order.fulfillment || 'counter').replace('-', ' ')}
                          </span>
                          <span>
                            <Clock3 size={15} />
                            Payment: {order.paymentStatus || 'completed'}
                          </span>
                        </div>
                        <div className="shop-order-total">
                          <small>
                            {Number(order.discount || 0) > 0
                              ? `Includes ${money(order.discount)} member savings`
                              : 'Total Paid'}
                          </small>
                          <strong>{money(order.totalAmount || order.total)}</strong>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="shop-orders-empty">
              <Card.Content>
                <span>
                  <History size={28} />
                </span>
                <h3>No Shop Orders Yet</h3>
                <p>Gear and equipment orders you place will be recorded here.</p>
                <Button variant="primary" onClick={() => setSearchParams({})}>
                  Browse Sports Shop
                </Button>
              </Card.Content>
            </Card>
          )}
        </section>
      ) : (
        <div className="commerce-page shop-page">
          {/* Member Discount Highlight */}
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
                  <PackageCheck size={16} />
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem' }}>
                    {userMembership?.plan?.name || 'Club Member'} Gear Benefit
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {discountRate}% member discount automatically calculated on all pro-shop items.
                  </span>
                </div>
              </div>
              <Badge variant="success">{discountRate}% OFF</Badge>
            </div>
          )}

          {/* Category Pills & Search */}
          <div className="commerce-toolbar shop-toolbar">
            <div className="commerce-category-list">
              {['ALL', 'Rackets', 'Balls', 'Shoes', 'Accessories', 'Apparel'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.45rem 0.95rem',
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
              <Search size={16} />
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
            <div style={{ padding: '3rem 0' }}>
              <Loader text="Loading shelf inventory..." />
            </div>
          ) : (
            <div className="commerce-grid">
              {filteredProducts.map((prod) => {
                const isLowStock = prod.stock <= prod.lowStockThreshold && prod.stock > 0;
                const isOutOfStock = prod.stock <= 0;
                const inCart = cart.find((item) => item.product._id === prod._id);

                return (
                  <Card key={prod._id} hoverable className="commerce-card">
                    <div className="commerce-card-media">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} loading="lazy" />
                      ) : (
                        <div className="commerce-image-placeholder">
                          <Package size={38} />
                          <span>Sports Gear</span>
                        </div>
                      )}
                      <Badge variant="primary">{prod.category}</Badge>
                    </div>

                    <Card.Content className="commerce-card-content">
                      <div className="commerce-card-meta">
                        {isOutOfStock ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning">Low ({prod.stock} left)</Badge>
                        ) : (
                          <span className="commerce-stock">
                            <CheckCircle size={13} color="var(--color-success-text, #10b981)" /> {prod.stock} in stock
                          </span>
                        )}
                      </div>

                      <Card.Title className="commerce-product-title">{prod.name}</Card.Title>

                      <div className="commerce-product-footer">
                        <div className="commerce-price">
                          <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {discountRate > 0 ? 'Member Price' : 'Price'}
                          </small>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                            {discountRate > 0 && (
                              <del style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {money(prod.price)}
                              </del>
                            )}
                            <strong className="commerce-price-current">
                              {money(discountRate > 0 ? prod.price * (1 - discountRate / 100) : prod.price)}
                            </strong>
                          </div>
                        </div>

                        <Button
                          variant={inCart ? 'success' : 'primary'}
                          size="sm"
                          disabled={isOutOfStock}
                          icon={ShoppingBag}
                          onClick={() => addToCart(prod)}
                        >
                          {isOutOfStock ? 'Sold Out' : inCart ? `In Cart (${inCart.quantity})` : 'Add'}
                        </Button>
                      </div>
                    </Card.Content>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Shopping Cart Drawer / Modal */}
      <Modal
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Pro Shop Cart"
        subtitle={`${totalItemsCount} item(s) selected`}
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
              Checkout · {money(totalAmount)}
            </Button>
          </>
        }
      >
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 1rem' }}>
            <ShoppingCart size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Your gear cart is empty</p>
            <span style={{ fontSize: '0.85rem' }}>Select rackets, shoes, or accessories to add.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Cart List */}
            <div className="cart-list">
              {cart.map((item) => (
                <div key={item.product._id} className="cart-item-row">
                  <div className="cart-item-info">
                    {item.product.image ? (
                      <img src={item.product.image} alt="" className="cart-item-thumb" />
                    ) : (
                      <div className="cart-item-thumb">
                        <Package size={18} />
                      </div>
                    )}
                    <div className="cart-item-details">
                      <h5 className="cart-item-title">{item.product.name}</h5>
                      <span className="cart-item-unit-price">{money(item.product.price)} each</span>
                    </div>
                  </div>

                  <div className="cart-qty-stepper">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.product._id, -1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="cart-qty-val">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="cart-qty-btn"
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => updateQuantity(item.product._id, 1)}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove from cart"
                      className="cart-qty-btn"
                      style={{ marginLeft: '0.35rem', color: 'var(--color-danger, #ef4444)' }}
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="cart-summary-box">
              <div className="cart-summary-row">
                <span>Subtotal ({totalItemsCount} items)</span>
                <strong>{money(subtotal)}</strong>
              </div>
              {discountRate > 0 && (
                <div className="cart-summary-row cart-summary-discount">
                  <span>{userMembership?.plan?.name || 'Member'} Discount ({discountRate}%)</span>
                  <strong>−{money(discountAmount)}</strong>
                </div>
              )}
              <div className="cart-summary-total">
                <span>Final Total</span>
                <span className="text-gradient">{money(totalAmount)}</span>
              </div>
            </div>

            {/* Fulfillment Selector */}
            <Select
              label="Fulfillment Method"
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value)}
              options={[
                { value: 'counter', label: 'Over-the-Counter Pickup at Club Desk' },
                { value: 'pickup', label: 'Club Locker Pickup' },
                { value: 'delivery', label: 'Home Delivery' },
              ]}
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
                { value: 'upi', label: 'UPI (Instant QR / PhonePe / GPay / Paytm)' },
                { value: 'card', label: 'Credit / Debit Card' },
                { value: 'cash', label: 'Cash at Desk' },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Add Product Modal (Staff) */}
      <Modal
        isOpen={addProductModal}
        onClose={() => setAddProductModal(false)}
        title="Add Pro Gear to Inventory"
        subtitle="Staff stock entry for tennis, squash, badminton, and gym gear."
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddProductModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProduct}>
              Save Gear
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: '1rem' }}>
          <Input
            label="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="e.g. Wilson Pro Staff V14 Racket"
            required
          />

          <div className="grid-cols-2">
            <Select
              label="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              options={[
                { value: 'Rackets', label: 'Rackets' },
                { value: 'Balls', label: 'Balls' },
                { value: 'Shoes', label: 'Shoes' },
                { value: 'Accessories', label: 'Accessories' },
                { value: 'Apparel', label: 'Apparel' },
              ]}
            />

            <Input
              label="Price (₹)"
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              placeholder="e.g. 2499"
              required
            />
          </div>

          <div className="grid-cols-2">
            <Input
              label="Initial Stock Units"
              type="number"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              required
            />

            <Input
              label="Low Stock Alert Threshold"
              type="number"
              value={newProduct.lowStockThreshold}
              onChange={(e) => setNewProduct({ ...newProduct, lowStockThreshold: e.target.value })}
              required
            />
          </div>

          <Input
            label="Image URL (Optional)"
            value={newProduct.image}
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ProShopPage;
