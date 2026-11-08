package com.pastelerias.service.impl;

import com.pastelerias.model.Compra;
import com.pastelerias.model.DetalleCompra;
import com.pastelerias.model.Producto;
import com.pastelerias.dto.CompraDTO;
import com.pastelerias.dto.VentasProductoDTO;
import com.pastelerias.repository.CompraRepository;
import com.pastelerias.repository.DetalleCompraRepository;
import com.pastelerias.repository.ProductoRepository;
import com.pastelerias.service.CompraService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompraServiceImpl implements CompraService {

    private final CompraRepository compraRepository;
    private final DetalleCompraRepository detalleCompraRepository;
    private final ProductoRepository productoRepository;

    public CompraServiceImpl(
            CompraRepository compraRepository,
            DetalleCompraRepository detalleCompraRepository,
            ProductoRepository productoRepository) {

        this.compraRepository = compraRepository;
        this.detalleCompraRepository = detalleCompraRepository;
        this.productoRepository = productoRepository;
    }

    @Override
    public List<Compra> listarCompras() {
        return compraRepository.findAll();
    }

    @Override
    public Compra obtenerPorId(Long id) {
        return compraRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public Compra registrarCompra(Compra compra) {

        // Toda nueva compra comienza como Pendiente
        compra.setEstado("Pendiente");

        for (DetalleCompra detalle : compra.getDetalles()) {

            if (detalle.getProducto() == null
                    && detalle.getIdProductoTemp() != null) {

                Producto prod = productoRepository
                        .findById(detalle.getIdProductoTemp())
                        .orElseThrow(() -> new RuntimeException(
                                "Producto no encontrado: "
                                        + detalle.getIdProductoTemp()));

                detalle.setProducto(prod);
            }

            detalle.setCompra(compra);
        }

        // Calcular total
        double total = compra.getDetalles()
                .stream()
                .mapToDouble(DetalleCompra::getSubtotal)
                .sum();

        compra.setTotal(total);

        Compra compraGuardada = compraRepository.save(compra);

        detalleCompraRepository.saveAll(compra.getDetalles());

        return compraGuardada;
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        compraRepository.deleteById(id);
    }

    @Override
    @Transactional
    public List<Compra> listarComprasPorCliente(Long idCliente) {
        return compraRepository.findByCliente_IdCliente(idCliente);
    }

    @Override
    public List<CompraDTO> listarDetallesCompraPorCliente(Long idCliente) {
        return compraRepository.findDetallesCompraPorCliente(idCliente);
    }

    @Override
    public double obtenerTotalVentas() {
        return compraRepository.obtenerTotalVentas();
    }

    @Override
    public List<VentasProductoDTO> obtenerVentasPorProducto() {
        return compraRepository.obtenerVentasPorProducto();
    }

    @Override
    public String obtenerClienteConMasCompras() {

        Object[] data = compraRepository.obtenerClienteConMasCompras();

        if (data == null || data.length == 0 || data[0] == null) {
            return "Ninguno";
        }

        return (String) data[0];
    }

    @Override
    @Transactional
    public ResponseEntity<?> actualizarEstadoCompra(
            Long idCompra,
            String nuevoEstado) {

        Compra compra = compraRepository
                .findById(idCompra)
                .orElse(null);

        if (compra == null) {
            return ResponseEntity.notFound().build();
        }

        String estadoActual = compra.getEstado();

        // Validar que el nuevo estado exista
        if (!esEstadoValido(nuevoEstado)) {
            return ResponseEntity.badRequest()
                    .body("Estado no válido: " + nuevoEstado);
        }

        // Evitar modificar un pedido ya cancelado
        if ("Cancelado".equals(estadoActual)) {
            return ResponseEntity.badRequest()
                    .body("No se puede modificar un pedido cancelado.");
        }

        // Evitar modificar un pedido ya entregado
        if ("Entregado".equals(estadoActual)) {
            return ResponseEntity.badRequest()
                    .body("No se puede modificar un pedido ya entregado.");
        }

        // Validar la transición del estado
        if (!transicionValida(estadoActual, nuevoEstado)) {
            return ResponseEntity.badRequest()
                    .body(
                            "No se puede cambiar el estado de "
                                    + estadoActual
                                    + " a "
                                    + nuevoEstado);
        }

        /*
         * El stock se descuenta cuando el pedido pasa a Preparando.
         */
        if ("Preparando".equals(nuevoEstado)
                && !"Preparando".equals(estadoActual)) {

            for (DetalleCompra detalle : compra.getDetalles()) {

                Producto producto = productoRepository
                        .findById(detalle.getProducto().getIdProducto())
                        .orElse(null);

                if (producto == null) {
                    return ResponseEntity.badRequest()
                            .body(
                                    "No se encontró el producto "
                                            + detalle.getProducto().getIdProducto());
                }

                int stockActual = producto.getStock() != null
                        ? producto.getStock()
                        : 0;

                if (stockActual < detalle.getCantidad()) {
                    return ResponseEntity.badRequest()
                            .body(
                                    "Stock insuficiente para el producto: "
                                            + producto.getNombreProducto());
                }
            }

            // Si todos tienen stock suficiente, descontamos
            for (DetalleCompra detalle : compra.getDetalles()) {

                Producto producto = productoRepository
                        .findById(detalle.getProducto().getIdProducto())
                        .orElseThrow();

                int stockActual = producto.getStock() != null
                        ? producto.getStock()
                        : 0;

                producto.setStock(
                        stockActual - detalle.getCantidad());

                productoRepository.save(producto);
            }
        }

        /*
         * Si un pedido que estaba en Preparando se cancela,
         * devolvemos las unidades al inventario.
         */
        if ("Cancelado".equals(nuevoEstado)
                && "Preparando".equals(estadoActual)) {

            for (DetalleCompra detalle : compra.getDetalles()) {

                Producto producto = productoRepository
                        .findById(detalle.getProducto().getIdProducto())
                        .orElse(null);

                if (producto != null) {

                    int stockActual = producto.getStock() != null
                            ? producto.getStock()
                            : 0;

                    producto.setStock(
                            stockActual + detalle.getCantidad());

                    productoRepository.save(producto);
                }
            }
        }

        compra.setEstado(nuevoEstado);
        compraRepository.save(compra);

        return ResponseEntity.ok(
                "Estado actualizado correctamente a " + nuevoEstado);
    }

    private boolean esEstadoValido(String estado) {

        return "Pendiente".equals(estado)
                || "Confirmado".equals(estado)
                || "Preparando".equals(estado)
                || "Listo".equals(estado)
                || "Entregado".equals(estado)
                || "Cancelado".equals(estado);
    }

    private boolean transicionValida(
            String estadoActual,
            String nuevoEstado) {

        if (estadoActual == null) {
            return "Pendiente".equals(nuevoEstado);
        }

        if ("Pendiente".equals(estadoActual)) {

            return "Confirmado".equals(nuevoEstado)
                    || "Cancelado".equals(nuevoEstado);
        }

        if ("Confirmado".equals(estadoActual)) {

            return "Preparando".equals(nuevoEstado)
                    || "Cancelado".equals(nuevoEstado);
        }

        if ("Preparando".equals(estadoActual)) {

            return "Listo".equals(nuevoEstado)
                    || "Cancelado".equals(nuevoEstado);
        }

        if ("Listo".equals(estadoActual)) {

            return "Entregado".equals(nuevoEstado);
        }

        return false;
    }
}