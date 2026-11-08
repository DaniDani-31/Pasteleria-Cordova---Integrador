"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const [usuario, setUsuario] = useState<any>(null);
  const [rol, setRol] = useState<string>("");

  const { clearCart } = useCart();

  // =====================================================
  // CARGAR USUARIO Y ROL
  // =====================================================

  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const storedUser = localStorage.getItem("usuario");
        const storedRole = localStorage.getItem("user_role");

        if (!storedUser) {
          setUsuario(null);
          setRol("");
          return;
        }

        const user = JSON.parse(storedUser);

        let rolNombre = "";

        // 1. Prioridad: user_role
        if (storedRole) {
          rolNombre = storedRole;
        }

        // 2. Si no existe user_role, revisar usuario.rol
        else if (typeof user.rol === "string") {
          rolNombre = user.rol;
        }

        // 3. Si rol viene como objeto
        else if (typeof user.rol === "object" && user.rol !== null) {
          rolNombre = user.rol.nombre_rol || "";
        }

        const rolDetectado = rolNombre.trim().toLowerCase();

        console.log("🔥 ROL DETECTADO (UserMenu):", rolDetectado);

        setUsuario(user);
        setRol(rolDetectado);
      } catch (error) {
        console.error("❌ Error leyendo usuario:", error);

        setUsuario(null);
        setRol("");
      }
    };

    // Cargar inicialmente
    cargarUsuario();

    // Escuchar cambios de sesión
    window.addEventListener("usuarioActualizado", cargarUsuario);

    return () => {
      window.removeEventListener("usuarioActualizado", cargarUsuario);
    };
  }, []);

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("user_role");

    clearCart(true);

    setUsuario(null);
    setRol("");

    router.push("/");
  };

  // =====================================================
  // NO MOSTRAR EN LOGIN NI REGISTRO
  // =====================================================

  if (pathname === "/login" || pathname === "/registro") {
    return null;
  }

  // =====================================================
  // ADMINISTRADOR
  // =====================================================

  if (rol === "administrador") {
    return (
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <h2 className="text-xl font-semibold text-primary">
          Panel del Administrador
        </h2>

        <div className="flex gap-3">
          <Link
            href="/editar-cuenta"
            className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            Editar Cuenta
          </Link>

          <Link
            href="/stock"
            className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            Stock
          </Link>

          <Link
            href="/compras-totales"
            className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            Compras Totales
          </Link>

          <Link
            href="/ventas-producto"
            className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            Ventas por Producto
          </Link>

          <Link
            href="/nuevo-admin"
            className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            Nuevo Admin
          </Link>

          <Link
            href="/recetas"
            className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
          >
            Gestión de Recetas
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // CLIENTE
  // =====================================================
  //
  // El cliente NO utiliza este menú.
  // Su interfaz normal permanece igual.
  // El ChatBotCliente se encargará de aparecer
  // únicamente para clientes.
  //

  return null;
}
