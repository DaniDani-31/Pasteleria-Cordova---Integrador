"use client";
import { API } from "@/lib/api";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Interfaz que coincide con el CompraDTO detallado del backend (una fila por producto)
interface CompraDTO {
  idCompra: number;
  total: number;
  fechaCompra: string; // Usaremos string para la fecha
  estado: string;
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  subtotal: number;
}

// Interfaz para la Compra Agrupada (una entidad Compra con una lista de Detalles)
interface CompraAgrupada {
  idCompra: number;
  total: number;
  fechaCompra: string;
  estado: string;
  detalles: {
    nombreProducto: string;
    cantidad: number;
    subtotal: number;
  }[];
}

function SeguimientoPedido({ estado }: { estado: string }) {
  return (
    <div className="text-sm font-medium text-gray-700">
      Estado del pedido: <span className="text-primary">{estado}</span>
    </div>
  );
}

export default function HistorialComprasPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [detalles, setDetalles] = useState<CompraDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState("");

  // FunciÃ³n para obtener los datos del historial de compras detallado
  const fetchHistorial = useCallback(async (idCliente: number) => {
    setCargando(true);
    setErrorMensaje("");

    try {
      const res = await fetch(`${API}/compras/cliente/${idCliente}/detalles`);
      const data = await res.json();

      if (!res.ok) {
        const mensajeError =
          data?.mensaje ||
          `Error al cargar el historial (Código ${res.status})`;
        throw new Error(mensajeError);
      }

      if (Array.isArray(data)) {
        setDetalles(data as CompraDTO[]);
      } else {
        setDetalles([]);
      }
    } catch (error: any) {
      console.error("Error al obtener historial:", error);
      setErrorMensaje(
        error.message || "No se pudo cargar el historial de compras.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      setUsuario(user);

      const idCliente = user.idCliente || user.id;
      if (idCliente) {
        fetchHistorial(idCliente);
      } else {
        setErrorMensaje("No se pudo obtener el ID del cliente.");
        setCargando(false);
      }
    } catch (e) {
      console.error("Error al procesar usuario de localStorage:", e);
      setErrorMensaje("Error en los datos de la sesiÃ³n.");
      setCargando(false);
    }
  }, [router, fetchHistorial]);

  // FUNCIÓN DE AGRUPACIÓN: Transforma la lista plana de DTOs en compras agrupadas
  const agruparCompras = (detallesPlanos: CompraDTO[]): CompraAgrupada[] => {
    const comprasMap = new Map<number, CompraAgrupada>();

    detallesPlanos.forEach((item) => {
      if (!comprasMap.has(item.idCompra)) {
        comprasMap.set(item.idCompra, {
          idCompra: item.idCompra,
          total: item.total,
          fechaCompra: item.fechaCompra,
          estado: item.estado,
          detalles: [],
        });
      }

      comprasMap.get(item.idCompra)?.detalles.push({
        nombreProducto: item.nombreProducto,
        cantidad: item.cantidad,
        subtotal: item.subtotal,
      });
    });

    return Array.from(comprasMap.values());
  };

  const comprasAgrupadas = agruparCompras(detalles);

  if (!usuario) return null;

  if (cargando) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <p className="text-xl text-gray-600">
          Cargando historial de compras...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 md:py-24">
      <h2 className="text-3xl font-bold text-primary mb-8 text-center">
        Historial de Compras Detallado
      </h2>

      {errorMensaje ? (
        <div className="max-w-6xl mx-auto p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          <p>{errorMensaje}</p>
        </div>
      ) : detalles.length === 0 ? (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl text-center">
          <p className="text-lg text-gray-500">
            No tienes compras registradas aÃºn.
          </p>
          <Button onClick={() => router.push("/")} className="mt-6">
            Comenzar a comprar
          </Button>
        </div>
      ) : (
        // Tabla para mostrar las compras agrupadas
        <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="py-3 px-4 text-left rounded-tl-lg">ID Compra</th>

                <th className="py-3 px-4 text-left">Fecha</th>

                <th className="py-3 px-4 text-left">Producto</th>

                <th className="py-3 px-4 text-center">Cantidad</th>

                <th className="py-3 px-4 text-right">Subtotal</th>

                <th className="py-3 px-4 text-right rounded-tr-lg">
                  Total Compra
                </th>
              </tr>
            </thead>
            <tbody>
              {comprasAgrupadas.map((compra) => (
                <React.Fragment key={compra.idCompra}>
                  {/* FILAS DE LOS PRODUCTOS */}
                  {compra.detalles.map((detalle, detalleIndex) => {
                    const isFirstDetail = detalleIndex === 0;

                    return (
                      <tr
                        key={`${compra.idCompra}-${detalleIndex}`}
                        className={`border-b hover:bg-gray-50 ${
                          isFirstDetail ? "border-t-2 border-primary/50" : ""
                        }`}
                      >
                        {/* ID Compra */}
                        <td
                          className={`py-3 px-4 font-mono text-sm ${
                            !isFirstDetail ? "text-gray-400" : "font-bold"
                          }`}
                        >
                          {isFirstDetail ? compra.idCompra : ""}
                        </td>

                        {/* Fecha */}
                        <td
                          className={`py-3 px-4 ${
                            !isFirstDetail ? "text-gray-400" : ""
                          }`}
                        >
                          {isFirstDetail ? compra.fechaCompra : ""}
                        </td>

                        {/* Producto */}
                        <td className="py-3 px-4">{detalle.nombreProducto}</td>

                        {/* Cantidad */}
                        <td className="py-3 px-4 text-center">
                          {detalle.cantidad}
                        </td>

                        {/* Subtotal */}
                        <td className="py-3 px-4 text-right">
                          S/. {detalle.subtotal.toFixed(2)}
                        </td>

                        {/* Total */}
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            !isFirstDetail ? "text-gray-400" : "text-lg"
                          }`}
                        >
                          {isFirstDetail
                            ? `S/. ${compra.total.toFixed(2)}`
                            : ""}
                        </td>
                      </tr>
                    );
                  })}

                  {/* =====================================================
          SEGUIMIENTO DEL PEDIDO
      ===================================================== */}
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-6 bg-gray-50 border-b-2 border-primary/30"
                    >
                      <SeguimientoPedido estado={compra.estado} />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ðŸ”™ BotÃ³n Volver al inicio */}
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="text-primary border-primary hover:bg-primary hover:text-white transition"
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
