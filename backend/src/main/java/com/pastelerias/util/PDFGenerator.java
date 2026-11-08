package com.pastelerias.util;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.util.List;

public class PDFGenerator {

    private static final Logger logger = LoggerFactory.getLogger(PDFGenerator.class);

    public static ByteArrayOutputStream generarReporteVentasPDF(List<Object[]> ventas) {
        logger.info("Creando PDF para ventas por producto...");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document();

        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font fuenteTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph titulo = new Paragraph("Reporte de Ventas por Producto", fuenteTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(20);
            document.add(titulo);

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 2, 5, 3 });

            Font fuenteCabecera = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            String[] cabeceras = { "ID Producto", "Nombre Producto", "Cantidad Vendida" };
            for (String c : cabeceras) {
                PdfPCell cell = new PdfPCell(new Phrase(c, fuenteCabecera));
                cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            for (Object[] venta : ventas) {
                table.addCell(String.valueOf(venta[0]));
                table.addCell(String.valueOf(venta[1]));
                table.addCell(String.valueOf(venta[2]));
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            logger.error("Error al generar PDF: {}", e.getMessage());
        }

        return outputStream;
    }
}
