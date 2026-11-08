package com.pastelerias.controller;

import com.pastelerias.model.Producto;
import com.pastelerias.repository.ProductoRepository;
import com.pastelerias.util.ExcelGenerator;
import com.pastelerias.util.PDFGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private static final Logger logger = LoggerFactory.getLogger(ReporteController.class);

    @Autowired
    private ProductoRepository productoRepository;

    // ------------------ REPORTE PRODUCTOS EXCEL ------------------
    @GetMapping("/productos/excel")
    public ResponseEntity<?> generarReporteProductos() {
        try {
            logger.info("Generando reporte de productos en formato Excel...");

            List<Producto> productos = productoRepository.findAll();
            ByteArrayOutputStream outputStream = ExcelGenerator.generarReporteProductos(productos);
            ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Reporte_Productos.xlsx")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(resource);

        } catch (IOException e) {
            logger.error("Error al generar el reporte Excel de productos: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error al generar el reporte Excel");
        }
    }

    // ------------------ REPORTE VENTAS POR PRODUCTO EXCEL ------------------
    @GetMapping("/ventas-producto/excel")
    public ResponseEntity<ByteArrayResource> generarReporteVentasExcel() {
        try {
            logger.info("Generando reporte de ventas por producto en Excel...");

            List<Object[]> ventas = productoRepository.obtenerVentasPorProducto();
            ByteArrayOutputStream outputStream = ExcelGenerator.generarReporteVentas(ventas);
            ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Reporte_Ventas_Producto.xlsx")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(resource);

        } catch (IOException e) {
            logger.error("Error al generar reporte Excel de ventas: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(null);
        }
    }

    // ------------------ REPORTE VENTAS POR PRODUCTO PDF ------------------
    @GetMapping("/ventas-producto/pdf")
    public ResponseEntity<ByteArrayResource> generarReporteVentasPDF() {
        try {
            logger.info("Generando reporte de ventas por producto en PDF...");

            List<Object[]> ventas = productoRepository.obtenerVentasPorProducto();
            ByteArrayOutputStream outputStream = PDFGenerator.generarReporteVentasPDF(ventas);
            ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Reporte_Ventas_Producto.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (Exception e) {
            logger.error("Error al generar reporte PDF de ventas: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(null);
        }
    }
}
