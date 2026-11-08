-- Active: 1760071128019@@127.0.0.1@3306@pastelerias_cordova
-- ============================================
-- ðŸš€ CREACIÃ“N DE BASE DE DATOS
-- ============================================
CREATE DATABASE IF NOT EXISTS pastelerias_cordova;
USE pastelerias_cordova;

-- ============================================
-- ðŸ§© TABLA: ROLES
-- ============================================
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- ============================================
-- ðŸ‘¤ TABLA: CLIENTES
-- ============================================
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseÃ±a VARCHAR(255) NOT NULL,
    id_rol INT DEFAULT 1,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- ============================================
-- ðŸ° TABLA: PRODUCTOS
-- ============================================
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    imagen_url VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ðŸ›’ TABLA: COMPRAS
-- ============================================
CREATE TABLE compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- ============================================
-- âœ‰ï¸ TABLA: CONTACTO
-- ============================================
CREATE TABLE contacto (
    id_contacto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ðŸŒŸ DATOS DE EJEMPLO (Opcionales)
-- ============================================
INSERT INTO roles (nombre_rol, descripcion) VALUES
('Cliente', 'Usuario que compra productos en la pastelerÃ­a'),
('Administrador', 'Usuario con acceso total al sistema');

INSERT INTO productos (nombre_producto, descripcion, precio, stock, imagen_url) VALUES
('Torta de Chocolate', 'La clÃ¡sica con tres capas de puro sabor', 40.00, 20, '/chocolate-cake-with-three-layers.jpg'),
('Muffin de Vainilla', 'Suave y esponjoso, perfecto para el cafÃ©', 4.00, 50, '/vanilla-muffin-golden-brown.jpg'),
('Cheesecake de Fresas', 'Crema ligera con fresas frescas', 35.00, 15, '/strawberry-cheesecake-with-fresh-strawberries.jpg'),
('Queque de Zanahoria', 'Con nueces y betÃºn de queso crema', 3.00, 60, '/carrot-cake-slice-with-cream-cheese-frosting.jpg');
