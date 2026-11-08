
package com.pastelerias.service.impl;

import com.pastelerias.dto.*;
import com.pastelerias.model.*;
import com.pastelerias.repository.*;
import com.pastelerias.service.RecetaService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class RecetaServiceImpl implements RecetaService {

        private final RecetaRepository recetaRepository;
        private final DetalleRecetaRepository detalleRepository;
        private final ProductoRepository productoRepository;
        private final InsumoRepository insumoRepository;

        public RecetaServiceImpl(
                        RecetaRepository recetaRepository,
                        DetalleRecetaRepository detalleRepository,
                        ProductoRepository productoRepository,
                        InsumoRepository insumoRepository) {

                this.recetaRepository = recetaRepository;
                this.detalleRepository = detalleRepository;
                this.productoRepository = productoRepository;
                this.insumoRepository = insumoRepository;
        }

        @Override
        public RecetaResponseDTO registrar(RecetaRequestDTO solicitud) {

                validarSolicitud(solicitud);

                Producto producto = productoRepository.findById(
                                solicitud.idProducto())
                                .orElseThrow(() -> new RuntimeException("Producto no encontrado."));

                if (recetaRepository.existsByProducto_IdProducto(
                                solicitud.idProducto())) {
                        throw new IllegalArgumentException(
                                        "Este producto ya tiene una receta registrada.");
                }

                Receta receta = new Receta();
                receta.setProducto(producto);
                receta.setNombreReceta(solicitud.nombreReceta().trim());
                receta.setDescripcion(solicitud.descripcion());
                receta.setRendimiento(1);

                receta = recetaRepository.save(receta);

                BigDecimal costoTotal = BigDecimal.ZERO;

                for (DetalleRecetaRequestDTO ingrediente : solicitud.ingredientes()) {

                        if (ingrediente.idInsumo() == null ||
                                        ingrediente.cantidad() == null ||
                                        ingrediente.unidadMedida() == null ||
                                        ingrediente.cantidad().compareTo(
                                                        BigDecimal.ZERO) <= 0) {

                                throw new IllegalArgumentException(
                                                "Los datos de los ingredientes no son válidos.");
                        }

                        Insumo insumo = insumoRepository.findById(
                                        ingrediente.idInsumo()).orElseThrow(
                                                        () -> new RuntimeException("Insumo no encontrado: "
                                                                        + ingrediente.idInsumo()));

                        if (insumo.getCostoUnitario() == null ||
                                        insumo.getCostoUnitario().compareTo(
                                                        BigDecimal.ZERO) < 0) {

                                throw new IllegalArgumentException(
                                                "El costo del insumo no es válido: "
                                                                + insumo.getNombreInsumo());
                        }

                        BigDecimal cantidadConvertida = convertirUnidad(
                                        ingrediente.cantidad(),
                                        ingrediente.unidadMedida(),
                                        insumo.getUnidadMedida());

                        BigDecimal subtotal = cantidadConvertida
                                        .multiply(insumo.getCostoUnitario())
                                        .setScale(2, RoundingMode.HALF_UP);

                        // Costo equivalente por unidad utilizada en la receta.
                        BigDecimal costoUnitarioReceta = subtotal
                                        .divide(
                                                        ingrediente.cantidad(),
                                                        4,
                                                        RoundingMode.HALF_UP);

                        DetalleReceta detalle = new DetalleReceta();

                        detalle.setReceta(receta);
                        detalle.setInsumo(insumo);
                        detalle.setCantidad(ingrediente.cantidad());
                        detalle.setUnidadMedida(
                                        normalizarUnidad(ingrediente.unidadMedida()));
                        detalle.setCostoUnitario(costoUnitarioReceta);
                        detalle.setSubtotal(subtotal);

                        detalleRepository.save(detalle);

                        costoTotal = costoTotal.add(subtotal);
                }

                // Actualizar el costo de producción por unidad.
                producto.setCostoProduccion(
                                costoTotal.divide(
                                                BigDecimal.valueOf(receta.getRendimiento()),
                                                2,
                                                RoundingMode.HALF_UP));

                productoRepository.save(producto);

                return construirRespuesta(receta);
        }

        @Override
        @Transactional(readOnly = true)
        public RecetaResponseDTO obtenerPorId(Long id) {

                Receta receta = recetaRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Receta no encontrada."));

                return construirRespuesta(receta);
        }

        @Override
        @Transactional(readOnly = true)
        public RecetaResponseDTO obtenerPorProducto(Long idProducto) {

                Receta receta = recetaRepository
                                .findByProducto_IdProducto(idProducto)
                                .orElseThrow(() -> new RuntimeException(
                                                "El producto no tiene una receta registrada."));

                return construirRespuesta(receta);
        }

        @Override
        @Transactional(readOnly = true)
        public List<RecetaResponseDTO> listarRecetas() {

                return recetaRepository.findAll()
                                .stream()
                                .map(this::construirRespuesta)
                                .toList();
        }

        @Override
        public RecetaResponseDTO actualizar(
                        Long id,
                        RecetaRequestDTO solicitud) {

                validarSolicitud(solicitud);

                Receta receta = recetaRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Receta no encontrada."));

                Long idProductoAnterior = receta.getProducto().getIdProducto();

                if (!idProductoAnterior.equals(solicitud.idProducto())) {
                        throw new IllegalArgumentException(
                                        "No se puede cambiar el producto asociado a la receta.");
                }

                // Actualizar los datos generales.
                receta.setNombreReceta(solicitud.nombreReceta().trim());
                receta.setDescripcion(solicitud.descripcion());

                recetaRepository.save(receta);

                // Eliminar los ingredientes anteriores.
                detalleRepository.deleteByReceta_IdReceta(id);

                BigDecimal costoTotal = BigDecimal.ZERO;

                // Registrar nuevamente los ingredientes.
                for (DetalleRecetaRequestDTO ingrediente : solicitud.ingredientes()) {

                        if (ingrediente.idInsumo() == null ||
                                        ingrediente.cantidad() == null ||
                                        ingrediente.unidadMedida() == null ||
                                        ingrediente.cantidad().compareTo(BigDecimal.ZERO) <= 0) {

                                throw new IllegalArgumentException(
                                                "Los datos de los ingredientes no son válidos.");
                        }

                        Insumo insumo = insumoRepository.findById(
                                        ingrediente.idInsumo()).orElseThrow(
                                                        () -> new RuntimeException(
                                                                        "Insumo no encontrado: "
                                                                                        + ingrediente.idInsumo()));

                        if (insumo.getCostoUnitario() == null ||
                                        insumo.getCostoUnitario().compareTo(BigDecimal.ZERO) < 0) {

                                throw new IllegalArgumentException(
                                                "El costo del insumo no es válido: "
                                                                + insumo.getNombreInsumo());
                        }

                        BigDecimal cantidadConvertida = convertirUnidad(
                                        ingrediente.cantidad(),
                                        ingrediente.unidadMedida(),
                                        insumo.getUnidadMedida());

                        BigDecimal subtotal = cantidadConvertida
                                        .multiply(insumo.getCostoUnitario())
                                        .setScale(2, RoundingMode.HALF_UP);

                        BigDecimal costoUnitarioReceta = subtotal.divide(
                                        ingrediente.cantidad(),
                                        4,
                                        RoundingMode.HALF_UP);

                        DetalleReceta detalle = new DetalleReceta();

                        detalle.setReceta(receta);
                        detalle.setInsumo(insumo);
                        detalle.setCantidad(ingrediente.cantidad());
                        detalle.setUnidadMedida(
                                        normalizarUnidad(ingrediente.unidadMedida()));
                        detalle.setCostoUnitario(costoUnitarioReceta);
                        detalle.setSubtotal(subtotal);

                        detalleRepository.save(detalle);

                        costoTotal = costoTotal.add(subtotal);
                }

                // Actualizar el costo de producción del producto.
                Producto producto = receta.getProducto();

                producto.setCostoProduccion(
                                costoTotal.divide(
                                                BigDecimal.valueOf(receta.getRendimiento()),
                                                2,
                                                RoundingMode.HALF_UP));

                productoRepository.save(producto);

                return construirRespuesta(receta);
        }

        private void validarSolicitud(RecetaRequestDTO solicitud) {

                if (solicitud == null ||
                                solicitud.idProducto() == null ||
                                solicitud.nombreReceta() == null ||
                                solicitud.nombreReceta().isBlank() ||
                                solicitud.ingredientes() == null ||
                                solicitud.ingredientes().isEmpty()) {

                        throw new IllegalArgumentException(
                                        "Debe proporcionar el producto, nombre e ingredientes.");
                }
        }

        private BigDecimal convertirUnidad(
                        BigDecimal cantidad,
                        String unidadOrigen,
                        String unidadDestino) {

                String origen = normalizarUnidad(unidadOrigen);
                String destino = normalizarUnidad(unidadDestino);

                if (origen.equals(destino)) {
                        return cantidad;
                }

                // Conversión de gramos a kilogramos.
                if (origen.equals("g") && destino.equals("kg")) {
                        return cantidad.divide(
                                        BigDecimal.valueOf(1000),
                                        6,
                                        RoundingMode.HALF_UP);
                }

                // Conversión de kilogramos a gramos.
                if (origen.equals("kg") && destino.equals("g")) {
                        return cantidad.multiply(BigDecimal.valueOf(1000));
                }

                // Conversión de mililitros a litros.
                if (origen.equals("ml") && destino.equals("l")) {
                        return cantidad.divide(
                                        BigDecimal.valueOf(1000),
                                        6,
                                        RoundingMode.HALF_UP);
                }

                // Conversión de litros a mililitros.
                if (origen.equals("l") && destino.equals("ml")) {
                        return cantidad.multiply(BigDecimal.valueOf(1000));
                }

                throw new IllegalArgumentException(
                                "No se pueden convertir las unidades "
                                                + origen + " y " + destino);
        }

        private String normalizarUnidad(String unidad) {

                if (unidad == null || unidad.isBlank()) {
                        throw new IllegalArgumentException(
                                        "La unidad de medida es obligatoria.");
                }

                String valor = unidad.trim().toLowerCase(Locale.ROOT);

                return switch (valor) {
                        case "gramo", "gramos" -> "g";
                        case "kilogramo", "kilogramos" -> "kg";
                        case "litro", "litros" -> "l";
                        case "mililitro", "mililitros" -> "ml";
                        case "unidad", "unidades", "und" -> "unidad";
                        default -> valor;
                };
        }

        private RecetaResponseDTO construirRespuesta(Receta receta) {

                List<DetalleRecetaResponseDTO> ingredientes = detalleRepository.findByReceta_IdReceta(
                                receta.getIdReceta()).stream()
                                .map(detalle -> new DetalleRecetaResponseDTO(
                                                detalle.getInsumo().getIdInsumo(),
                                                detalle.getInsumo().getNombreInsumo(),
                                                detalle.getCantidad(),
                                                detalle.getUnidadMedida(),
                                                detalle.getCostoUnitario(),
                                                detalle.getSubtotal()))
                                .toList();

                BigDecimal costoTotal = ingredientes.stream()
                                .map(DetalleRecetaResponseDTO::subtotal)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal costoPorUnidad = costoTotal.divide(
                                BigDecimal.valueOf(receta.getRendimiento()),
                                2,
                                RoundingMode.HALF_UP);

                return new RecetaResponseDTO(
                                receta.getIdReceta(),
                                receta.getProducto().getIdProducto(),
                                receta.getProducto().getNombreProducto(),
                                receta.getNombreReceta(),
                                receta.getRendimiento(),
                                ingredientes,
                                costoTotal,
                                costoPorUnidad);
        }
}
