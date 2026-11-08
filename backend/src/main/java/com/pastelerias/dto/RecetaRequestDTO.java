
package com.pastelerias.dto;

import java.util.List;

public record RecetaRequestDTO(
        Long idProducto,
        String nombreReceta,
        String descripcion,
        List<DetalleRecetaRequestDTO> ingredientes) {
}
