"use client";
import { API } from "@/lib/api";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API}/clientes/registrar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombreCompleto: nombre,
            correo: email,
            contrasena: password,
          }),
        }
      );

      // Intentar parsear la respuesta en formato JSON, aunque sea error
      let data: any;
      try {
        data = await response.json();
      } catch {
        data = { mensaje: "Respuesta no vÃ¡lida del servidor" };
      }

      if (response.ok) {
        alert(data.mensaje || "Registro exitoso âœ…");
        router.push("/login");
      } else {
        alert(data.mensaje || "Error al registrar âŒ");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      alert("Error al conectar con el servidor âš ï¸");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md border-4 border-muted shadow-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl font-bold text-foreground">
            REGISTRO DE CLIENTE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo:</Label>
              <Input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo ElectrÃ³nico:</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">ContraseÃ±a:</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-6 text-lg"
            >
              Registrarse
            </Button>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
              >
                Volver al Login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

