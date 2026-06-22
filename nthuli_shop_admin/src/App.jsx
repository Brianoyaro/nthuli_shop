
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import ProductDetail from './pages/ProductDetail';
import ProductCreate from './pages/ProductCreate';
import ProductEdit from './pages/ProductEdit';
import CategoryProducts from './pages/CategoryProducts';
import AdminOrders from './pages/AdminOrders';
import Login from './pages/Login';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected — require ADMIN login */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/category/:id" element={<ProtectedRoute><CategoryProducts /></ProtectedRoute>} />
            <Route path="/product/create" element={<ProtectedRoute><ProductCreate /></ProtectedRoute>} />
            <Route path="/product/:id/edit" element={<ProtectedRoute><ProductEdit /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
