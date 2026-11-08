package com.pastelerias.repository;

import com.pastelerias.dto.VentaHistoricaDTO;
import com.pastelerias.dto.VentaMLDTO;
import com.pastelerias.model.Compra;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MLRepository extends JpaRepository<Compra, Long> {

    @Query("""
                SELECT new com.pastelerias.dto.VentaHistoricaDTO(
                    p.idProducto,
                    p.nombreProducto,
                    c.fechaCompra,
                    p.precio,
                    d.cantidad,
                    d.subtotal
                )
                FROM DetalleCompra d
                JOIN d.compra c
                JOIN d.producto p
                WHERE c.estado = 'Entregado'
                ORDER BY c.fechaCompra ASC
            """)
    List<VentaHistoricaDTO> obtenerHistorialVentasML();

    @Query("""
                SELECT new com.pastelerias.dto.VentaMLDTO(
                    c.fechaCompra,
                    p.idProducto,
                    p.nombreProducto,
                    SUM(d.cantidad)
                )
                FROM DetalleCompra d
                JOIN d.compra c
                JOIN d.producto p
                WHERE c.estado = 'Entregado'
                GROUP BY c.fechaCompra, p.idProducto, p.nombreProducto
                ORDER BY c.fechaCompra ASC
            """)
    List<VentaMLDTO> obtenerVentasAgrupadasML();
}