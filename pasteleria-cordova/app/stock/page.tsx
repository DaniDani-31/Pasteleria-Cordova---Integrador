"use client";
import { API, ML_API } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Producto {
  idProducto: number;
  nombreProducto: string;
  stock: number;
}

interface Prediccion {
  idProducto: number;
  fechaPrediccion: string;
  demandaPredicha: number;
}

interface InventarioML {
  idProducto: number;
  nombreProducto: string;
  stockActual: number;
  demandaPredicha: number;
  cobertura: number;
  estadoInventario: string;
}

interface Optimizacion {
  idProducto: number;
  nombreProducto: string;
  stockActual: number;
  demandaPredicha: number;
  stockSeguridad: number;
  reposicionSugerida: number;
  recomendacion: string;
}

interface AnalisisML {
  prediccion: Prediccion;
  inventario: InventarioML;
  optimizacion: Optimizacion;
}

export default function StockPage() {
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [analisisML, setAnalisisML] = useState<Record<number, AnalisisML>>({});

  const [loading, setLoading] = useState(true);
  const [loadingML, setLoadingML] = useState(false);

  // =========================================================
  // CARGAR PRODUCTOS
  // =========================================================

  const cargarProductos = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API}/productos`);

      if (!response.ok) {
        throw new Error("No se pudieron cargar los productos");
      }

      const data = await response.json();

      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ANALISIS MACHINE LEARNING
  // =========================================================

  const cargarAnalisisML = async (listaProductos: Producto[]) => {
    try {
      setLoadingML(true);

      const resultados: Record<number, AnalisisML> = {};

      await Promise.all(
        listaProductos.map(async (producto) => {
          try {
            // -------------------------------------------------
            // 1. Obtener predicciÃ³n desde Python
            const prediccionResponse = await fetch(
              `${ML_API}/ventas/prediccion/${producto.idProducto}`,
            );

            if (!prediccionResponse.ok) {
              console.warn(
                `No se pudo obtener predicciÃ³n para ${producto.nombreProducto}`,
              );
              return;
            }

            const prediccion: Prediccion = await prediccionResponse.json();

            // -------------------------------------------------
            // 2. Analizar inventario en Spring Boot
            // -------------------------------------------------

            const inventarioResponse = await fetch(
              `${API}/ml/inventario/${producto.idProducto}?demandaPredicha=${prediccion.demandaPredicha}`,
            );

            if (!inventarioResponse.ok) {
              console.warn(
                `No se pudo analizar inventario para ${producto.nombreProducto}`,
              );
              return;
            }

            const inventario: InventarioML = await inventarioResponse.json();

            // -------------------------------------------------
            // 3. Obtener optimizacion de reposicion
            // -------------------------------------------------

            const optimizacionResponse = await fetch(
              `${API}/ml/optimizacion/${producto.idProducto}?demandaPredicha=${prediccion.demandaPredicha}&stockSeguridad=2`,
            );

            if (!optimizacionResponse.ok) {
              console.warn(
                `No se pudo calcular reposiciÃ³n para ${producto.nombreProducto}`,
              );
              return;
            }

            const optimizacion: Optimizacion =
              await optimizacionResponse.json();

            // -------------------------------------------------
            // Guardar anÃ¡lisis
            // -------------------------------------------------

            resultados[producto.idProducto] = {
              prediccion,
              inventario,
              optimizacion,
            };
          } catch (error) {
            console.error(
              `Error analizando producto ${producto.nombreProducto}:`,
              error,
            );
          }
        }),
      );

      setAnalisisML(resultados);
    } catch (error) {
      console.error("Error al cargar anÃ¡lisis ML:", error);
    } finally {
      setLoadingML(false);
    }
  };

  // =========================================================
  // CARGAR INFORMACION INICIAL
  // =========================================================

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const response = await fetch(`${API}/productos`);

        const data = await response.json();

        setProductos(data);

        await cargarAnalisisML(data);
      } catch (error) {
        console.error("Error al cargar informaciÃ³n:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarTodo();
  }, []);

  // =========================================================
  // AUMENTAR STOCK
  // =========================================================

  const aumentar = (id: number) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.idProducto === id
          ? {
              ...p,
              stock: p.stock + 1,
            }
          : p,
      ),
    );
  };

  // =========================================================
  // DISMINUIR STOCK
  // =========================================================

  const disminuir = (id: number) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.idProducto === id && p.stock > 0
          ? {
              ...p,
              stock: p.stock - 1,
            }
          : p,
      ),
    );
  };

  // =========================================================
  // ACTUALIZAR STOCK EN BACKEND
  // =========================================================

  const actualizarStock = async (producto: Producto) => {
    try {
      const response = await fetch(
        `${API}/productos/actualizar-stock/${producto.idProducto}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(producto.stock),
        },
      );

      if (response.ok) {
        alert(`Stock actualizado para ${producto.nombreProducto}`);

        // Volver a calcular el analisis ML
        await cargarAnalisisML(productos);
      } else {
        alert("Error al actualizar stock");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // =========================================================
  // ESTADO VISUAL DEL INVENTARIO
  // =========================================================

  const obtenerClaseEstado = (estado: string) => {
    switch (estado) {
      case "STOCK_SUFICIENTE":
        return "bg-green-100 text-green-700";

      case "STOCK_INSUFICIENTE":
        return "bg-yellow-100 text-yellow-700";

      case "SIN_STOCK":
        return "bg-red-100 text-red-700";

      case "SIN_DEMANDA_ESTIMADA":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Control de Stock</h1>

        <p className="text-lg">Cargando productos...</p>
      </div>
    );
  }

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundColor: "#f9f0dd",
      }}
    >
      {/* =====================================================
          TITULO
      ===================================================== */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Control de Stock</h1>

        <p className="text-gray-600 mt-1">
          Gestión de inventario y análisis inteligente
        </p>
      </div>

      {/* =====================================================
          RESUMEN ML
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Productos analizados</p>

          <p className="text-3xl font-bold mt-2">
            {Object.keys(analisisML).length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">
            Productos con stock insuficiente
          </p>

          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {
              Object.values(analisisML).filter(
                (item) =>
                  item.inventario.estadoInventario === "STOCK_INSUFICIENTE",
              ).length
            }
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Productos sin stock</p>

          <p className="text-3xl font-bold text-red-600 mt-2">
            {
              Object.values(analisisML).filter(
                (item) => item.inventario.estadoInventario === "SIN_STOCK",
              ).length
            }
          </p>
        </div>
      </div>

      {/* =====================================================
          INDICADOR ML
      ===================================================== */}

      {loadingML && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700">
            Analizando demanda e inventario con Machine Learning...
          </p>
        </div>
      )}

      {/* =====================================================
          TABLA
      ===================================================== */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">Producto</th>

              <th className="p-3 border">Stock actual</th>

              <th className="p-3 border">Acciones</th>

              <th className="p-3 border">Demanda estimada</th>

              <th className="p-3 border">Cobertura</th>

              <th className="p-3 border">Estado</th>

              <th className="p-3 border">Reposicion sugerida</th>

              <th className="p-3 border">Actualizar</th>
            </tr>
          </thead>

          <tbody>
            {productos.map((producto) => {
              const analisis = analisisML[producto.idProducto];

              return (
                <tr
                  key={producto.idProducto}
                  className="text-center border hover:bg-gray-50"
                >
                  {/* PRODUCTO */}

                  <td className="p-3 border font-semibold">
                    {producto.nombreProducto}
                  </td>

                  {/* STOCK */}

                  <td className="p-3 border">
                    <span className="text-xl font-bold">{producto.stock}</span>
                  </td>

                  {/* ACCIONES */}

                  <td className="p-3 border">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => disminuir(producto.idProducto)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        –
                      </button>

                      <button
                        onClick={() => aumentar(producto.idProducto)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* DEMANDA ML */}

                  <td className="p-3 border">
                    {analisis ? (
                      <div>
                        <span className="text-lg font-bold text-blue-600">
                          {analisis.prediccion.demandaPredicha}
                        </span>

                        <p className="text-xs text-gray-500">
                          unidades estimadas
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">Calculando...</span>
                    )}
                  </td>

                  {/* COBERTURA */}

                  <td className="p-3 border">
                    {analisis ? (
                      <div>
                        <span className="font-semibold">
                          {analisis.inventario.cobertura}
                        </span>

                        <p className="text-xs text-gray-500">
                          relacion stock/demanda
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* ESTADO */}

                  <td className="p-3 border">
                    {analisis ? (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${obtenerClaseEstado(
                          analisis.inventario.estadoInventario,
                        )}`}
                      >
                        {analisis.inventario.estadoInventario ===
                        "STOCK_SUFICIENTE"
                          ? "Stock suficiente"
                          : analisis.inventario.estadoInventario ===
                              "STOCK_INSUFICIENTE"
                            ? "Stock insuficiente"
                            : analisis.inventario.estadoInventario ===
                                "SIN_STOCK"
                              ? "Sin stock"
                              : "Sin demanda estimada"}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* REPOSICION */}

                  <td className="p-3 border">
                    {analisis ? (
                      <div>
                        <span
                          className={`text-lg font-bold ${
                            analisis.optimizacion.reposicionSugerida > 0
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {analisis.optimizacion.reposicionSugerida}
                        </span>

                        <p className="text-xs text-gray-500 mt-1">
                          {analisis.optimizacion.recomendacion}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* ACTUALIZAR */}

                  <td className="p-3 border">
                    <button
                      onClick={() => actualizarStock(producto)}
                      className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
