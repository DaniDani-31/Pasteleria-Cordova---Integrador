"use client";
import { API } from "@/lib/api";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Producto {
  idProducto: number;
  nombreProducto: string;
  descripcion: string;
  precio: number;
  stock: number;
  fechaCreacion?: string;
  costoProduccion?: number;
}

interface ProductoForm {
  nombreProducto: string;
  descripcion: string;
  precio: string;
  stock: string;
}

const formularioInicial: ProductoForm = {
  nombreProducto: "",
  descripcion: "",
  precio: "",
  stock: "0",
};

export default function AdministrarProductosPage() {
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [formulario, setFormulario] = useState<ProductoForm>(formularioInicial);

  const [productoEditar, setProductoEditar] = useState<number | null>(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // ==========================================
  // LISTAR PRODUCTOS
  // ==========================================
  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/productos`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los productos.");
      }

      const data: Producto[] = await response.json();

      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Error al conectar con el servidor.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // ==========================================
  // CAMBIAR CAMPOS DEL FORMULARIO
  // ==========================================
  const actualizarCampo = (campo: keyof ProductoForm, valor: string) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  };

  // ==========================================
  // ABRIR REGISTRO
  // ==========================================
  const nuevoProducto = () => {
    setFormulario({
      ...formularioInicial,
    });

    setProductoEditar(null);
    setError("");
    setMensaje("");
    setMostrarFormulario(true);
  };

  // ==========================================
  // ABRIR EDICIÃ“N
  // ==========================================
  const editarProducto = (producto: Producto) => {
    setFormulario({
      nombreProducto: producto.nombreProducto,
      descripcion: producto.descripcion || "",
      precio: String(producto.precio),
      stock: String(producto.stock),
    });

    setProductoEditar(producto.idProducto);
    setError("");
    setMensaje("");
    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CERRAR FORMULARIO
  // ==========================================
  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProductoEditar(null);
    setFormulario({ ...formularioInicial });
    setError("");
  };

  // ==========================================
  // REGISTRAR / ACTUALIZAR PRODUCTO
  // ==========================================
  const guardarProducto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setMensaje("");

    const nombre = formulario.nombreProducto.trim();
    const precio = Number(formulario.precio);
    const stock = Number(formulario.stock);

    if (!nombre) {
      setError("Ingresa el nombre del producto.");
      return;
    }

    if (!Number.isFinite(precio) || precio <= 0) {
      setError("El precio debe ser mayor a cero.");
      return;
    }

    if (
      formulario.stock.trim() === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError("Ingresa un stock inicial vÃ¡lido (entero y no negativo).");
      return;
    }

    const payload = {
      nombreProducto: nombre,
      descripcion: formulario.descripcion.trim(),
      precio,
      stock,
    };

    try {
      setGuardando(true);

      const editando = productoEditar !== null;

      const url = editando
        ? `${API}/productos/${productoEditar}`
        : `${API}/productos`;

      const response = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const detalle = await response.text();

        throw new Error(detalle || "No se pudo guardar el producto.");
      }

      const productoGuardado: Producto = await response.json();

      await cargarProductos();

      cerrarFormulario();

      setMensaje(
        editando
          ? "Producto actualizado correctamente."
          : `Producto "${productoGuardado.nombreProducto}" registrado correctamente.`,
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "OcurriÃ³ un error al guardar el producto.",
      );
    } finally {
      setGuardando(false);
    }
  };

  // ==========================================
  // FILTRAR PRODUCTOS
  // ==========================================
  const productosFiltrados = productos.filter((producto) =>
    producto.nombreProducto
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase()),
  );

  // ==========================================
  // INTERFAZ
  // ==========================================
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f9f0dd" }}>
      {/* ENCABEZADO */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gestion de Productos
          </h1>

          <p className="mt-1 text-gray-600">
            Administra los productos de Pastelerias Cordova.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-gray-600 px-5 py-2.5 font-semibold text-white hover:bg-gray-700"
          >
            Volver al inicio
          </button>

          <button
            onClick={nuevoProducto}
            className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800"
          >
            Nuevo producto
          </button>

          <button
            onClick={cargarProductos}
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
          onSubmit={guardarProducto}
          className="mb-7 rounded-xl bg-white p-6 shadow"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {productoEditar !== null
                ? "Editar producto"
                : "Registrar nuevo producto"}
            </h2>

            <button
              type="button"
              onClick={cerrarFormulario}
              className="text-gray-500 hover:text-red-600"
            >
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Nombre del producto
              </label>

              <input
                value={formulario.nombreProducto}
                onChange={(e) =>
                  actualizarCampo("nombreProducto", e.target.value)
                }
                placeholder="Ejemplo: xxxxx"
                required
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Precio de venta (S/)
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formulario.precio}
                onChange={(e) => actualizarCampo("precio", e.target.value)}
                placeholder="Ejemplo: #.##"
                required
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-semibold text-gray-700">
                Descripcion
              </label>

              <textarea
                value={formulario.descripcion}
                onChange={(e) => actualizarCampo("descripcion", e.target.value)}
                placeholder="Describe las caracterÃ­sticas del producto..."
                rows={3}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Stock inicial
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={formulario.stock}
                onChange={(e) => actualizarCampo("stock", e.target.value)}
                required
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={cerrarFormulario}
              className="rounded-lg border px-5 py-2.5 hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-amber-700 px-6 py-2.5 font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : productoEditar !== null
                  ? "Actualizar producto"
                  : "Guardar producto"}
            </button>
          </div>
        </form>
      )}

      {/* RESUMEN */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Productos registrados</p>

          <p className="mt-2 text-3xl font-bold text-amber-700">
            {productos.length}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Unidades en inventario</p>

          <p className="mt-2 text-3xl font-bold text-green-700">
            {productos.reduce(
              (total, producto) => total + Number(producto.stock || 0),
              0,
            )}
          </p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow">
        <label className="mb-2 block font-semibold text-gray-700">
          Buscar producto
        </label>

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto rounded-xl bg-white shadow">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Cargando productos...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-4">ID</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Costo de produccion</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productosFiltrados.map((producto) => (
                <tr
                  key={producto.idProducto}
                  className="border-b hover:bg-amber-50"
                >
                  <td className="p-4 font-semibold">{producto.idProducto}</td>

                  <td className="p-4">
                    <p className="font-semibold text-gray-800">
                      {producto.nombreProducto}
                    </p>

                    <p className="mt-1 max-w-xs text-xs text-gray-500">
                      {producto.descripcion}
                    </p>
                  </td>

                  <td className="p-4 font-semibold">
                    S/ {Number(producto.precio).toFixed(2)}
                  </td>

                  <td className="p-4">{producto.stock}</td>

                  <td className="p-4 font-semibold text-green-700">
                    S/ {Number(producto.costoProduccion || 0).toFixed(2)}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => editarProducto(producto)}
                      className="rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-800 hover:bg-blue-200"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}

              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
