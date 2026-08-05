import { HashRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import './App.css';

function App() {
  return (
    <CartProvider>
      <HashRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </main>
          <footer className="footer">
            <p>&copy; 2026 Goods On Demand. Marikina City, Philippines.</p>
            <a
              href="https://www.facebook.com/profile.php?id=100063829217498"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
            >
              Follow us on Facebook
            </a>
          </footer>
        </div>
      </HashRouter>
    </CartProvider>
  );
}

export default App;
