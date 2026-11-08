
package com.pastelerias.repository;

import com.pastelerias.model.Merma;
import com.pastelerias.dto.ResumenMotivoDTO;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MermaRepository extends JpaRepository<Merma, Long> {

    // Historial con filtros opcionales
    @Query("""
                SELECT DISTINCT m
                FROM Merma m
                LEFT JOIN FETCH m.insumo
                LEFT JOIN FETCH m.producto
                WHERE (:desde IS NULL OR m.fechaMerma >= :desde)
                AND (:hasta IS NULL OR m.fechaMerma <= :hasta)
                AND (
                    :tipo IS NULL
                    OR (:tipo = 'INSUMO' AND m.insumo IS NOT NULL)
                    OR (:tipo = 'PRODUCTO' AND m.producto IS NOT NULL)
                )
                AND (
                    :motivo IS NULL
                    OR LOWER(m.motivo) LIKE LOWER(CONCAT('%', :motivo, '%'))
                )
                ORDER BY m.fechaMerma DESC
            """)
    List<Merma> buscarConFiltros(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta,
            @Param("tipo") String tipo,
            @Param("motivo") String motivo);

    // Total de pérdidas económicas con filtros
    @Query("""
                SELECT COALESCE(SUM(m.costoTotal), 0)
                FROM Merma m
                WHERE (:desde IS NULL OR m.fechaMerma >= :desde)
                AND (:hasta IS NULL OR m.fechaMerma <= :hasta)
                AND (
                    :tipo IS NULL
                    OR (:tipo = 'INSUMO' AND m.insumo IS NOT NULL)
                    OR (:tipo = 'PRODUCTO' AND m.producto IS NOT NULL)
                )
                AND (
                    :motivo IS NULL
                    OR LOWER(m.motivo) LIKE LOWER(CONCAT('%', :motivo, '%'))
                )
            """)
    BigDecimal obtenerTotalPerdidasFiltradas(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta,
            @Param("tipo") String tipo,
            @Param("motivo") String motivo);

    // Cantidad de mermas con filtros
    @Query("""
                SELECT COUNT(m)
                FROM Merma m
                WHERE (:desde IS NULL OR m.fechaMerma >= :desde)
                AND (:hasta IS NULL OR m.fechaMerma <= :hasta)
                AND (
                    :tipo IS NULL
                    OR (:tipo = 'INSUMO' AND m.insumo IS NOT NULL)
                    OR (:tipo = 'PRODUCTO' AND m.producto IS NOT NULL)
                )
                AND (
                    :motivo IS NULL
                    OR LOWER(m.motivo) LIKE LOWER(CONCAT('%', :motivo, '%'))
                )
            """)
    Long contarMermasFiltradas(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta,
            @Param("tipo") String tipo,
            @Param("motivo") String motivo);

    // Resumen agrupado por motivo
    @Query("""
                SELECT new com.pastelerias.dto.ResumenMotivoDTO(
                    m.motivo,
                    COUNT(m),
                    SUM(m.costoTotal)
                )
                FROM Merma m
                WHERE (:desde IS NULL OR m.fechaMerma >= :desde)
                AND (:hasta IS NULL OR m.fechaMerma <= :hasta)
                AND (
                    :tipo IS NULL
                    OR (:tipo = 'INSUMO' AND m.insumo IS NOT NULL)
                    OR (:tipo = 'PRODUCTO' AND m.producto IS NOT NULL)
                )
                AND (
                    :motivo IS NULL
                    OR LOWER(m.motivo) LIKE LOWER(CONCAT('%', :motivo, '%'))
                )
                GROUP BY m.motivo
                ORDER BY SUM(m.costoTotal) DESC
            """)
    List<ResumenMotivoDTO> obtenerResumenPorMotivoFiltrado(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta,
            @Param("tipo") String tipo,
            @Param("motivo") String motivo);
}
