import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '@shared/constants';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [step, setStep] = useState<'info' | 'payment' | 'send' | 'done'>('info');

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <h1>Checkout</h1>
        <div className="empty-cart">
          <p>Your cart is empty. Add some items first!</p>
          <Link to="/products" className="continue-shopping-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handleSendOrder = async () => {
    // 1. Save order to Firestore so it shows in the inventory app
    try {
      await addDoc(collection(db, 'orders'), {
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          image: item.image || null,
        })),
        customerName: customerName.trim(),
        customerContact: customerContact.trim(),
        totalAmount,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to save order:', err);
    }

    // 2. Build the order message
    const itemLines = items
      .map((item) => `• ${item.productName} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
      .join('\n');

    const orderMessage = `Hi Goods On Demand! I'd like to place an order:\n\nORDER DETAILS:\n${itemLines}\n\nTotal Amount: ${formatPrice(totalAmount)}\n\nCustomer: ${customerName}\nContact #: ${customerContact}\n\nPayment: Sent via BPI InstaPay (screenshot attached below)\n\nPlease confirm my order. Thank you!`;

    // 3. Copy message to clipboard
    try {
      await navigator.clipboard.writeText(orderMessage);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = orderMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    // 4. Show confirmation then open Messenger
    setStep('done');

    // Open Messenger - m.me works on mobile, facebook.com/messages on desktop
    setTimeout(() => {
      window.open('https://m.me/100063829217498', '_blank');
    }, 2000);

    // 5. Clear cart
    clearCart();
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {/* Progress Steps */}
      <div className="checkout-steps">
        <div className={`checkout-step ${step === 'info' ? 'active' : 'done'}`}>
          <span className="step-indicator">1</span>
          <span>Your Info</span>
        </div>
        <div className={`checkout-step ${step === 'payment' ? 'active' : step === 'send' ? 'done' : ''}`}>
          <span className="step-indicator">2</span>
          <span>Payment</span>
        </div>
        <div className={`checkout-step ${step === 'send' ? 'active' : ''}`}>
          <span className="step-indicator">3</span>
          <span>Send Order</span>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* Step 1: Customer Info */}
          {step === 'info' && (
            <div className="checkout-section">
              <h2>Your Information</h2>
              <p className="section-desc">We'll use this to identify your order and contact you about delivery.</p>
              <div className="form-group">
                <label htmlFor="customerName">Your Name / Messenger Name</label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerContact">Contact Number</label>
                <input
                  id="customerContact"
                  type="tel"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className="form-input"
                />
              </div>
              <button
                className="next-step-btn"
                disabled={!customerName.trim() || !customerContact.trim()}
                onClick={() => setStep('payment')}
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment QR */}
          {step === 'payment' && (
            <div className="checkout-section">
              <h2>Send Payment</h2>
              <p className="section-desc">
                Scan the QR code below with your GCash or banking app to send your payment of{' '}
                <strong>{formatPrice(totalAmount)}</strong>.
              </p>

              <div className="qr-code-container">
                <div className="qr-section">
                  <h3 className="qr-label">BPI (InstaPay)</h3>
                  <img src="./payment-qr-bpi.png" alt="BPI Payment QR Code" className="qr-image" />
                </div>
              </div>

              <div className="payment-amount">
                <span>Amount to Send:</span>
                <strong>{formatPrice(totalAmount)}</strong>
              </div>

              <div className="payment-actions">
                <button className="back-btn" onClick={() => setStep('info')}>
                  Back
                </button>
                <button className="next-step-btn" onClick={() => setStep('send')}>
                  I've Sent Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Send via Messenger */}
          {step === 'send' && (
            <div className="checkout-section">
              <h2>Send Your Order</h2>
              <p className="section-desc">
                Click the button below — your order message will be <strong>copied to your clipboard</strong>, then Messenger will open. 
                Just <strong>paste the message</strong> and <strong>attach your payment screenshot</strong>!
              </p>

              <div className="order-preview">
                <h3>Order Summary</h3>
                {items.map((item) => (
                  <div key={item.productId} className="order-preview-item">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="order-preview-total">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="payment-actions">
                <button className="back-btn" onClick={() => setStep('payment')}>
                  Back
                </button>
                <button className="messenger-btn" onClick={handleSendOrder}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.2v3.07l2.93-1.61c.83.23 1.71.35 2.62.35h.3c5.64 0 10-4.13 10-9.7C21 6.13 17.64 2 12 2z"/>
                  </svg>
                  Copy Order & Open Messenger
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Done confirmation */}
          {step === 'done' && (
            <div className="checkout-section checkout-done">
              <div className="done-icon">&#128203;</div>
              <h2>Message Copied!</h2>
              <p className="section-desc">
                Your order details have been copied. Messenger is opening — just <strong>paste</strong> the message and <strong>attach your payment screenshot</strong>.
              </p>
              <div className="done-steps">
                <div className="done-step">
                  <span className="done-step-num">1</span>
                  <span>Long press the message box in Messenger</span>
                </div>
                <div className="done-step">
                  <span className="done-step-num">2</span>
                  <span>Tap "Paste"</span>
                </div>
                <div className="done-step">
                  <span className="done-step-num">3</span>
                  <span>Attach your payment screenshot</span>
                </div>
                <div className="done-step">
                  <span className="done-step-num">4</span>
                  <span>Send!</span>
                </div>
              </div>
              <a
                href="https://m.me/100063829217498"
                target="_blank"
                rel="noopener noreferrer"
                className="messenger-btn"
                style={{ marginTop: '1.5rem', textDecoration: 'none', display: 'inline-flex' }}
              >
                Open Messenger Again
              </a>
              <br />
              <Link to="/" className="continue-shopping-link" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Back to Home
              </Link>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <h3>Your Order</h3>
          {items.map((item) => (
            <div key={item.productId} className="sidebar-item">
              <span className="sidebar-item-name">
                {item.productName} <span className="sidebar-item-qty">x{item.quantity}</span>
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="sidebar-total">
            <span>Total</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
