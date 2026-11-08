
package com.pastelerias.dto;

import java.math.BigDecimal;
import java.util.List;

public record ResumenMermaDTO(
        Long totalMermas,
        BigDecimal totalPerdidas,
        List<ResumenMotivoDTO> resumenPorMotivo) {
}
