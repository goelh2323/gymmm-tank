import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from './StoreContext';

export interface CartItem {
  id: string; // unique ID: productId-flavor-size
  product: Product;
  selectedFlavor: string;
  selectedSize: string;
  quantity: number;
  overridePrice?: number;
  overrideComparePrice?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addToCart: (product: Product, flavor: string, size: string, quantity?: number, overridePrice?: number, overrideComparePrice?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  totalRegularPrice: number;
  totalSavings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('powerTankCart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('powerTankCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, flavor: string, size: string, quantity = 1, overridePrice?: number, overrideComparePrice?: number) => {
    // Generate unique ID for this item configuration
    const itemId = `${product.id}-${flavor.replace(/\s+/g, '')}-${size.replace(/\s+/g, '')}`;

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === itemId);
      if (existing) {
        // Limit to available stock
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        if (newQty === existing.quantity && existing.quantity >= product.stock) {
          alert(`Cannot add more. Limit of ${product.stock} reached (Maximum available stock).`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQty } : item
        );
      }
      // Add as new item
      return [...prevItems, { id: itemId, product, selectedFlavor: flavor, selectedSize: size, quantity, overridePrice, overrideComparePrice }];
    });
    setIsOpen(true); // Auto-open cart drawer when adding an item
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const maxStock = item.product.stock;
          const targetQty = Math.min(quantity, maxStock);
          if (quantity > maxStock) {
            alert(`Only ${maxStock} items available in stock.`);
          }
          return { ...item, quantity: targetQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Active price (uses overridePrice if available, otherwise salePrice/price)
  const totalPrice = cartItems.reduce((acc, item) => {
    const activePrice = item.overridePrice ?? (item.product.salePrice ?? item.product.price);
    return acc + activePrice * item.quantity;
  }, 0);

  // Base/Regular price
  const totalRegularPrice = cartItems.reduce((acc, item) => {
    const regularPrice = item.overrideComparePrice ?? item.product.price;
    return acc + regularPrice * item.quantity;
  }, 0);

  // Savings calculated
  const totalSavings = totalRegularPrice - totalPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
        totalRegularPrice,
        totalSavings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
