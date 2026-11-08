"use client";
import { API } from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ClienteDTO {
  idCliente: number;
  nombreCompleto: string;
  correo: string;
  // Solo necesitamos la contraseÃ±a para enviarla, no la recibimos del backend
  contrasena?: string | null;
}

export default function EditarCuentaPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<ClienteDTO | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  // Cargar datos del cliente
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) {
      setErrorMensaje(
        "No se encontrÃ³ sesiÃ³n activa. Redirigiendo a inicio de sesiÃ³n..."
      );
      setCargando(false);
      // Redirigir despuÃ©s de un breve retraso
      const timer = setTimeout(() => router.push("/login"), 3000);
      return () => clearTimeout(timer);
    }

    try {
      const user = JSON.parse(storedUser);
      const idCliente = user.idCliente || user.id;

      if (!idCliente) {
        setErrorMensaje(
          "No se pudo identificar al usuario. Vuelve a iniciar sesiÃ³n."
        );
        setCargando(false);
        return;
      }

      fetch(`${API}/clientes/${idCliente}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            const mensajeError =
              data?.mensaje ||
              `Error al obtener datos del cliente (CÃ³digo ${res.status})`;
            throw new Error(mensajeError);
          }
          return data;
        })
        .then((data) => {
          // Inicializar el campo contrasena como cadena vacÃ­a para el input
          setCliente({ ...data, contrasena: "" });
        })
        .catch((error) => {
          console.error("Error al cargar cliente:", error);
          setErrorMensaje(
            error.message || "Error al cargar los datos del cliente."
          );
        })
        .finally(() => setCargando(false));
    } catch (error: any) {
      console.error("Error al procesar el usuario del localStorage:", error);
      setErrorMensaje("Error al leer los datos del usuario.");
      setCargando(false);
    }
  }, [router]);

  // Manejar cambios en inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cliente) return;
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  // Guardar cambios
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !cliente.idCliente || guardando) return;

    setGuardando(true);

    try {
      const payload: Partial<ClienteDTO> = {
        nombreCompleto: cliente.nombreCompleto,
        correo: cliente.correo,
      };

      const nuevaContrasena = cliente.contrasena
        ? cliente.contrasena.trim()
        : "";

      if (nuevaContrasena !== "") {
        payload.contrasena = nuevaContrasena;
      }

      const res = await fetch(
        `${API}/clientes/${cliente.idCliente}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        const mensajeError = data?.mensaje || "Error al actualizar cliente";
        throw new Error(mensajeError);
      }

      // Actualizar localStorage con el nuevo nombre (si cambiÃ³)
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.nombreCompleto = cliente.nombreCompleto;
        localStorage.setItem("usuario", JSON.stringify(user));
      }

      alert("âœ… Datos actualizados correctamente.");

      // Limpiar el campo de contraseÃ±a en el estado despuÃ©s del Ã©xito
      setCliente((prev) => (prev ? { ...prev, contrasena: "" } : null));

      // RedirecciÃ³n al inicio
      router.push("/");
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      setErrorMensaje(error.message || "No se pudo actualizar la informaciÃ³n.");
    } finally {
      setGuardando(false);
    }
  };

  // Manejador para el botÃ³n de volver
  const handleVolver = () => {
    router.push("/");
  };

  // Render
  if (cargando)
    return <p className="text-center text-gray-500 mt-10">Cargando datos...</p>;
  if (errorMensaje)
    return <p className="text-center text-red-600 mt-10">{errorMensaje}</p>;
  if (!cliente)
    return (
      <p className="text-center mt-10">No se encontraron datos del cliente.</p>
    );

  return (
    // ðŸ†• CORRECCIÃ“N DE ESTILO: Eliminamos la altura mÃ­nima forzada
    // (min-h-[...]) para acercar el formulario al footer.
    <div className="flex justify-center items-start pt-10">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Editar Cuenta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombreCompleto"
              value={cliente.nombreCompleto || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Correo
            </label>
            <input
              type="email"
              name="correo"
              value={cliente.correo || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Nueva ContraseÃ±a (opcional)
            </label>
            <input
              type="password"
              name="contrasena"
              placeholder="Dejar vacÃ­o para no cambiar"
              value={cliente.contrasena || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>

        {/* BotÃ³n de volver al inicio */}
        <button
          onClick={handleVolver}
          className="w-full mt-3 bg-gray-400 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 transition"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}

