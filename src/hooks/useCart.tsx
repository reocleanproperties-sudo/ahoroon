import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, options?: { size?: string; color?: string }) => void;
  removeFromCart: (productId: string, options?: { size?: string; color?: string }) => void;
  updateQuantity: (productId: string, quantity: number, options?: { size?: string; color?: string }) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity = 1, options?: { size?: string; color?: string }) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedSize === options?.size && 
        item.selectedColor === options?.color
      );
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === options?.size && item.selectedColor === options?.color)
            ? { ...item, cartQuantity: item.cartQuantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: quantity, selectedSize: options?.size, selectedColor: options?.color }];
    });
  };

  const removeFromCart = (productId: string, options?: { size?: string; color?: string }) => {
    setCart(prev => prev.filter(item => 
      !(item.id === productId && item.selectedSize === options?.size && item.selectedColor === options?.color)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, options?: { size?: string; color?: string }) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => 
        !(item.id === productId && item.selectedSize === options?.size && item.selectedColor === options?.color)
      ));
      return;
    }

    const roundedQuantity = parseFloat(quantity.toFixed(3));

    setCart(prev => prev.map(item => 
      (item.id === productId && item.selectedSize === options?.size && item.selectedColor === options?.color)
        ? { ...item, cartQuantity: roundedQuantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.cartQuantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
