import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import ProductPage from './pages/ProductPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<PlaceholderPage title="Products" />} />
          <Route path="/products/:productId" element={<ProductPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/deals" element={<PlaceholderPage title="Deals" />} />
          <Route path="/support" element={<PlaceholderPage title="Support" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

/** Temporary placeholder for pages that aren't built yet */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '12px',
    }}>
      <h1 className="headline-lg" style={{ color: 'var(--on-surface)' }}>{title}</h1>
      <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
        This page is under construction.
      </p>
    </div>
  );
}

export default App;
