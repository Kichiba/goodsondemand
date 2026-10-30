import { useEffect, useState } from 'react';
import { subscribeToOrders, updateOrderStatus, deleteOrder } from '../../services/adminFirebase';
import { formatPrice, ORDER_STATUS_CONFIG } from '@shared/constants';
import type { Order, OrderStatus } from '@shared/types';

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];

// Linear progression, matching the phone app.
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'paid',
  paid: 'shipped',
  shipped: 'completed',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    const unsubscribe = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const advance = async (order: Order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await updateOrderStatus(order.id, next, order.items);
    } catch {
      alert('Failed to update order status.');
    }
  };

  const cancel = async (order: Order) => {
    if (!confirm(`Cancel order from ${order.customerName}?`)) return;
    try {
      // Only restore stock if it was already paid/shipped
      const restore = order.status === 'paid' || order.status === 'shipped';
      await updateOrderStatus(order.id, 'cancelled', restore ? order.items : undefined);
    } catch {
      alert('Failed to cancel order.');
    }
  };

  const remove = async (order: Order) => {
    if (!confirm(`Delete order from ${order.customerName}? This cannot be undone.`)) return;
    try {
      await deleteOrder(order.id);
    } catch {
      alert('Failed to delete order.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>{filtered.length} orders</p>
        </div>
      </div>

      <div className="admin-filter-row">
        <button
          className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            className={`admin-filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {ORDER_STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-muted">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <p className="admin-muted">No orders here yet.</p>
      ) : (
        <div className="admin-orders">
          {filtered.map((order) => {
            const cfg = ORDER_STATUS_CONFIG[order.status];
            const next = NEXT_STATUS[order.status];
            const closed = order.status === 'completed' || order.status === 'cancelled';
            return (
              <div key={order.id} className="admin-order-card">
                <div className="admin-order-head">
                  <div>
                    <strong>{order.customerName}</strong>
                    <span className="admin-order-contact">{order.customerContact}</span>
                  </div>
                  <div className="admin-order-badges">
                    {order.hasLayaway && <span className="admin-layaway-tag">Layaway</span>}
                    <span
                      className="admin-status-badge"
                      style={{ color: cfg.color, background: cfg.color + '20' }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </div>

                <div className="admin-order-items">
                  {order.items.map((it, i) => (
                    <div key={i} className="admin-order-item">
                      <span>
                        {it.productName} x{it.quantity}
                        {it.paymentMode === 'layaway' && (
                          <span className="admin-order-layaway">
                            {' '}· Layaway {formatPrice(it.paydayAmount || 0)}/payday × {it.months}mo
                          </span>
                        )}
                      </span>
                      <span>{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="admin-order-foot">
                  <strong>
                    Total: {formatPrice(order.totalAmount)}
                    {order.hasLayaway && order.amountDueNow != null && (
                      <span className="admin-order-paidnow">
                        {' '}(Paid now: {formatPrice(order.amountDueNow)})
                      </span>
                    )}
                  </strong>
                  <div className="admin-order-btns">
                    {next && (
                      <button className="admin-primary-btn admin-sm" onClick={() => advance(order)}>
                        Mark as {ORDER_STATUS_CONFIG[next].label}
                      </button>
                    )}
                    {!closed && (
                      <button className="admin-secondary-btn admin-sm" onClick={() => cancel(order)}>
                        Cancel
                      </button>
                    )}
                    <button
                      className="admin-link-btn admin-danger"
                      onClick={() => remove(order)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
