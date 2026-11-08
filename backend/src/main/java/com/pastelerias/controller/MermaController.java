
package com.pastelerias.controller;

import com.pastelerias.dto.MermaResponseDTO;
import com.pastelerias.model.Merma;
import com.pastelerias.service.MermaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.pastelerias.dto.ResumenMermaDTO;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.List;

@RestController
@RequestMapping("/api/mermas")
@CrossOrigin(origins = "http://localhost:3000")
public class MermaController {

    private final MermaService mermaService;

    public MermaController(MermaService mermaService) {
        this.mermaService = mermaService;
    }

    @GetMapping
    public ResponseEntity<List<MermaResponseDTO>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,

            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,

            @RequestParam(required = false) String tipo,

            @RequestParam(required = false) String motivo) {

        List<MermaResponseDTO> respuesta = mermaService.listarMermasFiltradas(
                desde, hasta, tipo, motivo).stream()
                .map(this::convertirDTO)
                .toList();

        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MermaResponseDTO> obtener(
            @PathVariable Long id) {

        Merma merma = mermaService.obtenerPorId(id);

        return ResponseEntity.ok(convertirDTO(merma));
    }

    @PostMapping
    public ResponseEntity<MermaResponseDTO> registrar(
            @RequestBody Merma merma) {

        Merma registrada = mermaService.registrar(merma);

        return ResponseEntity.ok(convertirDTO(registrada));
    }

    private MermaResponseDTO convertirDTO(Merma merma) {

        if (merma.getInsumo() != null) {
            return new MermaResponseDTO(
                    merma.getIdMerma(),
                    "INSUMO",
                    merma.getInsumo().getIdInsumo(),
                    merma.getInsumo().getNombreInsumo(),
                    merma.getInsumo().getUnidadMedida(),
                    merma.getCantidad(),
                    merma.getMotivo(),
                    merma.getDescripcion(),
                    merma.getCostoUnitario(),
                    merma.getCostoTotal(),
                    merma.getFechaMerma());
        }

        if (merma.getProducto() != null) {
            return new MermaResponseDTO(
                    merma.getIdMerma(),
                    "PRODUCTO",
                    merma.getProducto().getIdProducto(),
                    merma.getProducto().getNombreProducto(),
                    "unidad",
                    merma.getCantidad(),
                    merma.getMotivo(),
                    merma.getDescripcion(),
                    merma.getCostoUnitario(),
                    merma.getCostoTotal(),
                    merma.getFechaMerma());
        }

        throw new IllegalStateException(
                "La merma no tiene un inventario asociado.");
    }

    @GetMapping("/resumen")
    public ResponseEntity<ResumenMermaDTO> obtenerResumen(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,

            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,

            @RequestParam(required = false) String tipo,

            @RequestParam(required = false) String motivo) {

        return ResponseEntity.ok(
                mermaService.obtenerResumenFiltrado(
                        desde, hasta, tipo, motivo));
    }

}
