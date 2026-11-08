package com.pastelerias.util;

import com.pastelerias.model.Producto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

public class ExcelGenerator {

    private static final Logger logger = LoggerFactory.getLogger(ExcelGenerator.class);

    // ✅ Reporte de productos
    public static ByteArrayOutputStream generarReporteProductos(List<Producto> productos) throws IOException {
        logger.info("Creando archivo Excel para productos...");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet hoja = workbook.createSheet("Productos");
            hoja.setDefaultColumnWidth(20);

            CellStyle estiloCabecera = workbook.createCellStyle();
            Font fuenteCabecera = workbook.createFont();
            fuenteCabecera.setBold(true);
            estiloCabecera.setFont(fuenteCabecera);
            estiloCabecera.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            estiloCabecera.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row cabecera = hoja.createRow(0);
            String[] titulos = { "ID", "Nombre", "Descripción", "Precio", "Stock", "Imagen URL" };
            for (int i = 0; i < titulos.length; i++) {
                Cell celda = cabecera.createCell(i);
                celda.setCellValue(titulos[i]);
                celda.setCellStyle(estiloCabecera);
            }

            int fila = 1;
            for (Producto p : productos) {
                Row row = hoja.createRow(fila++);
                row.createCell(0).setCellValue(p.getIdProducto());
                row.createCell(1).setCellValue(p.getNombreProducto());
                row.createCell(2).setCellValue(p.getDescripcion());
                row.createCell(3).setCellValue(p.getPrecio());
                row.createCell(4).setCellValue(p.getStock());
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream;
        }
    }

    // ✅ Reporte de ventas por producto (actualizado para ser seguro)
    public static ByteArrayOutputStream generarReporteVentas(List<Object[]> ventas) throws IOException {
        logger.info("Creando archivo Excel para ventas por producto...");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet hoja = workbook.createSheet("Ventas por Producto");
            hoja.setDefaultColumnWidth(20);

            CellStyle estiloCabecera = workbook.createCellStyle();
            Font fuenteCabecera = workbook.createFont();
            fuenteCabecera.setBold(true);
            estiloCabecera.setFont(fuenteCabecera);
            estiloCabecera.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            estiloCabecera.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            Row cabecera = hoja.createRow(0);
            String[] titulos = { "ID Producto", "Nombre Producto", "Cantidad Vendida" };
            for (int i = 0; i < titulos.length; i++) {
                Cell celda = cabecera.createCell(i);
                celda.setCellValue(titulos[i]);
                celda.setCellStyle(estiloCabecera);
            }

            int fila = 1;
            for (Object[] venta : ventas) {
                Row row = hoja.createRow(fila++);

                int idProducto = venta[0] != null ? ((Number) venta[0]).intValue() : 0;
                String nombreProducto = venta[1] != null ? venta[1].toString() : "";
                double cantidadVendida = venta[2] != null ? ((Number) venta[2]).doubleValue() : 0;

                row.createCell(0).setCellValue(idProducto);
                row.createCell(1).setCellValue(nombreProducto);
                row.createCell(2).setCellValue(cantidadVendida);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream;
        }
    }
}
