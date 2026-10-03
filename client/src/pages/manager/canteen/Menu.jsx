import React, { useState, useEffect } from 'react';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import {
  Coffee,
  Plus,
  Utensils,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  Layers,
  Search,
} from 'lucide-react';

export const CanteenManagement = () => {
  const { toastSuccess, toastError } = useToast();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'tables' | 'orders'
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    category: 'Beverages',
    price: 120,
    isAvailable: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, tablesRes, ordersRes] = await Promise.all([
        managerService.getCanteenMenu(),
        managerService.getDiningTables(),
        managerService.getCanteenOrders(),
      ]);

      if (menuRes.success) setMenuItems(menuRes.data);
      if (tablesRes.success) setTables(tablesRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
    } catch (err) {
      toastError('Failed to load canteen & bar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.createMenuItem(newMenuItem);
      if (res.success) {
        toastSuccess(`Menu item ${newMenuItem.name} created!`);
        setShowAddMenuModal(false);
        fetchData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create menu item');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const res = await managerService.updateMenuItem(item._id, {
        isAvailable: !item.isAvailable,
      });
      if (res.success) {
        toastSuccess(`${item.name} is now ${!item.isAvailable ? 'Available' : 'Unavailable'}`);
        fetchData();
      }
    } catch (err) {
      toastError('Failed to update availability');
    }
  };

  const handleTableStatusChange = async (tableId, newStatus) => {
    try {
      const res = await managerService.updateTableStatus(tableId, { status: newStatus });
      if (res.success) {
        toastSuccess(res.message);
        fetchData();
      }
    } catch (err) {
      toastError('Failed to update table status');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Canteen & Bar Lounge Operations
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Menu catalog, dining tables configuration, active customer tabs, and kitchen order workflow.
          </p>
        </div>

        <button
          onClick={() => setShowAddMenuModal(true)}
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
          <Plus size={16} /> + Add Menu Item
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #DDE2EC', marginBottom: '1.5rem' }}>
        {[
          { id: 'menu', label: `Menu Items (${menuItems.length})` },
          { id: 'tables', label: `Dining Tables (${tables.length})` },
          { id: 'orders', label: `Active Orders & Tabs (${orders.length})` },
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

      {/* TAB 1: MENU */}
      {activeTab === 'menu' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Item Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Price</th>
                <th style={{ padding: '0.85rem 1rem' }}>Availability</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Toggle Status</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((it) => (
                <tr key={it._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>{it.name}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{it.category}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#17263B' }}>₹{it.price}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        backgroundColor: it.isAvailable ? 'rgba(143, 175, 152, 0.2)' : '#F6DEDE',
                        color: it.isAvailable ? '#8FAF98' : '#D97979',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {it.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleAvailability(it)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: '#F4F6FC',
                        border: '1px solid #DDE2EC',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#354962',
                        cursor: 'pointer',
                      }}
                    >
                      {it.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: DINING TABLES */}
      {activeTab === 'tables' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {tables.map((t) => (
            <div
              key={t._id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #DDE2EC',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#17263B' }}>
                    Table {t.tableNumber}
                  </span>
                  <span
                    style={{
                      backgroundColor: t.status === 'AVAILABLE'
                        ? 'rgba(143, 175, 152, 0.2)'
                        : t.status === 'OCCUPIED'
                        ? 'rgba(217, 142, 104, 0.2)'
                        : '#F7EBD4',
                      color: t.status === 'AVAILABLE'
                        ? '#8FAF98'
                        : t.status === 'OCCUPIED'
                        ? '#D98E68'
                        : '#D9A65D',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    {t.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                  <div>• Section: <strong>{t.section?.replace('_', ' ')}</strong></div>
                  <div>• Capacity: <strong>{t.capacity} Seats</strong></div>
                  {t.currentCustomer?.name && (
                    <div style={{ marginTop: '0.3rem', color: '#354962' }}>
                      • Customer: <strong>{t.currentCustomer.name}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #EEF2F6', paddingTop: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleTableStatusChange(t._id, st)}
                    style={{
                      flex: 1,
                      padding: '0.35rem 0.2rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: '1px solid #DDE2EC',
                      backgroundColor: t.status === st ? '#354962' : '#F4F6FC',
                      color: t.status === st ? '#FFFFFF' : '#354962',
                      cursor: 'pointer',
                    }}
                  >
                    {st.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.85rem 1rem' }}>Dishes / Drinks</th>
                <th style={{ padding: '0.85rem 1rem' }}>Table / Tab</th>
                <th style={{ padding: '0.85rem 1rem' }}>Total Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                    {o.customerName || (o.member ? `${o.member.firstName} ${o.member.lastName}` : 'Walk-in Guest')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962' }}>
                    {o.items?.map((it) => `${it.name} × ${it.quantity}`).join(', ')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontWeight: 600, color: '#354962' }}>
                      {o.tableNumber ? `Table ${o.tableNumber}` : 'Counter / Tab'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#17263B' }}>₹{o.total}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ backgroundColor: 'rgba(143, 175, 152, 0.2)', color: '#8FAF98', fontWeight: 700, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '999px' }}>
                      {o.status?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddMenuModal && (
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
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '450px', width: '100%', padding: '1.75rem', border: '1px solid #DDE2EC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#17263B' }}>
                Add Canteen Menu Item
              </h3>
              <button onClick={() => setShowAddMenuModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateMenuItem}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Item Name *</label>
                <input
                  type="text"
                  required
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                  placeholder="e.g. Avocado Protein Toast"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Category</label>
                  <select
                    value={newMenuItem.category}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  >
                    <option value="Beverages">Beverages & Coffee</option>
                    <option value="Protein Shakes">Protein Shakes</option>
                    <option value="Healthy Bowls">Healthy Bowls</option>
                    <option value="Snacks & Sandwiches">Snacks & Sandwiches</option>
                    <option value="Main Course">Main Course</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newMenuItem.price}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddMenuModal(false)} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Add to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanteenManagement;
