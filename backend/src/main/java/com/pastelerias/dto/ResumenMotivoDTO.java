
package com.pastelerias.dto;

import java.math.BigDecimal;

public record ResumenMotivoDTO(
        String motivo,
        Long cantidadMermas,
        BigDecimal costoTotal) {
}
