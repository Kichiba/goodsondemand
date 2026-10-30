import { Link } from 'react-router-dom';
import { useCart, lineDueNow } from '../context/CartContext';
import { formatPrice } from '@shared/constants';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, amountDueNow } = useCart();

  // Calculate original total (before discounts)
  const originalTotal = items.reduce(
    (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
    0
  );

  const hasLayaway = items.some((i) => i.paymentMode === 'layaway');
  const layawayBalance = totalAmount - amountDueNow;

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <h1>Your Cart</h1>
        <div className="empty-cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p>Your cart is empty</p>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const isLayaway = item.paymentMode === 'layaway';
            return (
            <div key={`${item.productId}-${item.paymentMode || 'full'}`} className="cart-item">
              <div className="cart-item-image">
                {item.image ? (
                  <img src={item.image} alt={item.productName} />
                ) : (
                  <div className="cart-item-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    </svg>
                  </div>
                )}
              </div>

              <div className="cart-item-details">
                <h3>{item.productName}</h3>
                <div className="cart-item-price">
                  {item.originalPrice ? (
                    <>
                      <span className="cart-price-sale">{formatPrice(item.price)}</span>
                      <span className="cart-price-original">{formatPrice(item.originalPrice)}</span>
                    </>
                  ) : (
                    <span>{formatPrice(item.price)}</span>
                  )}
                </div>
                {isLayaway && (
                  <div className="cart-layaway-tag">
                    <span className="layaway-badge">Layaway</span>
                    <span className="cart-layaway-terms">
                      {formatPrice(item.paydayAmount || 0)}/payday &middot; {item.months} months
                    </span>
                  </div>
                )}
              </div>

              <div className="cart-item-quantity">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1, undefined, item.paymentMode)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1, undefined, item.paymentMode)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="cart-item-subtotal">
                {formatPrice(lineDueNow(item))}
                {isLayaway && <span className="cart-item-duenow">due now</span>}
              </div>

              <button
                className="cart-item-remove"
                onClick={() => removeItem(item.productId, item.paymentMode)}
                aria-label={`Remove ${item.productName} from cart`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          );
          })}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          {originalTotal > totalAmount && (
            <div className="summary-row savings">
              <span>Original Price</span>
              <span className="cart-price-original">{formatPrice(originalTotal)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          {originalTotal > totalAmount && (
            <div className="summary-row discount">
              <span>You Save</span>
              <span className="cart-savings-amount">-{formatPrice(originalTotal - totalAmount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>To be discussed</span>
          </div>
          {hasLayaway && (
            <div className="summary-row layaway-balance">
              <span>Layaway balance (pay over time)</span>
              <span>{formatPrice(layawayBalance)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>{hasLayaway ? 'Pay Now' : 'Total'}</span>
            <span>{formatPrice(amountDueNow)}</span>
          </div>
          {hasLayaway && (
            <p className="layaway-note">
              Layaway items: pay the first payday amount now, then settle the rest over the agreed months via Messenger.
            </p>
          )}
          <Link to="/checkout" className="checkout-btn">
            Proceed to Checkout
          </Link>
          <Link to="/products" className="continue-shopping-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
