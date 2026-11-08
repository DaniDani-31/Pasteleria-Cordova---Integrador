package com.pastelerias.service.impl;

import com.pastelerias.dto.InventarioMLDTO;
import com.pastelerias.dto.OptimizacionDTO;
import com.pastelerias.dto.VentaHistoricaDTO;
import com.pastelerias.dto.VentaMLDTO;
import com.pastelerias.model.Producto;
import com.pastelerias.repository.MLRepository;
import com.pastelerias.repository.ProductoRepository;
import com.pastelerias.service.MLService;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MLServiceImpl implements MLService {

    private final MLRepository mlRepository;
    private final ProductoRepository productoRepository;

    public MLServiceImpl(
            MLRepository mlRepository,
            ProductoRepository productoRepository) {

        this.mlRepository = mlRepository;
        this.productoRepository = productoRepository;
    }

    @Override
    public List<VentaHistoricaDTO> obtenerHistorialVentas() {
        return mlRepository.obtenerHistorialVentasML();
    }

    @Override
    public InventarioMLDTO analizarInventario(
            Long idProducto,
            Double demandaPredicha) {

        Producto producto = productoRepository
                .findById(idProducto)
                .orElseThrow(() -> new RuntimeException(
                        "Producto no encontrado: " + idProducto));

        Integer stockActual = producto.getStock();

        if (stockActual == null) {
            stockActual = 0;
        }

        if (demandaPredicha == null || demandaPredicha < 0) {
            demandaPredicha = 0.0;
        }

        double cobertura = 0;

        if (demandaPredicha > 0) {
            cobertura = stockActual / demandaPredicha;
        }

        String estado;

        if (demandaPredicha == 0) {
            estado = "SIN_DEMANDA_ESTIMADA";
        } else if (stockActual == 0) {
            estado = "SIN_STOCK";
        } else if (stockActual < demandaPredicha) {
            estado = "STOCK_INSUFICIENTE";
        } else {
            estado = "STOCK_SUFICIENTE";
        }

        return new InventarioMLDTO(
                producto.getIdProducto(),
                producto.getNombreProducto(),
                stockActual,
                demandaPredicha,
                cobertura,
                estado);
    }

    @Override
    public OptimizacionDTO optimizarReposicion(
            Long idProducto,
            Double demandaPredicha,
            Integer stockSeguridad) {

        Producto producto = productoRepository
                .findById(idProducto)
                .orElseThrow(() -> new RuntimeException(
                        "Producto no encontrado: " + idProducto));

        int stockActual = producto.getStock() != null
                ? producto.getStock()
                : 0;

        int seguridad = stockSeguridad != null && stockSeguridad > 0
                ? stockSeguridad
                : 0;

        double demanda = demandaPredicha != null && demandaPredicha > 0
                ? demandaPredicha
                : 0;

        int reposicion = (int) Math.ceil(
                demanda + seguridad - stockActual);

        if (reposicion < 0) {
            reposicion = 0;
        }

        String recomendacion;

        if (reposicion == 0) {
            recomendacion = "El stock actual cubre la demanda estimada.";
        } else {
            recomendacion = "Se recomienda reponer "
                    + reposicion
                    + " unidades.";
        }

        return new OptimizacionDTO(
                producto.getIdProducto(),
                producto.getNombreProducto(),
                stockActual,
                demanda,
                seguridad,
                reposicion,
                recomendacion);
    }

    @Override
    public List<VentaMLDTO> obtenerVentasAgrupadas() {
        return mlRepository.obtenerVentasAgrupadasML();
    }
}