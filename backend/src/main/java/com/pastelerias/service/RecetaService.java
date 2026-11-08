
package com.pastelerias.service;

import com.pastelerias.dto.RecetaRequestDTO;
import com.pastelerias.dto.RecetaResponseDTO;

import java.util.List;

public interface RecetaService {

    RecetaResponseDTO registrar(RecetaRequestDTO solicitud);

    RecetaResponseDTO obtenerPorId(Long id);

    RecetaResponseDTO obtenerPorProducto(Long idProducto);

    List<RecetaResponseDTO> listarRecetas();

    RecetaResponseDTO actualizar(Long id, RecetaRequestDTO solicitud);
}
