"use client";
import { API } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NuevoAdminPage() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      // EL ROL 1 SE ASIGNA AUTOMATICAMENTE EN EL BACKEND
      const nuevoAdmin = {
        nombreCompleto,
        correo,
        contrasena,
      };

      const res = await fetch(`${API}/clientes/registrar-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoAdmin),
      });

      if (!res.ok) {
        // Intentar leer el mensaje de error que envÃ­a Spring Boot
        let data;
        try {
          data = await res.json();
        } catch {
          data = { mensaje: "Error al registrar administrador" };
        }
        throw new Error(data.mensaje || "Error al registrar administrador");
      }

      setMensaje("Administrador creado correctamente âœ”ï¸");
      setNombreCompleto("");
      setCorreo("");
      setContrasena("");

      // Opcional: Redirigir a lista de admins o dashboard
      // router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen p-6"
      style={{ backgroundColor: "#f9f0dd" }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Registrar Nuevo Administrador
        </h2>

        {mensaje && (
          <p className="text-green-600 text-center mb-4">{mensaje}</p>
        )}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nombre Completo</label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Crear Administrador
          </button>
        </form>

        {/* Botón Volver al inicio */}
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
