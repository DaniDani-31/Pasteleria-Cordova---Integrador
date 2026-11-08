
package com.pastelerias.dto;

import java.math.BigDecimal;

public record DetalleRecetaResponseDTO(
        Long idInsumo,
        String nombreInsumo,
        BigDecimal cantidad,
        String unidadMedida,
        BigDecimal costoUnitario,
        BigDecimal subtotal) {
}
