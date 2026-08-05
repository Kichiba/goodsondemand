import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, generateMessengerOrderLink } from '@shared/constants';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [step, setStep] = useState<'info' | 'payment' | 'send'>('info');

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

  const handleSendOrder = () => {
    const messengerLink = generateMessengerOrderLink(
      customerName,
      items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount
    );

    // Open Messenger in a new tab
    window.open(messengerLink, '_blank');

    // Clear cart after sending
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
              <p className="section-desc">We'll use this to identify your order on Messenger.</p>
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
              <button
                className="next-step-btn"
                disabled={!customerName.trim()}
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
                Click the button below to open Messenger with your order details pre-filled. 
                Just <strong>attach your payment screenshot</strong> and send — we'll confirm and process your order!
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
                  Send Order via Messenger
                </button>
              </div>
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
