package com.pastelerias.controller;

import com.google.common.base.Preconditions;
import com.pastelerias.model.Compra;
import com.pastelerias.model.DetalleCompra;
import com.pastelerias.model.Producto;
import com.pastelerias.model.Cliente;
import com.pastelerias.dto.CompraDTO;
import com.pastelerias.dto.VentasProductoDTO;
import com.pastelerias.dto.CompraRequest;
import com.pastelerias.dto.DetalleCompraRequest;
import com.pastelerias.service.CompraService;
import com.pastelerias.service.ClienteService;
import com.pastelerias.service.ProductoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/compras")
public class CompraController {

    private static final Logger logger = LoggerFactory.getLogger(CompraController.class);

    @Autowired
    private CompraService compraService;

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private ProductoService productoService;

    // ✅ Listar todas las compras

    @GetMapping
    public ResponseEntity<List<Compra>> listarCompras() {
        logger.info("Listando todas las compras");
        return ResponseEntity.ok(compraService.listarCompras());
    }

    // ✅ Obtener compra por ID

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerCompra(@PathVariable Long id) {
        logger.info("Buscando compra con ID {}", id);
        Compra compra = compraService.obtenerPorId(id);
        return (compra != null) ? ResponseEntity.ok(compra) : ResponseEntity.notFound().build();
    }

    // 🔹 Listar compras por ID de Cliente (Retorna Entidades)

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<Compra>> listarComprasPorCliente(@PathVariable Long idCliente) {
        logger.info("Listando compras (entidades) para el Cliente con ID: {}", idCliente);
        List<Compra> compras = compraService.listarComprasPorCliente(idCliente);
        return ResponseEntity.ok(compras);
    }

    // 🆕 Listar historial detallado por ID de Cliente (Retorna DTOs)

    @GetMapping("/cliente/{idCliente}/detalles")
    public ResponseEntity<List<CompraDTO>> listarDetallesCompraPorCliente(@PathVariable Long idCliente) {
        logger.info("Listando historial detallado (DTOs) para el Cliente con ID: {}", idCliente);
        List<CompraDTO> detalles = compraService.listarDetallesCompraPorCliente(idCliente);
        return ResponseEntity.ok(detalles);
    }

    // 🆕 Cliente con más compras

    @GetMapping("/cliente-mas-compras")
    public ResponseEntity<?> obtenerClienteConMasCompras() {
        String cliente = compraService.obtenerClienteConMasCompras();
        return ResponseEntity.ok(java.util.Collections.singletonMap("cliente", cliente));
    }

    // ✅ Registrar una nueva compra

    // ✅ Registrar una nueva compra
    @PostMapping
    public ResponseEntity<?> registrarCompra(@RequestBody CompraRequest compraRequest) {
        try {
            Preconditions.checkNotNull(compraRequest.getIdCliente(), "Debe asignarse un cliente a la compra");
            Preconditions.checkArgument(
                    compraRequest.getDetalles() != null && !compraRequest.getDetalles().isEmpty(),
                    "Debe incluir al menos un detalle de compra");

            // 🔹 Obtener cliente real desde la DB
            Cliente cliente = clienteService.obtenerPorId(compraRequest.getIdCliente());
            Preconditions.checkNotNull(cliente, "Cliente no encontrado con ID: " + compraRequest.getIdCliente());

            // 🔹 Crear la entidad Compra
            Compra compra = new Compra();
            compra.setCliente(cliente);
            compra.setFechaCompra(LocalDate.now());

            // 🔹 Convertir DetalleCompraRequest a DetalleCompra
            List<DetalleCompra> detalles = new ArrayList<>();
            for (DetalleCompraRequest detReq : compraRequest.getDetalles()) {
                Producto prod = productoService.obtenerPorId(detReq.getId_producto());
                Preconditions.checkNotNull(prod, "Producto no encontrado con ID: " + detReq.getId_producto());

                DetalleCompra det = new DetalleCompra();
                det.setProducto(prod);
                det.setCantidad(detReq.getCantidad());
                det.setSubtotal(detReq.getSubtotal());
                det.setCompra(compra);
                detalles.add(det);
            }
            compra.setDetalles(detalles);

            // 🔹 Calcular total
            double total = detalles.stream().mapToDouble(DetalleCompra::getSubtotal).sum();
            compra.setTotal(total);

            // 🔹 Guardar la compra
            Compra nuevaCompra = compraService.registrarCompra(compra);
            return ResponseEntity.ok(nuevaCompra);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error al registrar compra", e);
            return ResponseEntity.internalServerError().body("Error al registrar compra");
        }
    }

    // ➕ NUEVO ENDPOINT: Actualizar el estado de la compra (Para uso administrativo)

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstadoCompra(@PathVariable Long id, @RequestBody Map<String, String> request) {
        logger.info("Actualizando estado de la compra {} a {}", id, request.get("estado"));

        String nuevoEstado = request.get("estado");

        if (nuevoEstado == null || nuevoEstado.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("{\"mensaje\": \"El campo 'estado' es requerido en el cuerpo de la solicitud.\"}");
        }

        // La lógica de validación y guardado se delega al servicio
        return compraService.actualizarEstadoCompra(id, nuevoEstado);
    }

    // ✅ Eliminar compra

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCompra(@PathVariable Long id) {
        logger.info("Eliminando compra con ID {}", id);
        compraService.eliminar(id);
        return ResponseEntity.ok("Compra eliminada correctamente");
    }

    // ✅ Obtener el total de dinero recaudado por todas las compras

    @GetMapping("/total-ventas")
    public ResponseEntity<?> obtenerTotalVentas() {
        logger.info("Calculando total de ventas...");
        double total = compraService.obtenerTotalVentas();
        return ResponseEntity.ok(java.util.Collections.singletonMap("total", total));
    }

    // ✅ Obtener ventas por producto

    @GetMapping("/ventas-producto")
    public List<VentasProductoDTO> obtenerVentasProducto() {
        return compraService.obtenerVentasPorProducto();
    }
}