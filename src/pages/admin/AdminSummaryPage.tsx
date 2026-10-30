import { useEffect, useState } from 'react';
import { subscribeToProducts, subscribeToOrders } from '../../services/adminFirebase';
import { formatPrice, CATEGORIES } from '@shared/constants';
import type { Product, Order } from '@shared/types';

export default function AdminSummaryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubProducts = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });
    const unsubOrders = subscribeToOrders((data) => setOrders(data));
    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  // Sold = paid / shipped / completed orders
  const soldOrders = orders.filter(
    (o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'completed'
  );
  const totalSoldItems = soldOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const totalRevenue = soldOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const soldCost = soldOrders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce((itemSum, item) => {
        const product = products.find((p) => p.id === item.productId);
        return itemSum + (product?.costPrice || 0) * item.quantity;
      }, 0),
    0
  );
  const actualProfit = totalRevenue - soldCost;

  // Inventory
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const totalCost = products.reduce((sum, p) => sum + (p.costPrice || 0) * p.stock, 0);
  const totalProfit = totalValue - totalCost;
  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const lowStockItems = products.filter((p) => p.stock > 0 && p.stock <= 3);

  // Per-category breakdown
  const categorySummaries = CATEGORIES.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat.id);
    const value = catProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
    const cost = catProducts.reduce((sum, p) => sum + (p.costPrice || 0) * p.stock, 0);
    return {
      name: cat.name,
      totalItems: catProducts.length,
      totalStock: catProducts.reduce((sum, p) => sum + p.stock, 0),
      totalValue: value,
      profit: value - cost,
    };
  }).filter((s) => s.totalItems > 0);

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-muted">Loading summary...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Summary</h1>
          <p>Inventory and sales overview</p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="admin-stat-grid">
        <div className="admin-stat-card" style={{ background: '#ede9fe' }}>
          <span className="admin-stat-value">{totalProducts}</span>
          <span className="admin-stat-label">Total Products</span>
        </div>
        <div className="admin-stat-card" style={{ background: '#dbeafe' }}>
          <span className="admin-stat-value">{totalStock}</span>
          <span className="admin-stat-label">In Stock</span>
        </div>
        <div className="admin-stat-card" style={{ background: '#fce7f3' }}>
          <span className="admin-stat-value">{totalSoldItems}</span>
          <span className="admin-stat-label">Items Sold</span>
        </div>
        <div className="admin-stat-card" style={{ background: '#fee2e2' }}>
          <span className="admin-stat-value">{outOfStock}</span>
          <span className="admin-stat-label">Out of Stock</span>
        </div>
      </div>

      {/* Sales & Profit */}
      <h2 className="admin-section-title">Sales &amp; Profit</h2>
      <div className="admin-sales-grid">
        <div className="admin-sales-card" style={{ borderLeftColor: '#6d28d9' }}>
          <span>Total Revenue (Sold)</span>
          <strong>{formatPrice(totalRevenue)}</strong>
        </div>
        <div className="admin-sales-card" style={{ borderLeftColor: '#dc2626' }}>
          <span>Cost of Sold Items</span>
          <strong>{formatPrice(soldCost)}</strong>
        </div>
        <div className="admin-sales-card" style={{ borderLeftColor: '#059669' }}>
          <span>Actual Profit (Earned)</span>
          <strong style={{ color: '#059669' }}>{formatPrice(actualProfit)}</strong>
        </div>
      </div>

      {/* Remaining inventory */}
      <h2 className="admin-section-title">Remaining Inventory</h2>
      <div className="admin-sales-grid">
        <div className="admin-sales-card" style={{ borderLeftColor: '#2563eb' }}>
          <span>Selling Value (if all sold)</span>
          <strong>{formatPrice(totalValue)}</strong>
        </div>
        <div className="admin-sales-card" style={{ borderLeftColor: '#f59e0b' }}>
          <span>Cost Invested (in stock)</span>
          <strong>{formatPrice(totalCost)}</strong>
        </div>
        <div className="admin-sales-card" style={{ borderLeftColor: '#10b981' }}>
          <span>Potential Profit (unsold)</span>
          <strong style={{ color: '#10b981' }}>{formatPrice(totalProfit)}</strong>
        </div>
      </div>

      {/* Category breakdown */}
      <h2 className="admin-section-title">By Category</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Products</th>
              <th>Stock</th>
              <th>Value</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {categorySummaries.map((cat) => (
              <tr key={cat.name}>
                <td>{cat.name}</td>
                <td>{cat.totalItems}</td>
                <td>{cat.totalStock}</td>
                <td>{formatPrice(cat.totalValue)}</td>
                <td style={{ color: '#059669' }}>{formatPrice(cat.profit)}</td>
              </tr>
            ))}
            <tr className="admin-total-row">
              <td>TOTAL</td>
              <td>{totalProducts}</td>
              <td>{totalStock}</td>
              <td>{formatPrice(totalValue)}</td>
              <td style={{ color: '#059669' }}>{formatPrice(totalProfit)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Low stock alerts */}
      {lowStockItems.length > 0 && (
        <>
          <h2 className="admin-section-title">Low Stock Items</h2>
          <div className="admin-lowstock">
            {lowStockItems.map((p) => (
              <div key={p.id} className="admin-lowstock-item">
                <div>
                  <strong>{p.name}</strong>
                  <span className="admin-lowstock-cat">
                    {CATEGORIES.find((c) => c.id === p.category)?.name || p.category}
                  </span>
                </div>
                <span className="admin-lowstock-badge">{p.stock} left</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
