"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface VentaProducto {
  idProducto: number;
  nombreProducto: string;
  totalVendido: number;
}

interface Prediccion {
  idProducto: number;
  fechaPrediccion: string;
  demandaPredicha: number;
}

export default function VentasPorProductoPage() {
  const [ventas, setVentas] = useState<VentaProducto[]>([]);
  const [predicciones, setPredicciones] = useState<Record<number, Prediccion>>(
    {},
  );

  const [loading, setLoading] = useState(true);
  const [loadingML, setLoadingML] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // =========================================================
  // CARGAR VENTAS
  // =========================================================

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          "http://localhost:8080/api/compras/ventas-producto",
        );

        if (!res.ok) {
          throw new Error("Error al obtener ventas por producto");
        }

        const data: VentaProducto[] = await res.json();

        setVentas(data);

        // Después de obtener las ventas,
        // consultar las predicciones de ML
        await cargarPredicciones(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // =========================================================
  // CARGAR PREDICCIONES DESDE PYTHON
  // =========================================================

  const cargarPredicciones = async (productos: VentaProducto[]) => {
    try {
      setLoadingML(true);

      const resultados: Record<number, Prediccion> = {};

      await Promise.all(
        productos.map(async (producto) => {
          try {
            const response = await fetch(
              `http://localhost:8000/ventas/prediccion/${producto.idProducto}`,
            );

            if (!response.ok) {
              console.warn(
                `No se pudo obtener predicción para ${producto.nombreProducto}`,
              );
              return;
            }

            const data: Prediccion = await response.json();

            resultados[producto.idProducto] = data;
          } catch (error) {
            console.error(
              `Error en predicción de ${producto.nombreProducto}:`,
              error,
            );
          }
        }),
      );

      setPredicciones(resultados);
    } catch (error) {
      console.error("Error al cargar predicciones:", error);
    } finally {
      setLoadingML(false);
    }
  };

  // =========================================================
  // NIVEL DE DEMANDA
  // =========================================================

  const obtenerNivelDemanda = (demanda: number) => {
    if (demanda >= 5) {
      return {
        texto: "Alta",
        clase: "bg-red-100 text-red-700",
      };
    }

    if (demanda >= 2) {
      return {
        texto: "Media",
        clase: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      texto: "Baja",
      clase: "bg-green-100 text-green-700",
    };
  };

  // =========================================================
  // EXPORTAR PDF
  // =========================================================

  const exportPDF = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/reportes/ventas-producto/pdf",
      );

      if (!res.ok) {
        throw new Error(`Error al descargar PDF: ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "ventas-producto.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // =========================================================
  // EXPORTAR EXCEL
  // =========================================================

  const exportExcel = async () => {
    try {
      const res = await fetch(
        "http://localhost:8080/api/reportes/ventas-producto/excel",
      );

      if (!res.ok) {
        throw new Error(`Error al descargar Excel: ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "ventas-producto.xlsx";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: "#f9f0dd" }}>
        <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Ventas por Producto</h1>

          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f9f0dd" }}>
      <div className="max-w-7xl mx-auto">
        {/* ===================================================
            ENCABEZADO
        =================================================== */}

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h1 className="text-3xl font-bold mb-2">📈 Ventas por Producto</h1>

          <p className="text-gray-600">
            Análisis de ventas y estimación de demanda
          </p>
        </div>

        {/* ===================================================
            RESUMEN
        =================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">Productos analizados</p>

            <p className="text-3xl font-bold mt-2">{ventas.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">Predicciones disponibles</p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {Object.keys(predicciones).length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">Productos con demanda alta</p>

            <p className="text-3xl font-bold text-red-600 mt-2">
              {
                Object.values(predicciones).filter(
                  (p) => p.demandaPredicha >= 5,
                ).length
              }
            </p>
          </div>
        </div>

        {/* ===================================================
            ESTADO ML
        =================================================== */}

        {loadingML && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700">
              🤖 Calculando demanda estimada mediante Machine Learning...
            </p>
          </div>
        )}

        {/* ===================================================
            BOTONES DE EXPORTACIÓN
        =================================================== */}

        <div className="bg-white p-5 rounded-xl shadow mb-6">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={exportPDF}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              📄 Exportar PDF
            </button>

            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ===================================================
            TABLA
        =================================================== */}

        {!error && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-3">ID</th>

                  <th className="border p-3">Producto</th>

                  <th className="border p-3">Cantidad Vendida</th>

                  <th className="border p-3">Demanda Estimada</th>

                  <th className="border p-3">Nivel de Demanda</th>

                  <th className="border p-3">Fecha de Predicción</th>
                </tr>
              </thead>

              <tbody>
                {ventas.map((v) => {
                  const prediccion = predicciones[v.idProducto];

                  const nivel = prediccion
                    ? obtenerNivelDemanda(prediccion.demandaPredicha)
                    : null;

                  return (
                    <tr
                      key={`${v.idProducto}-${v.nombreProducto}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="border p-3 text-center">{v.idProducto}</td>

                      <td className="border p-3 font-semibold">
                        {v.nombreProducto}
                      </td>

                      <td className="border p-3 text-center">
                        {v.totalVendido}
                      </td>

                      {/* DEMANDA ML */}

                      <td className="border p-3 text-center">
                        {prediccion ? (
                          <div>
                            <span className="text-xl font-bold text-blue-600">
                              {prediccion.demandaPredicha}
                            </span>

                            <p className="text-xs text-gray-500">
                              unidades estimadas
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* NIVEL */}

                      <td className="border p-3 text-center">
                        {nivel ? (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${nivel.clase}`}
                          >
                            {nivel.texto}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* FECHA */}

                      <td className="border p-3 text-center">
                        {prediccion ? (
                          prediccion.fechaPrediccion
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="text-primary border-primary hover:bg-primary hover:text-white transition"
          >
            ⬅️ Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
