"use client";
import { API } from "@/lib/api";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";

// Interfaz del Ã­tem del carrito
interface CartItem {
  idProducto: number;
  name: string;
  price: string; // "S/ 15.00"
  quantity: number;
  description: string;
}

type PaymentMethod = "none" | "tarjeta" | "yape" | "plin";

export default function CarritoPage() {
  const {
    cart,
    clearCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart() as {
    cart: CartItem[];
    clearCart: (suppressToast?: boolean) => void;
    removeFromCart: (index: number) => void;
    increaseQuantity: (index: number) => void;
    decreaseQuantity: (index: number) => void;
  };

  const router = useRouter();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("none");

  const total = cart
    .reduce((acc, item) => {
      const cleanedPrice = item.price
        .replace("S/", "")
        .replace(" c/u", "")
        .replace(",", ".")
        .trim();
      const price = parseFloat(cleanedPrice);
      return acc + (isNaN(price) ? 0 : price * (item.quantity || 1));
    }, 0)
    .toFixed(2);

  const handleProcessPurchase = async (method: string) => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) {
      alert("Debes iniciar sesion para completar la compra.");
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    const idCliente = user.idCliente || user.id;

    if (!idCliente) {
      alert("No se pudo obtener tu ID de cliente.");
      return;
    }

    if (cart.length === 0) {
      alert("El carrito esta vacio.");
      return;
    }

    try {
      // ðŸ”¹ Mapear detalles correctamente para backend con limpieza de precio
      const detalles = cart.map((item) => {
        if (!item.idProducto) {
          throw new Error(`El producto "${item.name}" no tiene un ID valido.`);
        }

        const cleanedPrice = item.price
          .replace("S/", "")
          .replace(" c/u", "")
          .replace(",", ".")
          .trim();

        const numericPrice = parseFloat(cleanedPrice);
        if (isNaN(numericPrice)) {
          throw new Error(
            `El producto "${item.name}" tiene un precio invalido.`,
          );
        }

        return {
          id_producto: item.idProducto,
          cantidad: item.quantity,
          subtotal: numericPrice * item.quantity,
        };
      });

      if (detalles.length === 0) {
        throw new Error("No hay detalles de compra validos.");
      }

      // ðŸ”¹ Crear objeto CompraRequest compatible con backend
      const compra = {
        idCliente: idCliente,
        estado: "Pendiente",
        detalles,
      };

      console.log("Compra a enviar al backend:", compra);

      setIsProcessing(true);

      const res = await fetch(`${API}/compras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compra),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Respuesta del backend:", text);
        throw new Error("Error al registrar la compra");
      }

      clearCart(true);
      alert(`Compra realizada con exito usando ${method}. Total: S/ ${total}`);
      router.push("/historial");
    } catch (error: any) {
      console.error("Error al procesar compra:", error);
      alert(`Error al procesar la compra: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setShowPaymentOptions(false);
      setSelectedPayment("none");
    }
  };

  const renderPaymentContent = () => {
    if (selectedPayment === "tarjeta") {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleProcessPurchase("Tarjeta");
          }}
          className="space-y-4"
        >
          <h2 className="font-bold mb-4">Datos de la Tarjeta</h2>
          <input
            type="text"
            placeholder="Numero de Tarjeta"
            required
            maxLength={16}
            className="w-full border p-2 rounded"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MM/AA"
              required
              maxLength={5}
              className="w-1/2 border p-2 rounded"
            />
            <input
              type="text"
              placeholder="CVC"
              required
              maxLength={4}
              className="w-1/2 border p-2 rounded"
            />
          </div>
          <input
            type="text"
            placeholder="Nombre en la tarjeta"
            required
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isProcessing ? "Procesando Pago..." : `Pagar S/ ${total}`}
          </button>
          <button
            type="button"
            onClick={() => setSelectedPayment("none")}
            className="mt-3 text-sm text-gray-600 underline w-full"
          >
            Volver a metodos
          </button>
        </form>
      );
    }

    if (selectedPayment === "yape" || selectedPayment === "plin") {
      const numeroEmpresa =
        selectedPayment === "yape" ? "+51 962 062 153" : "+51 988 997 105";
      return (
        <div className="text-center space-y-4">
          <h2 className="font-bold text-xl">
            Pagar con {selectedPayment.toUpperCase()}
          </h2>
          <p className="text-lg">
            Monto a pagar:{" "}
            <span className="font-extrabold text-pink-600">S/ {total}</span>
          </p>
          <div className="p-4 border-2 border-dashed border-gray-400 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              Transfiere el monto total a:
            </p>
            <p className="text-2xl font-bold text-green-700">{numeroEmpresa}</p>
            <p className="text-xs text-gray-500 mt-1">
              Titular: Pastelerias Cordova S.A.C.
            </p>
            <img
              src={
                selectedPayment === "yape"
                  ? "/yape_daniel.jpg"
                  : "/plin_sebas.png"
              }
              alt={`QR de ${selectedPayment.toUpperCase()}`}
              className="w-40 h-40 mx-auto mt-4"
            />
          </div>
          <p className="text-sm text-gray-600">
            Una vez transferido, haz clic en **"Confirmar Pago"** para
            finalizar.
          </p>
          <button
            onClick={() => handleProcessPurchase(selectedPayment.toUpperCase())}
            disabled={isProcessing}
            className={`w-full py-3 rounded text-white font-semibold transition ${
              selectedPayment === "yape"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {isProcessing ? "Confirmando..." : "âœ… Confirmar Pago"}
          </button>
          <button
            onClick={() => setSelectedPayment("none")}
            className="mt-3 text-sm text-gray-600 underline w-full"
          >
            Volver a metodos
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <h2 className="font-bold mb-2">Elige tu metodo de pago</h2>
        <button
          onClick={() => setSelectedPayment("tarjeta")}
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Tarjeta de Credito/Debito
        </button>
        <button
          onClick={() => setSelectedPayment("yape")}
          className="bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
        >
          Yape
        </button>
        <button
          onClick={() => setSelectedPayment("plin")}
          className="bg-sky-500 text-white py-2 rounded hover:bg-sky-600"
        >
          Plin
        </button>
        <button
          onClick={() => {
            setShowPaymentOptions(false);
            setSelectedPayment("none");
          }}
          className="mt-3 text-sm text-gray-600 underline"
        >
          Cancelar
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex flex-col justify-center items-center text-center pt-28 pb-20 container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Tu Carrito</h1>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white p-8 rounded-xl shadow-md max-w-md w-full">
            <p className="text-gray-600 text-lg mb-6">
              Tu carrito esta vacÃ­o.
            </p>
            <button
              onClick={() => {
                router.push("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-all"
            >
              Volver al inicio
            </button>
          </div>
        ) : (
          <div className="max-w-2xl bg-white p-6 rounded-xl shadow">
            <ul>
              {cart.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center border-b py-3"
                >
                  <div className="text-left">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseQuantity(i)}
                      className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(i)}
                      className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                    <div className="font-semibold">{item.price}</div>
                    <button
                      onClick={() => removeFromCart(i)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-6 font-bold text-lg text-pink-800">
              <span>Total:</span>
              <span>S/ {total}</span>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => clearCart()}
                className="w-full bg-gray-200 hover:bg-gray-300 py-3 rounded"
                disabled={showPaymentOptions}
              >
                Vaciar carrito
              </button>
              <button
                onClick={() => setShowPaymentOptions(true)}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded"
                disabled={showPaymentOptions}
              >
                Pagar ahora
              </button>
            </div>
            {showPaymentOptions && (
              <div className="mt-8 bg-gray-100 p-6 rounded-lg max-w-sm mx-auto">
                {renderPaymentContent()}
              </div>
            )}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  router.push("/");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-pink-600 hover:text-pink-800 underline text-sm"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
