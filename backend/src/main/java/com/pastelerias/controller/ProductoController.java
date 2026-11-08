
package com.pastelerias.controller;

import com.pastelerias.model.Producto;
import com.pastelerias.repository.ProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private static final Logger logger = LoggerFactory.getLogger(ProductoController.class);

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listarProductos() {
        logger.info("Listando productos disponibles");
        return ResponseEntity.ok(productoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerProducto(@PathVariable Long id) {
        return productoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
        try {
            if (producto.getNombreProducto() == null ||
                    producto.getNombreProducto().isBlank()) {
                return ResponseEntity.badRequest()
                        .body("El nombre del producto no puede estar vacío.");
            }

            if (producto.getPrecio() == null ||
                    !Double.isFinite(producto.getPrecio()) ||
                    producto.getPrecio() <= 0) {
                return ResponseEntity.badRequest()
                        .body("El precio debe ser mayor a cero.");
            }

            if (producto.getStock() == null || producto.getStock() < 0) {
                return ResponseEntity.badRequest()
                        .body("El stock inicial no puede ser negativo.");
            }

            producto.setIdProducto(null);
            producto.setNombreProducto(producto.getNombreProducto().trim());

            if (producto.getFechaCreacion() == null) {
                producto.setFechaCreacion(LocalDateTime.now());
            }

            if (producto.getCostoProduccion() == null) {
                producto.setCostoProduccion(BigDecimal.ZERO);
            }

            Producto nuevo = productoRepository.save(producto);

            logger.info("Producto creado correctamente: {}",
                    nuevo.getNombreProducto());

            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);

        } catch (Exception e) {
            logger.error("Error al crear producto", e);
            return ResponseEntity.internalServerError()
                    .body("Ocurrió un error al registrar el producto.");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(
            @PathVariable Long id,
            @RequestBody Producto productoActualizado) {

        return productoRepository.findById(id).map(producto -> {

            if (productoActualizado.getNombreProducto() == null ||
                    productoActualizado.getNombreProducto().isBlank()) {
                return ResponseEntity.badRequest()
                        .body("El nombre del producto es obligatorio.");
            }

            if (productoActualizado.getPrecio() == null ||
                    !Double.isFinite(productoActualizado.getPrecio()) ||
                    productoActualizado.getPrecio() <= 0) {
                return ResponseEntity.badRequest()
                        .body("El precio debe ser mayor a cero.");
            }

            if (productoActualizado.getStock() == null ||
                    productoActualizado.getStock() < 0) {
                return ResponseEntity.badRequest()
                        .body("El stock no puede ser negativo.");
            }

            producto.setNombreProducto(
                    productoActualizado.getNombreProducto().trim());
            producto.setDescripcion(productoActualizado.getDescripcion());
            producto.setPrecio(productoActualizado.getPrecio());
            producto.setStock(productoActualizado.getStock());

            Producto actualizado = productoRepository.save(producto);

            logger.info("Producto actualizado: {}", actualizado.getIdProducto());

            return ResponseEntity.ok(actualizado);

        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/actualizar-stock/{id}")
    public ResponseEntity<?> actualizarStock(
            @PathVariable Long id,
            @RequestBody Integer nuevoStock) {

        if (nuevoStock == null || nuevoStock < 0) {
            return ResponseEntity.badRequest()
                    .body("El stock no puede ser negativo.");
        }

        return productoRepository.findById(id).map(producto -> {
            producto.setStock(nuevoStock);
            productoRepository.save(producto);

            return ResponseEntity.ok("Stock actualizado correctamente.");
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            productoRepository.deleteById(id);
            logger.info("Producto eliminado: {}", id);

            return ResponseEntity.ok("Producto eliminado correctamente.");

        } catch (Exception e) {
            logger.error("No se pudo eliminar el producto {}", id, e);

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("No se puede eliminar el producto porque podría estar relacionado con recetas o ventas.");
        }
    }
}
