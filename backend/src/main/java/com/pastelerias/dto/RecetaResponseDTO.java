
package com.pastelerias.dto;

import java.math.BigDecimal;
import java.util.List;

public record RecetaResponseDTO(
        Long idReceta,
        Long idProducto,
        String nombreProducto,
        String nombreReceta,
        Integer rendimiento,
        List<DetalleRecetaResponseDTO> ingredientes,
        BigDecimal costoTotal,
        BigDecimal costoPorUnidad) {
}
