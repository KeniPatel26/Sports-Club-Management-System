import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Plus,
  Search,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  RefreshCw,
  User,
  Trash2,
  Check,
  X,
  CreditCard,
  Building2,
  Receipt,
  FileText,
  Truck,
  ArrowRight,
  ShieldCheck,
  MinusCircle,
  History,
} from 'lucide-react';
import staffService from '../../../services/staffService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';

export const ShopStaffDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [alert, setAlert] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Tab
  const activeTab = ['dashboard', 'products', 'inventory', 'sales', 'orders', 'payments'].includes(currentTab)
    ? currentTab
    : 'dashboard';

  const handleTabChange = (tabName) => {
    setSearchParams(tabName === 'dashboard' ? {} : { tab: tabName });
  };

  // Stock Receiving Modal state
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [receivedQty, setReceivedQty] = useState(10);
  const [receiveReason, setReceiveReason] = useState('New shipment delivery received');
  const [submittingStock, setSubmittingStock] = useState(false);

  // Report Damage Modal state
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageProductId, setDamageProductId] = useState('');
  const [damageQty, setDamageQty] = useState(1);
  const [damageReason, setDamageReason] = useState('Broken string / damaged in storage');
  const [submittingDamage, setSubmittingDamage] = useState(false);

  // Inventory History state
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Counter POS Cart state
  const [cart, setCart] = useState([]);
  const [isMemberCustomer, setIsMemberCustomer] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState('UPI');
  const [submittingPos, setSubmittingPos] = useState(false);
  const [posSuccessReceipt, setPosSuccessReceipt] = useState(null);

  // Online Orders state
  const [shopOrders, setShopOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState('ALL'); // ALL, pending, confirmed, preparing, ready, completed

  // Payments state
  const [paymentsList, setPaymentsList] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Attendance state
  const [checkedIn, setCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('09:00 AM');

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const [resOverview, resProducts] = await Promise.all([
        staffService.getShopOverview(),
        staffService.getShopProducts({ category: selectedCategory, search: searchQuery }),
      ]);

      if (resOverview?.success) {
        setOverview(resOverview.data);
      }
      if (resProducts?.success) {
        setProducts(resProducts.data);
        if (resProducts.data.length > 0 && !selectedProductId) {
          setSelectedProductId(resProducts.data[0]._id);
          setDamageProductId(resProducts.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Shop staff error:', err);
      setAlert({ type: 'danger', message: 'Failed to load shop inventory data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, [selectedCategory]);

  // Search products effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await staffService.getShopProducts({ category: selectedCategory, search: searchQuery });
        if (res.success) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Inventory History
  const fetchInventoryHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await staffService.getInventoryHistory();
      if (res.success) {
        setInventoryHistory(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventoryHistory();
    }
  }, [activeTab]);

  // Fetch Orders
  const fetchOrders = async (statusFilter) => {
    setLoadingOrders(true);
    try {
      const res = await staffService.getShopOrders({ status: statusFilter || orderFilter });
      if (res.success) {
        setShopOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      fetchOrders(orderFilter);
    }
  }, [activeTab, orderFilter]);

  // Fetch Payments
  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await staffService.getShopPayments();
      if (res.success) {
        setPaymentsList(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  // Live member search for POS
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (memberSearchQuery.trim().length >= 2) {
        try {
          const res = await staffService.searchMembers(memberSearchQuery);
          if (res.success) {
            setMemberSearchResults(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setMemberSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearchQuery]);

  // Stock In submission
  const handleReceiveStock = async (e) => {
    e.preventDefault();
    setSubmittingStock(true);
    try {
      const res = await staffService.receiveStock({
        productId: selectedProductId,
        quantity: receivedQty,
        reason: receiveReason,
      });
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Stock updated successfully.' });
        setShowReceiveModal(false);
        fetchShopData();
        if (activeTab === 'inventory') fetchInventoryHistory();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to update stock' });
    } finally {
      setSubmittingStock(false);
    }
  };

  // Report Damage submission
  const handleReportDamage = async (e) => {
    e.preventDefault();
    setSubmittingDamage(true);
    try {
      const res = await staffService.reportDamagedStock({
        productId: damageProductId,
        quantity: damageQty,
        reason: damageReason,
      });
      if (res.success) {
        setAlert({ type: 'info', message: res.message || 'Damaged stock recorded.' });
        setShowDamageModal(false);
        fetchShopData();
        if (activeTab === 'inventory') fetchInventoryHistory();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to report damage' });
    } finally {
      setSubmittingDamage(false);
    }
  };

  // Cart operations
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setAlert({ type: 'warning', message: `Cannot add more. Current stock is ${product.stock}` });
          return prev;
        }
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          maxStock: product.stock,
          quantity: 1,
        },
      ];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxStock) {
              setAlert({ type: 'warning', message: `Cannot exceed stock limit (${item.maxStock})` });
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // POS Price calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const memberDiscountPercent = isMemberCustomer && selectedMember ? selectedMember.courtDiscount ? 15 : 15 : 0; // 15% Gold, 10% Silver
  const posDiscountAmount = Math.round((cartSubtotal * memberDiscountPercent) / 100);
  const posFinalTotal = Math.max(cartSubtotal - posDiscountAmount, 0);

  // POS Checkout submission
  const handlePosCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmittingPos(true);
    try {
      const payload = {
        memberId: isMemberCustomer && selectedMember ? selectedMember.id : undefined,
        customerName: isMemberCustomer && selectedMember ? selectedMember.name : (walkInName || 'Counter Customer'),
        customerPhone: isMemberCustomer && selectedMember ? selectedMember.phone : (walkInPhone || ''),
        items: cart,
        paymentMethod: posPaymentMethod,
      };

      const res = await staffService.processCounterSale(payload);
      if (res.success) {
        setPosSuccessReceipt({
          orderId: res.data._id,
          customerName: payload.customerName,
          items: [...cart],
          subtotal: cartSubtotal,
          discount: posDiscountAmount,
          total: posFinalTotal,
          paymentMethod: posPaymentMethod,
          date: new Date().toLocaleString(),
        });
        setCart([]);
        setSelectedMember(null);
        setIsMemberCustomer(false);
        setWalkInName('');
        setWalkInPhone('');
        fetchShopData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to complete counter sale.' });
    } finally {
      setSubmittingPos(false);
    }
  };

  // Update order status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await staffService.updateShopOrderStatus(orderId, newStatus);
      if (res.success) {
        setAlert({ type: 'success', message: `Order #${orderId.slice(-4)} updated to ${newStatus.toUpperCase()}` });
        fetchOrders(orderFilter);
        fetchShopData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update order status' });
    }
  };

  // Attendance Toggle
  const handleAttendanceToggle = async () => {
    try {
      if (checkedIn) {
        const res = await staffService.checkOut();
        setCheckedIn(false);
        setAlert({ type: 'info', message: res.message || 'Checked out.' });
      } else {
        const res = await staffService.checkIn();
        setCheckedIn(true);
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setAlert({ type: 'success', message: res.message || 'Checked in.' });
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Attendance error' });
    }
  };

  if (loading && !overview) {
    return <Loader fullPage text="Loading Pro Shop Terminal..." />;
  }

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShoppingBag size={24} color="var(--primary-navy)" />
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-family-display)',
                margin: 0,
              }}
            >
              Sports Shop Terminal
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: 'var(--lavender)',
                color: 'var(--primary-navy)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)',
              }}
            >
              PRO SHOP OPERATIONS
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            Shared Inventory • Counter POS Checkout • Online Order Fulfillment • Stock Management
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Shift Attendance Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.85rem',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: checkedIn ? 'var(--success)' : 'var(--danger)',
              }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Shift: 09:00 - 18:00 {checkedIn && `(In: ${checkInTime})`}
            </span>
            <button
              onClick={handleAttendanceToggle}
              style={{
                border: 'none',
                background: checkedIn ? 'var(--light-danger)' : 'var(--light-green)',
                color: checkedIn ? 'var(--danger)' : 'var(--success)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {checkedIn ? 'Check Out' : 'Check In'}
            </button>
          </div>

          <button
            onClick={() => setShowReceiveModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} color="var(--success)" />
            Receive Stock
          </button>

          <button
            onClick={() => handleTabChange('sales')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-peach)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(217, 142, 104, 0.3)',
            }}
          >
            <ShoppingCart size={16} />
            Counter POS Sale
          </button>
        </div>
      </div>

      {/* Sub-Nav Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'dashboard', label: 'Shop Dashboard', icon: TrendingUp },
          { id: 'products', label: 'Product Catalog', icon: ShoppingBag },
          { id: 'inventory', label: 'Shared Inventory & Stock Logs', icon: Package },
          { id: 'sales', label: 'Counter POS Sales', icon: ShoppingCart },
          { id: 'orders', label: 'Online Orders Lifecycle', icon: Truck },
          { id: 'payments', label: 'Shop Payments', icon: Receipt },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--primary-navy)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {alert && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* 4 KPIs - Always Visible */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              TODAY'S SALES
            </span>
            <DollarSign size={18} color="var(--primary-navy)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
            ₹{overview?.kpi?.todaySales || '24,500'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
            Counter & Online combined
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              PENDING ORDERS
            </span>
            <Clock size={18} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.4rem' }}>
            {overview?.kpi?.pendingOrders || 12}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Need preparation
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              READY FOR PICKUP
            </span>
            <CheckCircle size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.4rem' }}>
            {overview?.kpi?.readyForPickup || 5}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Awaiting member pickup
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              LOW STOCK ALERTS
            </span>
            <AlertTriangle size={18} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.4rem' }}>
            {overview?.kpi?.lowStockCount || 7}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Under threshold level
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SHOP DASHBOARD OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Recent Orders Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    margin: 0,
                    fontFamily: 'var(--font-family-display)',
                  }}
                >
                  Recent Shop Orders & Counter Sales
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                  Live fulfillment pipeline
                </p>
              </div>
              <button
                onClick={fetchShopData}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>ORDER ID</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>CUSTOMER</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>TYPE</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(overview?.recentOrders || []).length > 0 ? (
                    overview.recentOrders.map((o) => (
                      <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                          #{o._id.slice(-4).toUpperCase()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {o.member ? `${o.member.firstName} ${o.member.lastName || ''}` : o.customerName || 'Guest'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: o.fulfillment === 'counter' ? 'var(--lavender)' : 'var(--light-peach)',
                              color: o.fulfillment === 'counter' ? 'var(--primary-navy)' : 'var(--primary-peach)',
                            }}
                          >
                            {o.fulfillment === 'counter' ? 'COUNTER POS' : 'ONLINE ORDER'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor:
                                o.status === 'completed'
                                  ? 'var(--light-green)'
                                  : o.status === 'ready'
                                  ? 'var(--light-warning)'
                                  : 'rgba(53, 73, 98, 0.1)',
                              color:
                                o.status === 'completed'
                                  ? 'var(--success)'
                                  : o.status === 'ready'
                                  ? 'var(--warning)'
                                  : 'var(--primary-navy)',
                            }}
                          >
                            {o.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>₹{o.total}</td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          {o.status === 'pending' && (
                            <button
                              onClick={() => handleOrderStatusUpdate(o._id, 'preparing')}
                              style={{
                                backgroundColor: 'var(--primary-navy)',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Process
                            </button>
                          )}
                          {o.status === 'preparing' && (
                            <button
                              onClick={() => handleOrderStatusUpdate(o._id, 'ready')}
                              style={{
                                backgroundColor: 'var(--warning)',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Mark Ready
                            </button>
                          )}
                          {o.status === 'ready' && (
                            <button
                              onClick={() => handleOrderStatusUpdate(o._id, 'completed')}
                              style={{
                                backgroundColor: 'var(--success)',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Collect / Handover
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No orders recorded today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Watchlist */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <AlertTriangle size={18} color="var(--danger)" />
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'var(--font-family-display)',
                }}
              >
                Low Stock Alerts
              </h3>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Products with inventory at or below threshold:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {products
                .filter((p) => p.stock <= (p.lowStockThreshold || 5))
                .slice(0, 5)
                .map((p) => (
                  <div
                    key={p._id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--light-danger)',
                      border: '1px solid rgba(220, 38, 38, 0.2)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{p.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Stock: <strong>{p.stock} units left</strong> (Min: {p.lowStockThreshold || 5})
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProductId(p._id);
                        setShowReceiveModal(true);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--primary-navy)',
                        cursor: 'pointer',
                      }}
                    >
                      + Stock
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRODUCT CATALOG & SEARCH */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
          }}
        >
          {/* Filters & Search */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <input
                type="text"
                placeholder="Search by Name, SKU, Category, Brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                }}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.75rem', top: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['ALL', 'Rackets', 'Balls', 'Shoes', 'Apparel', 'Accessories'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: selectedCategory === cat ? 'var(--primary-navy)' : '#FFFFFF',
                    color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {products.map((p) => {
              const isLow = p.stock <= (p.lowStockThreshold || 5);
              return (
                <div
                  key={p._id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--bg-main)',
                          color: 'var(--text-muted)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {p.category}
                      </span>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isLow ? 'var(--light-danger)' : 'var(--light-green)',
                          color: isLow ? 'var(--danger)' : 'var(--success)',
                        }}
                      >
                        {p.stock} in stock
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.65rem 0 0.25rem 0' }}>
                      {p.name}
                    </h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      SKU: {p.sku || `SKU-${p._id.slice(-4).toUpperCase()}`} • Brand: {p.brand || 'Yonex/Wilson'}
                    </div>

                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.65rem' }}>
                      ₹{p.price}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => {
                        addToCart(p);
                        handleTabChange('sales');
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: 'var(--primary-peach)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <ShoppingCart size={14} /> Sell POS
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProductId(p._id);
                        setShowReceiveModal(true);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                      }}
                    >
                      + Stock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SHARED INVENTORY & STOCK LOGS */}
      {/* ======================================================== */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Shared Inventory Banner */}
          <div
            style={{
              backgroundColor: 'var(--lavender)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(53, 73, 98, 0.15)',
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="var(--primary-navy)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  Shared Real-Time Inventory
                </h3>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Online member purchases and counter POS sales automatically synchronize with and deduct from the exact same inventory pool.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowReceiveModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  backgroundColor: 'var(--success)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={15} /> + Receive Stock
              </button>
              <button
                onClick={() => setShowDamageModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <MinusCircle size={15} /> Report Damaged Stock
              </button>
            </div>
          </div>

          {/* Inventory Transaction Logs */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Inventory Transaction History
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Audit trail of shipments received, counter POS sales, and reported damages
                </p>
              </div>
              <button
                onClick={fetchInventoryHistory}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={12} /> Refresh Logs
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>DATE & TIME</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>PRODUCT</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>TYPE</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>CHANGE</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>PREV ➔ NEW</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>NOTE / REASON</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryHistory.length > 0 ? (
                    inventoryHistory.map((h) => (
                      <tr key={h._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(h.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {h.product?.name || 'Product'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor:
                                h.type === 'PURCHASE'
                                  ? 'var(--light-green)'
                                  : h.type === 'DAMAGE'
                                  ? 'var(--light-danger)'
                                  : 'var(--lavender)',
                              color:
                                h.type === 'PURCHASE'
                                  ? 'var(--success)'
                                  : h.type === 'DAMAGE'
                                  ? 'var(--danger)'
                                  : 'var(--primary-navy)',
                            }}
                          >
                            {h.type}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '0.85rem 1rem',
                            fontWeight: 800,
                            color: h.quantity > 0 ? 'var(--success)' : 'var(--danger)',
                          }}
                        >
                          {h.quantity > 0 ? `+${h.quantity}` : h.quantity}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                          {h.previousStock} ➔ <strong>{h.newStock}</strong>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {h.notes}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {loadingHistory ? 'Loading history logs...' : 'No inventory transactions recorded.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: COUNTER POS SALES */}
      {/* ======================================================== */}
      {activeTab === 'sales' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: Product Selector */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Select Products for Counter Sale
            </h3>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                }}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.75rem', top: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto' }}>
              {products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => addToCart(p)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-main)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{p.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: p.stock <= 3 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {p.stock} left
                    </span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
                    ₹{p.price}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary-peach)', fontWeight: 700, marginTop: '0.2rem' }}>
                    + Click to add
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: POS Cart & Checkout */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.25rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Current POS Bill ({cart.length} items)
            </h3>

            {/* Customer Identification */}
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsMemberCustomer(false)}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: !isMemberCustomer ? 'var(--primary-navy)' : '#FFFFFF',
                    color: !isMemberCustomer ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Walk-in Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsMemberCustomer(true)}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: isMemberCustomer ? 'var(--primary-navy)' : '#FFFFFF',
                    color: isMemberCustomer ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Club Member (Discount)
                </button>
              </div>

              {isMemberCustomer ? (
                <div>
                  {selectedMember ? (
                    <div
                      style={{
                        backgroundColor: 'var(--lavender)',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{selectedMember.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                          {selectedMember.planName} (15% Pro Shop Discount)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMember(null)}
                        style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="Search member name/phone..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          fontSize: '0.8rem',
                        }}
                      />
                      {memberSearchResults.length > 0 && (
                        <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border)', marginTop: '0.25rem' }}>
                          {memberSearchResults.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => {
                                setSelectedMember(m);
                                setMemberSearchResults([]);
                              }}
                              style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              <strong>{m.name}</strong> ({m.planName})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8rem' }}
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8rem' }}
                  />
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price} each</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, -1)}
                        style={{ width: '22px', height: '22px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.productId, 1)}
                        style={{ width: '22px', height: '22px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: '0.25rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Cart is empty. Click products on left to add.
                </div>
              )}
            </div>

            {/* Total breakdown */}
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Subtotal:</span>
                <span>₹{cartSubtotal}</span>
              </div>
              {posDiscountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--success)' }}>
                  <span>Member Discount ({memberDiscountPercent}%):</span>
                  <span>-₹{posDiscountAmount}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--primary-navy)',
                  marginTop: '0.4rem',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.4rem',
                }}
              >
                <span>Final Total:</span>
                <span>₹{posFinalTotal}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                {['UPI', 'CARD', 'CASH'].map((pm) => (
                  <button
                    type="button"
                    key={pm}
                    onClick={() => setPosPaymentMethod(pm)}
                    style={{
                      padding: '0.45rem',
                      borderRadius: 'var(--radius-sm)',
                      border: posPaymentMethod === pm ? '2px solid var(--primary-navy)' : '1px solid var(--border)',
                      backgroundColor: posPaymentMethod === pm ? '#FFFFFF' : 'var(--bg-main)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkout Button */}
            <button
              type="button"
              disabled={cart.length === 0 || submittingPos}
              onClick={handlePosCheckout}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--primary-peach)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: cart.length === 0 || submittingPos ? 'not-allowed' : 'pointer',
              }}
            >
              {submittingPos ? 'Processing POS...' : `Collect ₹${posFinalTotal} & Generate Invoice`}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ONLINE ORDERS LIFECYCLE */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Online Shop Orders Lifecycle
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Lifecycle: NEW ➔ PROCESSING ➔ READY FOR PICKUP / PACKED ➔ COLLECTED ➔ DELIVERED
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'pending', label: 'New Orders' },
                { id: 'preparing', label: 'Processing' },
                { id: 'ready', label: 'Ready for Pickup' },
                { id: 'completed', label: 'Completed / Delivered' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: orderFilter === f.id ? 'var(--primary-navy)' : '#FFFFFF',
                    color: orderFilter === f.id ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>ORDER ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>MEMBER / BUYER</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>ITEMS</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>FULFILLMENT</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>
                    STAGE ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {shopOrders.length > 0 ? (
                  shopOrders.map((o) => (
                    <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        #{o._id.slice(-4).toUpperCase()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {o.member ? `${o.member.firstName} ${o.member.lastName || ''}` : o.customerName || 'Online Member'}
                        </span>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{o.customerPhone || o.member?.phone}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem' }}>
                        {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: o.fulfillment === 'counter' ? 'var(--lavender)' : 'var(--light-peach)',
                            color: o.fulfillment === 'counter' ? 'var(--primary-navy)' : 'var(--primary-peach)',
                          }}
                        >
                          {o.fulfillment?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor:
                              o.status === 'completed'
                                ? 'var(--light-green)'
                                : o.status === 'ready'
                                ? 'var(--light-warning)'
                                : 'rgba(53, 73, 98, 0.1)',
                            color:
                              o.status === 'completed'
                                ? 'var(--success)'
                                : o.status === 'ready'
                                ? 'var(--warning)'
                                : 'var(--primary-navy)',
                          }}
                        >
                          {o.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>₹{o.total}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        {o.status === 'pending' && (
                          <button
                            onClick={() => handleOrderStatusUpdate(o._id, 'preparing')}
                            style={{
                              backgroundColor: 'var(--primary-navy)',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Accept & Process
                          </button>
                        )}
                        {o.status === 'preparing' && (
                          <button
                            onClick={() => handleOrderStatusUpdate(o._id, 'ready')}
                            style={{
                              backgroundColor: 'var(--warning)',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Ready for Pickup
                          </button>
                        )}
                        {o.status === 'ready' && (
                          <button
                            onClick={() => handleOrderStatusUpdate(o._id, 'completed')}
                            style={{
                              backgroundColor: 'var(--success)',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Handover / Shipped
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {loadingOrders ? 'Loading orders...' : 'No orders matching filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: SHOP PAYMENTS */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Sports Shop Payments Ledger
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ledger of counter POS sales and online sports purchases
              </p>
            </div>
            <button
              onClick={fetchPayments}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>PAYMENT ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>CUSTOMER</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>METHOD</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentsList.length > 0 ? (
                  paymentsList.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {p.paymentId || `PAY-${p._id.slice(-6)}`}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {p.customerName || 'Customer'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--lavender)',
                            color: 'var(--primary-navy)',
                          }}
                        >
                          {p.method}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--light-green)',
                            color: 'var(--success)',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        ₹{p.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {loadingPayments ? 'Loading payments...' : 'No payments found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RECEIVE STOCK MODAL */}
      {/* ======================================================== */}
      {showReceiveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                Receive Stock Shipment
              </h3>
              <button onClick={() => setShowReceiveModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReceiveStock}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Current: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Reason / Delivery Note</label>
                <input
                  type="text"
                  value={receiveReason}
                  onChange={(e) => setReceiveReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingStock}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--success)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  cursor: submittingStock ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingStock ? 'Updating...' : 'Add to Shared Stock'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT DAMAGE MODAL */}
      {/* ======================================================== */}
      {showDamageModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--danger)' }}>
                Report Damaged Stock
              </h3>
              <button onClick={() => setShowDamageModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportDamage}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Product</label>
                <select
                  value={damageProductId}
                  onChange={(e) => setDamageProductId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Current: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Damaged Quantity (Reduce from stock)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={damageQty}
                  onChange={(e) => setDamageQty(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Damage Details / Discrepancy Note</label>
                <input
                  type="text"
                  required
                  value={damageReason}
                  onChange={(e) => setDamageReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingDamage}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  cursor: submittingDamage ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingDamage ? 'Submitting...' : 'Record Damaged Stock'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* POS RECEIPT MODAL */}
      {/* ======================================================== */}
      {posSuccessReceipt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--light-green)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <CheckCircle size={28} />
            </div>

            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Payment Received ✓
            </h3>
            <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Pro Shop Invoice #{posSuccessReceipt.orderId?.slice(-6).toUpperCase()}
            </p>

            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <strong>{posSuccessReceipt.customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <strong>{posSuccessReceipt.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span>₹{posSuccessReceipt.subtotal}</span>
              </div>
              {posSuccessReceipt.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--success)' }}>
                  <span>Membership Discount:</span>
                  <span>-₹{posSuccessReceipt.discount}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.5rem',
                  marginTop: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--primary-navy)',
                }}
              >
                <span>Total Paid:</span>
                <span>₹{posSuccessReceipt.total}</span>
              </div>
            </div>

            <button
              onClick={() => setPosSuccessReceipt(null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--primary-navy)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Done & Start Next Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopStaffDashboard;
