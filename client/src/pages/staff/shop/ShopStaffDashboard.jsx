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
  SlidersHorizontal,
  RotateCcw,
  LayoutGrid,
  List,
  Eye,
  Pencil,
} from 'lucide-react';
import staffService from '../../../services/staffService';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../../components/ui/Loader';
import Alert from '../../../components/ui/Alert';
import FilterDropdown from '../../../components/ui/FilterDropdown';
import Pagination from '../../../components/common/Pagination';
import { usePagination } from '../../../hooks/usePagination';

export const ShopStaffDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [alert, setAlert] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', category: 'Rackets', sku: '', brand: '', description: '',
    price: '', stock: 0, lowStockThreshold: 5, image: '', isAvailable: true,
  });
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
  const [supplierName, setSupplierName] = useState('Yonex India Authorized');
  const [supplierInvoice, setSupplierInvoice] = useState('INV-2026-089');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiveReason, setReceiveReason] = useState('New shipment delivery received');
  const [submittingStock, setSubmittingStock] = useState(false);

  // Stock Adjustment Modal state (Damaged, Missing, Wrong count, Returned)
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustQtyChange, setAdjustQtyChange] = useState(-1);
  const [adjustType, setAdjustType] = useState('DAMAGED'); // DAMAGED, MISSING, WRONG_COUNT, RETURNED, MANUAL
  const [adjustReason, setAdjustReason] = useState('Damaged during storage/display');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Report Damage Modal state
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageProductId, setDamageProductId] = useState('');
  const [damageQty, setDamageQty] = useState(1);
  const [damageReason, setDamageReason] = useState('Broken string / damaged in storage');
  const [submittingDamage, setSubmittingDamage] = useState(false);

  // Controlled Return & Refund Modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnProductId, setReturnProductId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('Customer returned unused product in original package');
  const [returnRefundAmount, setReturnRefundAmount] = useState(0);
  const [submittingReturn, setSubmittingReturn] = useState(false);

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
  const [orderViewMode, setOrderViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState(null);

  // Payments state
  const [paymentsList, setPaymentsList] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Attendance state
  const [checkedIn, setCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('09:00 AM');
  const recentOrdersPage = usePagination(overview?.recentOrders || [], 10, activeTab);
  const inventoryHistoryPage = usePagination(inventoryHistory, 10, activeTab);
  const shopOrdersPage = usePagination(shopOrders, 10, `${activeTab}|${orderFilter}`);
  const paymentsPage = usePagination(paymentsList, 10, activeTab);

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
          setAdjustProductId(resProducts.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Shop staff error:', err);
      setAlert({ type: 'danger', message: 'Failed to load shop inventory data.' });
    } finally {
      setLoading(false);
    }
  };

  const openProductEditor = (product = null) => {
    setEditingProduct(product);
    setProductForm(product ? {
      name: product.name || '',
      category: product.category || 'General',
      sku: product.sku || '',
      brand: product.brand || '',
      description: product.description || '',
      price: product.price ?? '',
      stock: product.stock ?? 0,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      image: product.image || '',
      isAvailable: product.isAvailable !== false,
    } : {
      name: '', category: 'Rackets', sku: '', brand: '', description: '',
      price: '', stock: 0, lowStockThreshold: 5, image: '', isAvailable: true,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setSavingProduct(true);
    try {
      const save = editingProduct
        ? staffService.updateShopProduct(editingProduct._id, productForm)
        : staffService.createShopProduct(productForm);
      const response = await save;
      setAlert({ type: 'success', message: response.message || 'Product saved.' });
      setShowProductModal(false);
      await fetchShopData();
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Could not save the product.' });
    } finally {
      setSavingProduct(false);
    }
  };

  const handleProductAvailability = async (product) => {
    try {
      const response = await staffService.updateShopProduct(product._id, { isAvailable: !product.isAvailable });
      setProducts((current) => current.map((item) => item._id === product._id ? response.data : item));
      setAlert({ type: 'success', message: response.message || 'Product availability updated.' });
    } catch (error) {
      setAlert({ type: 'danger', message: error.response?.data?.message || 'Could not update product availability.' });
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

  // Stock In submission (with Supplier & Invoice)
  const handleReceiveStock = async (e) => {
    e.preventDefault();
    setSubmittingStock(true);
    try {
      const res = await staffService.receiveStock({
        productId: selectedProductId,
        quantity: receivedQty,
        supplier: supplierName,
        invoiceNumber: supplierInvoice,
        receivedDate,
        notes: receiveReason,
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

  // Stock Adjustment submission
  const handleAdjustStock = async (e) => {
    e.preventDefault();
    setSubmittingAdjust(true);
    try {
      const res = await staffService.adjustStock({
        productId: adjustProductId,
        quantityChange: adjustQtyChange,
        adjustmentType: adjustType,
        reason: adjustReason,
      });
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Stock adjusted successfully.' });
        setShowAdjustModal(false);
        fetchShopData();
        if (activeTab === 'inventory') fetchInventoryHistory();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to adjust stock' });
    } finally {
      setSubmittingAdjust(false);
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

  // Process Return & Refund
  const handleReturnOrder = async (e) => {
    e.preventDefault();
    if (!returnOrderId || !returnProductId) return;

    setSubmittingReturn(true);
    try {
      const res = await staffService.processOrderReturn(returnOrderId, {
        productId: returnProductId,
        quantity: returnQty,
        returnReason,
        refundAmount: returnRefundAmount,
      });
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Return and restock processed successfully.' });
        setShowReturnModal(false);
        fetchOrders(orderFilter);
        fetchShopData();
        if (activeTab === 'inventory') fetchInventoryHistory();
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to process return' });
    } finally {
      setSubmittingReturn(false);
    }
  };


  // Cart operations
  const addToCart = (product) => {
    if (product.isAvailable === false || product.stock < 1) {
      setAlert({ type: 'warning', message: 'This product is not currently available for sale.' });
      return;
    }
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
          ...(res.data.receipt || {}),
          orderId: res.data.order?._id || res.data._id,
          customerName: res.data.receipt?.customerName || payload.customerName,
          items: res.data.receipt?.items || [...cart],
          subtotal: res.data.receipt?.subtotal ?? cartSubtotal,
          discount: res.data.receipt?.discountAmount ?? posDiscountAmount,
          total: res.data.receipt?.total ?? posFinalTotal,
          paymentMethod: res.data.receipt?.paymentMethod || posPaymentMethod,
          date: res.data.receipt?.date || new Date().toLocaleString(),
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
    <div className="shop-staff-dashboard" style={{ width: '100%', minWidth: 0 }}>
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
          {activeTab === 'products' && <ShoppingBag size={28} color="var(--primary-navy)" />}
          {activeTab === 'inventory' && <Package size={28} color="var(--primary-navy)" />}
          {activeTab === 'sales' && <ShoppingCart size={28} color="var(--primary-navy)" />}
          {activeTab === 'orders' && <Truck size={28} color="var(--primary-navy)" />}
          {activeTab === 'payments' && <Receipt size={28} color="var(--primary-navy)" />}
          {activeTab === 'dashboard' && <TrendingUp size={28} color="var(--primary-navy)" />}
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              fontFamily: 'var(--font-family-display)',
              margin: 0,
            }}
          >
            {activeTab === 'products' && 'Product Catalog'}
            {activeTab === 'inventory' && 'Inventory & Stock'}
            {activeTab === 'sales' && 'Counter POS Sales'}
            {activeTab === 'orders' && 'Online Orders'}
            {activeTab === 'payments' && 'Shop Payments'}
            {activeTab === 'dashboard' && 'Sports Shop Dashboard'}
          </h1>
        </div>
      </div>

      {alert && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: SHOP DASHBOARD OVERVIEW */}
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
                    recentOrdersPage.paginatedItems.map((o) => (
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
                                backgroundColor: 'var(--primary)',
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
              <div style={{ padding: '0 1rem' }}><Pagination {...recentOrdersPage} onPageChange={recentOrdersPage.setCurrentPage} /></div>
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
          {/* Product management access */}
          <div
            style={{
              backgroundColor: 'rgba(53, 73, 98, 0.06)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={18} color="var(--primary-navy)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
                Manage the sports shop catalog, availability, prices, and stock details from one place.
              </span>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openProductEditor()}>
              <Plus size={15} /> Add product
            </button>
          </div>

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

            <FilterDropdown label="Category" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} options={[
              { value: 'ALL', label: 'All categories' },
              ...['Rackets', 'Balls', 'Shoes', 'Apparel', 'Accessories', 'Sports Equipment'].map((category) => ({ value: category, label: category })),
            ]} />
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
                        {p.isAvailable === false ? 'Unavailable' : `${p.stock} in stock`}
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

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={p.isAvailable === false || p.stock < 1}
                      onClick={() => {
                        addToCart(p);
                        handleTabChange('sales');
                      }}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: 'var(--primary)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: p.isAvailable === false || p.stock < 1 ? 'not-allowed' : 'pointer',
                        opacity: p.isAvailable === false || p.stock < 1 ? 0.55 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <ShoppingCart size={14} /> Sell POS
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openProductEditor(p)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => handleProductAvailability(p)}>
                      {p.isAvailable === false ? 'Enable' : 'Disable'}
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
                  Shared Real-Time Inventory Control
                </h3>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Online member purchases and counter POS sales automatically synchronize with and deduct from the exact same physical inventory.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
                onClick={() => {
                  setAdjustProductId(products[0]?._id || '');
                  setShowAdjustModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <SlidersHorizontal size={15} /> Stock Adjustment
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
                    inventoryHistoryPage.paginatedItems.map((h) => (
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
              <div style={{ padding: '0 1rem' }}><Pagination {...inventoryHistoryPage} onPageChange={inventoryHistoryPage.setCurrentPage} /></div>
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
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: !isMemberCustomer ? '2px solid #354962' : '1px solid #CBD5E1',
                    backgroundColor: !isMemberCustomer ? '#354962' : '#F1F4F9',
                    color: !isMemberCustomer ? '#FFFFFF' : '#1E293B',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Walk-in Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsMemberCustomer(true)}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isMemberCustomer ? '2px solid #354962' : '1px solid #CBD5E1',
                    backgroundColor: isMemberCustomer ? '#354962' : '#F1F4F9',
                    color: isMemberCustomer ? '#FFFFFF' : '#1E293B',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {['UPI', 'CARD', 'CASH'].map((pm) => (
                  <button
                    type="button"
                    key={pm}
                    onClick={() => setPosPaymentMethod(pm)}
                    style={{
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: posPaymentMethod === pm ? '2px solid #354962' : '1px solid #CBD5E1',
                      backgroundColor: posPaymentMethod === pm ? '#354962' : '#F1F4F9',
                      color: posPaymentMethod === pm ? '#FFFFFF' : '#1E293B',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
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
                padding: '0.85rem',
                backgroundColor: cart.length === 0 ? '#94A3B8' : '#D98E68',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: cart.length === 0 || submittingPos ? 'not-allowed' : 'pointer',
                boxShadow: cart.length > 0 ? '0 4px 12px rgba(217, 142, 104, 0.4)' : 'none',
              }}
            >
              {submittingPos ? 'Processing POS...' : `Collect ₹${posFinalTotal} & Generate Invoice`}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ONLINE ORDERS LIFECYCLE & KANBAN BOARD */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Orders Top Bar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              padding: '1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Truck size={20} color="var(--primary-navy)" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-family-display)' }}>
                  Online Shop Orders Pipeline
                </h3>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Operational Workflow: NEW ➔ PROCESSING ➔ READY FOR PICKUP ➔ COMPLETED / DELIVERED
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* View Toggle */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-main)',
                  padding: '3px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOrderViewMode('kanban')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: orderViewMode === 'kanban' ? 'var(--primary)' : 'transparent',
                    color: orderViewMode === 'kanban' ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <LayoutGrid size={14} /> Kanban Board
                </button>
                <button
                  type="button"
                  onClick={() => setOrderViewMode('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: orderViewMode === 'table' ? 'var(--primary)' : 'transparent',
                    color: orderViewMode === 'table' ? '#FFFFFF' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <List size={14} /> Table View
                </button>
              </div>

              {/* Status Filter for Table View */}
              {orderViewMode === 'table' && (
                <FilterDropdown label="Order status" value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)} options={[
                  { value: 'ALL', label: 'All orders' },
                  { value: 'pending', label: 'New' },
                  { value: 'preparing', label: 'Processing' },
                  { value: 'ready', label: 'Ready' },
                  { value: 'completed', label: 'Completed' },
                ]} />
              )}

              <button
                onClick={() => fetchOrders(orderFilter)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: KANBAN BOARD */}
          {orderViewMode === 'kanban' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                alignItems: 'start',
              }}
            >
              {/* Column 1: NEW ORDERS */}
              {(() => {
                const colOrders = shopOrders.filter((o) => o.status === 'pending');
                return (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                      padding: '1rem',
                      minHeight: '400px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.85rem',
                        paddingBottom: '0.65rem',
                        borderBottom: '2px solid rgba(53, 73, 98, 0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={15} color="var(--primary-navy)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                          NEW ORDERS
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--lavender)',
                          color: 'var(--primary-navy)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {colOrders.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {colOrders.map((o) => (
                        <div
                          key={o._id}
                          style={{
                            backgroundColor: 'var(--bg-main)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            transition: 'var(--transition)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedOrderForDrawer(o)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                              #{o._id.slice(-4).toUpperCase()}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--lavender)',
                                color: 'var(--primary-navy)',
                              }}
                            >
                              {o.fulfillment === 'counter' ? 'COUNTER POS' : 'CLUB PICKUP'}
                            </span>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {o.member ? `${o.member.firstName} ${o.member.lastName || ''}` : o.customerName || 'Online Member'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {o.member ? 'Club Member' : 'Walk-in Guest'} • {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border)', paddingTop: '0.4rem' }}>
                            {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ') || 'Sports Items'}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                              ₹{o.total}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderStatusUpdate(o._id, 'preparing');
                              }}
                              style={{
                                backgroundColor: 'var(--primary)',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '0.4rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Accept & Process ➔
                            </button>
                          </div>
                        </div>
                      ))}
                      {colOrders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No new pending orders
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Column 2: PROCESSING / PREPARING */}
              {(() => {
                const colOrders = shopOrders.filter((o) => o.status === 'preparing' || o.status === 'confirmed');
                return (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                      padding: '1rem',
                      minHeight: '400px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.85rem',
                        paddingBottom: '0.65rem',
                        borderBottom: '2px solid rgba(217, 142, 104, 0.4)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Package size={15} color="var(--primary-peach)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-peach)' }}>
                          PROCESSING
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--light-peach)',
                          color: 'var(--primary-peach)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {colOrders.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {colOrders.map((o) => (
                        <div
                          key={o._id}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid rgba(217, 142, 104, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedOrderForDrawer(o)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                              #{o._id.slice(-4).toUpperCase()}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--light-peach)',
                                color: 'var(--primary-peach)',
                              }}
                            >
                              PACKING
                            </span>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {o.member ? `${o.member.firstName} ${o.member.lastName || ''}` : o.customerName || 'Online Member'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {o.customerPhone || o.member?.phone || 'No phone'}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border)', paddingTop: '0.4rem' }}>
                            {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                              ₹{o.total}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderStatusUpdate(o._id, 'ready');
                              }}
                              style={{
                                backgroundColor: 'var(--warning)',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '0.4rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Mark Ready ➔
                            </button>
                          </div>
                        </div>
                      ))}
                      {colOrders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No orders in processing
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Column 3: READY FOR PICKUP */}
              {(() => {
                const colOrders = shopOrders.filter((o) => o.status === 'ready');
                return (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                      padding: '1rem',
                      minHeight: '400px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.85rem',
                        paddingBottom: '0.65rem',
                        borderBottom: '2px solid rgba(234, 179, 8, 0.4)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle size={15} color="var(--warning)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--warning)' }}>
                          READY FOR PICKUP
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--light-warning)',
                          color: 'var(--warning)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {colOrders.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {colOrders.map((o) => (
                        <div
                          key={o._id}
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid rgba(234, 179, 8, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedOrderForDrawer(o)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                              #{o._id.slice(-4).toUpperCase()}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--light-warning)',
                                color: 'var(--warning)',
                              }}
                            >
                              AT DESK
                            </span>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {o.member ? `${o.member.firstName} ${o.member.lastName || ''}` : o.customerName || 'Online Member'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {o.customerPhone || o.member?.phone || 'No phone'}
                            </div>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border)', paddingTop: '0.4rem' }}>
                            {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                              ₹{o.total}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderStatusUpdate(o._id, 'completed');
                              }}
                              style={{
                                backgroundColor: 'var(--success)',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '0.4rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Handover / Collect ✓
                            </button>
                          </div>
                        </div>
                      ))}
                      {colOrders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No orders awaiting pickup
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Column 4: COMPLETED / DELIVERED */}
              {(() => {
                const colOrders = shopOrders.filter((o) => o.status === 'completed');
                return (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                      padding: '1rem',
                      minHeight: '400px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.85rem',
                        paddingBottom: '0.65rem',
                        borderBottom: '2px solid rgba(168, 192, 172, 0.6)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Check size={15} color="var(--success)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>
                          COMPLETED
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--light-green)',
                          color: 'var(--success)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {colOrders.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {colOrders.slice(0, 10).map((o) => (
                        <div
                          key={o._id}
                          style={{
                            backgroundColor: 'var(--bg-main)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.45rem',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedOrderForDrawer(o)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                              #{o._id.slice(-4).toUpperCase()}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--light-green)',
                                color: 'var(--success)',
                              }}
                            >
                              COMPLETED
                            </span>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {o.member ? `${o.member.firstName} ${o.member.lastName || ''}` : o.customerName || 'Online Member'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(o.createdAt).toLocaleDateString()} • Paid
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                              ₹{o.total}
                            </span>
                            {!o.isReturned ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReturnOrderId(o._id);
                                  if (o.items && o.items.length > 0) {
                                    setReturnProductId(o.items[0].product?._id || o.items[0].product);
                                    setReturnQty(o.items[0].quantity || 1);
                                    setReturnRefundAmount(o.total || 0);
                                  }
                                  setShowReturnModal(true);
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  color: 'var(--danger)',
                                  border: '1px solid var(--border)',
                                  padding: '3px 7px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Return
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger)' }}>
                                RETURNED
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {colOrders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No completed orders yet
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW MODE 2: TABLE VIEW */}
          {orderViewMode === 'table' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
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
                      shopOrdersPage.paginatedItems.map((o) => (
                        <tr
                          key={o._id}
                          style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                          onClick={() => setSelectedOrderForDrawer(o)}
                        >
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
                            {o.items?.length
                              ? o.items.map((it) => `${it.quantity} × ${it.name}`).join(', ')
                              : 'Cart details unavailable'}
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
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            {o.status === 'pending' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(o._id, 'preparing')}
                                style={{
                                  backgroundColor: 'var(--primary)',
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
                            {o.status === 'completed' && !o.isReturned && (
                              <button
                                onClick={() => {
                                  setReturnOrderId(o._id);
                                  if (o.items && o.items.length > 0) {
                                    setReturnProductId(o.items[0].product?._id || o.items[0].product);
                                    setReturnQty(o.items[0].quantity || 1);
                                    setReturnRefundAmount(o.total || 0);
                                  }
                                  setShowReturnModal(true);
                                }}
                                style={{
                                  backgroundColor: 'transparent',
                                  color: 'var(--danger)',
                                  border: '1px solid var(--border)',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <RotateCcw size={12} /> Return
                              </button>
                            )}
                            {o.isReturned && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 700 }}>
                                RETURNED
                              </span>
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
                <div style={{ padding: '0 1rem' }}><Pagination {...shopOrdersPage} onPageChange={shopOrdersPage.setCurrentPage} /></div>
              </div>
            </div>
          )}

          {/* ORDER DETAILS SLIDE-OVER DRAWER */}
          {selectedOrderForDrawer && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(23, 38, 59, 0.5)',
                display: 'flex',
                justifyContent: 'flex-end',
                zIndex: 1000,
              }}
              onClick={() => setSelectedOrderForDrawer(null)}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  width: '100%',
                  maxWidth: '460px',
                  height: '100%',
                  padding: '1.75rem',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-peach)', textTransform: 'uppercase' }}>
                        Order Details
                      </span>
                      <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        #{selectedOrderForDrawer._id.slice(-6).toUpperCase()}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedOrderForDrawer(null)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Customer Information */}
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      CUSTOMER
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {selectedOrderForDrawer.member
                        ? `${selectedOrderForDrawer.member.firstName} ${selectedOrderForDrawer.member.lastName || ''}`
                        : selectedOrderForDrawer.customerName || 'Online Member'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Phone: {selectedOrderForDrawer.customerPhone || selectedOrderForDrawer.member?.phone || 'N/A'}
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--lavender)',
                          color: 'var(--primary-navy)',
                        }}
                      >
                        {selectedOrderForDrawer.member ? 'Club Member (Discount Applied)' : 'Walk-in Guest'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--light-peach)',
                          color: 'var(--primary-peach)',
                        }}
                      >
                        {selectedOrderForDrawer.fulfillment === 'counter' ? 'Counter POS' : 'Club Pickup'}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                      ORDER ITEMS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {selectedOrderForDrawer.items?.map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.65rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                              {it.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ₹{it.price} × {it.quantity}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                            ₹{it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                      <span>₹{selectedOrderForDrawer.subtotal ?? selectedOrderForDrawer.total}</span>
                    </div>
                    {selectedOrderForDrawer.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--success)' }}>
                        <span>Discount</span>
                        <span>−₹{selectedOrderForDrawer.discount}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Status</span>
                      <span style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-navy)' }}>
                        {selectedOrderForDrawer.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Payment</span>
                      <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                        {selectedOrderForDrawer.paymentStatus?.toUpperCase() || 'PAID'}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: 'var(--primary-navy)',
                        borderTop: '1px solid var(--border)',
                        paddingTop: '0.5rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <span>Total Amount</span>
                      <span>₹{selectedOrderForDrawer.total}</span>
                    </div>
                  </div>
                </div>

                {/* Stage Progression Action inside Drawer */}
                <div>
                  {selectedOrderForDrawer.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleOrderStatusUpdate(selectedOrderForDrawer._id, 'preparing');
                        setSelectedOrderForDrawer(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        backgroundColor: 'var(--primary)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Accept & Start Processing ➔
                    </button>
                  )}
                  {selectedOrderForDrawer.status === 'preparing' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleOrderStatusUpdate(selectedOrderForDrawer._id, 'ready');
                        setSelectedOrderForDrawer(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        backgroundColor: 'var(--warning)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Mark Ready for Pickup ➔
                    </button>
                  )}
                  {selectedOrderForDrawer.status === 'ready' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleOrderStatusUpdate(selectedOrderForDrawer._id, 'completed');
                        setSelectedOrderForDrawer(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        backgroundColor: 'var(--success)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Complete Handover / Shipped ✓
                    </button>
                  )}
                  {selectedOrderForDrawer.status === 'completed' && !selectedOrderForDrawer.isReturned && (
                    <button
                      type="button"
                      onClick={() => {
                        setReturnOrderId(selectedOrderForDrawer._id);
                        if (selectedOrderForDrawer.items && selectedOrderForDrawer.items.length > 0) {
                          setReturnProductId(selectedOrderForDrawer.items[0].product?._id || selectedOrderForDrawer.items[0].product);
                          setReturnQty(selectedOrderForDrawer.items[0].quantity || 1);
                          setReturnRefundAmount(selectedOrderForDrawer.total || 0);
                        }
                        setSelectedOrderForDrawer(null);
                        setShowReturnModal(true);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        backgroundColor: 'var(--danger)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Process Return & Refund
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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
                  paymentsPage.paginatedItems.map((p) => (
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
            <div style={{ padding: '0 1rem' }}><Pagination {...paymentsPage} onPageChange={paymentsPage.setCurrentPage} /></div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRODUCT CREATE / EDIT MODAL */}
      {/* ======================================================== */}
      {showProductModal && (
        <div className="shop-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowProductModal(false);
        }}>
          <section className="shop-product-modal" role="dialog" aria-modal="true" aria-labelledby="shop-product-modal-title">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 id="shop-product-modal-title" style={{ margin: 0, fontSize: '1.3rem' }}>
                  {editingProduct ? 'Edit sports product' : 'Add sports product'}
                </h2>
                <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Product updates are shared with the online shop and POS.
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" aria-label="Close product form" onClick={() => setShowProductModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="shop-product-form">
              <label>Product name<input required maxLength={120} value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></label>
              <label>Category<input required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} /></label>
              <label>SKU<input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} /></label>
              <label>Brand<input value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} /></label>
              <label>Price (₹)<input required type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} /></label>
              <label>Stock quantity<input required type="number" min="0" step="1" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} /></label>
              <label>Low stock alert at<input required type="number" min="0" step="1" value={productForm.lowStockThreshold} onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })} /></label>
              <label>Image URL<input type="url" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} /></label>
              <label className="shop-product-form-wide">Description<textarea rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></label>
              <label className="shop-product-form-wide shop-product-availability">
                <input type="checkbox" checked={productForm.isAvailable} onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })} />
                Available for sale
              </label>
              <div className="shop-product-form-wide" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingProduct}>
                  {savingProduct ? 'Saving…' : editingProduct ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </section>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
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
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Received Date</label>
                  <input
                    type="date"
                    required
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Supplier / Vendor</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yonex India"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Invoice / PO #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-2026-089"
                    value={supplierInvoice}
                    onChange={(e) => setSupplierInvoice(e.target.value)}
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
      {/* STOCK ADJUSTMENT MODAL (Damaged, Missing, Wrong count, Returned) */}
      {/* ======================================================== */}
      {showAdjustModal && (
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
                Stock Adjustment & Reconciliation
              </h3>
              <button onClick={() => setShowAdjustModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustStock}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Product</label>
                <select
                  value={adjustProductId}
                  onChange={(e) => setAdjustProductId(e.target.value)}
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
                      {p.name} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Adjustment Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                    }}
                  >
                    <option value="DAMAGED">Damaged Product (-)</option>
                    <option value="MISSING">Missing / Lost (-)</option>
                    <option value="WRONG_COUNT">Wrong Physical Count (+/-)</option>
                    <option value="RETURNED">Customer Return (+)</option>
                    <option value="MANUAL">Manual Correction</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Quantity Change ({adjustQtyChange >= 0 ? `+${adjustQtyChange}` : adjustQtyChange})
                  </label>
                  <input
                    type="number"
                    required
                    value={adjustQtyChange}
                    onChange={(e) => setAdjustQtyChange(Number(e.target.value))}
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

              {/* Dynamic preview */}
              {(() => {
                const p = products.find((prod) => prod._id === adjustProductId);
                const current = p ? p.stock : 0;
                const nextStock = Math.max(0, current + Number(adjustQtyChange));
                return (
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Stock Change Preview:</span>
                    <span><strong>{current}</strong> units ➔ <strong style={{ color: adjustQtyChange >= 0 ? 'var(--success)' : 'var(--danger)' }}>{nextStock}</strong> units</span>
                  </div>
                );
              })()}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Adjustment Reason & Discrepancy Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit discrepancy / string snapped in rack"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
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
                disabled={submittingAdjust}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  cursor: submittingAdjust ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingAdjust ? 'Adjusting Stock...' : 'Save Stock Adjustment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RETURN & REFUND MODAL */}
      {/* ======================================================== */}
      {showReturnModal && (
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
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--danger)' }}>
                  Process Order Return & Restock
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Order #{returnOrderId ? returnOrderId.slice(-6).toUpperCase() : ''}
                </span>
              </div>
              <button onClick={() => setShowReturnModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReturnOrder}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Product to Return</label>
                <select
                  value={returnProductId}
                  onChange={(e) => setReturnProductId(e.target.value)}
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
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Return Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={returnQty}
                    onChange={(e) => setReturnQty(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Refund Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={returnRefundAmount}
                    onChange={(e) => setReturnRefundAmount(Number(e.target.value))}
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

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Return Reason & Inspection Notes</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unused item returned within policy / Wrong size"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
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
                disabled={submittingReturn}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--danger)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  cursor: submittingReturn ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingReturn ? 'Processing Return...' : `Confirm Return & Restock (+${returnQty} units)`}
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
                backgroundColor: 'var(--primary)',
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
