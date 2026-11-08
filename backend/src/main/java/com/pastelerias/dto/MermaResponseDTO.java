
package com.pastelerias.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MermaResponseDTO(
        Long idMerma,
        String tipoInventario,
        Long idReferencia,
        String nombre,
        String unidadMedida,
        BigDecimal cantidad,
        String motivo,
        String descripcion,
        BigDecimal costoUnitario,
        BigDecimal costoTotal,
        LocalDateTime fechaMerma) {
}
