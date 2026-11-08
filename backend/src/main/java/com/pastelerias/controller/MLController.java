package com.pastelerias.controller;

import com.pastelerias.dto.InventarioMLDTO;
import com.pastelerias.dto.OptimizacionDTO;
import com.pastelerias.dto.VentaHistoricaDTO;
import com.pastelerias.dto.VentaMLDTO;
import com.pastelerias.service.MLService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/ml")
public class MLController {

    private final MLService mlService;

    public MLController(MLService mlService) {
        this.mlService = mlService;
    }

    /**
     * Obtiene los datos históricos que serán utilizados
     * posteriormente para Machine Learning.
     */
    @GetMapping("/ventas/historial")
    public ResponseEntity<List<VentaHistoricaDTO>> obtenerHistorialVentas() {

        return ResponseEntity.ok(
                mlService.obtenerHistorialVentas());
    }

    /**
     * Analiza el estado del inventario utilizando
     * una demanda previamente predicha por ML.
     */
    @GetMapping("/inventario/{idProducto}")
    public ResponseEntity<InventarioMLDTO> analizarInventario(
            @PathVariable Long idProducto,
            @RequestParam Double demandaPredicha) {

        return ResponseEntity.ok(
                mlService.analizarInventario(
                        idProducto,
                        demandaPredicha));
    }

    /**
     * Calcula la cantidad recomendada de reposición.
     */
    @GetMapping("/optimizacion/{idProducto}")
    public ResponseEntity<OptimizacionDTO> optimizarReposicion(
            @PathVariable Long idProducto,
            @RequestParam Double demandaPredicha,
            @RequestParam(defaultValue = "0") Integer stockSeguridad) {

        return ResponseEntity.ok(
                mlService.optimizarReposicion(
                        idProducto,
                        demandaPredicha,
                        stockSeguridad));
    }

    @GetMapping("/ventas/dataset")
    public ResponseEntity<List<VentaMLDTO>> obtenerDatasetVentas() {
        return ResponseEntity.ok(mlService.obtenerVentasAgrupadas());
    }
}