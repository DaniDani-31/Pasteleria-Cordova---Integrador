"use client";

import { useSearchParams } from "next/navigation";

interface SeguimientoPedidoProps {
  estado: string;
}

const estados = [
  {
    id: "Pendiente",
    titulo: "Pedido recibido",
    descripcion: "Hemos recibido tu pedido.",
    icono: "📝",
  },
  {
    id: "Confirmado",
    titulo: "Pedido confirmado",
    descripcion: "La pastelería ha confirmado tu pedido.",
    icono: "✓",
  },
  {
    id: "Preparando",
    titulo: "En preparación",
    descripcion: "Estamos preparando tus productos.",
    icono: "👨‍🍳",
  },
  {
    id: "Listo",
    titulo: "Listo para entregar",
    descripcion: "Tu pedido está listo para ser entregado.",
    icono: "📦",
  },
  {
    id: "Entregado",
    titulo: "Pedido entregado",
    descripcion: "Tu pedido ha sido entregado. ¡Gracias por comprar!",
    icono: "🎉",
  },
];

export default function SeguimientoPedido() {
  const searchParams = useSearchParams();
  const estado = searchParams.get("estado") ?? "Pendiente";
  const estadoActual = estado?.trim().toLowerCase();

  const esCancelado = estadoActual === "cancelado";

  const indiceActual = estados.findIndex(
    (item) => item.id.toLowerCase() === estadoActual,
  );

  return (
    <div className="w-full">
      <h3 className="text-lg font-bold text-primary mb-5">
        📍 Seguimiento de tu pedido
      </h3>

      {esCancelado ? (
        <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center text-xl font-bold">
            ✕
          </div>

          <div>
            <p className="font-bold text-red-700">Pedido cancelado</p>

            <p className="text-sm text-red-600">
              Este pedido ha sido cancelado.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-3">
          <div className="min-w-[700px]">
            <div className="relative flex items-start justify-between">
              {/* Línea base */}

              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" />

              {/* Línea de progreso */}

              <div
                className="absolute top-5 left-0 h-1 bg-green-500 transition-all duration-500"
                style={{
                  width:
                    indiceActual <= 0 || indiceActual === -1
                      ? "0%"
                      : `${(indiceActual / (estados.length - 1)) * 100}%`,
                }}
              />

              {estados.map((item, index) => {
                const completado = indiceActual >= index && indiceActual !== -1;

                const actual = indiceActual === index;

                return (
                  <div
                    key={item.id}
                    className="relative z-10 flex flex-col items-center w-32"
                  >
                    {/* Círculo */}

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow ${
                        completado ? "bg-green-500" : "bg-gray-300"
                      } ${actual ? "ring-4 ring-green-100" : ""}`}
                    >
                      {completado ? "✓" : index + 1}
                    </div>

                    {/* Título */}

                    <p
                      className={`mt-3 text-sm text-center font-bold ${
                        actual
                          ? "text-green-600"
                          : completado
                            ? "text-gray-700"
                            : "text-gray-400"
                      }`}
                    >
                      {item.icono} {item.titulo}
                    </p>

                    {/* Descripción */}

                    <p
                      className={`text-xs text-center mt-1 ${
                        actual ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {item.descripcion}
                    </p>

                    {/* Estado actual */}

                    {actual && (
                      <span className="mt-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        Estado actual
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
