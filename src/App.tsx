import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import BackToTop from './components/BackToTop';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import InvoicePage from './pages/InvoicePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminLayout from './pages/admin/AdminLayout';
import AdminSummaryPage from './pages/admin/AdminSummaryPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import './App.css';

// Customer-facing store, wrapped in the cart/toast providers and shared chrome.
function StoreApp() {
  return (
    <CartProvider>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/invoice/:id" element={<InvoicePage />} />
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
          <BackToTop />
        </div>
      </ToastProvider>
    </CartProvider>
  );
}

// Inventory manager admin, kept separate from the customer store chrome.
function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Paths are relative to the parent "/admin/*" route. */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="summary" replace />} />
          <Route path="summary" element={<AdminSummaryPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Admin area — everything under /admin */}
        <Route path="/admin/*" element={<AdminApp />} />
        {/* Customer store — everything else */}
        <Route path="/*" element={<StoreApp />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
