"use client";
import { API } from "@/lib/api";

import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const { addToCart } = useCart();

  const products = [
    {
      idProducto: 1,
      name: "Torta de Chocolate",
      description: "La clÃ¡sica con tres capas de puro sabor",
      price: "S/ 40.00",
      image: "/chocolate-cake-with-three-layers.jpg",
    },
    {
      idProducto: 2,
      name: "Muffin de Vainilla",
      description: "Suave y esponjoso, perfecto para el cafÃ©",
      price: "S/ 4.00 c/u",
      image: "/vanilla-muffin-golden-brown.jpg",
    },
    {
      idProducto: 3,
      name: "Cheesecake de Fresas",
      description: "Crema ligera con fresas frescas",
      price: "S/ 35.00",
      image: "/strawberry-cheesecake-with-fresh-strawberries.jpg",
    },
    {
      idProducto: 4,
      name: "Queque de Zanahoria",
      description: "Con nueces y betÃºn de queso crema",
      price: "S/ 3.00 c/u",
      image: "/carrot-cake-slice-with-cream-cheese-frosting.jpg",
    },
  ];

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    mensaje: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/contactos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("âœ… Mensaje enviado correctamente. Â¡Gracias por contactarnos!");
        setFormData({
          nombre: "",
          correo: "",
          telefono: "",
          mensaje: "",
        });
      } else {
        const errorText = await response.text();
        console.error("Error al enviar mensaje:", errorText);
        alert("âš ï¸ Error al enviar mensaje. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error de conexiÃ³n:", error);
      alert("âŒ No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* ðŸŸ£ HERO PRINCIPAL */}
      <section
        id="inicio"
        className="relative h-[600px] flex flex-col items-center justify-center text-center"
      >
        <img
          src="/logito_cordova.jpeg"
          alt="Fondo PastelerÃ­a"
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-6">
            PASTELERÃA CÃ“RDOVA
          </h1>
        </div>
      </section>

      {/* ðŸŸ¡ SOBRE NOSOTROS */}
      <section id="sobre-nosotros" className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          {/* Texto a la izquierda */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Sobre Nosotros
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
              Somos una pastelerÃ­a familiar con mÃ¡s de 10 aÃ±os de experiencia,
              dedicados a endulzar momentos especiales con postres artesanales y
              productos de calidad. En PastelerÃ­a CÃ³rdova creemos que cada
              postre cuenta una historia, y la nuestra estÃ¡ llena de amor,
              pasiÃ³n y dedicaciÃ³n.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Nuestro objetivo es llevar dulzura a cada hogar, combinando
              recetas tradicionales con un toque moderno, para garantizar una
              experiencia inolvidable en cada bocado.
            </p>
          </div>

          {/* Video a la derecha */}
          <div className="rounded-xl overflow-hidden shadow-lg border border-primary/20">
            <video
              controls
              autoPlay
              muted
              loop
              className="w-full h-80 object-cover"
            >
              <source src="/video-pasteleriacordova.mp4" type="video/mp4" />
              Tu navegador no soporta videos.
            </video>
          </div>
        </div>
      </section>

      {/* ðŸŸ¢ PRODUCTOS */}
      <section id="productos" className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Nuestros 4 Productos MÃ¡s Vendidos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-12">
            {products.map((product, index) => (
              <ProductCard
                idProducto={product.idProducto}
                key={index}
                name={product.name}
                description={product.description}
                price={product.price}
                image={product.image}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>

          {/* ðŸ”— BotÃ³n para ir a /productos */}
          <Button
            onClick={() => (window.location.href = "/productos")}
            className="bg-primary hover:bg-accent text-primary-foreground px-6 py-3 rounded-lg shadow-md transition"
          >
            Ver MÃ¡s Productos
          </Button>
        </div>
      </section>

      {/* ðŸŸ  CONTACTO */}
      <section id="contacto" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
            ContÃ¡ctanos
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Â¿Tienes alguna pregunta o comentario? Completa el formulario y nos
            pondremos en contacto contigo pronto.
          </p>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* InformaciÃ³n de contacto */}
            <div className="space-y-8 text-left">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-foreground">
                  InformaciÃ³n de Contacto
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">
                        DirecciÃ³n
                      </h4>
                      <p className="text-muted-foreground">
                        Contamos con 4 locales en Lima Sur
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">
                        TelÃ©fono
                      </h4>
                      <p className="text-muted-foreground">+51 926 499 245</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">
                        Email
                      </h4>
                      <p className="text-muted-foreground">
                        pasteleriacordova@gmail.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  Horario de AtenciÃ³n
                </h3>
                <div className="space-y-1 text-muted-foreground">
                  <p>Lunes a Viernes: 10:00 AM - 10:00 PM</p>
                  <p>SÃ¡bados: 8:00 AM - 12:00 PM</p>
                  <p>Domingos: 8:00 AM - 12:00 PM</p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="bg-card border-4 border-primary/20 rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                EnvÃ­anos un Mensaje
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Nombre Completo
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="correo"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Correo ElectrÃ³nico
                  </label>
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    required
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    TelÃ©fono
                  </label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+51 999 888 777"
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mensaje"
                    className="block text-sm font-medium mb-2 text-foreground"
                  >
                    Mensaje
                  </label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    required
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Escribe tu mensaje aquÃ­..."
                    rows={5}
                    className="w-full resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-accent text-primary-foreground"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ðŸ”µ CLIENTES */}
      <section id="clientes" className="py-20 bg-secondary text-center">
        <h2 className="text-3xl font-bold mb-6 text-foreground">
          Nuestros Clientes
        </h2>
        <p className="text-muted-foreground mb-12">
          Ellos confÃ­an en nuestros productos para sus celebraciones.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-6xl mx-auto px-4">
          {[
            {
              name: "Lionel Messi",
              image: "/messi.png",
              review:
                "Â¡IncreÃ­ble servicio! EncarguÃ© una torta personalizada para el cumpleaÃ±os de mi madre y quedÃ³ preciosa. El sabor era espectacular, todos los invitados preguntaron de dÃ³nde era. Definitivamente volverÃ© a comprar aquÃ­.",
            },
            {
              name: "Erling Haaland",
              image: "/haaland.png",
              review:
                "PedÃ­ un cheesecake de fresas y fue amor a primera vista. La textura, el sabor y la presentaciÃ³n fueron perfectos. Se nota la dedicaciÃ³n que ponen en cada detalle. RecomendadÃ­simo.",
            },
            {
              name: "Cristiano Ronaldo",
              image: "/cr7.png",
              review:
                "Desde que probÃ© sus muffins, no puedo dejar de pasar por la pastelerÃ­a cada semana. Son suaves, deliciosos y siempre frescos. AdemÃ¡s, la atenciÃ³n del personal es muy amable y rÃ¡pida.",
            },
          ].map((client, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center md:w-1/3"
            >
              <img
                src={client.image}
                alt={client.name}
                className="w-20 h-20 rounded-full mb-4 object-cover"
              />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {client.name}
              </h3>
              <div className="flex justify-center mb-3 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm">{client.review}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ðŸŸ£ LOCALES */}
      <section id="locales" className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold mb-10 text-foreground">
          Nuestros Locales
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
          {[
            {
              name: "VMT 1",
              address: "JirÃ³n Las Magnolias, VMT 15812",
              image: "/magnolias.png",
              map: "http://google.com/maps/place/Pasteleria+Cordova/@-12.1428925,-76.9465777,19z/data=!4m15!1m8!3m7!1s0x9105b896a69285bb:0x351ca2644548b817!2sJir%C3%B3n+las+Magnolias+501,+Lima+15812!3b1!8m2!3d-12.1428925!4d-76.945934!16s%2Fg%2F11csm7jb1z!3m5!1s0x9105b896a150a0df:0xfc7a7dee42243642!8m2!3d-12.1426336!4d-76.9458825!16s%2Fg%2F11c5g5r2q7?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D",
            },
            {
              name: "VMT 2",
              address: "Av. JosÃ© Carlos MariÃ¡tegui 1780, VMT",
              image: "/mariategui 1.png",
              map: "https://www.google.com/maps?q=Av.+JosÃ©+Carlos+MariÃ¡tegui+1780,+VMT",
            },
            {
              name: "VMT 3",
              address: "Av. JosÃ© Carlos MariÃ¡tegui 1090, VMT",
              image: "/mariategui 2.png",
              map: "https://www.google.com/maps?q=Av.+JosÃ©+Carlos+MariÃ¡tegui+1090,+VMT",
            },
            {
              name: "Sn. Juan",
              address: "Av. San Juan 609-B, VMT",
              image: "/san juan.png",
              map: "https://www.google.com/maps?q=Av.+San+Juan+609-B,+VMT",
            },
          ].map((local, index) => (
            <div
              key={index}
              className="bg-secondary/20 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={local.image}
                alt={local.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {local.name}
                </h3>
                <p className="text-muted-foreground mb-3">{local.address}</p>
                <a
                  href={local.map}
                  target="_blank"
                  className="text-primary font-medium hover:underline"
                >
                  Ver en Google Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

