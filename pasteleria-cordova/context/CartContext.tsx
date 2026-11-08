"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "@/hooks/use-toast";

// 🆕 Se renombra 'id' a 'idProducto' para coincidir con la estructura del Backend (CompraRequest)
export type Product = {
  idProducto: number; // 👈 Cambiado de 'id' a 'idProducto'
  name: string;
  description: string;
  price: string; // Ejemplo: "S/ 15.00"
  image: string;
  quantity?: number;
};

type CartContextType = {
  cart: Product[];
  addToCart: (product: Product) => void;
  clearCart: (suppressToast?: boolean) => void;
  removeFromCart: (index: number) => void;
  increaseQuantity: (index: number) => void;
  decreaseQuantity: (index: number) => void;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [lastAction, setLastAction] = useState<{
    type: string;
    product?: Product;
    name?: string;
    suppressToast?: boolean; // 🆕 Para controlar la alerta de vaciado
  } | null>(null);

  // 🧠 Recuperar carrito del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // 💾 Guardar carrito cada vez que cambia
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Mostrar toast después del render
  useEffect(() => {
    if (!lastAction) return;
    const { type, product, name, suppressToast } = lastAction;

    if (type === "add" && product) {
      toast({
        title: "Producto agregado",
        description: `✅ ${product.name} agregado exitosamente`,
      });
    } else if (type === "remove" && name) {
      toast({
        title: "Producto eliminado",
        description: `❌ ${name} eliminado del carrito`,
        variant: "destructive",
      });
    } else if (type === "clear" && !suppressToast) {
      // 🆕 Solo muestra si NO se suprimió
      toast({
        title: "Carrito vaciado",
        description: "🗑️ Carrito vaciado",
      });
    }

    setLastAction(null);
  }, [lastAction]);

  // 🟢 Agregar producto (Actualizado para usar idProducto)
  const addToCart = (product: Product) => {
    setCart((prev) => {
      // 🆕 Usamos idProducto
      const existing = prev.find((p) => p.idProducto === product.idProducto);
      if (existing) {
        return prev.map((p) =>
          // 🆕 Usamos idProducto
          p.idProducto === product.idProducto
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setLastAction({ type: "add", product });
  };

  // ❌ Eliminar producto (Mantiene la eliminación por índice)
  const removeFromCart = (index: number) => {
    const productName = cart[index]?.name;
    setCart((prev) => prev.filter((_, i) => i !== index));
    if (productName) setLastAction({ type: "remove", name: productName });
  };

  // 🗑️ Vacia carrito (Mantiene la supresión de alerta)
  const clearCart = (suppressToast: boolean = false) => {
    setCart([]);
    // La sincronización con localStorage ya se maneja en el useEffect [cart]

    // 🆕 Pasa el estado de supresión al lastAction
    if (!suppressToast) {
      setLastAction({ type: "clear" });
    } else {
      setLastAction({ type: "clear", suppressToast: true });
    }
  };

  // ⬆️ Aumentar cantidad
  const increaseQuantity = (index: number) => {
    setCart((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      )
    );
  };

  // ⬇️ Disminuir cantidad
  const decreaseQuantity = (index: number) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index && item.quantity && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        // Filtra si la cantidad llegó a 0 (eliminando el ítem)
        .filter((item) => item.quantity !== 0)
    );
  };

  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        clearCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
