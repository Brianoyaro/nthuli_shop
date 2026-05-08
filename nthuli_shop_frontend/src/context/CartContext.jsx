import { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { cartAPI } from '../services/cartAPI';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

const STORAGE_KEY = 'nthuli_cart';

/**
 * Transforms backend cart format to UI format
 * Preserves both CartItem ID and Product ID for different API operations
 */
const transformBackendItem = (item) => ({
  id: item.id, // CartItem ID for update operations
  productId: item.productId, // Product ID for removal
  name: item.productName,
  price: parseFloat(item.unitPrice),
  quantity: item.quantity,
  image: item.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
  category: 'General',
});

export function CartProvider({ children }) {
  const { isAuthenticated, isLoading: authLoading } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [previousAuthState, setPreviousAuthState] = useState(null);

  /**
   * Migrate cart from localStorage to backend when user logs in
   */
  const migrateGuestCartToBackend = useCallback(async () => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);
      if (!storedCart) {
        console.log('📭 No guest cart to migrate');
        return;
      }

      const guestCart = JSON.parse(storedCart);
      if (!guestCart || guestCart.length === 0) {
        console.log('📭 Guest cart is empty');
        return;
      }

      console.log('🔄 Migrating guest cart to backend:', guestCart.length, 'items');

      // Add each item from guest cart to backend
      for (const item of guestCart) {
        try {
          await cartAPI.addToCart(
            item.id,
            item.name,
            item.price,
            item.quantity
          );
          console.log('✅ Migrated item to backend:', item.name);
        } catch (error) {
          console.error('❌ Failed to migrate item:', item.name, error);
        }
      }

      // Clear localStorage after migration
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ Cart migration complete - localStorage cleared');
    } catch (error) {
      console.error('❌ Cart migration failed:', error);
    }
  }, []);

  /**
   * Initialize cart: Load from localStorage or fetch from backend
   */
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    const initializeCart = async () => {
      try {
        setLoading(true);

        if (isAuthenticated) {
          // Check if this is a transition from guest to authenticated
          if (previousAuthState === false) {
            console.log('🔐 User just logged in - migrating guest cart');
            await migrateGuestCartToBackend();
          }

          // Authenticated: Fetch from backend
          console.log('👤 Authenticated user - fetching cart from backend');
          const response = await cartAPI.getCart();
          const backendCart = (response.items || []).map(transformBackendItem);
          setCart(backendCart);
        } else {
          // Guest: Load from localStorage
          console.log('👥 Guest user - loading cart from localStorage');
          const storedCart = localStorage.getItem(STORAGE_KEY);
          setCart(storedCart ? JSON.parse(storedCart) : []);
        }
      } catch (error) {
        console.error('❌ Failed to initialize cart:', error);
        setCart([]);
      } finally {
        setLoading(false);
        setHasInitialized(true);
        setPreviousAuthState(isAuthenticated);
      }
    };

    initializeCart();
  }, [isAuthenticated, authLoading, migrateGuestCartToBackend, previousAuthState]);

  /**
   * Save cart to localStorage (for guests)
   */
  const saveToLocalStorage = useCallback((cartData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData));
  }, []);

  /**
   * Add product to cart
   */
  const addToCart = useCallback(
    async (product) => {
      try {
        setLoading(true);
        console.log('➕ Adding to cart:', product.name);

        if (isAuthenticated) {
          // Call backend
          await cartAPI.addToCart(
            product.id,
            product.name,
            product.price,
            1
          );
          // Refetch cart from backend
          const response = await cartAPI.getCart();
          const backendCart = (response.items || []).map(transformBackendItem);
          setCart(backendCart);
        } else {
          // Update localStorage
          const existingItem = cart.find((item) => item.id === product.id);
          let updatedCart;

          if (existingItem) {
            updatedCart = cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            updatedCart = [
              ...cart,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0]?.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image',
                category: product.categoryName || 'General',
                quantity: 1,
              },
            ];
          }

          setCart(updatedCart);
          saveToLocalStorage(updatedCart);
        }

        console.log('✅ Item added to cart');
      } catch (error) {
        console.error('❌ Error adding to cart:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cart, isAuthenticated, saveToLocalStorage]
  );

  /**
   * Remove product from cart
   */
  const removeFromCart = useCallback(
    async (cartItemId) => {
      try {
        setLoading(true);
        console.log('🗑️ Removing from cart:', cartItemId);

        if (isAuthenticated) {
          // Find the item to get its product ID
          const item = cart.find(i => i.id === cartItemId);
          if (item) {
            // Call backend with product ID
            await cartAPI.removeFromCart(item.productId);
            // Refetch cart from backend
            const response = await cartAPI.getCart();
            const backendCart = (response.items || []).map(transformBackendItem);
            setCart(backendCart);
          }
        } else {
          // Update localStorage
          const updatedCart = cart.filter((item) => item.id !== cartItemId);
          setCart(updatedCart);
          saveToLocalStorage(updatedCart);
        }

        console.log('✅ Item removed from cart');
      } catch (error) {
        console.error('❌ Error removing from cart:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cart, isAuthenticated, saveToLocalStorage]
  );

  /**
   * Update product quantity in cart
   */
  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      try {
        if (quantity <= 0) {
          await removeFromCart(cartItemId);
          return;
        }

        setLoading(true);
        console.log('✏️ Updating quantity:', { cartItemId, quantity });

        if (isAuthenticated) {
          // Call backend with CartItem ID (not product ID)
          await cartAPI.updateQuantity(cartItemId, quantity);
          // Refetch cart from backend
          const response = await cartAPI.getCart();
          const backendCart = (response.items || []).map(transformBackendItem);
          setCart(backendCart);
        } else {
          // Update localStorage - guest cart uses product ID
          const updatedCart = cart.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item
          );
          setCart(updatedCart);
          saveToLocalStorage(updatedCart);
        }

        console.log('✅ Quantity updated');
      } catch (error) {
        console.error('❌ Error updating quantity:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cart, isAuthenticated, removeFromCart, saveToLocalStorage]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🧹 Clearing cart');

      if (isAuthenticated) {
        // Remove all items from backend using product ID
        for (const item of cart) {
          try {
            await cartAPI.removeFromCart(item.productId);
          } catch (err) {
            console.warn(`⚠️ Failed to remove item ${item.id} from backend:`, err);
          }
        }
      }

      setCart([]);
      saveToLocalStorage([]);
      console.log('✅ Cart cleared');
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cart, isAuthenticated, saveToLocalStorage]);

  /**
   * Get cart total
   */
  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  /**
   * Get total item count
   */
  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  /**
   * Sync guest cart to backend after login
   */
  const syncGuestCartToBackend = useCallback(async () => {
    if (!isAuthenticated || cart.length === 0) return;

    try {
      console.log('🔄 Syncing guest cart to backend...');

      // Add all guest items to backend
      for (const item of cart) {
        try {
          await cartAPI.addToCart(item.id, item.name, item.price, item.quantity);
        } catch (err) {
          console.warn(`⚠️ Failed to sync item ${item.name}:`, err);
        }
      }

      // Fetch final cart from backend
      const response = await cartAPI.getCart();
      const backendCart = (response.items || []).map(transformBackendItem);
      setCart(backendCart);
      localStorage.removeItem(STORAGE_KEY); // Clear localStorage after sync

      console.log('✅ Guest cart synced to backend');
    } catch (error) {
      console.warn('⚠️ Failed to sync guest cart:', error);
    }
  }, [isAuthenticated, cart]);

  const value = {
    cart,
    loading,
    hasInitialized,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    syncGuestCartToBackend,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}