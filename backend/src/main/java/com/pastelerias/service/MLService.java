package com.pastelerias.service;

import com.pastelerias.dto.InventarioMLDTO;
import com.pastelerias.dto.OptimizacionDTO;
import com.pastelerias.dto.VentaHistoricaDTO;
import com.pastelerias.dto.VentaMLDTO;

import java.util.List;

public interface MLService {

    List<VentaHistoricaDTO> obtenerHistorialVentas();

    List<VentaMLDTO> obtenerVentasAgrupadas();

    InventarioMLDTO analizarInventario(
            Long idProducto,
            Double demandaPredicha);

    OptimizacionDTO optimizarReposicion(
            Long idProducto,
            Double demandaPredicha,
            Integer stockSeguridad);
}