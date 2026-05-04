import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const TopNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Orders', path: '/orders', icon: '📦' },
    { label: 'Products', path: '/products', icon: '🛍️' },
    { label: 'Categories', path: '/categories', icon: '🏷️' },
    { label: 'Analytics', path: '/analytics', icon: '📈' },
    { label: 'Refunds', path: '/refunds', icon: '💰' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setOpenDropdown(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setOpenDropdown(null);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Nthuli
            </div>
            <span className="text-xs bg-blue-600 px-2 py-1 rounded">Admin</span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-700 text-gray-300 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </div>
            ))}
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'user' ? null : 'user')}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                {user?.firstName?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-sm text-right">
                <p className="font-medium">{user?.firstName || 'Admin'}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <span className="text-xs">▼</span>
            </button>

            {openDropdown === 'user' && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold text-sm">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 font-medium transition-colors"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
