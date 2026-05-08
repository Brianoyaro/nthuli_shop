# Cart System Implementation Guide

## Overview
The cart system now uses a **single, unified CartContext** that intelligently handles both guest users (localStorage) and authenticated users (backend API).

## Architecture

```
┌─────────────────────────────────────────┐
│         CartContext                     │
├─────────────────────────────────────────┤
│                                         │
│  Monitors: isAuthenticated              │
│                                         │
│  If Guest:                              │
│    ├─ Load cart from localStorage       │
│    └─ All operations → localStorage     │
│                                         │
│  If Authenticated:                      │
│    ├─ Fetch cart from backend on mount  │
│    └─ All operations → backend API      │
│                                         │
│  On Login (Guest → Auth):               │
│    └─ Sync localStorage items to backend│
│                                         │
└─────────────────────────────────────────┘
```

## Usage

### In Components
```javascript
import { useCart } from '../hooks/useCart';

export function MyComponent() {
  const {
    cart,           // Current cart items
    loading,        // Loading state
    addToCart,      // Add product
    removeFromCart, // Remove by ID
    updateQuantity, // Update quantity
    clearCart,      // Clear entire cart
    getCartTotal,   // Get total price
    getCartItemCount, // Get item count
  } = useCart();

  return (
    // Your component JSX
  );
}
```

## Key Methods

### `addToCart(product)`
- **Guest**: Adds to localStorage (or increments if exists)
- **Auth**: Calls `POST /cart/add`, fetches updated cart from backend

```javascript
await addToCart({
  id: 1,
  name: 'Product Name',
  price: 5000,
  categoryName: 'Clothes',
  images: [{ imageUrl: '/path/to/image.jpg' }]
});
```

### `removeFromCart(productId)`
- **Guest**: Removes from localStorage
- **Auth**: Calls `DELETE /cart/{productId}`, refetches cart

```javascript
await removeFromCart(productId);
```

### `updateQuantity(productId, quantity)`
- **Guest**: Updates localStorage, removes if quantity ≤ 0
- **Auth**: Calls `PUT /cart/{productId}?quantity={quantity}`, refetches cart

```javascript
await updateQuantity(productId, 5);
```

### `clearCart()`
- **Guest**: Clears localStorage
- **Auth**: Removes all items from backend via API

```javascript
await clearCart();
```

## Login Flow (Guest → Authenticated)

1. Guest user adds items to cart (stored in localStorage)
2. User clicks "Login"
3. `AuthContext.login()` sets `isAuthenticated = true`
4. CartContext detects change via `useEffect([isAuthenticated])`
5. `syncGuestCartToBackend()` runs automatically:
   - Adds each guest item to backend
   - Fetches updated cart from backend
   - Clears localStorage (merge complete)
6. UI updates to show backend cart

**Result**: Guest cart items seamlessly become authenticated user's cart.

## Data Format

### Backend Format
```javascript
{
  productId: 1,
  productName: "Shirt",
  quantity: 2,
  unitPrice: "5000.00"
}
```

### UI Format
```javascript
{
  id: 1,
  name: "Shirt",
  quantity: 2,
  price: 5000,
  image: "...",
  category: "General"
}
```

Transformation happens automatically in `transformBackendItem()`.

## Logout Flow

1. `AuthContext.logout()` clears tokens
2. `isAuthenticated = false`
3. CartContext reloads from localStorage
4. If no localStorage cart exists, shows empty cart
5. User can browse and add items to guest cart

## Deprecated Files

The following file is **no longer used** and can be deleted:
- `src/store/cartStore.js` (Zustand store)

## Error Handling

- **Network errors**: Caught and logged, user notified via toast
- **Auth failure**: Cart operations fail gracefully
- **Missing tokens**: Requests fail, user might need re-auth
- **Backend unavailable**: Guest mode falls back to localStorage

## Performance Notes

- Cart fetched once on mount (for authenticated users)
- Cart refetched after each mutation (add/remove/update)
- No polling or continuous sync
- localStorage used only for guests (no memory leak)

## Testing Checklist

- [ ] Guest adds item → appears in cart
- [ ] Guest refreshes page → cart persists
- [ ] Guest logs in → guest items appear in authenticated cart
- [ ] Auth user adds item → appears in cart
- [ ] Auth user refreshes page → items persist from backend
- [ ] Auth user logs out → can add items as guest again
- [ ] Network errors handled gracefully
- [ ] Cart counts shown correctly in navbar
- [ ] Checkout works for both guest and auth users
