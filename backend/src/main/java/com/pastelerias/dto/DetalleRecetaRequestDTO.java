
package com.pastelerias.dto;

import java.math.BigDecimal;

public record DetalleRecetaRequestDTO(
        Long idInsumo,
        BigDecimal cantidad,
        String unidadMedida) {
}
