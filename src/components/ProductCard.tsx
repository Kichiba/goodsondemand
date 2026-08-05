import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '@shared/constants';
import type { Product } from '@shared/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, getItemQuantity } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || undefined,
    }, product.stock);
  };

  const isOutOfStock = product.stock <= 0;
  const currentInCart = getItemQuantity(product.id);
  const isMaxedOut = currentInCart >= product.stock;
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
    <div className="product-card">
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
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
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
