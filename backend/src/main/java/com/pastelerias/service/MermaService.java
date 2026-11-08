
package com.pastelerias.service;

import com.pastelerias.model.Merma;
import com.pastelerias.dto.ResumenMermaDTO;

import java.time.LocalDate;
import java.util.List;

public interface MermaService {

    List<Merma> listarMermas();

    List<Merma> listarMermasFiltradas(
            LocalDate desde,
            LocalDate hasta,
            String tipo,
            String motivo);

    Merma obtenerPorId(Long id);

    Merma registrar(Merma merma);

    ResumenMermaDTO obtenerResumen();

    ResumenMermaDTO obtenerResumenFiltrado(
            LocalDate desde,
            LocalDate hasta,
            String tipo,
            String motivo);
}
