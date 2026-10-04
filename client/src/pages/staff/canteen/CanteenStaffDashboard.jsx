import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Coffee,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  RefreshCw,
  Eye,
  Check,
  CreditCard,
  ChefHat,
  X,
  FileText,
  Sparkles,
  UtensilsCrossed,
  Receipt,
  DollarSign,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import staffService from '../../../services/staffService';
import { managerService } from '../../../services/managerService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';
import FilterDropdown from '../../../components/ui/FilterDropdown';
import Pagination from '../../../components/common/Pagination';
import { usePagination } from '../../../hooks/usePagination';

const CANTEEN_PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI', fullLabel: 'UPI / QR Code' },
  { value: 'CARD', label: 'Card', fullLabel: 'Credit / Debit Card' },
  { value: 'NET_BANKING', label: 'Net Banking', fullLabel: 'Net Banking' },
  { value: 'CASH', label: 'Cash', fullLabel: 'Counter Cash' },
];

const getCanteenCustomerName = (name) => {
  const value = String(name || '').trim();
  return !value || /^table\s+\S+\s+guest$/i.test(value) ? 'Guest Customer' : value;
};

const formatMembershipDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const CanteenStaffDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [menu, setMenu] = useState([]);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [submittingMenuItem, setSubmittingMenuItem] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', category: 'Snacks', price: '', image: '' });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (alert?.type !== 'warning') return undefined;
    const warning = alert;
    const timeout = window.setTimeout(() => {
      setAlert((current) => current === warning ? null : current);
    }, 3200);
    return () => window.clearTimeout(timeout);
  }, [alert]);

  // Active Tab
  const activeTab = ['dashboard', 'menu', 'orders', 'tabs', 'payments', 'profile'].includes(currentTab)
    ? currentTab
    : 'dashboard';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Kitchen Pipeline state
  const [canteenOrders, setCanteenOrders] = useState([]);
  const [orderStageFilter, setOrderStageFilter] = useState('ALL'); // ALL, pending, confirmed, preparing, ready, completed

  // Open Tabs state
  const [openTabsList, setOpenTabsList] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(false);
  const [tabsLoadError, setTabsLoadError] = useState('');

  // Payments state
  const [canteenPayments, setCanteenPayments] = useState([]);
  const paymentsPage = usePagination(canteenPayments, 10, currentTab);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentsLoadError, setPaymentsLoadError] = useState('');

  // New Kitchen Order Modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [memberSearchError, setMemberSearchError] = useState('');
  const [orderDraftItems, setOrderDraftItems] = useState([]);
  const [isTabOrder, setIsTabOrder] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Settle Tab Modal state
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleOrder, setSettleOrder] = useState(null);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState('UPI');
  const [submittingSettle, setSubmittingSettle] = useState(false);
  const [settleReceipt, setSettleReceipt] = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [staffProfile, setStaffProfile] = useState(null);


  const fetchCanteenData = async () => {
    try {
      setLoading(true);
      const [resOverview, resMenu] = await Promise.all([
        staffService.getCanteenOverview(),
        staffService.getCanteenMenu(),
      ]);

      if (resOverview?.success) {
        setOverview(resOverview.data);
      }
      if (resMenu?.success) {
        setMenu(resMenu.data);
      }
    } catch (err) {
      console.error('Canteen staff load error:', err);
      setAlert({ type: 'danger', message: 'Failed to load canteen operations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanteenData();
  }, []);

  // Fetch kitchen orders
  const fetchOrders = async (stage) => {
    try {
      const res = await staffService.getCanteenOrders({ status: stage || orderStageFilter });
      if (res.success) {
        setCanteenOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      fetchOrders(orderStageFilter);
    }
  }, [activeTab, orderStageFilter]);

  useEffect(() => {
    if (activeTab !== 'dashboard') return undefined;
    const timer = window.setInterval(async () => {
      try {
        const result = await staffService.getCanteenOverview();
        if (result?.success) setOverview(result.data);
      } catch (error) {
        console.error('Canteen live feed refresh failed:', error);
      }
    }, 10000);
    return () => window.clearInterval(timer);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'profile') return;
    staffService.getMyProfile()
      .then((result) => { if (result?.success) setStaffProfile(result.data); })
      .catch(() => setAlert({ type: 'danger', message: 'Failed to load staff profile.' }));
  }, [activeTab]);

  // Fetch open tabs
  const fetchOpenTabs = async () => {
    setLoadingTabs(true);
    setTabsLoadError('');
    try {
      const res = await staffService.getOpenTabs();
      if (res.success) {
        setOpenTabsList(Array.isArray(res.data) ? res.data : []);
      } else {
        setTabsLoadError(res.message || 'Could not load open bills.');
      }
    } catch (err) {
      console.error(err);
      setTabsLoadError(err.response?.data?.message || 'Could not load open bills. Please refresh and try again.');
    } finally {
      setLoadingTabs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tabs') {
      fetchOpenTabs();
    }
  }, [activeTab]);

  // Fetch payments
  const fetchPayments = async () => {
    setLoadingPayments(true);
    setPaymentsLoadError('');
    try {
      const res = await staffService.getCanteenPayments();
      if (res.success) {
        setCanteenPayments(Array.isArray(res.data) ? res.data : []);
      } else {
        setPaymentsLoadError(res.message || 'Could not load payment history.');
      }
    } catch (err) {
      console.error(err);
      setPaymentsLoadError(err.response?.data?.message || 'Could not load payment history. Please refresh and try again.');
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
    }
  }, [activeTab]);

  // Live member search
  useEffect(() => {
    const query = memberSearchQuery.trim();
    if (query.length < 2) {
      setMemberSearchResults([]);
      setMemberSearchLoading(false);
      setMemberSearchError('');
      return undefined;
    }

    let cancelled = false;
    setMemberSearchLoading(true);
    setMemberSearchError('');
    const timer = window.setTimeout(async () => {
      try {
        const res = await staffService.searchMembers(query);
        if (!cancelled && res.success) {
          setMemberSearchResults(res.data || []);
          setMemberSearchError('');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Member search failed:', error);
          setMemberSearchResults([]);
          setMemberSearchError(error.response?.data?.message || 'Could not search members. Check your connection and try again.');
        }
      } finally {
        if (!cancelled) setMemberSearchLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [memberSearchQuery]);

  const handleAddMenuItem = async (event) => {
    event.preventDefault();
    setSubmittingMenuItem(true);
    try {
      const result = await managerService.createMenuItem({
        name: newMenuItem.name.trim(),
        category: newMenuItem.category,
        price: Number(newMenuItem.price),
        image: newMenuItem.image.trim(),
        isAvailable: true,
      });
      if (!result?.success) throw new Error(result?.message || 'Unable to add menu item.');
      setMenu((items) => [...items, result.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewMenuItem({ name: '', category: 'Snacks', price: '', image: '' });
      setShowAddMenuModal(false);
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || error.message || 'Failed to add menu item.' });
    } finally {
      setSubmittingMenuItem(false);
    }
  };

  // Update order pipeline status
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await staffService.updateCanteenOrderStatus(orderId, newStatus);
      if (res.success) {
        setAlert({ type: 'success', message: `Order #${orderId.slice(-4)} updated to ${newStatus.toUpperCase()}` });
        fetchCanteenData();
        fetchOrders(orderStageFilter);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update order status' });
    }
  };

  const showQuantityLimitWarning = (itemName) => {
    setAlert({
      type: 'warning',
      message: `Each item is limited to 10 per order. ${itemName ? `${itemName} is already at the limit.` : 'The quantity has been kept at 10.'}`,
    });
  };

  // Draft order operations
  const addItemToDraft = (menuItem) => {
    const existing = orderDraftItems.find((item) => item.productId === menuItem._id);
    if (existing?.quantity >= 10) {
      showQuantityLimitWarning(menuItem.name);
      return;
    }
    setOrderDraftItems((prev) => {
      const exists = prev.find((i) => i.productId === menuItem._id);
      if (exists) {
        return prev.map((i) =>
          i.productId === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          category: menuItem.category,
          quantity: 1,
        },
      ];
    });
  };

  const updateDraftQty = (productId, delta) => {
    const target = orderDraftItems.find((item) => item.productId === productId);
    if (target && target.quantity + delta > 10) {
      showQuantityLimitWarning(target.name);
      return;
    }
    setOrderDraftItems((prev) => {
      return prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const setDraftQty = (productId, value) => {
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1) return;
    if (quantity > 10) {
      const item = orderDraftItems.find((entry) => entry.productId === productId);
      showQuantityLimitWarning(item?.name);
    }
    setOrderDraftItems((items) => items.map((item) => item.productId === productId
      ? { ...item, quantity: Math.min(quantity, 10) }
      : item));
  };

  // Create Order Submission
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (orderDraftItems.length === 0) return;
    if (orderDraftItems.some((item) => item.quantity > 10)) {
      showQuantityLimitWarning(orderDraftItems.find((item) => item.quantity > 10)?.name);
      return;
    }

    setSubmittingOrder(true);
    try {
      const payload = {
        tableNumber: '',
        memberId: selectedMember ? selectedMember.id : undefined,
        customerName: selectedMember?.name || 'Guest',
        customerPhone: selectedMember?.phone || '',
        items: orderDraftItems,
        isTab: isTabOrder,
      };

      const res = await staffService.createCanteenOrder(payload);
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Kitchen order sent successfully!' });
        setShowOrderModal(false);
      setOrderDraftItems([]);
        setSelectedMember(null);
      setMemberSearchQuery('');
      setMemberSearchResults([]);
        fetchCanteenData();
        await fetchOpenTabs();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to create order' });
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Settle Tab Submission
  const handleSettleTab = async (e) => {
    e.preventDefault();
    if (!settleOrder) return;

    setSubmittingSettle(true);
    try {
      const res = await staffService.settleCanteenTab({
        orderId: settleOrder._id,
        tableNumber: settleOrder.tableNumber,
        paymentMethod: settlePaymentMethod,
      });

      if (res.success) {
        const paidOrder = res.data?.order || settleOrder;
        setSettleReceipt({
          order: paidOrder,
          invoice: res.data?.invoice,
          payment: res.data?.payment,
          orderId: paidOrder._id,
          customerName: paidOrder.customerName || settleOrder.customerName || 'Guest',
          items: paidOrder.items || [],
          subtotal: paidOrder.subtotal,
          discount: paidOrder.discount,
          total: paidOrder.total,
          paymentMethod: settlePaymentMethod,
          date: new Date().toLocaleString(),
        });
        setShowSettleModal(false);
        setSettleOrder(null);
        fetchCanteenData();
        if (activeTab === 'tabs') fetchOpenTabs();
        fetchPayments();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to settle tab' });
    } finally {
      setSubmittingSettle(false);
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelOrder || cancelOrder.status === 'completed') return;
    setSubmittingCancel(true);
    try {
      await staffService.updateCanteenOrderStatus(cancelOrder._id, 'cancelled');
      setAlert({ type: 'success', message: `Order #${cancelOrder._id.slice(-4)} cancelled. Reason: ${cancelReason}` });
      setCancelOrder(null);
      await fetchCanteenData();
      await fetchOrders(orderStageFilter);
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Failed to cancel order.' });
    } finally {
      setSubmittingCancel(false);
    }
  };

  const draftSubtotal = orderDraftItems.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  const memberCafeDiscountRate = selectedMember?.hasActiveMembership ? Number(selectedMember.cafeDiscount || 0) : 0;
  const draftDiscount = Math.round((draftSubtotal * memberCafeDiscountRate) / 100);
  const draftTotal = Math.max(0, draftSubtotal - draftDiscount);

  if (loading && !overview) {
    return <Loader fullPage text="Loading Canteen & Bar Terminal..." />;
  }

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Dynamic Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeTab === 'menu' && <UtensilsCrossed size={28} color="var(--primary-navy)" />}
          {activeTab === 'orders' && <ChefHat size={28} color="var(--primary-navy)" />}
          {activeTab === 'tabs' && <Receipt size={28} color="var(--primary-navy)" />}
          {activeTab === 'payments' && <DollarSign size={28} color="var(--primary-navy)" />}
          {activeTab === 'dashboard' && <Coffee size={28} color="var(--primary-navy)" />}
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-family-display)',
              margin: 0,
            }}
          >
            {activeTab === 'menu' && 'Menu & Item Availability'}
            {activeTab === 'orders' && 'Kitchen Order Queue'}
            {activeTab === 'tabs' && 'Bills'}
            {activeTab === 'payments' && 'Canteen Payments'}
            {activeTab === 'dashboard' && 'Canteen & Bar Dashboard'}
          </h1>
        </div>
      </div>

      {alert?.message && alert.type === 'warning' && (
        <div className="canteen-quantity-toast" role="alert">
          <AlertCircle size={19} aria-hidden="true" />
          <div><strong>Quantity limit reached</strong><span>{alert.message}</span></div>
          <button type="button" aria-label="Dismiss quantity warning" onClick={() => setAlert(null)}><X size={16} /></button>
        </div>
      )}

      {alert?.message && alert.type !== 'success' && alert.type !== 'warning' && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.message}</Alert>
        </div>
      )}

      {/* 4 KPIs - Always Visible */}
      {activeTab !== 'profile' && (
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
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              ACTIVE ORDERS
            </span>
            <ChefHat size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
            {overview?.kpi?.activeOrdersCount ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
            Live in kitchen queue
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              PREPARING
            </span>
            <Clock size={18} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.4rem' }}>
            {overview?.kpi?.preparingCount ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Cooking in progress
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.15rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              READY TO SERVE
            </span>
            <CheckCircle size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.4rem' }}>
            {overview?.kpi?.readyCount ?? 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Ready for runner dispatch
          </span>
        </div>

      </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: CANTEEN DASHBOARD OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="canteen-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Live Kitchen Queue */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.1rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Live Kitchen Orders Feed
                </h3>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  New tickets, preparations, and ready orders
                </p>
              </div>
              <button
                onClick={fetchCanteenData}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
              {(overview?.liveKitchenQueue || []).length > 0 ? (
                overview.liveKitchenQueue.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                          {getCanteenCustomerName(order.customerName)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          • #{order._id.slice(-4).toUpperCase()}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor:
                              order.status === 'ready'
                                ? 'var(--success-light)'
                                : order.status === 'preparing'
                                  ? 'var(--warning-light)'
                                  : 'var(--bg-subtle)',
                            color:
                              order.status === 'ready'
                                ? 'var(--success)'
                                : order.status === 'preparing'
                                  ? 'var(--warning)'
                                  : 'var(--text-main)',
                          }}
                        >
                          {order.status?.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 600 }}>
                        {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(' • ')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Amount: ₹{order.total}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleOrderStatusUpdate(order._id, 'preparing')}
                          style={{
                            padding: '0.45rem 0.85rem',
                            backgroundColor: 'var(--primary)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleOrderStatusUpdate(order._id, 'ready')}
                          style={{
                            padding: '0.45rem 0.85rem',
                            backgroundColor: 'var(--warning)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleOrderStatusUpdate(order._id, 'completed')}
                          style={{
                            padding: '0.45rem 0.85rem',
                            backgroundColor: 'var(--success)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Served & Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No active orders in kitchen queue.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MENU ITEMS */}
      {/* ======================================================== */}
      {activeTab === 'menu' && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Canteen Menu Items
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                View current menu items and prices, or add a new item.
              </p>
            </div>
            <button type="button" className="btn btn-primary btn-md" onClick={() => setShowAddMenuModal(true)}>
              <Plus size={16} /> Add Menu Item
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {menu.length ? (
              menu.map((item) => (
                <div
                  key={item._id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.4rem',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  <div>
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
                      {item.category}
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.4rem 0 0.2rem 0' }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      ₹{item.price}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No menu items yet. Add a menu item to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: KITCHEN PIPELINE & DISPATCH */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Kitchen Order Queue & Progress
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Pipeline: NEW ➔ ACCEPTED ➔ PREPARING ➔ READY ➔ SERVED ➔ COMPLETED
              </p>
            </div>

            <FilterDropdown label="Order status" value={orderStageFilter} onChange={(event) => setOrderStageFilter(event.target.value)} options={[
              { value: 'ALL', label: 'All orders' },
              { value: 'pending', label: 'New tickets' },
              { value: 'preparing', label: 'Preparing' },
              { value: 'ready', label: 'Ready for service' },
              { value: 'completed', label: 'Completed' },
            ]} />
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {canteenOrders.length > 0 ? (
              canteenOrders.map((o) => (
                <div
                  key={o._id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-main)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {getCanteenCustomerName(o.customerName)}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Ticket #{o._id.slice(-4).toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor:
                            o.status === 'ready'
                              ? 'var(--success-light)'
                              : o.status === 'preparing'
                                ? 'var(--warning-light)'
                                : o.status === 'completed'
                                  ? 'var(--bg-main)'
                                  : 'var(--bg-subtle)',
                          color:
                            o.status === 'ready'
                              ? 'var(--success)'
                              : o.status === 'preparing'
                                ? 'var(--warning)'
                                : o.status === 'completed'
                                  ? 'var(--text-muted)'
                                  : 'var(--text-main)',
                        }}
                      >
                        {o.status?.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.5rem', fontWeight: 600 }}>
                      {o.items?.map((it) => `${it.quantity} × ${it.name}`).join(' • ')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Total: ₹{o.total} • Tab Status: {o.tabStatus || 'OPEN'}
                    </div>
                  </div>

                  {/* Progression button */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['pending', 'confirmed'].includes(o.status) && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o._id, 'preparing')}
                        style={{
                          padding: '0.55rem 1.15rem',
                          backgroundColor: 'var(--primary)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Start Preparing
                      </button>
                    )}
                    {o.status === 'preparing' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o._id, 'ready')}
                        style={{
                          padding: '0.55rem 1.15rem',
                          backgroundColor: 'var(--warning)',
                          color: 'var(--primary-text)',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
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
                          padding: '0.55rem 1.15rem',
                          backgroundColor: 'var(--success)',
                          color: 'var(--primary-text)',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Served to Guest ✓
                      </button>
                    )}
                    {!['completed', 'cancelled'].includes(o.status) && (
                      <button type="button" className="canteen-cancel-button" onClick={() => { setCancelOrder(o); setCancelReason('Customer requested cancellation'); }}>
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No kitchen orders in this stage.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: OPEN TABS & RUNNING BILLS */}
      {/* ======================================================== */}
      {activeTab === 'tabs' && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Bills
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Review open orders and settle customer bills
              </p>
            </div>
            <button
              onClick={fetchOpenTabs}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.65rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <RefreshCw size={12} /> Refresh Tabs
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {openTabsList.length > 0 ? (
              openTabsList.map((tab) => (
                <div
                  key={tab._id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {getCanteenCustomerName(tab.customerName)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--warning-light)',
                          color: 'var(--warning)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        UNPAID BILL
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                      Unpaid bill
                    </div>

                    {/* Items Breakdown */}
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        ORDERS / ITEMS:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {tab.items?.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                            <span>{it.quantity}x {it.name}</span>
                            <strong>₹{it.price * it.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subtotal & Discount */}
                    <div
                      style={{
                        marginTop: '0.75rem',
                        borderTop: '1px dashed var(--border-color)',
                        paddingTop: '0.5rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      {tab.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                          <span>Member Cafe Discount:</span>
                          <span>-₹{tab.discount}</span>
                        </div>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          color: 'var(--text-main)',
                          marginTop: '0.35rem',
                        }}
                      >
                        <span>Bill Total:</span>
                        <span>₹{tab.total}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-md canteen-settle-button"
                      onClick={() => {
                        setSettleOrder(tab);
                        setShowSettleModal(true);
                      }}
                    >
                      Settle Bill
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ colSpan: 3, textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      {loadingTabs ? 'Loading open bills...' : tabsLoadError || 'No open bills currently running.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: CANTEEN PAYMENTS */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Canteen Settlement Receipts Ledger
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ledger of settled cafe bills and collected payments
              </p>
            </div>
            <button
              onClick={fetchPayments}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
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
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
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
                {canteenPayments.length > 0 ? (
                  paymentsPage.paginatedItems.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {p.paymentId || `PAY-${p._id.slice(-6)}`}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {getCanteenCustomerName(p.customerName)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-main)',
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
                            backgroundColor: 'var(--success-light)',
                            color: 'var(--success)',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>
                        ₹{p.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {loadingPayments ? 'Loading canteen payments...' : paymentsLoadError || 'No payments found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ padding: '0 1rem' }}><Pagination {...paymentsPage} onPageChange={paymentsPage.setCurrentPage} /></div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && staffProfile && (
        <section className="canteen-profile-card" aria-label="My profile">
          {user?.profileImage
            ? <img className="canteen-profile-photo" src={user.profileImage} alt="Profile" />
            : <div className="canteen-profile-photo canteen-profile-placeholder" aria-label="Profile photo unavailable">{staffProfile.name?.charAt(0) || 'S'}</div>}
          <dl className="canteen-profile-details">
            <div><dt>Name</dt><dd>{staffProfile.name || '—'}</dd></div>
            <div><dt>Employee ID</dt><dd>{staffProfile.employeeId || '—'}</dd></div>
            <div><dt>Department</dt><dd>{staffProfile.department === 'CANTEEN' ? 'Canteen' : staffProfile.department || '—'}</dd></div>
            <div><dt>Phone</dt><dd>{staffProfile.phone || '—'}</dd></div>
            <div><dt>Email</dt><dd>{staffProfile.email || '—'}</dd></div>
          </dl>
        </section>
      )}

      {cancelOrder && (
        <div className="modal-backdrop canteen-modal-backdrop">
          <form className="canteen-modal" onSubmit={handleCancelOrder}>
            <div className="canteen-modal-heading">
              <h2>Cancel Order #{cancelOrder._id.slice(-4).toUpperCase()}</h2>
              <button type="button" className="canteen-icon-button" aria-label="Close" onClick={() => setCancelOrder(null)}><X size={18} /></button>
            </div>
            <label>Cancellation reason<textarea required value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} /></label>
            <p className="canteen-muted-note">The order status will be cancelled. The current order record has no field for storing a cancellation reason.</p>
            <div className="canteen-modal-actions">
              <button type="button" className="btn btn-outline btn-md" onClick={() => setCancelOrder(null)}>Close</button>
              <button type="submit" className="btn btn-danger btn-md" disabled={submittingCancel}>{submittingCancel ? 'Cancelling…' : 'Confirm Cancel'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* NEW KITCHEN ORDER / TAB MODAL */}
      {/* ======================================================== */}
      {showAddMenuModal && (
        <div className="modal-backdrop canteen-modal-backdrop" style={{ zIndex: 1200 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAddMenuModal(false); }}>
          <form className="canteen-modal" onSubmit={handleAddMenuItem}>
            <div className="canteen-modal-heading">
              <h2>Add Menu Item</h2>
              <button type="button" className="canteen-icon-button" aria-label="Close" onClick={() => setShowAddMenuModal(false)}><X size={18} /></button>
            </div>
            <label>Item Name<input required maxLength="100" value={newMenuItem.name} onChange={(event) => setNewMenuItem({ ...newMenuItem, name: event.target.value })} /></label>
            <label>Category
              <select required value={newMenuItem.category} onChange={(event) => setNewMenuItem({ ...newMenuItem, category: event.target.value })}>
                {Array.from(new Set(['Beverages', 'Healthy', 'Meals', 'Snacks', ...menu.map((item) => item.category).filter(Boolean)]))
                  .sort((a, b) => a.localeCompare(b))
                  .map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label>Price<input required type="number" min="0.01" step="0.01" value={newMenuItem.price} onChange={(event) => setNewMenuItem({ ...newMenuItem, price: event.target.value })} /></label>
            <label>Image URL (optional)<input type="url" value={newMenuItem.image} onChange={(event) => setNewMenuItem({ ...newMenuItem, image: event.target.value })} /></label>
            <div className="canteen-modal-actions">
              <button type="button" className="btn btn-outline btn-md" onClick={() => setShowAddMenuModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-md" disabled={submittingMenuItem}>{submittingMenuItem ? 'Saving…' : 'Save Menu Item'}</button>
            </div>
          </form>
        </div>
      )}

      {showOrderModal && (
        <div
          className="canteen-order-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(12, 20, 31, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="canteen-order-modal"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div className="canteen-order-modal-heading">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                New Kitchen Order / Open Tab
              </h3>
              <button type="button" className="canteen-icon-button" aria-label="Close order form" onClick={() => setShowOrderModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form className="canteen-order-form" onSubmit={handleCreateOrder}>
              <div className="canteen-member-picker">
                <label htmlFor="canteen-member-search">Find a club member</label>
                {selectedMember ? (
                  <div className="canteen-selected-member">
                    <div className="canteen-selected-member-heading">
                      <div>
                        <strong>{selectedMember.name}</strong>
                        <span>{selectedMember.memberId} · {selectedMember.planName}</span>
                      </div>
                      <button
                        type="button"
                        className="canteen-member-change"
                        onClick={() => {
                          setSelectedMember(null);
                        }}
                      >
                        Change
                      </button>
                    </div>
                    <div className="canteen-membership-facts">
                      <div><span>Starts</span><strong>{formatMembershipDate(selectedMember.membershipStartDate)}</strong></div>
                      <div><span>Ends</span><strong>{formatMembershipDate(selectedMember.membershipEndDate)}</strong></div>
                      <div><span>Canteen discount</span><strong>{memberCafeDiscountRate}%</strong></div>
                    </div>
                    {!selectedMember.hasActiveMembership && (
                      <p className="canteen-no-membership">No active membership found. No membership discount will be applied.</p>
                    )}
                  </div>
                ) : (
                  <>
                    <input
                      id="canteen-member-search"
                      type="search"
                      autoComplete="off"
                      placeholder="Search by member name, phone, or email"
                      value={memberSearchQuery}
                      onChange={(event) => {
                        setMemberSearchQuery(event.target.value);
                        setSelectedMember(null);
                      }}
                    />
                    {memberSearchQuery.trim().length >= 2 && (
                      <div className="canteen-member-results" role="listbox" aria-label="Matching club members">
                        {memberSearchLoading ? (
                          <p>Searching members…</p>
                        ) : memberSearchResults.length ? (
                          memberSearchResults.map((member) => (
                            <button
                              type="button"
                              role="option"
                              aria-selected="false"
                              key={member.id}
                              onClick={() => {
                                setSelectedMember(member);
                                setMemberSearchQuery('');
                                setMemberSearchResults([]);
                                setMemberSearchError('');
                              }}
                            >
                              <span><strong>{member.name}</strong><small>{member.memberId} · {member.phone || member.email}</small></span>
                              <span>{member.planName}{member.hasActiveMembership ? ` · ${member.cafeDiscount}% off` : ''}</span>
                            </button>
                          ))
                        ) : memberSearchError ? (
                          <p>{memberSearchError}</p>
                        ) : (
                          <p>No matching members found. The order will be saved as a guest order.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Menu Item Quick Selector */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Add Menu Dishes to Order:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto', marginTop: '0.35rem' }}>
                  {menu
                    .filter((m) => m.isAvailable)
                    .map((item) => (
                      <button
                        type="button"
                        key={item._id}
                        onClick={() => addItemToDraft(item)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-main)',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>₹{item.price}</div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Selected Order Items */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Order Draft Items:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.35rem' }}>
                  {orderDraftItems.length > 0 ? (
                    orderDraftItems.map((item) => (
                      <div key={item.productId} className="canteen-draft-item">
                        <div>
                          <strong>{item.name}</strong> • ₹{item.price}
                        </div>
                        <div className="canteen-quantity-control">
                          <button
                            type="button"
                            className="canteen-quantity-button"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => updateDraftQty(item.productId, -1)}
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            aria-label={`${item.name} quantity`}
                            aria-describedby="canteen-quantity-limit-note"
                            className="canteen-quantity-input"
                            type="number"
                            min="1"
                            max="10"
                            step="1"
                            value={item.quantity}
                            onChange={(event) => setDraftQty(item.productId, event.target.value)}
                          />
                          <button
                            type="button"
                            className="canteen-quantity-button"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => updateDraftQty(item.productId, 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                      Click menu items above to add to this order ticket.
                    </div>
                  )}
                </div>
              </div>
              <div className="canteen-order-summary">
                <div><span>Subtotal</span><strong>₹{draftSubtotal.toFixed(2)}</strong></div>
                {selectedMember && (
                  <div className="canteen-order-summary-discount">
                    <span>Member discount{memberCafeDiscountRate ? ` (${memberCafeDiscountRate}%)` : ''}</span>
                    <strong>−₹{draftDiscount.toFixed(2)}</strong>
                  </div>
                )}
                <div className="canteen-order-summary-total"><span>Total</span><strong>₹{draftTotal.toFixed(2)}</strong></div>
              </div>
              <p id="canteen-quantity-limit-note" className="canteen-quantity-limit-note">Maximum 10 quantities per item per order.</p>
              <button
                type="submit"
                className="btn btn-primary btn-md canteen-order-confirm"
                style={{ width: '100%', marginTop: '0.65rem' }}
                disabled={orderDraftItems.length === 0 || submittingOrder}
              >
                {submittingOrder ? 'Confirming Order…' : 'Confirm Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SETTLE TAB BILL MODAL */}
      {/* ======================================================== */}
      {showSettleModal && settleOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(12, 20, 31, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="canteen-modal canteen-payment-modal"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '460px',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Settle Tab & Print Invoice
              </h3>
              <button onClick={() => setShowSettleModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="canteen-summary-card">
              <div className="canteen-summary-row">
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <strong>{getCanteenCustomerName(settleOrder.customerName)}</strong>
              </div>
              <div className="canteen-summary-row">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span>₹{settleOrder.subtotal}</span>
              </div>
              {settleOrder.discount > 0 && (
                <div className="canteen-summary-row canteen-summary-discount">
                  <span>Member Cafe Discount:</span>
                  <span>-₹{settleOrder.discount}</span>
                </div>
              )}
              <div
                className="canteen-summary-row canteen-summary-total"
              >
                <span>Total Due:</span>
                <span>₹{settleOrder.total}</span>
              </div>
            </div>

            <form onSubmit={handleSettleTab}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  PAYMENT METHOD
                </label>
                <div className="canteen-payment-methods">
                  {CANTEEN_PAYMENT_METHODS.map(({ value, label, fullLabel }) => (
                    <button
                      type="button"
                      key={value}
                      aria-pressed={settlePaymentMethod === value}
                      title={fullLabel}
                      className="canteen-payment-method"
                      onClick={() => setSettlePaymentMethod(value)}
                      style={{
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        border: settlePaymentMethod === value ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        backgroundColor: settlePaymentMethod === value ? 'var(--bg-card)' : 'var(--bg-main)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-md canteen-modal-primary-action"
                disabled={submittingSettle}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: submittingSettle ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingSettle ? 'Processing Payment…' : `Confirm Payment · ₹${settleOrder.total}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SETTLE RECEIPT MODAL */}
      {/* ======================================================== */}
      {settleReceipt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(12, 20, 31, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="canteen-modal canteen-receipt-modal"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
              }}
            >
              <CheckCircle size={28} />
            </div>

            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Payment Received
            </h3>
            <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Bill #B{settleReceipt.orderId?.slice(-6).toUpperCase()} • {getCanteenCustomerName(settleReceipt.customerName)}
            </p>

            <div className="canteen-receipt-summary">
              <div className="canteen-receipt-row canteen-receipt-meta"><span>Customer</span><strong>{getCanteenCustomerName(settleReceipt.customerName)}</strong></div>
              {settleReceipt.items.map((item, index) => (
                <div key={`${item.product || item.name}-${index}`} className="canteen-receipt-row canteen-receipt-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="canteen-receipt-row canteen-receipt-meta"><span>Subtotal</span><span>₹{settleReceipt.subtotal}</span></div>
              <div className="canteen-receipt-row canteen-receipt-meta"><span>Member Discount</span><span>-₹{settleReceipt.discount}</span></div>
              <div className="canteen-receipt-row canteen-receipt-meta"><span>Status</span><strong>{settleReceipt.order?.paymentStatus?.toUpperCase() || 'PAID'}</strong></div>
              <div className="canteen-receipt-row canteen-receipt-meta">
                <span>Method</span>
                <strong>{settleReceipt.paymentMethod}</strong>
              </div>
              <div className="canteen-receipt-row canteen-receipt-total">
                <span>Amount Paid:</span>
                <span>₹{settleReceipt.total}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-md canteen-modal-primary-action"
              onClick={() => setSettleReceipt(null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CanteenStaffDashboard;
