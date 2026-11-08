# Pastelerías Córdova - Aplicación Web

Esta es la aplicación web frontend para Pastelerías Córdova, construida con Next.js y React.

## Características

- **Página Principal**: Hero section con productos más vendidos
- **Sistema de Autenticación**: Login y registro para clientes y administradores
- **Catálogo de Productos**: Visualización completa de productos disponibles
- **Navegación Completa**: Sobre Nosotros, Productos, Contacto, Clientes, Valores
- **Carrito de Compras**: Icono de carrito en el navbar
- **Diseño Responsivo**: Optimizado para móviles, tablets y desktop

## Tecnologías Utilizadas

- **Frontend**: Next.js 15 con React
- **Estilos**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui
- **Iconos**: Lucide React

## Integración con Backend

Esta aplicación está diseñada para integrarse con un backend Spring Boot. Los puntos de integración incluyen:

### Endpoints Requeridos (Spring Boot)

\`\`\`java
// Autenticación
POST /api/auth/login
POST /api/auth/register

// Productos
GET /api/productos
GET /api/productos/{id}

// Carrito
POST /api/carrito/agregar
GET /api/carrito
DELETE /api/carrito/{id}

// Pedidos
POST /api/pedidos
GET /api/pedidos/{userId}
\`\`\`

### Librerías Java Recomendadas

Para el backend Spring Boot, se recomienda usar 3 de estas 4 librerías:

1. **Google Guava**: Para colecciones y utilidades
2. **Apache POI**: Para generación de reportes en Excel
3. **Apache Commons**: Para utilidades generales
4. **Logback**: Para logging avanzado

### Base de Datos MySQL

Estructura de tablas recomendada:

\`\`\`sql
-- Usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre_completo VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  tipo ENUM('cliente', 'administrador'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Productos
CREATE TABLE productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255),
  descripcion TEXT,
  precio DECIMAL(10, 2),
  imagen_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carrito
CREATE TABLE carrito (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT,
  producto_id INT,
  cantidad INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Pedidos
CREATE TABLE pedidos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT,
  total DECIMAL(10, 2),
  estado VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
\`\`\`

## Instalación

\`\`\`bash
npm install
npm run dev
\`\`\`

## Próximos Pasos

1. Crear el backend Spring Boot con los endpoints mencionados
2. Configurar MySQL Workbench con las tablas necesarias
3. Implementar las 3 librerías Java seleccionadas
4. Conectar el frontend con el backend mediante fetch/axios
5. Implementar autenticación JWT
6. Agregar funcionalidad completa del carrito de compras

## Notas

- Los formularios de login y registro están listos para conectarse al backend
- Las imágenes de productos usan placeholders que deben reemplazarse con imágenes reales
- El diseño sigue fielmente las referencias proporcionadas
