import { Link } from 'react-router-dom';
import { CATEGORIES } from '@shared/constants';

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Goods On Demand</h1>
          <p className="hero-subtitle">
            Branded and authentic bags, wallets, belts, clothes, perfumes & more — shipped from Marikina City. Order easily via Messenger.
          </p>
          <Link to="/products" className="hero-cta">
            Shop Now
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="category-card"
            >
              <div className="category-icon-wrapper">
                <span className="category-icon-text">{cat.name.charAt(0)}</span>
              </div>
              <span className="category-card-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How to Order</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Browse & Add to Cart</h3>
            <p>Browse our products and add the items you want to your cart.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Pay via QR Code</h3>
            <p>Scan our GCash/bank QR code at checkout to send your payment.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Confirm via Messenger</h3>
            <p>Send your order details and payment proof to our Messenger. We'll confirm and ship!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
