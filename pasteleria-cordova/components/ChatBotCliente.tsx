"use client";

import { useEffect, useState } from "react";

interface Mensaje {
  tipo: "bot" | "cliente";
  texto: string;
}

interface Producto {
  idProducto: number;
  nombreProducto: string;
  descripcion: string;
  precio: number;
  stock: number;
  fechaCreacion: string;
}

export default function ChatbotCliente() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      tipo: "bot",
      texto:
        "¡Hola! 👋 Bienvenido a Pastelería Córdova. ¿En qué puedo ayudarte?",
    },
  ]);

  const [usuario, setUsuario] = useState<any>(null);
  const [esCliente, setEsCliente] = useState(false);
  const [verificandoUsuario, setVerificandoUsuario] = useState(true);

  // Productos obtenidos desde Spring Boot
  const [productos, setProductos] = useState<Producto[]>([]);

  // ==========================================
  // VERIFICAR USUARIO Y CARGAR PRODUCTOS
  // ==========================================
  useEffect(() => {
    const verificarUsuario = () => {
      const usuarioGuardado = localStorage.getItem("usuario");

      console.log("CHATBOT - usuario guardado:", usuarioGuardado);

      if (!usuarioGuardado) {
        console.log("CHATBOT - no hay usuario");
        setUsuario(null);
        setEsCliente(false);
        setProductos([]);
        setVerificandoUsuario(false);
        return;
      }

      try {
        const usuarioActual = JSON.parse(usuarioGuardado);

        const rolGuardado = localStorage.getItem("user_role");

        console.log("CHATBOT - usuario:", usuarioActual);
        console.log("CHATBOT - rol desde user_role:", rolGuardado);

        setUsuario(usuarioActual);

        if (rolGuardado?.toLowerCase() !== "cliente") {
          console.log("CHATBOT - usuario NO es cliente");
          setEsCliente(false);
          setProductos([]);
          setVerificandoUsuario(false);
          return;
        }

        console.log("CHATBOT - usuario ES cliente");
        setEsCliente(true);

        // Cargar productos
        fetch("http://localhost:8080/api/productos")
          .then((respuesta) => {
            if (!respuesta.ok) {
              throw new Error("No se pudieron obtener los productos");
            }

            return respuesta.json();
          })
          .then((datos: Producto[]) => {
            console.log("CHATBOT - productos cargados:", datos);
            setProductos(datos);
          })
          .catch((error) => {
            console.error("CHATBOT - error cargando productos:", error);
          })
          .finally(() => {
            setVerificandoUsuario(false);
          });
      } catch (error) {
        console.error("CHATBOT - error leyendo usuario:", error);
        setUsuario(null);
        setEsCliente(false);
        setVerificandoUsuario(false);
      }
    };

    // Primera comprobación
    verificarUsuario();

    // Escuchar cambios de usuario
    window.addEventListener("usuarioActualizado", verificarUsuario);

    return () => {
      window.removeEventListener("usuarioActualizado", verificarUsuario);
    };
  }, []);

  // ==========================================
  // RESPUESTAS DEL CHATBOT
  // ==========================================
  const obtenerRespuesta = (texto: string): string => {
    const pregunta = texto.toLowerCase().trim();

    // ==========================================
    // SALUDOS
    // ==========================================
    if (
      pregunta.includes("hola") ||
      pregunta.includes("buenas") ||
      pregunta.includes("buenos días") ||
      pregunta.includes("buenos dias") ||
      pregunta.includes("buenas tardes") ||
      pregunta.includes("buenas noches")
    ) {
      return `¡Hola${
        usuario?.nombreCompleto ? ` ${usuario.nombreCompleto}` : ""
      }! 👋 ¿En qué puedo ayudarte?`;
    }

    // ==========================================
    // LISTA DE PRODUCTOS
    // ==========================================
    if (
      pregunta.includes("producto") ||
      pregunta.includes("productos") ||
      pregunta.includes("qué venden") ||
      pregunta.includes("que venden") ||
      pregunta.includes("catálogo") ||
      pregunta.includes("catalogo")
    ) {
      if (productos.length === 0) {
        return "🍰 En este momento no pude obtener nuestro catálogo. Intenta nuevamente en unos segundos.";
      }

      const listaProductos = productos
        .map(
          (producto) =>
            `• ${producto.nombreProducto} - S/ ${producto.precio.toFixed(2)}`,
        )
        .join("\n");

      return `🍰 Estos son nuestros productos disponibles:\n\n${listaProductos}`;
    }

    // ==========================================
    // PRECIO DE UN PRODUCTO
    // ==========================================
    if (
      pregunta.includes("precio") ||
      pregunta.includes("precios") ||
      pregunta.includes("cuánto cuesta") ||
      pregunta.includes("cuanto cuesta") ||
      pregunta.includes("cuánto vale") ||
      pregunta.includes("cuanto vale")
    ) {
      if (productos.length === 0) {
        return "💰 No pude consultar los precios en este momento. Intenta nuevamente.";
      }

      const productoEncontrado = productos.find((producto) =>
        pregunta.includes(producto.nombreProducto.toLowerCase()),
      );

      if (productoEncontrado) {
        return `💰 El ${productoEncontrado.nombreProducto} cuesta S/ ${productoEncontrado.precio.toFixed(
          2,
        )}.`;
      }

      return "💰 Puedo consultar el precio de nuestros productos. Indícame el nombre del producto que deseas consultar.";
    }

    // ==========================================
    // DISPONIBILIDAD / STOCK
    // ==========================================
    if (
      pregunta.includes("stock") ||
      pregunta.includes("disponible") ||
      pregunta.includes("disponibilidad") ||
      pregunta.includes("hay")
    ) {
      if (productos.length === 0) {
        return "📦 No pude consultar la disponibilidad en este momento.";
      }

      const productoEncontrado = productos.find((producto) =>
        pregunta.includes(producto.nombreProducto.toLowerCase()),
      );

      if (productoEncontrado) {
        if (productoEncontrado.stock > 0) {
          return `📦 Sí, tenemos ${productoEncontrado.nombreProducto} disponible.\n\n💰 Precio: S/ ${productoEncontrado.precio.toFixed(
            2,
          )}\n📦 Stock disponible: ${productoEncontrado.stock} unidades.`;
        }

        return `❌ Actualmente no tenemos ${productoEncontrado.nombreProducto} disponible.`;
      }

      return "📦 Indícame el nombre del producto y puedo consultar su disponibilidad.";
    }

    // ==========================================
    // CARRITO
    // ==========================================
    if (
      pregunta.includes("carrito") ||
      pregunta.includes("comprar") ||
      pregunta.includes("compra")
    ) {
      return "🛒 Puedes agregar los productos que deseas al carrito y posteriormente realizar tu compra.";
    }

    // ==========================================
    // PEDIDO
    // ==========================================
    if (pregunta.includes("pedido") || pregunta.includes("orden")) {
      return "📦 Puedes consultar el estado de tus pedidos desde la sección Historial de Compras.";
    }

    // ==========================================
    // HISTORIAL
    // ==========================================
    if (
      pregunta.includes("historial") ||
      pregunta.includes("compras anteriores") ||
      pregunta.includes("mis compras")
    ) {
      return "🧾 Puedes consultar tus compras anteriores ingresando a Historial de Compras.";
    }

    // ==========================================
    // MÉTODOS DE PAGO
    // ==========================================
    if (
      pregunta.includes("pago") ||
      pregunta.includes("pagar") ||
      pregunta.includes("yape") ||
      pregunta.includes("plin") ||
      pregunta.includes("tarjeta")
    ) {
      return "💳 Puedes revisar los métodos de pago disponibles durante el proceso de compra.";
    }

    // ==========================================
    // INFORMACIÓN DE LA PASTELERÍA
    // ==========================================
    if (
      pregunta.includes("información") ||
      pregunta.includes("informacion") ||
      pregunta.includes("pastelería") ||
      pregunta.includes("pasteleria")
    ) {
      return "🏪 Somos Pastelería Córdova. Puedes navegar por nuestro catálogo para conocer nuestros productos y realizar tus pedidos.";
    }

    // ==========================================
    // ASESOR
    // ==========================================
    if (
      pregunta.includes("asesor") ||
      pregunta.includes("persona") ||
      pregunta.includes("atención") ||
      pregunta.includes("atencion") ||
      pregunta.includes("ayuda")
    ) {
      return "👨‍💼 Claro. Si necesitas atención personalizada, puedes comunicarte con uno de nuestros asesores mediante WhatsApp.";
    }

    // ==========================================
    // GRACIAS
    // ==========================================
    if (pregunta.includes("gracias") || pregunta.includes("muchas gracias")) {
      return "😊 ¡Con mucho gusto! Estamos para ayudarte.";
    }

    // ==========================================
    // DESPEDIDA
    // ==========================================
    if (
      pregunta.includes("adiós") ||
      pregunta.includes("adios") ||
      pregunta.includes("chau")
    ) {
      return "👋 ¡Gracias por visitar Pastelería Córdova!";
    }

    // ==========================================
    // RESPUESTA POR DEFECTO
    // ==========================================
    return "🤔 No estoy seguro de haber entendido tu consulta. Puedes preguntarme sobre productos, precios, disponibilidad, carrito, pedidos, historial de compras o métodos de pago.";
  };

  // ==========================================
  // CONTACTAR CON UN ASESOR POR WHATSAPP
  // ==========================================
  const contactarAsesor = () => {
    const numeroAsesor = "51962062153"; // Reemplazar por el número real

    const texto = encodeURIComponent(
      `Hola, soy ${
        usuario?.nombreCompleto || "cliente"
      }. Necesito ayuda de un asesor de Pastelería Córdova.`,
    );

    const url = `https://wa.me/${51962062153}?text=${texto}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ==========================================
  // ENVIAR MENSAJE
  // ==========================================
  const enviarMensaje = () => {
    if (!mensaje.trim()) return;

    const mensajeCliente = mensaje.trim();

    setMensajes((prev) => [
      ...prev,
      {
        tipo: "cliente",
        texto: mensajeCliente,
      },
    ]);

    setMensaje("");

    setTimeout(() => {
      const respuesta = obtenerRespuesta(mensajeCliente);

      setMensajes((prev) => [
        ...prev,
        {
          tipo: "bot",
          texto: respuesta,
        },
      ]);
    }, 400);
  };

  // ==========================================
  // ENTER
  // ==========================================
  const manejarEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      enviarMensaje();
    }
  };

  // ==========================================
  // VERIFICACIÓN DEL USUARIO
  // ==========================================
  if (verificandoUsuario) {
    return null;
  }

  if (!esCliente) {
    return null;
  }

  // ==========================================
  // INTERFAZ
  // ==========================================
  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white w-16 h-16 rounded-full shadow-lg hover:scale-105 transition"
        aria-label="Abrir chatbot"
      >
        🤖
      </button>

      {/* VENTANA DEL CHAT */}
      {abierto && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-30px)] bg-white rounded-2xl shadow-2xl border overflow-hidden">
          {/* CABECERA */}
          <div className="bg-primary text-white px-4 py-3 flex justify-between items-center">
            <div>
              <h2 className="font-bold">🤖 Asistente Córdova</h2>

              <p className="text-xs opacity-90">Atención al cliente</p>
            </div>

            <button
              onClick={() => setAbierto(false)}
              className="text-white text-xl"
            >
              ×
            </button>
          </div>

          {/* MENSAJES */}
          <div className="h-[400px] overflow-y-auto p-4 bg-gray-50">
            {mensajes.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-3 ${
                  msg.tipo === "cliente" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-line ${
                    msg.tipo === "cliente"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow rounded-bl-none"
                  }`}
                >
                  {msg.texto}
                </div>
              </div>
            ))}
          </div>

          {/* OPCIONES RÁPIDAS */}
          <div className="px-3 py-2 border-t bg-white">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setMensaje("Quiero ver los productos")}
                className="whitespace-nowrap text-xs bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200"
              >
                🍰 Productos
              </button>

              <button
                onClick={() => setMensaje("Quiero consultar mi pedido")}
                className="whitespace-nowrap text-xs bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200"
              >
                📦 Mi pedido
              </button>

              <button
                onClick={contactarAsesor}
                className="whitespace-nowrap text-xs bg-green-100 text-green-800 px-3 py-2 rounded-full hover:bg-green-200"
              >
                💬 Contactar con un Asesor
              </button>
            </div>

            {/* INPUT */}
            <div className="flex gap-2">
              <input
                type="text"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={manejarEnter}
                placeholder="Escribe tu consulta..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                onClick={enviarMensaje}
                className="bg-primary text-white px-4 rounded-lg hover:opacity-90"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
