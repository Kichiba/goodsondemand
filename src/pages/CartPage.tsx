import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '@shared/constants';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount } = useCart();

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
          {items.map((item) => (
            <div key={item.productId} className="cart-item">
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
                <p className="cart-item-price">{formatPrice(item.price)}</p>
              </div>

              <div className="cart-item-quantity">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="cart-item-subtotal">
                {formatPrice(item.price * item.quantity)}
              </div>

              <button
                className="cart-item-remove"
                onClick={() => removeItem(item.productId)}
                aria-label={`Remove ${item.productName} from cart`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>To be discussed</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
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
