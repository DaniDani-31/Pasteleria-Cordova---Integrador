package com.pastelerias.repository;

import com.pastelerias.model.Compra;
import com.pastelerias.dto.CompraDTO; // 👈 Usando el nombre correcto
import com.pastelerias.dto.VentasProductoDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

        List<Compra> findByCliente_IdCliente(Long idCliente);

        // 🆕 CONSULTA JPQL: Se asegura que mapee al nuevo DTO
        @Query("SELECT new com.pastelerias.dto.CompraDTO(" +
                        "c.idCompra, " +
                        "cl.idCliente, " +
                        "cl.nombreCompleto, " +
                        "c.fechaCompra, " +
                        "c.estado, " +
                        "c.total, " +
                        "p.idProducto, " +
                        "p.nombreProducto, " +
                        "d.cantidad, " +
                        "d.subtotal) " +
                        "FROM Compra c " +
                        "JOIN c.cliente cl " + // 👈 NECESARIO
                        "JOIN c.detalles d " +
                        "JOIN d.producto p " + // 👈 NECESARIO
                        "WHERE cl.idCliente = :idCliente " +
                        "ORDER BY c.fechaCompra DESC")
        List<CompraDTO> findDetallesCompraPorCliente(@Param("idCliente") Long idCliente);

        @Query("SELECT COALESCE(SUM(c.total), 0) FROM Compra c")
        double obtenerTotalVentas();

        @Query("SELECT new com.pastelerias.dto.VentasProductoDTO(p.idProducto, p.nombreProducto, SUM(d.cantidad)) " +
                        "FROM DetalleCompra d JOIN d.producto p " +
                        "GROUP BY p.idProducto, p.nombreProducto " +
                        "ORDER BY SUM(d.cantidad) DESC")
        List<VentasProductoDTO> obtenerVentasPorProducto();

        @Query(value = "SELECT cl.nombre_completo, COUNT(co.id_compra) AS totalCompras " +
                        "FROM compras co " +
                        "JOIN clientes cl ON co.id_cliente = cl.id_cliente " +
                        "GROUP BY co.id_cliente " +
                        "ORDER BY totalCompras DESC " +
                        "LIMIT 1", nativeQuery = true)
        Object[] obtenerClienteConMasCompras();
}
