package com.pastelerias.repository;

import com.pastelerias.model.Producto;
import com.pastelerias.model.DetalleCompra; // importa tu entidad de detalle de compras
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Método para obtener ventas por producto
    @Query("SELECT p.idProducto, p.nombreProducto, SUM(d.cantidad) " +
            "FROM DetalleCompra d JOIN d.producto p " +
            "GROUP BY p.idProducto, p.nombreProducto")
    List<Object[]> obtenerVentasPorProducto();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Producto p WHERE p.idProducto = :id")
    Optional<Producto> buscarPorIdConBloqueo(
            @Param("id") Long id);
}
