import React, { useState, useEffect } from 'react';
import managerService from '../../../services/managerService';
import { useToast } from '../../../context/ToastContext';
import {
  ShoppingBag,
  Plus,
  AlertTriangle,
  Package,
  RotateCcw,
  CheckCircle2,
  X,
  Search,
  Filter,
} from 'lucide-react';

export const ShopManagement = () => {
  const { toastSuccess, toastError } = useToast();
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'inventory' | 'orders'
  const [products, setProducts] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Rackets',
    price: 3500,
    stock: 10,
    lowStockThreshold: 5,
  });

  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'PURCHASE',
    quantity: 10,
    notes: 'Restocked by Manager',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, logsRes, ordersRes] = await Promise.all([
        managerService.getProducts(),
        managerService.getInventoryLogs(),
        managerService.getShopOrders(),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (logsRes.success) setInventoryLogs(logsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data);
    } catch (err) {
      toastError('Failed to load pro shop data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await managerService.createProduct(newProduct);
      if (res.success) {
        toastSuccess(`Product ${newProduct.name} created!`);
        setShowAddProductModal(false);
        fetchData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      if (!selectedProductForStock) return;
      const res = await managerService.adjustStock({
        productId: selectedProductForStock._id,
        type: stockAdjustment.type,
        quantity: stockAdjustment.quantity,
        notes: stockAdjustment.notes,
      });

      if (res.success) {
        toastSuccess(res.message);
        setShowStockModal(false);
        fetchData();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to adjust stock');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#17263B', margin: 0 }}>
            Sports Pro-Shop & Inventory
          </h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Manage sports merchandise, replenish low inventory stock, and track sales receipts.
          </p>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
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
          <Plus size={16} /> + Add Product
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #DDE2EC', marginBottom: '1.5rem' }}>
        {[
          { id: 'products', label: `Gear Catalog (${products.length})` },
          { id: 'inventory', label: `Stock Movements & Logs (${inventoryLogs.length})` },
          { id: 'orders', label: `Shop Orders (${orders.length})` },
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

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Product Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Price</th>
                <th style={{ padding: '0.85rem 1rem' }}>Stock Level</th>
                <th style={{ padding: '0.85rem 1rem' }}>Threshold</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Inventory Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = p.stock <= p.lowStockThreshold;
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>{p.name}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{p.category}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#17263B' }}>₹{p.price?.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: isLow ? '#D97979' : '#17263B' }}>
                      {p.stock} units
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>Min. {p.lowStockThreshold}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          backgroundColor: isLow ? '#F6DEDE' : 'rgba(143, 175, 152, 0.2)',
                          color: isLow ? '#D97979' : '#8FAF98',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '999px',
                        }}
                      >
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedProductForStock(p);
                          setShowStockModal(true);
                        }}
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
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: INVENTORY LOGS */}
      {activeTab === 'inventory' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Product</th>
                <th style={{ padding: '0.85rem 1rem' }}>Movement Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Qty</th>
                <th style={{ padding: '0.85rem 1rem' }}>Previous &rarr; New Stock</th>
                <th style={{ padding: '0.85rem 1rem' }}>Notes</th>
                <th style={{ padding: '0.85rem 1rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {inventoryLogs.map((log) => (
                <tr key={log._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>{log.product?.name || 'Sports Item'}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: '#D98E68' }}>{log.type}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{log.quantity}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962' }}>{log.previousStock} &rarr; {log.newStock}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{log.notes || '-'}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #DDE2EC', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F4F6FC', borderBottom: '1px solid #DDE2EC', color: '#64748B', fontWeight: 700 }}>
                <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.85rem 1rem' }}>Items Ordered</th>
                <th style={{ padding: '0.85rem 1rem' }}>Total Amount</th>
                <th style={{ padding: '0.85rem 1rem' }}>Fulfillment</th>
                <th style={{ padding: '0.85rem 1rem' }}>Payment</th>
                <th style={{ padding: '0.85rem 1rem' }}>Order Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} style={{ borderBottom: '1px solid #EEF2F6' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#17263B' }}>
                    {o.customerName || (o.member ? `${o.member.firstName} ${o.member.lastName}` : 'Walk-in Member')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#354962' }}>
                    {o.items?.map((it) => `${it.name} × ${it.quantity}`).join(', ')}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#17263B' }}>₹{o.total}</td>
                  <td style={{ padding: '0.85rem 1rem', textTransform: 'capitalize' }}>{o.fulfillment}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ color: '#8FAF98', fontWeight: 700 }}>{o.paymentStatus?.toUpperCase()}</span>
                  </td>
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

      {/* Adjust Stock Modal */}
      {showStockModal && selectedProductForStock && (
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
                Adjust Stock: {selectedProductForStock.name}
              </h3>
              <button onClick={() => setShowStockModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustStock}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Movement Type</label>
                <select
                  value={stockAdjustment.type}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, type: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                >
                  <option value="PURCHASE">Purchase / Supplier Restock (+)</option>
                  <option value="RETURN">Customer Return (+)</option>
                  <option value="DAMAGE">Damaged / Written Off (-)</option>
                  <option value="ADJUSTMENT">Direct Stock Override (=)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Notes</label>
                <input
                  type="text"
                  value={stockAdjustment.notes}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, notes: e.target.value })}
                  placeholder="e.g. Yonex new shipment received"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowStockModal(false)} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
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
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '1.75rem', border: '1px solid #DDE2EC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#17263B' }}>
                Add Pro-Shop Product
              </h3>
              <button onClick={() => setShowAddProductModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Yonex Astrox 88D Pro Racket"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  >
                    <option value="Rackets">Rackets</option>
                    <option value="Balls & Shuttlecocks">Balls & Shuttlecocks</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Grips & Strings">Grips & Strings</option>
                    <option value="Apparel & Accessories">Apparel & Accessories</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Initial Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#354962' }}>Low Stock Alert Qty</label>
                  <input
                    type="number"
                    value={newProduct.lowStockThreshold}
                    onChange={(e) => setNewProduct({ ...newProduct, lowStockThreshold: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #DDE2EC', marginTop: '0.2rem', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddProductModal(false)} style={{ padding: '0.6rem 1.25rem', backgroundColor: '#F4F6FC', border: '1px solid #DDE2EC', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', backgroundColor: '#D98E68', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopManagement;
