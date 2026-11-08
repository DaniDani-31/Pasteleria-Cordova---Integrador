"use client";
import { API } from "@/lib/api";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
interface Producto {
  idProducto: number;
  nombreProducto: string;
  descripcion: string;
  precio: number;
  stock: number;
  costoProduccion: number;
}

const imagenesProductos: Record<number, string> = {
  1: "/chocolate-cake-with-three-layers.jpg",
  2: "/vanilla-muffin-golden-brown.jpg",
  3: "/strawberry-cheesecake-with-fresh-strawberries.jpg",
  4: "/carrot-cake-slice-with-cream-cheese-frosting.jpg",
  5: "/brownie.jpg",
  6: "/cupcake red velvet.jpeg",
  7: "/pie de limon.webp",
  8: "/tiramisu.jpg",
  9: "/alfajores.webp",
  10: "/torta 3 leches.jpg",
  11: "/rollo de canela.jpg",
  12: "/galleticas.jpg",
};

export default function ProductosPage() {
  const { addToCart } = useCart();
  const router = useRouter();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProductos = async () => {
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
        console.error("Error al cargar productos:", err);
        setError(
          "No se pudieron cargar los productos. Verifica que el servidor estÃ© activo.",
        );
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Nuestros Productos
        </h1>

        {loading && (
          <p className="py-10 text-center text-gray-500">
            Cargando productos...
          </p>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-center text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && productos.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            No hay productos registrados actualmente.
          </p>
        )}

        {!loading && !error && productos.length > 0 && (
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {productos.map((producto) => {
              const imagen =
                imagenesProductos[Number(producto.idProducto)] ||
                "/placeholder.svg";

              const productoCarrito = {
                idProducto: producto.idProducto,
                name: producto.nombreProducto,
                description: producto.descripcion,
                price: `S/ ${Number(producto.precio).toFixed(2)}`,
                image: imagen,
              };

              return (
                <ProductCard
                  key={producto.idProducto}
                  idProducto={producto.idProducto}
                  name={producto.nombreProducto}
                  description={producto.descripcion}
                  price={`S/ ${Number(producto.precio).toFixed(2)}`}
                  image={imagen}
                  onAddToCart={() => addToCart({ ...productoCarrito })}
                />
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <Button
            onClick={() => router.push("/")}
            className="rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow-md transition hover:bg-accent"
          >
            Volver al Inicio
          </Button>
        </div>
      </main>
    </div>
  );
}




