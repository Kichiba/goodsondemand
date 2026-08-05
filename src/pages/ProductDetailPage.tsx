import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useCart } from '../context/CartContext';
import { formatPrice, CATEGORIES } from '@shared/constants';
import type { Product } from '@shared/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem, getItemQuantity } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="empty-state">
          <p>Product not found.</p>
          <Link to="/products" className="continue-shopping-btn">Back to Products</Link>
        </div>
      </div>
    );
  }

  const categoryName = CATEGORIES.find((c) => c.id === product.category)?.name || product.category;
  const isOutOfStock = product.stock <= 0;
  const currentInCart = getItemQuantity(product.id);
  const isMaxedOut = currentInCart >= product.stock;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || undefined,
    }, product.stock);
  };

  return (
    <div className="product-detail-page">
      <Link to="/products" className="back-link">
        &larr; Back to Products
      </Link>

      <div className="product-detail-layout">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="gallery-main">
            {product.images[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="gallery-main-image"
              />
            ) : (
              <div className="gallery-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="gallery-thumbs">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`gallery-thumb ${idx === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-detail-info">
          <span className="detail-category">{categoryName}</span>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">{formatPrice(product.price)}</p>

          {product.description && (
            <div className="detail-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          <div className="detail-stock">
            {isOutOfStock ? (
              <span className="stock-out">Out of Stock</span>
            ) : (
              <span className="stock-in">{product.stock} in stock</span>
            )}
          </div>

          <button
            className="detail-add-to-cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxedOut}
          >
            {isOutOfStock ? 'Sold Out' : isMaxedOut ? `Max in Cart (${currentInCart})` : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
