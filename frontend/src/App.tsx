import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import ProductPage from './pages/ProductPage';
import ProductsPage from './pages/ProductsPage';
import DealsPage from './pages/DealsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './components/RoleRedirect';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Dashboard routes — no Navbar */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/*"
            element={
              <ProtectedRoute roles={['ROLE_SELLER']}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Role-based redirect after login */}
          <Route path="/redirect" element={<RoleRedirect />} />

          {/* Public / user routes — with Navbar */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <main className="page-content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:productId" element={<ProductPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/deals" element={<DealsPage />} />
                  </Routes>
                </main>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
