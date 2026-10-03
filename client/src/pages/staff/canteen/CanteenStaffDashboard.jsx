import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Coffee,
  UtensilsCrossed,
  CheckCircle,
  Clock,
  User,
  Users,
  DollarSign,
  Plus,
  RefreshCw,
  Eye,
  Check,
  CreditCard,
  ChefHat,
  X,
  FileText,
  Building2,
  Receipt,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import staffService from '../../../services/staffService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';

export const CanteenStaffDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [alert, setAlert] = useState(null);

  // Active Tab
  const activeTab = ['dashboard', 'menu', 'tables', 'orders', 'tabs', 'payments'].includes(currentTab)
    ? currentTab
    : 'dashboard';

  const handleTabChange = (tabName) => {
    setSearchParams(tabName === 'dashboard' ? {} : { tab: tabName });
  };

  // Kitchen Pipeline state
  const [canteenOrders, setCanteenOrders] = useState([]);
  const [orderStageFilter, setOrderStageFilter] = useState('ALL'); // ALL, pending, confirmed, preparing, ready, completed

  // Open Tabs state
  const [openTabsList, setOpenTabsList] = useState([]);
  const [loadingTabs, setLoadingTabs] = useState(false);

  // Payments state
  const [canteenPayments, setCanteenPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // New Kitchen Order Modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTableNum, setSelectedTableNum] = useState('T1');
  const [customerType, setCustomerType] = useState('TABLE'); // TABLE | MEMBER | WALK_IN
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [orderDraftItems, setOrderDraftItems] = useState([]);
  const [isTabOrder, setIsTabOrder] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Settle Tab Modal state
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleOrder, setSettleOrder] = useState(null);
  const [settlePaymentMethod, setSettlePaymentMethod] = useState('UPI');
  const [submittingSettle, setSubmittingSettle] = useState(false);
  const [settleReceipt, setSettleReceipt] = useState(null);

  // Table Status Edit Modal state
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableStatus, setTableStatus] = useState('AVAILABLE');
  const [seatedGuest, setSeatedGuest] = useState('');

  // Attendance state
  const [checkedIn, setCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('08:30 AM');

  const fetchCanteenData = async () => {
    try {
      setLoading(true);
      const [resOverview, resTables, resMenu] = await Promise.all([
        staffService.getCanteenOverview(),
        staffService.getDiningTables(),
        staffService.getCanteenMenu(),
      ]);

      if (resOverview?.success) {
        setOverview(resOverview.data);
      }
      if (resTables?.success) {
        setTables(resTables.data);
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

  // Fetch open tabs
  const fetchOpenTabs = async () => {
    setLoadingTabs(true);
    try {
      const res = await staffService.getOpenTabs();
      if (res.success) {
        setOpenTabsList(res.data);
      }
    } catch (err) {
      console.error(err);
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
    try {
      const res = await staffService.getCanteenPayments();
      if (res.success) {
        setCanteenPayments(res.data);
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

  // Live member search
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

  // Toggle dish availability (available / out of stock)
  const handleToggleAvailability = async (itemId, itemName) => {
    try {
      const res = await staffService.toggleItemAvailability(itemId);
      if (res.success) {
        setAlert({
          type: 'success',
          message: `${itemName} status updated: ${res.data?.isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}`,
        });
        fetchCanteenData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to toggle item availability' });
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

  // Seat guest or update table
  const handleUpdateTable = async (e) => {
    e.preventDefault();
    if (!selectedTable) return;

    try {
      const res = await staffService.updateTableStatus(selectedTable._id, {
        status: tableStatus,
        customerName: tableStatus === 'OCCUPIED' ? seatedGuest : '',
      });
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Table updated successfully.' });
        setShowTableModal(false);
        fetchCanteenData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update table' });
    }
  };

  // Quick Table status transition
  const handleQuickTableTransition = async (table, targetStatus) => {
    try {
      const res = await staffService.updateTableStatus(table._id, {
        status: targetStatus,
        customerName: targetStatus === 'AVAILABLE' ? '' : table.currentCustomer?.name,
      });
      if (res.success) {
        setAlert({ type: 'success', message: `Table ${table.tableNumber} is now ${targetStatus}` });
        fetchCanteenData();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update table' });
    }
  };

  // Draft order operations
  const addItemToDraft = (menuItem) => {
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
    setOrderDraftItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Create Order Submission
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (orderDraftItems.length === 0) return;

    setSubmittingOrder(true);
    try {
      const payload = {
        tableNumber: selectedTableNum,
        memberId: selectedMember ? selectedMember.id : undefined,
        customerName: selectedMember ? selectedMember.name : (customerName || `Table ${selectedTableNum} Guest`),
        customerPhone: selectedMember ? selectedMember.phone : (customerPhone || ''),
        items: orderDraftItems,
        isTab: isTabOrder,
      };

      const res = await staffService.createCanteenOrder(payload);
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Kitchen order sent successfully!' });
        setShowOrderModal(false);
        setOrderDraftItems([]);
        setSelectedMember(null);
        setCustomerName('');
        setCustomerPhone('');
        fetchCanteenData();
        if (activeTab === 'tabs') fetchOpenTabs();
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
        setSettleReceipt({
          orderId: settleOrder._id,
          tableNumber: settleOrder.tableNumber,
          customerName: settleOrder.customerName,
          items: settleOrder.items || [],
          subtotal: settleOrder.subtotal,
          discount: settleOrder.discount,
          total: settleOrder.total,
          paymentMethod: settlePaymentMethod,
          date: new Date().toLocaleString(),
        });
        setShowSettleModal(false);
        setSettleOrder(null);
        fetchCanteenData();
        if (activeTab === 'tabs') fetchOpenTabs();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to settle tab' });
    } finally {
      setSubmittingSettle(false);
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
    return <Loader fullPage text="Loading Canteen & Bar Terminal..." />;
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
            {activeTab === 'menu' && <UtensilsCrossed size={24} color="var(--primary-navy)" />}
            {activeTab === 'tables' && <Building2 size={24} color="var(--primary-navy)" />}
            {activeTab === 'orders' && <ChefHat size={24} color="var(--primary-navy)" />}
            {activeTab === 'tabs' && <Receipt size={24} color="var(--primary-navy)" />}
            {activeTab === 'payments' && <DollarSign size={24} color="var(--primary-navy)" />}
            {activeTab === 'dashboard' && <Coffee size={24} color="var(--primary-navy)" />}
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-family-display)',
                margin: 0,
              }}
            >
              {activeTab === 'menu' && 'Menu & Item Availability'}
              {activeTab === 'tables' && 'Table Layout & Seating Status'}
              {activeTab === 'orders' && 'Kitchen Order Display (KOD)'}
              {activeTab === 'tabs' && 'Open Table Tabs & Bill Settlement'}
              {activeTab === 'payments' && 'Canteen Payments & Daily Closing'}
              {activeTab === 'dashboard' && 'Canteen & Bar Dashboard'}
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
              {activeTab === 'menu' && 'MENU'}
              {activeTab === 'tables' && 'TABLES'}
              {activeTab === 'orders' && 'KITCHEN QUEUE'}
              {activeTab === 'tabs' && 'TABS & BILLS'}
              {activeTab === 'payments' && 'TRANSACTIONS'}
              {activeTab === 'dashboard' && 'DASHBOARD'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
            {activeTab === 'menu' && 'Manage menu catalog, prices, categories, and 1-click 86 / out-of-stock toggle'}
            {activeTab === 'tables' && 'Visual dining table grid, seating capacity, active tabs, and occupancy management'}
            {activeTab === 'orders' && 'Live order pipeline for chef and kitchen staff (Received → Cooking → Ready → Served)'}
            {activeTab === 'tabs' && 'Manage running customer tabs, bill generation, and checkout settlement'}
            {activeTab === 'payments' && 'Complete payment history, payment method breakdown, and daily sales register'}
            {activeTab === 'dashboard' && `Logged in as ${user?.firstName || 'Staff'} • Table Management • Running Tabs & Bills • Kitchen Queue Pipeline`}
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
              Shift: 08:30 - 22:30 {checkedIn && `(In: ${checkInTime})`}
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
            onClick={() => {
              if (tables.length > 0) setSelectedTableNum(tables[0].tableNumber);
              setShowOrderModal(true);
            }}
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
            <Plus size={16} />
            New Kitchen Order / Tab
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
          { id: 'dashboard', label: 'Canteen Dashboard', icon: TrendingUp },
          { id: 'menu', label: 'Menu Availability', icon: UtensilsCrossed },
          { id: 'tables', label: 'Table Management', icon: Building2 },
          { id: 'orders', label: 'Kitchen Pipeline', icon: ChefHat },
          { id: 'tabs', label: 'Open Tabs & Bills', icon: Receipt },
          { id: 'payments', label: 'Canteen Payments', icon: DollarSign },
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

      {/* ======================================================== */}
      {/* TAB 1: CANTEEN DASHBOARD OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* 4 KPIs - Displayed only on Dashboard */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
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
                  ACTIVE ORDERS
                </span>
                <ChefHat size={18} color="var(--primary-navy)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.4rem' }}>
                {overview?.kpi?.activeOrdersCount || 12}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                Live in kitchen queue
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
                  PREPARING
                </span>
                <Clock size={18} color="var(--warning)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)', marginTop: '0.4rem' }}>
                {overview?.kpi?.preparingCount || 6}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Cooking in progress
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
                  READY TO SERVE
                </span>
                <CheckCircle size={18} color="var(--success)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.4rem' }}>
                {overview?.kpi?.readyCount || 3}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Ready for runner dispatch
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
                  OCCUPIED TABLES
                </span>
                <Users size={18} color="var(--primary-peach)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-peach)', marginTop: '0.4rem' }}>
                {overview?.kpi?.occupiedTablesCount || 8}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Seated dining guests
              </span>
            </div>
          </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Live Kitchen Queue */}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
              {(overview?.liveKitchenQueue || []).length > 0 ? (
                overview.liveKitchenQueue.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
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
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                          Table {order.tableNumber || 'Counter'}
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
                                ? 'var(--light-green)'
                                : order.status === 'preparing'
                                ? 'var(--light-warning)'
                                : 'var(--lavender)',
                            color:
                              order.status === 'ready'
                                ? 'var(--success)'
                                : order.status === 'preparing'
                                ? 'var(--warning)'
                                : 'var(--primary-navy)',
                          }}
                        >
                          {order.status?.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.35rem', fontWeight: 600 }}>
                        {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(' • ')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Guest: {order.customerName || 'Walk-in'} • Amount: ₹{order.total}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleOrderStatusUpdate(order._id, 'preparing')}
                          style={{
                            padding: '0.45rem 0.85rem',
                            backgroundColor: 'var(--primary-navy)',
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

          {/* Quick Table Status Grid */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Table Status Overview
              </h3>
              <button
                onClick={() => handleTabChange('tables')}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--primary-peach)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View Layout ➔
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
              {tables.map((t) => {
                const isAvail = t.status === 'AVAILABLE';
                const isOccupied = t.status === 'OCCUPIED';
                const isCleaning = t.status === 'CLEANING';

                return (
                  <div
                    key={t._id}
                    onClick={() => {
                      setSelectedTable(t);
                      setTableStatus(t.status);
                      setSeatedGuest(t.currentCustomer?.name || '');
                      setShowTableModal(true);
                    }}
                    style={{
                      padding: '0.75rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      backgroundColor: isAvail
                        ? 'var(--light-green)'
                        : isOccupied
                        ? 'var(--light-danger)'
                        : 'var(--light-warning)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: isAvail ? 'var(--success)' : isOccupied ? 'var(--danger)' : 'var(--warning)',
                      }}
                    >
                      {t.tableNumber}
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {t.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MENU AVAILABILITY (STAFF TOGGLE) */}
      {/* ======================================================== */}
      {activeTab === 'menu' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Canteen Menu Operational Availability
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Staff can toggle dishes Available or Out of Stock. (Base prices and item creation are managed by Manager).
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {menu.map((item) => (
              <div
                key={item._id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: item.isAvailable ? '#FFFFFF' : 'rgba(0,0,0,0.02)',
                  opacity: item.isAvailable ? 1 : 0.7,
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
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    ₹{item.price}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleAvailability(item._id, item.name)}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    backgroundColor: item.isAvailable ? 'var(--light-green)' : 'var(--light-danger)',
                    color: item.isAvailable ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {item.isAvailable ? 'AVAILABLE 🟢' : 'OUT OF STOCK 🔴'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TABLE MANAGEMENT & STATUS LIFECYCLE */}
      {/* ======================================================== */}
      {activeTab === 'tables' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Visual Dining & Bar Table Layout
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Lifecycle: 🟢 AVAILABLE ➔ 🔴 OCCUPIED ➔ 🟡 CLEANING ➔ 🟢 AVAILABLE
              </p>
            </div>

            {/* Status Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                Available
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
                Occupied
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                Cleaning
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {tables.map((t) => {
              const isAvail = t.status === 'AVAILABLE';
              const isOccupied = t.status === 'OCCUPIED';
              const isCleaning = t.status === 'CLEANING';

              return (
                <div
                  key={t._id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    backgroundColor: isAvail
                      ? '#FFFFFF'
                      : isOccupied
                      ? 'rgba(239, 68, 68, 0.04)'
                      : 'rgba(245, 158, 11, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        {t.tableNumber}
                      </span>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: isAvail
                            ? 'var(--light-green)'
                            : isOccupied
                            ? 'var(--light-danger)'
                            : 'var(--light-warning)',
                          color: isAvail ? 'var(--success)' : isOccupied ? 'var(--danger)' : 'var(--warning)',
                        }}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      Capacity: {t.capacity || 4} Seats • Section: {t.section || 'INDOOR_CAFE'}
                    </div>

                    {isOccupied && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          backgroundColor: 'var(--lavender)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                        }}
                      >
                        Guest: <strong>{t.currentCustomer?.name || 'Seated Guest'}</strong>
                      </div>
                    )}
                  </div>

                  {/* Operational Transition Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    {isAvail && (
                      <button
                        onClick={() => {
                          setSelectedTableNum(t.tableNumber);
                          setShowOrderModal(true);
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          backgroundColor: 'var(--primary-navy)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Seat & Open Tab
                      </button>
                    )}

                    {isOccupied && (
                      <button
                        onClick={() => handleQuickTableTransition(t, 'CLEANING')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          backgroundColor: 'var(--warning)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Move to Cleaning
                      </button>
                    )}

                    {isCleaning && (
                      <button
                        onClick={() => handleQuickTableTransition(t, 'AVAILABLE')}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          backgroundColor: 'var(--success)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Mark Clean & Ready
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedTable(t);
                        setTableStatus(t.status);
                        setSeatedGuest(t.currentCustomer?.name || '');
                        setShowTableModal(true);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: KITCHEN PIPELINE & DISPATCH */}
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

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'pending', label: 'New Tickets' },
                { id: 'preparing', label: 'Preparing' },
                { id: 'ready', label: 'Ready for Service' },
                { id: 'completed', label: 'Completed' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderStageFilter(f.id)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: orderStageFilter === f.id ? 'var(--primary-navy)' : '#FFFFFF',
                    color: orderStageFilter === f.id ? '#FFFFFF' : 'var(--text-muted)',
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

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {canteenOrders.length > 0 ? (
              canteenOrders.map((o) => (
                <div
                  key={o._id}
                  style={{
                    border: '1px solid var(--border)',
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
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        Table {o.tableNumber || 'Counter'}
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
                              ? 'var(--light-green)'
                              : o.status === 'preparing'
                              ? 'var(--light-warning)'
                              : o.status === 'completed'
                              ? 'var(--bg-main)'
                              : 'var(--lavender)',
                          color:
                            o.status === 'ready'
                              ? 'var(--success)'
                              : o.status === 'preparing'
                              ? 'var(--warning)'
                              : o.status === 'completed'
                              ? 'var(--text-muted)'
                              : 'var(--primary-navy)',
                        }}
                      >
                        {o.status?.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.5rem', fontWeight: 600 }}>
                      {o.items?.map((it) => `${it.quantity} × ${it.name}`).join(' • ')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Guest: {o.customerName || 'Guest'} • Total: ₹{o.total} • Tab Status: {o.tabStatus || 'OPEN'}
                    </div>
                  </div>

                  {/* Progression button */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {o.status === 'pending' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o._id, 'preparing')}
                        style={{
                          padding: '0.55rem 1.15rem',
                          backgroundColor: 'var(--primary-navy)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Accept & Start Cooking
                      </button>
                    )}
                    {o.status === 'preparing' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o._id, 'ready')}
                        style={{
                          padding: '0.55rem 1.15rem',
                          backgroundColor: 'var(--warning)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Dish Ready for Table
                      </button>
                    )}
                    {o.status === 'ready' && (
                      <button
                        onClick={() => handleOrderStatusUpdate(o._id, 'completed')}
                        style={{
                          padding: '0.55rem 1.15rem',
                          backgroundColor: 'var(--success)',
                          color: '#FFFFFF',
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
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Running Table Tabs & Bill Settlement
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Accumulate multiple rounds onto a table tab and settle before guest checkout
              </p>
            </div>
            <button
              onClick={fetchOpenTabs}
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
                    border: '1px solid var(--border)',
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
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        Table {tab.tableNumber || 'Counter'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--light-warning)',
                          color: 'var(--warning)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        OPEN TAB
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                      Guest: <strong>{tab.customerName || 'Walk-in'}</strong>
                    </div>

                    {/* Items Breakdown */}
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
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
                        borderTop: '1px dashed var(--border)',
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
                          color: 'var(--primary-navy)',
                          marginTop: '0.35rem',
                        }}
                      >
                        <span>Current Tab Total:</span>
                        <span>₹{tab.total}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                    <button
                      onClick={() => {
                        setSettleOrder(tab);
                        setShowSettleModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.65rem',
                        backgroundColor: 'var(--primary-peach)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Settle & Close Tab
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ colSpan: 3, textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                {loadingTabs ? 'Loading open tabs...' : 'No open table tabs currently running.'}
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
                Canteen Settlement Receipts Ledger
              </h3>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ledger of settled table tabs, cafe bills, and collected dining payments
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
                {canteenPayments.length > 0 ? (
                  canteenPayments.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {p.paymentId || `PAY-${p._id.slice(-6)}`}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {p.customerName || 'Dining Customer'}
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
                      {loadingPayments ? 'Loading canteen payments...' : 'No payments found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* NEW KITCHEN ORDER / TAB MODAL */}
      {/* ======================================================== */}
      {showOrderModal && (
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
              maxWidth: '620px',
              width: '100%',
              padding: '1.5rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                New Kitchen Order / Open Tab
              </h3>
              <button onClick={() => setShowOrderModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder}>
              {/* Table Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Table</label>
                  <select
                    value={selectedTableNum}
                    onChange={(e) => setSelectedTableNum(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                    }}
                  >
                    {tables.map((t) => (
                      <option key={t._id} value={t.tableNumber}>
                        {t.tableNumber} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Guest / Member Name</label>
                  <input
                    type="text"
                    placeholder="Guest Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
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
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-main)',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary-navy)', fontWeight: 600 }}>₹{item.price}</div>
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
                      <div
                        key={item.productId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.45rem 0.65rem',
                          backgroundColor: 'var(--lavender)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div>
                          <strong>{item.name}</strong> • ₹{item.price}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => updateDraftQty(item.productId, -1)}
                            style={{ width: '22px', height: '22px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateDraftQty(item.productId, 1)}
                            style={{ width: '22px', height: '22px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            +
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

              <button
                type="submit"
                disabled={orderDraftItems.length === 0 || submittingOrder}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary-peach)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: orderDraftItems.length === 0 || submittingOrder ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingOrder ? 'Sending to Kitchen...' : `Send Order to Kitchen (Table ${selectedTableNum})`}
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
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                Settle Tab & Print Invoice
              </h3>
              <button onClick={() => setShowSettleModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Table:</span>
                <strong>Table {settleOrder.tableNumber || 'Counter'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                <strong>{settleOrder.customerName || 'Guest'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span>₹{settleOrder.subtotal}</span>
              </div>
              {settleOrder.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--success)' }}>
                  <span>Member Cafe Discount:</span>
                  <span>-₹{settleOrder.discount}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.4rem',
                  marginTop: '0.4rem',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--primary-navy)',
                }}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                  {['UPI', 'CARD', 'CASH'].map((pm) => (
                    <button
                      type="button"
                      key={pm}
                      onClick={() => setSettlePaymentMethod(pm)}
                      style={{
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        border: settlePaymentMethod === pm ? '2px solid var(--primary-navy)' : '1px solid var(--border)',
                        backgroundColor: settlePaymentMethod === pm ? '#FFFFFF' : 'var(--bg-main)',
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

              <button
                type="submit"
                disabled={submittingSettle}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary-navy)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: submittingSettle ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingSettle ? 'Settling Tab...' : `Collect ₹${settleOrder.total} & Move Table to Cleaning`}
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
              Bill #B{settleReceipt.orderId?.slice(-6).toUpperCase()} • Table {settleReceipt.tableNumber} Tab Closed
            </p>

            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Table:</span>
                <strong>Table {settleReceipt.tableNumber}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Method:</span>
                <strong>{settleReceipt.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.4rem', marginTop: '0.4rem', fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                <span>Amount Paid:</span>
                <span>₹{settleReceipt.total}</span>
              </div>
            </div>

            <button
              onClick={() => setSettleReceipt(null)}
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
              Close & Ready Table
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TABLE STATUS EDIT MODAL */}
      {/* ======================================================== */}
      {showTableModal && selectedTable && (
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
              maxWidth: '420px',
              width: '100%',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                Manage {selectedTable.tableNumber}
              </h3>
              <button onClick={() => setShowTableModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTable}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Table Status</label>
                <select
                  value={tableStatus}
                  onChange={(e) => setTableStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    marginTop: '0.25rem',
                  }}
                >
                  <option value="AVAILABLE">AVAILABLE (🟢 Free for guests)</option>
                  <option value="OCCUPIED">OCCUPIED (🔴 Dining in progress)</option>
                  <option value="CLEANING">CLEANING (🟡 Sanitizing / Clearing)</option>
                </select>
              </div>

              {tableStatus === 'OCCUPIED' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Seated Customer Name</label>
                  <input
                    type="text"
                    placeholder="Guest Name"
                    value={seatedGuest}
                    onChange={(e) => setSeatedGuest(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
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
                Update Table State
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanteenStaffDashboard;
