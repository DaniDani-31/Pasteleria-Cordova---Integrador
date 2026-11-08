package com.pastelerias.controller;

import com.google.common.base.Preconditions;
import com.pastelerias.model.Contacto;
import com.pastelerias.repository.ContactoRepository;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/contactos")
public class ContactoController {

    private static final Logger logger = LoggerFactory.getLogger(ContactoController.class);

    @Autowired
    private ContactoRepository contactoRepository;

    @GetMapping
    public List<Contacto> listarContactos() {
        logger.info("Listando contactos recibidos");
        return contactoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerContacto(@PathVariable Long id) {
        logger.info("Buscando contacto con ID {}", id);
        return contactoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crearContacto(@RequestBody Contacto contacto) {
        try {
            Preconditions.checkArgument(StringUtils.isNotBlank(contacto.getNombre()), "El nombre no puede estar vacío");
            Preconditions.checkArgument(StringUtils.isNotBlank(contacto.getCorreo()), "El correo no puede estar vacío");

            Contacto nuevo = contactoRepository.save(contacto);
            logger.info("Nuevo mensaje de contacto registrado: {}", nuevo.getNombre());
            return ResponseEntity.ok(nuevo);

        } catch (IllegalArgumentException e) {
            logger.error("Error al registrar contacto: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarContacto(@PathVariable Long id) {
        logger.info("Eliminando contacto con ID {}", id);
        if (!contactoRepository.existsById(id)) {
            logger.warn("Contacto con ID {} no encontrado", id);
            return ResponseEntity.notFound().build();
        }
        contactoRepository.deleteById(id);
        return ResponseEntity.ok("Contacto eliminado correctamente");
    }
}
