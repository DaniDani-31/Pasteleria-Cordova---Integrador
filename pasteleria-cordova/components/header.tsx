"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [rol, setRol] = useState<"admin" | "cliente" | "">("");
  const [mounted, setMounted] = useState(false);
  const { totalItems, clearCart } = useCart();

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem("usuario");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const backendRol = user.rol?.toLowerCase().trim();

        if (backendRol === "administrador") {
          setRol("admin");
        } else {
          setRol("cliente");
        }

        setUsuario(user);
      } catch (error) {
        console.error("Error al recuperar el usuario:", error);
        localStorage.removeItem("usuario");
      }
    }

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("usuario");

      if (updatedUser) {
        try {
          const user = JSON.parse(updatedUser);
          setUsuario(user);
          setRol(
            user.rol?.toLowerCase().trim() === "administrador"
              ? "admin"
              : "cliente",
          );
        } catch {
          setUsuario(null);
          setRol("");
        }
      } else {
        setUsuario(null);
        setRol("");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    } else {
      router.push(`/#${id}`);
      setMenuOpen(false);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    clearCart(true);
    setUsuario(null);
    setRol("");
    setMenuUsuarioAbierto(false);
    router.push("/login");
  };

  const navegar = (ruta: string) => {
    router.push(ruta);
    setMenuUsuarioAbierto(false);
    setMenuOpen(false);
  };

  if (!mounted) return null;

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1
          onClick={() => scrollToSection("inicio")}
          className="text-2xl font-bold text-primary cursor-pointer"
        >
          Pastelerías Córdova
        </h1>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden md:flex space-x-8">
          {[
            "inicio",
            "sobre-nosotros",
            "productos",
            "contacto",
            "clientes",
            "locales",
          ].map((id) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              {id.toUpperCase().replace("-", " ")}
            </button>
          ))}
        </nav>

        {/* ICONOS USUARIO Y CARRITO */}
        <div className="flex items-center space-x-4 relative">
          {/* CARRITO SOLO PARA CLIENTES */}
          {usuario && rol === "cliente" && (
            <div className="relative">
              <button
                onClick={() => navegar("/carrito")}
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors relative"
              >
                <ShoppingCart className="w-6 h-6" />

                <span className="hidden sm:inline text-sm font-medium">
                  Carrito
                </span>
              </button>

              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                  {totalItems}
                </span>
              )}
            </div>
          )}

          {/* USUARIO */}
          {usuario ? (
            <div className="relative">
              <button
                onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
              >
                <User className="w-6 h-6" />

                <span className="hidden sm:inline text-sm font-medium">
                  Hola, {usuario.nombreCompleto}
                </span>
              </button>

              {menuUsuarioAbierto && (
                <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg z-50 py-1">
                  {/* MENÚ CLIENTE */}
                  {rol === "cliente" && (
                    <>
                      <button
                        onClick={() => navegar("/editar-cuenta")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        ✏️ Editar cuenta
                      </button>

                      <button
                        onClick={() => navegar("/historial")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        🧾 Historial de compras
                      </button>
                    </>
                  )}

                  {/* MENÚ ADMINISTRADOR */}
                  {rol === "admin" && (
                    <>
                      <button
                        onClick={() => navegar("/editar-cuenta")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        ✏️ Editar Cuenta
                      </button>

                      <button
                        onClick={() => navegar("/stock")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        📦 Stock
                      </button>

                      <button
                        onClick={() => navegar("/recetas")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        📖 Gestión de Recetas
                      </button>

                      {/* NUEVO BOTÓN: GESTIÓN DE PRODUCTOS */}
                      <button
                        onClick={() => navegar("/admin/productos")}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 text-gray-700"
                      >
                        🆕 Nuevo Producto
                      </button>

                      <button
                        onClick={() => navegar("/compras-totales")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        💰 Compras Totales
                      </button>

                      <button
                        onClick={() => navegar("/ventas-producto")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        📊 Ventas por Producto
                      </button>

                      <button
                        onClick={() => navegar("/nuevo-admin")}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        👤 Nuevo Admin
                      </button>
                    </>
                  )}

                  {/* CERRAR SESIÓN */}
                  <button
                    onClick={handleCerrarSesion}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navegar("/login")}
              className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
            >
              <User className="w-6 h-6" />

              <span className="hidden sm:inline text-sm font-medium">
                Iniciar Sesión
              </span>
            </button>
          )}

          {/* MENÚ MÓVIL */}
          <button
            className="md:hidden text-gray-700 hover:text-primary transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* NAVEGACIÓN MÓVIL */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="flex flex-col space-y-3 p-4">
            {[
              "inicio",
              "sobre-nosotros",
              "productos",
              "contacto",
              "clientes",
              "locales",
            ].map((id) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className="text-gray-700 hover:text-primary transition-colors text-left"
              >
                {id.toUpperCase().replace("-", " ")}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
