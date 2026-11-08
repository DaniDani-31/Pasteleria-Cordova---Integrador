package com.pastelerias.controller;

import com.pastelerias.dto.RecetaRequestDTO;
import com.pastelerias.dto.RecetaResponseDTO;
import com.pastelerias.service.RecetaService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recetas")
@CrossOrigin(origins = "http://localhost:3000")
public class RecetaController {

    private final RecetaService recetaService;

    public RecetaController(RecetaService recetaService) {
        this.recetaService = recetaService;
    }

    @PostMapping
    public ResponseEntity<RecetaResponseDTO> registrar(
            @RequestBody RecetaRequestDTO solicitud) {

        return ResponseEntity.ok(
                recetaService.registrar(solicitud));
    }

    @GetMapping
    public ResponseEntity<List<RecetaResponseDTO>> listar() {
        return ResponseEntity.ok(
                recetaService.listarRecetas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecetaResponseDTO> obtener(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                recetaService.obtenerPorId(id));
    }

    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<RecetaResponseDTO> obtenerPorProducto(
            @PathVariable Long idProducto) {

        return ResponseEntity.ok(
                recetaService.obtenerPorProducto(idProducto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecetaResponseDTO> actualizar(
            @PathVariable Long id,
            @RequestBody RecetaRequestDTO solicitud) {

        return ResponseEntity.ok(
                recetaService.actualizar(id, solicitud));
    }

}