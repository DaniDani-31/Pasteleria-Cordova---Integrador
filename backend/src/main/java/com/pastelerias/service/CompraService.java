package com.pastelerias.service;

import com.pastelerias.model.Compra;
import com.pastelerias.dto.CompraDTO;
import com.pastelerias.dto.VentasProductoDTO;
import org.springframework.http.ResponseEntity; // 👈 Importar ResponseEntity
import java.util.List;

public interface CompraService {

    List<Compra> listarCompras();

    Compra obtenerPorId(Long id);

    Compra registrarCompra(Compra compra);

    void eliminar(Long id);

    // 🔹 Listar compras por ID de cliente (Retorna Entidades - requiere
    // @Transactional)
    List<Compra> listarComprasPorCliente(Long idCliente);

    // 🆕 Nuevo método para el historial detallado (Retorna DTOs)
    List<CompraDTO> listarDetallesCompraPorCliente(Long idCliente);

    double obtenerTotalVentas();

    List<VentasProductoDTO> obtenerVentasPorProducto();

    String obtenerClienteConMasCompras();

    // ➕ NUEVO MÉTODO PARA ACTUALIZAR ESTADO DE LA COMPRA
    ResponseEntity<?> actualizarEstadoCompra(Long idCompra, String nuevoEstado);
}