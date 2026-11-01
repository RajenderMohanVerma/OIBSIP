import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'cc_cart';

const loadCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => loadCart());

  // Sync to localStorage on every change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  /**
   * Add an item to cart. If same pizza+size+crust+toppings combo exists, increment qty.
   */
  const addItem = (newItem) => {
    setItems((prev) => {
      const newToppingsSorted = (newItem.toppings || []).map((t) => t.name).sort().join(',');

      const existingIdx = prev.findIndex((i) => {
        const iToppingsSorted = (i.toppings || []).map((t) => t.name).sort().join(',');
        return (
          i.pizzaId === newItem.pizzaId &&
          i.size === newItem.size &&
          i.crust === newItem.crust &&
          iToppingsSorted === newToppingsSorted
        );
      });

      if (existingIdx >= 0) {
        const updated = [...prev];
        const current = updated[existingIdx];
        const newQty = Math.min(current.quantity + newItem.quantity, 10);
        updated[existingIdx] = { ...current, quantity: newQty };
        toast.success(`${newItem.pizzaName} quantity updated in cart`);
        return updated;
      }

      toast.success(`${newItem.pizzaName} added to cart!`);
      return [...prev, { ...newItem, cartId: `${Date.now()}-${Math.random()}` }];
    });
  };

  const removeItem = (cartId) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity < 1) {
      removeItem(cartId);
      return;
    }
    if (quantity > 10) return;
    setItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Client-side estimated subtotal (server recalculates before order creation).
   */
  const estimatedSubtotal = items.reduce((sum, item) => {
    const toppingsTotal = (item.toppings || []).reduce((t, top) => t + (top.price || 0), 0);
    const unitPrice =
      (item.basePrice || 0) +
      (item.sizeAdjustment || 0) +
      (item.crustAdjustment || 0) +
      toppingsTotal;
    return sum + unitPrice * (item.quantity || 1);
  }, 0);

  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        estimatedSubtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
