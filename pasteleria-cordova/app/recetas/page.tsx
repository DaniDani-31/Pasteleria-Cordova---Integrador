"use client";
import { API } from "@/lib/api";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Ingrediente {
  idInsumo: number;
  nombreInsumo: string;
  cantidad: number;
  unidadMedida: string;
  costoUnitario: number;
  subtotal: number;
}

interface Receta {
  idReceta: number;
  idProducto: number;
  nombreProducto: string;
  nombreReceta: string;
  rendimiento: number;
  ingredientes: Ingrediente[];
  costoTotal: number;
  costoPorUnidad: number;
}

interface Producto {
  idProducto: number;
  nombreProducto: string;
}

interface Insumo {
  idInsumo: number;
  nombreInsumo: string;
  unidadMedida: string;
  stock: number;
  costoUnitario: number;
}

interface IngredienteForm {
  idInsumo: string;
  cantidad: string;
  unidadMedida: string;
}

export default function RecetasPage() {
  const router = useRouter();

  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(
    null,
  );

  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idRecetaEditar, setIdRecetaEditar] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [idProducto, setIdProducto] = useState("");
  const [nombreReceta, setNombreReceta] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [ingredientesForm, setIngredientesForm] = useState<IngredienteForm[]>([
    { idInsumo: "", cantidad: "", unidadMedida: "" },
  ]);

  // ==========================================
  // CARGAR RECETAS
  // ==========================================
  const cargarRecetas = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/recetas`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar las recetas.");
      }

      const data: Receta[] = await response.json();

      setRecetas(Array.isArray(data) ? data : []);

      // Mantener actualizada la receta seleccionada.
      setRecetaSeleccionada((actual) => {
        if (!actual) return null;

        return (
          data.find(
            (receta) => Number(receta.idReceta) === Number(actual.idReceta),
          ) ?? null
        );
      });
    } catch (err) {
      console.error("Error al cargar recetas:", err);
      setError("No se pudo conectar con el servidor de recetas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarRecetas();
  }, [cargarRecetas]);

  // ==========================================
  // CARGAR PRODUCTOS E INSUMOS
  // ==========================================
  const cargarDatosFormulario = async () => {
    const [productosResponse, insumosResponse] = await Promise.all([
      fetch(`${API}/productos`, { cache: "no-store" }),
      fetch(`${API}/insumos`, { cache: "no-store" }),
    ]);

    if (!productosResponse.ok || !insumosResponse.ok) {
      throw new Error("No se pudieron cargar los productos e insumos.");
    }

    const productosData: Producto[] = await productosResponse.json();
    const insumosData: Insumo[] = await insumosResponse.json();

    setProductos(Array.isArray(productosData) ? productosData : []);
    setInsumos(Array.isArray(insumosData) ? insumosData : []);

    return {
      productosData,
      insumosData,
    };
  };

  // ==========================================
  // ABRIR FORMULARIO PARA NUEVA RECETA
  // ==========================================
  const abrirFormulario = async () => {
    try {
      setCargandoFormulario(true);
      setError("");
      setMensaje("");

      await cargarDatosFormulario();

      setModoEdicion(false);
      setIdRecetaEditar(null);
      setIdProducto("");
      setNombreReceta("");
      setDescripcion("");
      setIngredientesForm([{ idInsumo: "", cantidad: "", unidadMedida: "" }]);

      setMostrarFormulario(true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar los productos e insumos.",
      );
    } finally {
      setCargandoFormulario(false);
    }
  };

  // ==========================================
  // EDITAR RECETA EXISTENTE
  // ==========================================
  const editarReceta = async (receta: Receta) => {
    try {
      setCargandoFormulario(true);
      setError("");
      setMensaje("");

      await cargarDatosFormulario();

      setModoEdicion(true);
      setIdRecetaEditar(Number(receta.idReceta));
      setIdProducto(String(receta.idProducto));
      setNombreReceta(receta.nombreReceta);
      setDescripcion("");

      setIngredientesForm(
        receta.ingredientes.map((ingrediente) => ({
          idInsumo: String(ingrediente.idInsumo),
          cantidad: String(ingrediente.cantidad),
          unidadMedida: ingrediente.unidadMedida,
        })),
      );

      setMostrarFormulario(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la informaciÃ³n para editar.");
    } finally {
      setCargandoFormulario(false);
    }
  };

  // ==========================================
  // PRODUCTOS DISPONIBLES
  // ==========================================
  const productosDisponibles = useMemo(() => {
    return productos.filter((producto) => {
      const productoId = Number(producto.idProducto);

      // En ediciÃ³n, permitir el producto de la receta actual.
      if (modoEdicion) {
        return productoId === Number(idProducto);
      }

      // En registro, excluir productos que ya tienen receta.
      return !recetas.some(
        (receta) => Number(receta.idProducto) === productoId,
      );
    });
  }, [productos, recetas, modoEdicion, idProducto]);

  // ==========================================
  // FILTRAR RECETAS
  // ==========================================
  const recetasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return recetas.filter((receta) =>
      (receta.nombreProducto || "").toLowerCase().includes(termino),
    );
  }, [recetas, busqueda]);

  // ==========================================
  // FORMATO DE MONEDA
  // ==========================================
  const formatoMoneda = (valor: number) =>
    `S/ ${Number(valor || 0).toFixed(2)}`;

  // ==========================================
  // ACTUALIZAR INGREDIENTE
  // ==========================================
  const actualizarIngrediente = (
    index: number,
    campo: keyof IngredienteForm,
    valor: string,
  ) => {
    setIngredientesForm((actuales) =>
      actuales.map((ingrediente, i) => {
        if (i !== index) return ingrediente;

        if (campo === "idInsumo") {
          const insumo = insumos.find(
            (item) => Number(item.idInsumo) === Number(valor),
          );

          return {
            ...ingrediente,
            idInsumo: valor,
            unidadMedida: insumo?.unidadMedida || "",
          };
        }

        return {
          ...ingrediente,
          [campo]: valor,
        };
      }),
    );
  };

  // ==========================================
  // AGREGAR INGREDIENTE
  // ==========================================
  const agregarIngrediente = () => {
    setIngredientesForm((actuales) => [
      ...actuales,
      { idInsumo: "", cantidad: "", unidadMedida: "" },
    ]);
  };

  // ==========================================
  // ELIMINAR INGREDIENTE
  // ==========================================
  const eliminarIngrediente = (index: number) => {
    setIngredientesForm((actuales) => actuales.filter((_, i) => i !== index));
  };

  // ==========================================
  // LIMPIAR FORMULARIO
  // ==========================================
  const limpiarFormulario = () => {
    setIdProducto("");
    setNombreReceta("");
    setDescripcion("");
    setIngredientesForm([{ idInsumo: "", cantidad: "", unidadMedida: "" }]);

    setModoEdicion(false);
    setIdRecetaEditar(null);
    setMostrarFormulario(false);
  };

  // ==========================================
  // GUARDAR O ACTUALIZAR RECETA
  // ==========================================
  const guardarReceta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!idProducto || !nombreReceta.trim()) {
      setError("Selecciona un producto e ingresa el nombre de la receta.");
      return;
    }

    if (ingredientesForm.length === 0) {
      setError("Agrega al menos un ingrediente.");
      return;
    }

    const ingredientesValidos = ingredientesForm.every(
      (item) =>
        item.idInsumo.trim() !== "" &&
        Number.isFinite(Number(item.cantidad)) &&
        Number(item.cantidad) > 0 &&
        item.unidadMedida.trim() !== "",
    );

    if (!ingredientesValidos) {
      setError("Completa correctamente todos los ingredientes y cantidades.");
      return;
    }

    const ids = ingredientesForm.map((item) => Number(item.idInsumo));

    if (new Set(ids).size !== ids.length) {
      setError("No puedes repetir un mismo ingrediente en la receta.");
      return;
    }

    // VerificaciÃ³n adicional en el frontend.
    // No permite registrar otra receta para el mismo producto.
    if (!modoEdicion) {
      const yaTieneReceta = recetas.some(
        (receta) => Number(receta.idProducto) === Number(idProducto),
      );

      if (yaTieneReceta) {
        setError("Este producto ya tiene una receta registrada.");
        return;
      }
    }

    if (modoEdicion && idRecetaEditar === null) {
      setError("No se identificÃ³ la receta que deseas actualizar.");
      return;
    }

    const payload = {
      idProducto: Number(idProducto),
      nombreReceta: nombreReceta.trim(),
      descripcion: descripcion.trim(),
      ingredientes: ingredientesForm.map((item) => ({
        idInsumo: Number(item.idInsumo),
        cantidad: Number(item.cantidad),
        unidadMedida: item.unidadMedida,
      })),
    };

    try {
      setGuardando(true);

      const editando = modoEdicion;

      const url = editando
        ? `${API}/recetas/${idRecetaEditar}`
        : `${API}/recetas`;

      const response = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detalle = await response.text();

        throw new Error(detalle || "No se pudo guardar la receta.");
      }

      const recetaGuardada: Receta = await response.json();

      // Cerrar el formulario y actualizar el listado.
      limpiarFormulario();
      await cargarRecetas();

      setRecetaSeleccionada(recetaGuardada);

      setMensaje(
        editando
          ? "Â¡Receta actualizada correctamente!"
          : "Â¡Receta registrada correctamente!",
      );
    } catch (err) {
      console.error("Error al guardar receta:", err);

      setError(
        err instanceof Error
          ? err.message
          : "OcurriÃ³ un error al guardar la receta.",
      );
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // PANTALLA DE CARGA
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: "#f9f0dd" }}>
        Cargando recetas...
      </div>
    );
  }

  // ==========================================
  // INTERFAZ PRINCIPAL
  // ==========================================
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f9f0dd" }}>
      {/* ENCABEZADO */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestion de Recetas
          </h1>

          <p className="mt-1 text-gray-600">
            Consulta las recetas, ingredientes y costos de produccion.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-gray-600 px-5 py-2.5 font-semibold text-white hover:bg-gray-700"
          >
            Volver al Inicio
          </button>

          <button
            onClick={abrirFormulario}
            disabled={cargandoFormulario}
            className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-50"
          >
            {cargandoFormulario ? "Cargando..." : " Nueva Receta"}
          </button>

          <button
            onClick={cargarRecetas}
            disabled={loading}
            className="rounded-lg bg-amber-700 px-5 py-2.5 font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="mb-5 rounded-lg border border-green-300 bg-green-50 p-4 text-green-700">
          {mensaje}
        </div>
      )}

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <form
          onSubmit={guardarReceta}
          className="mb-7 rounded-xl bg-white p-6 shadow"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {modoEdicion ? "Editar receta" : "Registrar nueva receta"}
            </h2>

            <button
              type="button"
              onClick={limpiarFormulario}
              className="text-gray-500 hover:text-red-600"
            >
              Cerrar
            </button>
          </div>

          {/* PRODUCTO Y NOMBRE */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Producto
              </label>

              <select
                value={idProducto}
                disabled={modoEdicion}
                onChange={(e) => {
                  const producto = productos.find(
                    (item) =>
                      Number(item.idProducto) === Number(e.target.value),
                  );

                  setIdProducto(e.target.value);
                  setNombreReceta(producto?.nombreProducto || "");
                }}
                required
                className="w-full rounded-lg border p-3 disabled:bg-gray-100"
              >
                <option value="">Seleccionar producto</option>

                {productosDisponibles.map((producto) => (
                  <option key={producto.idProducto} value={producto.idProducto}>
                    {producto.nombreProducto}
                  </option>
                ))}
              </select>

              {!modoEdicion &&
                productos.length > 0 &&
                productosDisponibles.length === 0 && (
                  <p className="mt-1 text-sm text-amber-700">
                    Todos los productos registrados ya tienen una receta. Puedes
                    seleccionar una receta existente para editarla.
                  </p>
                )}

              {modoEdicion && (
                <p className="mt-1 text-sm text-gray-500">
                  El producto asociado no se puede cambiar al editar la receta.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Nombre de la receta
              </label>

              <input
                value={nombreReceta}
                onChange={(e) => setNombreReceta(e.target.value)}
                required
                placeholder="Nombre de la receta"
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          {/* DESCRIPCIÃ“N */}
          <div className="mb-5">
            <label className="mb-2 block font-semibold text-gray-700">
              Descripcion
            </label>

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="DescripciÃ³n de la preparaciÃ³n..."
              rows={2}
              className="w-full rounded-lg border p-3"
            />
          </div>

          {/* INGREDIENTES */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Ingredientes</h3>

            <button
              type="button"
              onClick={agregarIngrediente}
              className="rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-800 hover:bg-blue-200"
            >
              Agregar ingrediente
            </button>
          </div>

          <div className="space-y-3">
            {ingredientesForm.map((ingrediente, index) => (
              <div
                key={index}
                className="grid grid-cols-1 items-end gap-3 rounded-lg border p-3 md:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Insumo
                  </label>

                  <select
                    value={ingrediente.idInsumo}
                    onChange={(e) =>
                      actualizarIngrediente(index, "idInsumo", e.target.value)
                    }
                    required
                    className="w-full rounded-lg border p-2.5"
                  >
                    <option value="">Seleccionar insumo</option>

                    {insumos.map((insumo) => (
                      <option key={insumo.idInsumo} value={insumo.idInsumo}>
                        {insumo.nombreInsumo} â€” Stock: {insumo.stock}{" "}
                        {insumo.unidadMedida}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Cantidad
                  </label>

                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={ingrediente.cantidad}
                    onChange={(e) =>
                      actualizarIngrediente(index, "cantidad", e.target.value)
                    }
                    required
                    placeholder="0.000"
                    className="w-full rounded-lg border p-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Unidad
                  </label>

                  <input
                    value={ingrediente.unidadMedida}
                    readOnly
                    placeholder="AutomÃ¡tica"
                    className="w-full rounded-lg border bg-gray-100 p-2.5"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => eliminarIngrediente(index)}
                  disabled={ingredientesForm.length === 1}
                  className="rounded-lg bg-red-100 px-4 py-2.5 text-red-700 hover:bg-red-200 disabled:opacity-40"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          {/* BOTONES DEL FORMULARIO */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={limpiarFormulario}
              className="rounded-lg border px-5 py-2.5 hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                guardando || (!modoEdicion && productosDisponibles.length === 0)
              }
              className="rounded-lg bg-amber-700 px-6 py-2.5 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : modoEdicion
                  ? "Actualizar receta"
                  : "Guardar receta"}
            </button>
          </div>
        </form>
      )}

      {/* TARJETAS DE RESUMEN */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Recetas registradas</p>

          <p className="mt-2 text-3xl font-bold text-amber-700">
            {recetas.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Ingredientes utilizados</p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            {
              new Set(
                recetas.flatMap((receta) =>
                  receta.ingredientes.map((item) => Number(item.idInsumo)),
                ),
              ).size
            }
          </p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <label className="mb-2 block font-semibold text-gray-700">
          Buscar receta por producto
        </label>

        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Ejemplo: Torta de Chocolate..."
          className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-amber-600"
        />
      </div>

      {/* LISTADO Y DETALLE */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            Listado de recetas ({recetasFiltradas.length})
          </h2>

          {recetasFiltradas.map((receta) => (
            <button
              key={receta.idReceta}
              onClick={() => setRecetaSeleccionada(receta)}
              className={`w-full rounded-xl border bg-white p-5 text-left shadow transition hover:border-amber-500 ${
                Number(recetaSeleccionada?.idReceta) === Number(receta.idReceta)
                  ? "border-amber-600 ring-2 ring-amber-200"
                  : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">
                    Producto #{receta.idProducto}
                  </p>

                  <h3 className="text-lg font-bold text-gray-800">
                    {receta.nombreProducto}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {receta.ingredientes.length} ingredientes Rendimiento:{" "}
                    {receta.rendimiento} unidad
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">Costo unitario</p>

                  <p className="text-xl font-bold text-green-700">
                    {formatoMoneda(receta.costoPorUnidad)}
                  </p>
                </div>
              </div>
            </button>
          ))}

          {recetasFiltradas.length === 0 && (
            <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow">
              No se encontraron recetas.
            </div>
          )}
        </div>

        {/* DETALLE DE RECETA */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Detalle de la receta
          </h2>

          {recetaSeleccionada ? (
            <div className="rounded-xl bg-white p-5 shadow">
              <h3 className="text-2xl font-bold text-gray-800">
                {recetaSeleccionada.nombreReceta}
              </h3>

              <button
                onClick={() => editarReceta(recetaSeleccionada)}
                disabled={cargandoFormulario}
                className="mb-4 mt-3 rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
              >
                Editar receta
              </button>

              <p className="mb-4 mt-1 text-sm text-gray-500">
                {recetaSeleccionada.nombreProducto}
              </p>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-xs text-gray-500">Costo total</p>

                  <p className="text-xl font-bold text-amber-800">
                    {formatoMoneda(recetaSeleccionada.costoTotal)}
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-xs text-gray-500">Costo por unidad</p>

                  <p className="text-xl font-bold text-green-800">
                    {formatoMoneda(recetaSeleccionada.costoPorUnidad)}
                  </p>
                </div>
              </div>

              <h4 className="mb-3 font-bold text-gray-800">
                Ingredientes utilizados
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2">Ingrediente</th>
                      <th className="p-2">Cantidad</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recetaSeleccionada.ingredientes.map((ingrediente) => (
                      <tr key={ingrediente.idInsumo} className="border-b">
                        <td className="p-2 font-medium">
                          {ingrediente.nombreInsumo}
                        </td>

                        <td className="p-2">
                          {ingrediente.cantidad} {ingrediente.unidadMedida}
                        </td>

                        <td className="p-2 text-right font-semibold">
                          {formatoMoneda(ingrediente.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={2} className="p-3">
                        Total
                      </td>

                      <td className="p-3 text-right text-green-700">
                        {formatoMoneda(recetaSeleccionada.costoTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow">
              <p className="text-4xl"></p>

              <p className="mt-3 font-semibold">
                Selecciona una receta del listado
              </p>

              <p className="mt-1 text-sm">
                Aqui podras consultar sus ingredientes y costos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
