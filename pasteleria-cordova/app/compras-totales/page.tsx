"use client";
import { API } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function ComprasTotalesPage() {
  const router = useRouter();

  interface Cliente {
    nombreCompleto?: string;
  }

  interface Compra {
    idCompra: number | string;
    cliente?: Cliente;
    fechaCompra: string;
    total: number;
    estado: string;
  }

  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        // ============================
        // COMPRAS
        // ============================
        const resCompras = await fetch(`${API}/compras`);

        const dataCompras = await resCompras.json();

        console.log("Respuesta /api/compras:", dataCompras);

        const comprasRecibidas: Compra[] = Array.isArray(dataCompras)
          ? dataCompras
          : Array.isArray(dataCompras.compras)
            ? dataCompras.compras
            : Array.isArray(dataCompras.data)
              ? dataCompras.data
              : [];

        setCompras(comprasRecibidas);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando compras:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================
  // CAMBIAR ESTADO
  // ============================
  const cambiarEstado = async (
    idCompra: number | string,
    nuevoEstado: string,
  ) => {
    try {
      const res = await fetch(`${API}/compras/${idCompra}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: nuevoEstado,
        }),
      });

      if (!res.ok) {
        const mensaje = await res.text();

        alert(mensaje || "No se pudo actualizar el estado de la compra.");

        return;
      }

      // Actualizar la tabla sin recargar la pÃ¡gina
      setCompras((prev) =>
        prev.map((c) =>
          String(c.idCompra) === String(idCompra)
            ? {
                ...c,
                estado: nuevoEstado,
              }
            : c,
        ),
      );

      alert(`La compra #${idCompra} ahora estÃ¡ en estado "${nuevoEstado}".`);
    } catch (error) {
      console.error("Error actualizando estado:", error);

      alert("No se pudo conectar con el servidor.");
    }
  };

  // ============================
  // OBTENER SIGUIENTE ESTADO
  // ============================
  const obtenerSiguienteEstado = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "Confirmado";

      case "Confirmado":
        return "Preparando";

      case "Preparando":
        return "Listo";

      case "Listo":
        return "Entregado";

      default:
        return null;
    }
  };

  // ============================
  // TEXTO DEL BOTON
  // ============================
  const textoSiguienteEstado = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "Confirmar pedido";

      case "Confirmado":
        return "Iniciar preparacion";

      case "Preparando":
        return "Marcar como listo";

      case "Listo":
        return "Marcar entregado";

      default:
        return "";
    }
  };

  // ============================
  // COLOR DEL ESTADO
  // ============================
  const colorEstado = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-500 text-black px-3 py-1 rounded-full font-semibold";

      case "Confirmado":
        return "bg-blue-500 text-white px-3 py-1 rounded-full font-semibold";

      case "Preparando":
        return "bg-orange-500 text-white px-3 py-1 rounded-full font-semibold";

      case "Listo":
        return "bg-purple-600 text-white px-3 py-1 rounded-full font-semibold";

      case "Entregado":
        return "bg-green-600 text-white px-3 py-1 rounded-full font-semibold";

      case "Cancelado":
        return "bg-red-600 text-white px-3 py-1 rounded-full font-semibold";

      default:
        return "bg-gray-400 text-white px-3 py-1 rounded-full font-semibold";
    }
  };

  // ============================
  // EXPORTAR EXCEL
  // ============================
  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      compras.map((c) => ({
        ID: c.idCompra,
        Cliente: c.cliente?.nombreCompleto || "Desconocido",
        Fecha: c.fechaCompra,
        Total: c.total,
        Estado: c.estado,
      })),
    );

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Compras");

    XLSX.writeFile(workbook, "compras_totales.xlsx");
  };

  // ============================
  // EXPORTAR PDF
  // ============================
  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);

    doc.text("Reporte de Compras Totales", 14, 20);

    (doc as any).autoTable({
      startY: 30,

      head: [["ID", "Cliente", "Fecha", "Total", "Estado"]],

      body: compras.map((c) => [
        c.idCompra,
        c.cliente?.nombreCompleto || "Desconocido",
        c.fechaCompra,
        "S/ " + Number(c.total || 0).toFixed(2),
        c.estado,
      ]),
    });

    doc.save("compras_totales.pdf");
  };

  // ============================
  // LOADING
  // ============================
  if (loading) {
    return <p className="text-center mt-10">Cargando datos...</p>;
  }

  // ============================
  // TOTALES
  // ============================
  const comprasArray = Array.isArray(compras) ? compras : [];

  const totalCompras = comprasArray.length;

  const sumaTotal = comprasArray.reduce(
    (acc, c) => acc + Number(c.total || 0),
    0,
  );

  return (
    <div className="p-6">
      {/* ============================
          TÃTULO
      ============================ */}
      <h1 className="text-3xl font-bold mb-5">Compras Totales</h1>

      {/* ============================
          ESTADÃSTICAS
      ============================ */}
      <div className="flex gap-6 bg-gray-100 p-4 rounded-lg shadow mb-5">
        <div className="text-lg font-semibold">
          Total de compras registradas:{" "}
          <span className="text-blue-700">{totalCompras}</span>
        </div>

        <div className="text-lg font-semibold">
          Suma total de compras:{" "}
          <span className="text-green-700">S/ {sumaTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* ============================
          EXPORTACIÃ“N
      ============================ */}
      <div className="flex gap-4 mb-5">
        <Button onClick={exportarExcel} className="bg-green-700 text-white">
          Exportar Excel
        </Button>

        <Button onClick={exportarPDF} className="bg-red-700 text-white">
          Exportar PDF
        </Button>
      </div>

      {/* ============================
          TABLA
      ============================ */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">ID</th>

              <th className="border p-2">Cliente</th>

              <th className="border p-2">Fecha</th>

              <th className="border p-2">Total</th>

              <th className="border p-2">Estado</th>

              <th className="border p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {comprasArray.map((c) => {
              const siguienteEstado = obtenerSiguienteEstado(c.estado);

              return (
                <tr key={c.idCompra}>
                  {/* ID */}
                  <td className="border p-2">{c.idCompra}</td>

                  {/* CLIENTE */}
                  <td className="border p-2">
                    {c.cliente?.nombreCompleto || "Desconocido"}
                  </td>

                  {/* FECHA */}
                  <td className="border p-2">{c.fechaCompra}</td>

                  {/* TOTAL */}
                  <td className="border p-2">
                    S/ {Number(c.total || 0).toFixed(2)}
                  </td>

                  {/* ESTADO */}
                  <td className="border p-2">
                    <span className={colorEstado(c.estado)}>{c.estado}</span>
                  </td>

                  {/* ACCIONES */}
                  <td className="border p-2">
                    <div className="flex gap-2 flex-wrap">
                      {/* SIGUIENTE ESTADO */}
                      {siguienteEstado && (
                        <button
                          onClick={() =>
                            cambiarEstado(c.idCompra, siguienteEstado)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                          {textoSiguienteEstado(c.estado)}
                        </button>
                      )}

                      {/* CANCELAR */}
                      {c.estado !== "Cancelado" && c.estado !== "Entregado" && (
                        <button
                          onClick={() => {
                            const confirmar = window.confirm(
                              `Â¿Deseas cancelar la compra #${c.idCompra}?`,
                            );

                            if (confirmar) {
                              cambiarEstado(c.idCompra, "Cancelado");
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ============================
            VOLVER
        ============================ */}
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
    </div>
  );
}
