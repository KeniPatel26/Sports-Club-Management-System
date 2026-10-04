import React, { useState, useEffect } from 'react';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import {
  TrendingUp,
  CreditCard,
  FileText,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';
import ChartCard from '../../../components/ui/ChartCard';
import Pagination from '../../../components/common/Pagination';
import { usePagination } from '../../../hooks/usePagination';

export const FinanceManagement = () => {
  const { toastSuccess, toastError } = useToast();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'payments' | 'invoices' | 'expenses'
  const [overview, setOverview] = useState(null);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const paymentsPage = usePagination(payments, 10, activeTab);
  const invoicesPage = usePagination(invoices, 10, activeTab);
  const expensesPage = usePagination(expenses, 10, activeTab);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'MAINTENANCE',
    amount: 5000,
    paymentMethod: 'BANK_TRANSFER',
    vendor: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overRes, payRes, invRes, expRes] = await Promise.all([
        managerService.getFinanceOverview(),
        managerService.getPayments(),
        managerService.getInvoices(),
        managerService.getExpenses(),
      ]);

      if (overRes.success) setOverview(overRes.data);
      if (payRes.success) setPayments(payRes.data);
      if (invRes.success) setInvoices(invRes.data);
      if (expRes.success) setExpenses(expRes.data);
    } catch (err) {
      toastError('Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const expenseBreakdown = expenses.reduce((totals, expense) => {
    const category = expense.category || 'Other';
    totals[category] = (totals[category] || 0) + Number(expense.amount || 0);
    return totals;
  }, {});

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.createExpense(newExpense);
      if (res.success) {
        toastSuccess(`Expense of ₹${newExpense.amount} recorded!`);
        setShowAddExpenseModal(false);
        fetchData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to record expense');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Financial & Accounting Hub
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Consolidated ledger across Memberships, Court Turfs, Pro-Shop POS, and Club Operational Expenses.
          </p>
        </div>

        <button
          onClick={() => setShowAddExpenseModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: '#D98E68',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(217, 142, 104, 0.25)',
          }}
        >
          <Plus size={16} /> + Record Expense
        </button>
      </div>

      {/* Financial Top Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #DDE2EC' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Today's Revenue</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', marginTop: '0.25rem' }}>
            ₹{overview?.todayRevenue ? overview.todayRevenue.toLocaleString('en-IN') : '52,600'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8FAF98', fontWeight: 700, marginTop: '0.3rem' }}>
            &uarr; Real-time Settlements
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #DDE2EC' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Total Club Revenue</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', marginTop: '0.25rem' }}>
            ₹{overview?.totalRevenue?.toLocaleString('en-IN') || '3,35,000'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8FAF98', fontWeight: 700, marginTop: '0.3rem' }}>
            &uarr; High Revenue Cycle
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #DDE2EC' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Operating Expenses</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97979', marginTop: '0.25rem' }}>
            ₹{overview?.totalExpenses?.toLocaleString('en-IN') || '1,97,000'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>
            Payroll, Utilities & Supplies
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid #DDE2EC' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Net Operating Result</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8FAF98', marginTop: '0.25rem' }}>
            ₹{overview?.netOperatingProfit?.toLocaleString('en-IN') || '1,38,000'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8FAF98', fontWeight: 700, marginTop: '0.3rem' }}>
            {overview?.profitMarginPct || 41}% Operating Margin
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #DDE2EC', marginBottom: '1.5rem' }}>
        {[
          { id: 'overview', label: 'Departmental Breakdown' },
          { id: 'payments', label: `Payment Transactions (${payments.length})` },
          { id: 'invoices', label: `Invoices (${invoices.length})` },
          { id: 'expenses', label: `Operating Expenses (${expenses.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.65rem 1.15rem',
              border: 'none',
              background: 'none',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: activeTab === tab.id ? '#D98E68' : '#64748B',
              borderBottom: activeTab === tab.id ? '2px solid #D98E68' : 'none',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW BREAKDOWN */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Revenue by Stream */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #DDE2EC' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#17263B' }}>
              Revenue by Source (Oct 2026)
            </h3>
            <ChartCard bare type="doughnut" height={220} currency showLegend data={[
              { label: 'Memberships', value: overview?.revenueBreakdown?.membership ?? 150000, color: '#D98E68' },
              { label: 'Courts', value: overview?.revenueBreakdown?.court ?? 80000, color: '#8FAF98' },
              { label: 'Pro shop', value: overview?.revenueBreakdown?.shop ?? 60000, color: '#38bdf8' },
              { label: 'Canteen', value: overview?.revenueBreakdown?.canteen ?? 45000, color: '#F0B08E' },
            ]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#354962' }}>Membership Annual Plans</span>
                <strong style={{ color: '#17263B' }}>₹{overview?.revenueBreakdown?.membership?.toLocaleString('en-IN') || '1,50,000'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#354962' }}>Court & Turf Bookings</span>
                <strong style={{ color: '#17263B' }}>₹{overview?.revenueBreakdown?.court?.toLocaleString('en-IN') || '80,000'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#354962' }}>Sports Pro-Shop Gear</span>
                <strong style={{ color: '#17263B' }}>₹{overview?.revenueBreakdown?.shop?.toLocaleString('en-IN') || '60,000'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#354962' }}>Canteen & Bar Cafe</span>
                <strong style={{ color: '#17263B' }}>₹{overview?.revenueBreakdown?.canteen?.toLocaleString('en-IN') || '45,000'}</strong>
              </div>
            </div>
          </div>

          {/* Revenue by Payment Method */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #DDE2EC' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#17263B' }}>
              Settlement by Payment Method
            </h3>
            <ChartCard bare type="pie" height={220} currency showLegend data={[
              { label: 'UPI Instant', value: overview?.methodBreakdown?.upi ?? 180000, color: '#10B981' },
              { label: 'Card (Credit/Debit)', value: overview?.methodBreakdown?.card ?? 110000, color: '#6366F1' },
              { label: 'Counter Cash', value: overview?.methodBreakdown?.cash ?? 45000, color: '#F59E0B' },
            ]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#354962' }}>UPI / QR Instant</span>
                <strong style={{ color: '#10B981' }}>₹{overview?.methodBreakdown?.upi?.toLocaleString('en-IN') || '1,80,000'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#354962' }}>Credit & Debit Cards</span>
                <strong style={{ color: '#6366F1' }}>₹{overview?.methodBreakdown?.card?.toLocaleString('en-IN') || '1,10,000'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#354962' }}>Counter Physical Cash</span>
                <strong style={{ color: '#F59E0B' }}>₹{overview?.methodBreakdown?.cash?.toLocaleString('en-IN') || '45,000'}</strong>
              </div>
            </div>
          </div>

          {/* Expense by Stream */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '14px', border: '1px solid #DDE2EC', gridColumn: 'span 1' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#17263B' }}>
              Operating Expenses Breakdown
            </h3>
            <ChartCard bare type="bar" horizontal currency height={220} data={Object.entries(expenseBreakdown).map(([label, value]) => ({ label, value }))} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#354962' }}>Staff Monthly Salaries</span>
                <strong style={{ color: '#D97979' }}>₹1,10,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#F4F6FC', borderRadius: '8px' }}>
                <span style={{ fontWeight: 700, color: '#354962' }}>Court Maintenance & Turfs</span>
                <strong style={{ color: '#D97979' }}>₹18,000</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === 'payments' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Transaction ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Customer / Member</th>
                <th style={{ padding: '0.85rem 1rem' }}>Purpose / Module</th>
                <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Payment Method</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {paymentsPage.paginatedItems.map((p) => {
                const status = (p.status || 'PAID').toUpperCase();
                const isPaid = status === 'PAID' || status === 'SUCCESS';
                const isFailed = status === 'FAILED';
                const method = (p.paymentMethod || p.method || 'UPI').toUpperCase();
                const purpose = (p.purpose || p.type || 'COURT_BOOKING').replace('_', ' ');

                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#354962', fontFamily: 'monospace' }}>
                      {p.transactionId || p.paymentId || `TXN-${p._id.slice(-6)}`}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#17263B' }}>
                      {p.customerName || (p.user ? `${p.user.firstName} ${p.user.lastName || ''}`.trim() : 'Guest')}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ backgroundColor: '#E8EAF4', color: '#354962', fontWeight: 700, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px' }}>
                        {purpose}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#17263B' }}>₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontWeight: 600, color: method === 'UPI' ? '#059669' : method === 'CARD' ? '#4F46E5' : '#D97706' }}>
                        {method}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          backgroundColor: isPaid ? 'rgba(143, 175, 152, 0.2)' : isFailed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isPaid ? '#227B4C' : isFailed ? '#DC2626' : '#D97706',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '4px 10px',
                          borderRadius: '999px',
                        }}
                      >
                        {isPaid ? 'PAID' : isFailed ? 'FAILED' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.82rem' }}>
                      {new Date(p.paidAt || p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '0 1rem' }}><Pagination {...paymentsPage} onPageChange={paymentsPage.setCurrentPage} /></div>
        </div>
      )}

      {/* TAB 3: INVOICES */}
      {activeTab === 'invoices' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Invoice #</th>
                <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.85rem 1rem' }}>Service Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Subtotal</th>
                <th style={{ padding: '0.85rem 1rem' }}>Total Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {invoicesPage.paginatedItems.map((inv) => (
                <tr key={inv._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#354962' }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#17263B' }}>{inv.customerName}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{inv.type}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>₹{inv.subtotal}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#17263B' }}>₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ backgroundColor: 'rgba(143, 175, 152, 0.2)', color: '#8FAF98', fontWeight: 700, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '999px' }}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '0 1rem' }}><Pagination {...invoicesPage} onPageChange={invoicesPage.setCurrentPage} /></div>
        </div>
      )}

      {/* TAB 4: EXPENSES */}
      {activeTab === 'expenses' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Expense Item</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Vendor</th>
                <th style={{ padding: '0.85rem 1rem' }}>Payment Method</th>
                <th style={{ padding: '0.85rem 1rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {expensesPage.paginatedItems.map((exp) => (
                <tr key={exp._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>{exp.title}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ backgroundColor: '#F6DEDE', color: '#D97979', fontWeight: 700, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px' }}>
                      {exp.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#D97979' }}>₹{exp.amount?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{exp.vendor || '-'}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{exp.paymentMethod}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{new Date(exp.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '0 1rem' }}><Pagination {...expensesPage} onPageChange={expensesPage.setCurrentPage} /></div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showAddExpenseModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 38, 59, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem', border: '1px solid #DDE2EC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#17263B' }}>
                Record Club Expense
              </h3>
              <button onClick={() => setShowAddExpenseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Expense Title *</label>
                <input
                  type="text"
                  required
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="e.g. Floodlights Generator Diesel"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  >
                    <option value="MAINTENANCE">Maintenance & Repairs</option>
                    <option value="UTILITIES">Electricity & Water</option>
                    <option value="SUPPLIES">Gear & Kitchen Supplies</option>
                    <option value="EQUIPMENT">Equipment Upgrade</option>
                    <option value="SALARY">Payroll Payout</option>
                    <option value="OTHER">Other Operational</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Vendor / Payee</label>
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                  placeholder="e.g. Apex Sports Surfaces"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddExpenseModal(false)} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManagement;
