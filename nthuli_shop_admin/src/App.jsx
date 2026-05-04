
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setupApiInterceptors } from './services/apiService';
import { useEffect } from 'react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import ProductDetail from './pages/ProductDetail';
import ProductCreate from './pages/ProductCreate';
import ProductEdit from './pages/ProductEdit';
import CategoryProducts from './pages/CategoryProducts';
import Analytics from './pages/Analytics';
import Orders from './pages/Orders';
import Refunds from './pages/Refunds';
import Products from './pages/Products';
import Categories from './pages/Categories';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import TopNavigation from './components/TopNavigation';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Setup API interceptors
const ApiInterceptorSetup = ({ children }) => {
  useEffect(() => {
    setupApiInterceptors();
  }, []);

  return children;
};

// Layout wrapper for protected routes
const AdminLayout = ({ children }) => (
  <div>
    <TopNavigation />
    <main className="min-h-screen bg-gray-50">
      {children}
    </main>
  </div>
);

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/category/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CategoryProducts />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/product/create"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ProductCreate />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/product/:id/edit"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ProductEdit />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/product/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ProductDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Analytics />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Orders />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/refunds"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Refunds />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Products />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Categories />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ApiInterceptorSetup>
          <Router>
            <Toaster position="top-right" />
            <AppRoutes />
          </Router>
        </ApiInterceptorSetup>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
