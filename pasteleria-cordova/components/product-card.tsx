"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/context/CartContext";
import toast from "react-hot-toast"; // ✅ Importamos toast

interface ProductCardProps {
  idProducto: number;
  name: string;
  description: string;
  price: string;
  image: string;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({
  idProducto,
  name,
  description,
  price,
  image,
  onAddToCart,
}: ProductCardProps) {
  const handleAddToCart = () => {
    onAddToCart({ idProducto, name, description, price, image });
    toast.success("Producto agregado exitosamente 🎉"); // ✅ Mostramos la alerta aquí
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-border bg-card">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg font-bold text-foreground">
          {name}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-center pb-2">
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2">
        <p className="text-xl font-bold text-primary">{price}</p>
        <Button onClick={handleAddToCart}>Agregar al Carrito</Button>
      </CardFooter>
    </Card>
  );
}
