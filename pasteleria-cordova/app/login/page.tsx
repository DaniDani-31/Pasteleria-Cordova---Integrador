"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/clientes/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password,
        }),
      });

      if (!response.ok) {
        toast({
          title: "Error",
          description: "Correo o contraseña incorrectos ❌",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      const usuario = data.usuario || data;

      console.log("LOGIN - usuario recibido:", usuario);
      console.log("LOGIN - rol recibido:", usuario?.rol);

      if (!usuario || !usuario.nombreCompleto) {
        toast({
          title: "Error",
          description: data.mensaje || "Datos de usuario inválidos ❌",
          variant: "destructive",
        });
        return;
      }

      // =====================================================
      // OBTENER EL ROL
      // El backend puede devolver:
      // rol: "Administrador"
      // o:
      // rol: { nombre_rol: "Administrador" }
      // =====================================================

      let rolNombre = "";

      if (typeof usuario.rol === "string") {
        rolNombre = usuario.rol;
      } else if (usuario.rol?.nombre_rol) {
        rolNombre = usuario.rol.nombre_rol;
      }

      console.log("LOGIN - nombre del rol:", rolNombre);

      if (!rolNombre) {
        console.error("LOGIN - No se pudo determinar el rol del usuario.");

        toast({
          title: "Error",
          description: "No se pudo determinar el rol del usuario ❌",
          variant: "destructive",
        });

        return;
      }

      // Normalizamos el rol para las validaciones
      const rolNormalizado = rolNombre.trim();

      // =====================================================
      // GUARDAR ROL
      // =====================================================

      localStorage.setItem("user_role", rolNormalizado);

      // =====================================================
      // GUARDAR USUARIO
      // =====================================================

      localStorage.setItem(
        "usuario",
        JSON.stringify({
          idCliente: usuario.idCliente,
          nombreCompleto: usuario.nombreCompleto,
          correo: usuario.correo,
          rol: rolNormalizado,
        }),
      );

      console.log("LOGIN - usuario guardado:", localStorage.getItem("usuario"));

      console.log("LOGIN - rol guardado:", localStorage.getItem("user_role"));

      // Avisar al resto de componentes
      window.dispatchEvent(new Event("usuarioActualizado"));

      toast({
        title: "Inicio de sesión exitoso ✅",
        description: `Bienvenido ${usuario.nombreCompleto}`,
      });

      // =====================================================
      // REDIRECCIÓN SEGÚN EL ROL
      // =====================================================

      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Error en el login:", error);

      toast({
        title: "Error de conexión ⚠️",
        description: "No se pudo conectar con el servidor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md border-4 border-muted shadow-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl font-bold text-foreground">
            INICIO DE SESIÓN
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CORREO */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico:</Label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* CONTRASEÑA */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña:</Label>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* INICIAR SESIÓN */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-6 text-lg"
            >
              Iniciar Sesión
            </Button>

            {/* REGISTRO */}
            <Link href="/registro">
              <Button
                type="button"
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10 bg-transparent"
              >
                Registrarse
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
