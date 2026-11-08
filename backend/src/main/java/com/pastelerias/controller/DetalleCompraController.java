package com.pastelerias.controller;

import com.pastelerias.model.DetalleCompra;
import com.pastelerias.repository.CompraRepository;
import com.pastelerias.repository.ProductoRepository;
import com.pastelerias.service.DetalleCompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000") // Conexión desde React
@RestController
@RequestMapping("/api/detalles")
public class DetalleCompraController {

    @Autowired
    private DetalleCompraService detalleCompraService;

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // ✅ Listar todos los detalles
    @GetMapping
    public ResponseEntity<List<DetalleCompra>> listarDetalles() {
        List<DetalleCompra> detalles = detalleCompraService.listarDetalles();
        return ResponseEntity.ok(detalles);
    }

    // ✅ Obtener detalle por ID
    @GetMapping("/{id}")
    public ResponseEntity<DetalleCompra> obtenerDetalle(@PathVariable Integer id) {
        DetalleCompra detalle = detalleCompraService.obtenerPorId(id);
        return (detalle != null)
                ? ResponseEntity.ok(detalle)
                : ResponseEntity.notFound().build();
    }

    // ✅ Registrar un nuevo detalle (con validación)
    @PostMapping
    public ResponseEntity<?> registrarDetalle(@RequestBody DetalleCompra detalle) {
        try {
            if (detalle.getCompra() == null || detalle.getCompra().getIdCompra() == null) {
                return ResponseEntity.badRequest().body("Debe especificar el ID de la compra asociada");
            }

            if (detalle.getProducto() == null || detalle.getProducto().getIdProducto() == null) {
                return ResponseEntity.badRequest().body("Debe especificar el ID del producto asociado");
            }

            var compra = compraRepository.findById(detalle.getCompra().getIdCompra())
                    .orElseThrow(() -> new IllegalArgumentException("Compra no encontrada"));

            var producto = productoRepository.findById(detalle.getProducto().getIdProducto())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

            detalle.setCompra(compra);
            detalle.setProducto(producto);

            DetalleCompra nuevoDetalle = detalleCompraService.guardar(detalle);
            return ResponseEntity.ok(nuevoDetalle);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al registrar el detalle: " + e.getMessage());
        }
    }

    // ✅ Eliminar un detalle por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarDetalle(@PathVariable Integer id) {
        detalleCompraService.eliminar(id);
        return ResponseEntity.ok("Detalle de compra eliminado correctamente");
    }
}
