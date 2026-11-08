
package com.pastelerias.controller;

import com.pastelerias.model.Insumo;
import com.pastelerias.service.InsumoService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
@CrossOrigin(origins = "http://localhost:3000")
public class InsumoController {

    private final InsumoService insumoService;

    public InsumoController(InsumoService insumoService) {
        this.insumoService = insumoService;
    }

    @GetMapping
    public ResponseEntity<List<Insumo>> listar() {
        return ResponseEntity.ok(insumoService.listarInsumos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Insumo> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(insumoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Insumo> guardar(@RequestBody Insumo insumo) {
        return ResponseEntity.ok(insumoService.guardar(insumo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        insumoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
