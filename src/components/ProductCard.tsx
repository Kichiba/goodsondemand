import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';
import { formatPrice } from '@shared/constants';
import type { Product } from '@shared/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, getItemQuantity } = useCart();
  const { showToast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.salePrice || product.price,
      originalPrice: product.salePrice ? product.price : undefined,
      quantity: 1,
      image: product.images[0] || undefined,
    }, product.stock);

    // Trigger animation + toast
    setAddedAnimation(true);
    showToast(`${product.name} added to cart`);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const isOutOfStock = product.stock <= 0;
  const currentInCart = getItemQuantity(product.id);
  const isMaxedOut = currentInCart >= product.stock;

  // Check if product is new (added within last 7 days)
  const isNew = product.createdAt
    ? Date.now() / 1000 - product.createdAt.seconds < 7 * 24 * 60 * 60
    : false;
  const hasMultipleImages = product.images.length > 1;

  // Handle hover zones for image switching
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!hasMultipleImages) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const segmentWidth = rect.width / product.images.length;
    const index = Math.min(
      Math.floor(x / segmentWidth),
      product.images.length - 1
    );
    setCurrentImageIndex(index);
  };

  const handleMouseLeave = () => {
    setCurrentImageIndex(0);
  };

  return (
    <div className={`product-card ${addedAnimation ? 'card-added' : ''}`}>
      {addedAnimation && (
        <div className="added-toast">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Added!
        </div>
      )}
      <Link
        to={`/product/${product.id}`}
        className="product-image-wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {product.images[currentImageIndex] ? (
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        ) : product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        )}
        {isOutOfStock && <div className="out-of-stock-badge">Sold Out</div>}
        {isNew && !isOutOfStock && <div className="new-badge">NEW</div>}
        {product.promoLabel && <div className="promo-label-badge">{product.promoLabel}</div>}
        <div className="product-category-badge">{product.category}</div>

        {/* Image dots indicator */}
        {hasMultipleImages && (
          <div className="image-dots">
            {product.images.map((_, idx) => (
              <span
                key={idx}
                className={`image-dot ${idx === currentImageIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
      </Link>

      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-stock-info">
          {isOutOfStock ? (
            <span className="stock-label out">Out of Stock</span>
          ) : (
            <span className="stock-label in">{product.stock} in stock</span>
          )}
        </div>
        <div className="product-footer">
          <div className="product-price-group">
            {product.salePrice ? (
              <>
                <span className="product-price sale">{formatPrice(product.salePrice)}</span>
                <span className="product-price-original">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="product-price">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxedOut}
            aria-label={`Add ${product.name} to cart`}
          >
            {isOutOfStock ? 'Sold Out' : isMaxedOut ? 'Max Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
