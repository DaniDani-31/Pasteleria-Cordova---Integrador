"use client";
import { API } from "@/lib/api";

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
        "Â¡Hola! ðŸ‘‹ Bienvenido a PastelerÃ­a CÃ³rdova. Â¿En quÃ© puedo ayudarte?",
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
        fetch(`${API}/productos`)
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

    // Primera comprobaciÃ³n
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
      pregunta.includes("buenos dÃ­as") ||
      pregunta.includes("buenos dias") ||
      pregunta.includes("buenas tardes") ||
      pregunta.includes("buenas noches")
    ) {
      return `Â¡Hola${
        usuario?.nombreCompleto ? ` ${usuario.nombreCompleto}` : ""
      }! ðŸ‘‹ Â¿En quÃ© puedo ayudarte?`;
    }

    // ==========================================
    // LISTA DE PRODUCTOS
    // ==========================================
    if (
      pregunta.includes("producto") ||
      pregunta.includes("productos") ||
      pregunta.includes("quÃ© venden") ||
      pregunta.includes("que venden") ||
      pregunta.includes("catÃ¡logo") ||
      pregunta.includes("catalogo")
    ) {
      if (productos.length === 0) {
        return "ðŸ° En este momento no pude obtener nuestro catÃ¡logo. Intenta nuevamente en unos segundos.";
      }

      const listaProductos = productos
        .map(
          (producto) =>
            `â€¢ ${producto.nombreProducto} - S/ ${producto.precio.toFixed(2)}`,
        )
        .join("\n");

      return `ðŸ° Estos son nuestros productos disponibles:\n\n${listaProductos}`;
    }

    // ==========================================
    // PRECIO DE UN PRODUCTO
    // ==========================================
    if (
      pregunta.includes("precio") ||
      pregunta.includes("precios") ||
      pregunta.includes("cuÃ¡nto cuesta") ||
      pregunta.includes("cuanto cuesta") ||
      pregunta.includes("cuÃ¡nto vale") ||
      pregunta.includes("cuanto vale")
    ) {
      if (productos.length === 0) {
        return "ðŸ’° No pude consultar los precios en este momento. Intenta nuevamente.";
      }

      const productoEncontrado = productos.find((producto) =>
        pregunta.includes(producto.nombreProducto.toLowerCase()),
      );

      if (productoEncontrado) {
        return `ðŸ’° El ${productoEncontrado.nombreProducto} cuesta S/ ${productoEncontrado.precio.toFixed(
          2,
        )}.`;
      }

      return "ðŸ’° Puedo consultar el precio de nuestros productos. IndÃ­came el nombre del producto que deseas consultar.";
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
        return "ðŸ“¦ No pude consultar la disponibilidad en este momento.";
      }

      const productoEncontrado = productos.find((producto) =>
        pregunta.includes(producto.nombreProducto.toLowerCase()),
      );

      if (productoEncontrado) {
        if (productoEncontrado.stock > 0) {
          return `ðŸ“¦ SÃ­, tenemos ${productoEncontrado.nombreProducto} disponible.\n\nðŸ’° Precio: S/ ${productoEncontrado.precio.toFixed(
            2,
          )}\nðŸ“¦ Stock disponible: ${productoEncontrado.stock} unidades.`;
        }

        return `âŒ Actualmente no tenemos ${productoEncontrado.nombreProducto} disponible.`;
      }

      return "ðŸ“¦ IndÃ­came el nombre del producto y puedo consultar su disponibilidad.";
    }

    // ==========================================
    // CARRITO
    // ==========================================
    if (
      pregunta.includes("carrito") ||
      pregunta.includes("comprar") ||
      pregunta.includes("compra")
    ) {
      return "ðŸ›’ Puedes agregar los productos que deseas al carrito y posteriormente realizar tu compra.";
    }

    // ==========================================
    // PEDIDO
    // ==========================================
    if (pregunta.includes("pedido") || pregunta.includes("orden")) {
      return "ðŸ“¦ Puedes consultar el estado de tus pedidos desde la secciÃ³n Historial de Compras.";
    }

    // ==========================================
    // HISTORIAL
    // ==========================================
    if (
      pregunta.includes("historial") ||
      pregunta.includes("compras anteriores") ||
      pregunta.includes("mis compras")
    ) {
      return "ðŸ§¾ Puedes consultar tus compras anteriores ingresando a Historial de Compras.";
    }

    // ==========================================
    // MÃ‰TODOS DE PAGO
    // ==========================================
    if (
      pregunta.includes("pago") ||
      pregunta.includes("pagar") ||
      pregunta.includes("yape") ||
      pregunta.includes("plin") ||
      pregunta.includes("tarjeta")
    ) {
      return "ðŸ’³ Puedes revisar los mÃ©todos de pago disponibles durante el proceso de compra.";
    }

    // ==========================================
    // INFORMACIÃ“N DE LA PASTELERÃA
    // ==========================================
    if (
      pregunta.includes("informaciÃ³n") ||
      pregunta.includes("informacion") ||
      pregunta.includes("pastelerÃ­a") ||
      pregunta.includes("pasteleria")
    ) {
      return "ðŸª Somos PastelerÃ­a CÃ³rdova. Puedes navegar por nuestro catÃ¡logo para conocer nuestros productos y realizar tus pedidos.";
    }

    // ==========================================
    // ASESOR
    // ==========================================
    if (
      pregunta.includes("asesor") ||
      pregunta.includes("persona") ||
      pregunta.includes("atenciÃ³n") ||
      pregunta.includes("atencion") ||
      pregunta.includes("ayuda")
    ) {
      return "ðŸ‘¨â€ðŸ’¼ Claro. Si necesitas atenciÃ³n personalizada, puedes comunicarte con uno de nuestros asesores mediante WhatsApp.";
    }

    // ==========================================
    // GRACIAS
    // ==========================================
    if (pregunta.includes("gracias") || pregunta.includes("muchas gracias")) {
      return "ðŸ˜Š Â¡Con mucho gusto! Estamos para ayudarte.";
    }

    // ==========================================
    // DESPEDIDA
    // ==========================================
    if (
      pregunta.includes("adiÃ³s") ||
      pregunta.includes("adios") ||
      pregunta.includes("chau")
    ) {
      return "ðŸ‘‹ Â¡Gracias por visitar PastelerÃ­a CÃ³rdova!";
    }

    // ==========================================
    // RESPUESTA POR DEFECTO
    // ==========================================
    return "ðŸ¤” No estoy seguro de haber entendido tu consulta. Puedes preguntarme sobre productos, precios, disponibilidad, carrito, pedidos, historial de compras o mÃ©todos de pago.";
  };

  // ==========================================
  // CONTACTAR CON UN ASESOR POR WHATSAPP
  // ==========================================
  const contactarAsesor = () => {
    const numeroAsesor = "51962062153"; // Reemplazar por el nÃºmero real

    const texto = encodeURIComponent(
      `Hola, soy ${
        usuario?.nombreCompleto || "cliente"
      }. Necesito ayuda de un asesor de PastelerÃ­a CÃ³rdova.`,
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
  // VERIFICACIÃ“N DEL USUARIO
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
      {/* BOTÃ“N FLOTANTE */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white w-16 h-16 rounded-full shadow-lg hover:scale-105 transition"
        aria-label="Abrir chatbot"
      >
        ðŸ¤–
      </button>

      {/* VENTANA DEL CHAT */}
      {abierto && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-30px)] bg-white rounded-2xl shadow-2xl border overflow-hidden">
          {/* CABECERA */}
          <div className="bg-primary text-white px-4 py-3 flex justify-between items-center">
            <div>
              <h2 className="font-bold">ðŸ¤– Asistente CÃ³rdova</h2>

              <p className="text-xs opacity-90">AtenciÃ³n al cliente</p>
            </div>

            <button
              onClick={() => setAbierto(false)}
              className="text-white text-xl"
            >
              Ã—
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

          {/* OPCIONES RÃPIDAS */}
          <div className="px-3 py-2 border-t bg-white">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setMensaje("Quiero ver los productos")}
                className="whitespace-nowrap text-xs bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200"
              >
                ðŸ° Productos
              </button>

              <button
                onClick={() => setMensaje("Quiero consultar mi pedido")}
                className="whitespace-nowrap text-xs bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200"
              >
                ðŸ“¦ Mi pedido
              </button>

              <button
                onClick={contactarAsesor}
                className="whitespace-nowrap text-xs bg-green-100 text-green-800 px-3 py-2 rounded-full hover:bg-green-200"
              >
                ðŸ’¬ Contactar con un Asesor
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
                âž¤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

