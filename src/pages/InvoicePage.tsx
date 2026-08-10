import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { formatPrice } from '@shared/constants';

interface OrderData {
  id: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  customerName: string;
  customerContact: string;
  totalAmount: number;
  status: string;
  createdAt: { seconds: number } | null;
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as OrderData);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    // Check if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      // Use native share on mobile
      navigator.share({
        title: `Invoice #${order?.id?.slice(-8).toUpperCase()}`,
        text: `Invoice from Goods On Demand`,
        url: window.location.href,
      }).catch(() => {
        // Fallback to print if share is cancelled
        window.print();
      });
    } else {
      window.print();
    }
  };

  const handleScreenshot = () => {
    // Hint for mobile users
    alert('Tip: Take a screenshot of this page to save your invoice!\n\niPhone: Side button + Volume Up\nAndroid: Power + Volume Down');
  };

  if (loading) {
    return (
      <div className="invoice-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="invoice-page">
        <div className="empty-state">
          <p>Invoice not found.</p>
        </div>
      </div>
    );
  }

  const invoiceNumber = order.id.slice(-8).toUpperCase();
  const orderDate = order.createdAt
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const statusLabel: Record<string, string> = {
    pending: 'Pending Payment',
    paid: 'Paid',
    shipped: 'Shipped',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  return (
    <div className="invoice-page">
      {/* Actions - hidden when printing */}
      <div className="invoice-actions no-print">
        <button className="print-btn" onClick={handlePrint}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          {/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 'Share Invoice' : 'Print / Save as PDF'}
        </button>
        <button className="screenshot-btn" onClick={handleScreenshot}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Save as Screenshot
        </button>
      </div>

      {/* Invoice Content */}
      <div className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-brand">
            <img src="./logo.png" alt="Goods On Demand" className="invoice-logo" />
            <div>
              <h1 className="invoice-business-name">Goods On Demand</h1>
              <p className="invoice-business-info">Marikina City, Philippines</p>
              <p className="invoice-business-info">Since 2020</p>
            </div>
          </div>
          <div className="invoice-meta">
            <h2 className="invoice-title">INVOICE</h2>
            <p className="invoice-number">#{invoiceNumber}</p>
            <p className="invoice-date">{orderDate}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="invoice-customer">
          <div>
            <p className="invoice-label">Bill To:</p>
            <p className="invoice-customer-name">{order.customerName}</p>
            <p className="invoice-customer-contact">{order.customerContact}</p>
          </div>
          <div className="invoice-status-box">
            <span className={`invoice-status ${order.status}`}>
              {statusLabel[order.status] || order.status}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="invoice-table">
          <div className="invoice-table-header">
            <span className="invoice-col-item">Item</span>
            <span className="invoice-col-price">Price</span>
            <span className="invoice-col-qty">Qty</span>
            <span className="invoice-col-amount">Amount</span>
          </div>
          {order.items.map((item, idx) => (
            <div key={idx} className="invoice-table-row">
              <span className="invoice-col-item">{item.productName}</span>
              <span className="invoice-col-price">{formatPrice(item.price)}</span>
              <span className="invoice-col-qty">{item.quantity}</span>
              <span className="invoice-col-amount">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="invoice-total-row">
            <span>Subtotal</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
          <div className="invoice-total-row">
            <span>Shipping</span>
            <span>To be discussed</span>
          </div>
          <div className="invoice-total-row grand-total">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="invoice-payment">
          <p className="invoice-label">Payment Method:</p>
          <p className="invoice-payment-text">BPI InstaPay (via QR Code)</p>
          <p className="invoice-payment-note">
            Please send payment to our QR code and confirm via Messenger.
          </p>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>Thank you for shopping with Goods On Demand!</p>
          <p className="invoice-footer-sub">
            For questions, message us on Facebook: Goods On Demand
          </p>
        </div>
      </div>
    </div>
  );
}
