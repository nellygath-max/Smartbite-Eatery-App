/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react';
import { getStoredValue, setStoredValue } from '../utils/storage';
export const CartContext = createContext(null);
const initialCart = () => getStoredValue('smartbite_cart', []);
export function CartProvider({ children }) {
  const [items, setItems] = useState(initialCart);
  useEffect(() => setStoredValue('smartbite_cart', items), [items]);
  const addItem = (meal) =>
    setItems((current) => {
      const id = meal._id || meal.id;
      const existing = current.find((item) => item._id === id);
      const stock = Number(meal.stock);
      const maximumQuantity = Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : Infinity;
      if (maximumQuantity < 1 || existing?.quantity >= maximumQuantity) return current;
      return existing
        ? current.map((item) =>
            item._id === id ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...current, { ...meal, _id: id, quantity: 1 }];
    });
  const updateQuantity = (id, quantity) =>
    setItems((current) => {
      if (quantity < 1) return current.filter((item) => item._id !== id);

      return current.flatMap((item) => {
        if (item._id !== id) return [item];
        const stock = Number(item.stock);
        const maximumQuantity = Number.isFinite(stock)
          ? Math.max(0, Math.floor(stock))
          : quantity;
        const nextQuantity = Math.min(quantity, maximumQuantity);
        return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
      });
    });
  const removeItem = (id) =>
    setItems((current) => current.filter((item) => item._id !== id));
  const clearCart = () => setItems([]);
  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        total,
        count: items.reduce((n, item) => n + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
