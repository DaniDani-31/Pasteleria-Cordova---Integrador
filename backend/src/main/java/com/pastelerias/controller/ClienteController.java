package com.pastelerias.controller;

import com.google.common.base.Preconditions;
import com.pastelerias.dto.ClienteDTO;
import com.pastelerias.model.Cliente;
import com.pastelerias.service.ClienteService;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
// Importación de Spring Security necesaria para la autorización por rol
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private static final Logger logger = LoggerFactory.getLogger(ClienteController.class);

    @Autowired
    private ClienteService clienteService;

    // 🔹 LISTAR CLIENTES
    // 🛡️ PROTECCIÓN AÑADIDA: Solo accesible por Administradores
    @PreAuthorize("hasRole('Administrador')")
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<ClienteDTO>> listarClientes() {
        logger.info("Listando todos los clientes...");
        List<ClienteDTO> clientesDTO = clienteService.listarClientes()
                .stream()
                .map(cliente -> new ClienteDTO(
                        cliente.getIdCliente(),
                        cliente.getNombreCompleto(),
                        cliente.getCorreo(),
                        cliente.getRol() != null ? cliente.getRol().getNombre_rol() : null))
                .collect(Collectors.toList());
        return ResponseEntity.ok(clientesDTO);
    }

    // 🔹 OBTENER CLIENTE POR ID
    // NOTA: Se recomienda añadir lógica aquí para que un cliente solo pueda obtener
    // su propio ID.
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> obtenerCliente(@PathVariable Long id) {
        logger.info("Buscando cliente con ID {}", id);
        try {
            if (id == null || id <= 0) {
                logger.warn("ID inválido recibido: {}", id);
                return ResponseEntity.badRequest().body("{\"mensaje\": \"ID inválido\"}");
            }

            ClienteDTO clienteDTO = clienteService.obtenerClienteDTO(id);
            if (clienteDTO != null) {
                return ResponseEntity.ok(clienteDTO);
            } else {
                logger.warn("Cliente con ID {} no encontrado", id);
                return ResponseEntity.status(404).body("{\"mensaje\": \"Cliente no encontrado\"}");
            }

        } catch (Exception e) {
            logger.error("Error al obtener cliente con ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("{\"mensaje\": \"Error interno del servidor\"}");
        }
    }

    // 🔹 REGISTRAR CLIENTE (REGISTRO REGULAR DE CLIENTE)
    @PostMapping(value = "/registrar", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registrarCliente(@RequestBody Cliente cliente) {
        try {
            Preconditions.checkArgument(StringUtils.isNotBlank(cliente.getNombreCompleto()),
                    "El nombre no puede estar vacío");
            Preconditions.checkArgument(StringUtils.isNotBlank(cliente.getCorreo()), "El correo no puede estar vacío");
            Preconditions.checkArgument(StringUtils.isNotBlank(cliente.getContrasena()),
                    "La contraseña no puede estar vacía");

            ResponseEntity<?> response = clienteService.registrar(cliente);

            if (response.getStatusCode().is2xxSuccessful()
                    && response.getBody() instanceof ClienteDTO savedClienteDTO) {
                return ResponseEntity.ok(savedClienteDTO);
            } else {
                return response;
            }

        } catch (IllegalArgumentException e) {
            logger.error("Error al registrar cliente: {}", e.getMessage());
            return ResponseEntity.badRequest().body("{\"mensaje\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            logger.error("Error inesperado al registrar cliente: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("{\"mensaje\": \"Error interno del servidor\"}");
        }
    }

    // 🔹 ACTUALIZAR CLIENTE
    // NOTA: Se recomienda proteger esta ruta para que un cliente solo pueda
    // actualizarse a sí mismo
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> actualizarCliente(@PathVariable Long id, @RequestBody Cliente clienteActualizado) {
        logger.info("Actualizando cliente con ID {}", id);
        try {
            Cliente cliente = clienteService.obtenerPorId(id);
            if (cliente != null) {
                cliente.setNombreCompleto(clienteActualizado.getNombreCompleto());
                cliente.setCorreo(clienteActualizado.getCorreo());
                cliente.setContrasena(clienteActualizado.getContrasena());
                Cliente actualizado = clienteService.guardar(cliente);

                ClienteDTO actualizadoDTO = new ClienteDTO(
                        actualizado.getIdCliente(),
                        actualizado.getNombreCompleto(),
                        actualizado.getCorreo(),
                        actualizado.getRol() != null ? actualizado.getRol().getNombre_rol() : null);

                return ResponseEntity.ok(actualizadoDTO);
            } else {
                logger.warn("Cliente con ID {} no encontrado para actualización", id);
                return ResponseEntity.status(404).body("{\"mensaje\": \"Cliente no encontrado\"}");
            }
        } catch (Exception e) {
            logger.error("Error al actualizar cliente con ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("{\"mensaje\": \"Error interno del servidor\"}");
        }
    }

    // 🔹 ELIMINAR CLIENTE
    // 🛡️ PROTECCIÓN AÑADIDA: Solo accesible por Administradores
    @PreAuthorize("hasRole('Administrador')")
    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> eliminarCliente(@PathVariable Long id) {
        logger.info("Eliminando cliente con ID {}", id);
        try {
            Cliente cliente = clienteService.obtenerPorId(id);
            if (cliente == null) {
                logger.warn("Cliente con ID {} no existe", id);
                return ResponseEntity.status(404).body("{\"mensaje\": \"Cliente no encontrado\"}");
            }
            clienteService.eliminar(id);
            logger.info("Cliente con ID {} eliminado correctamente", id);
            return ResponseEntity.ok("{\"mensaje\": \"Cliente eliminado correctamente\"}");
        } catch (Exception e) {
            logger.error("Error al eliminar cliente con ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("{\"mensaje\": \"Error interno del servidor\"}");
        }
    }

    // 🔹 LOGIN CLIENTE
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody Cliente loginRequest) {
        logger.info("Intento de inicio de sesión con correo: {}", loginRequest.getCorreo());
        try {
            Preconditions.checkArgument(StringUtils.isNotBlank(loginRequest.getCorreo()),
                    "El correo no puede estar vacío");
            Preconditions.checkArgument(StringUtils.isNotBlank(loginRequest.getContrasena()),
                    "La contraseña no puede estar vacía");

            return clienteService.login(loginRequest.getCorreo(), loginRequest.getContrasena());
        } catch (IllegalArgumentException e) {
            logger.error("Error en los datos de inicio de sesión: {}", e.getMessage());
            return ResponseEntity.badRequest().body("{\"mensaje\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            logger.error("Error inesperado en el login: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("{\"mensaje\": \"Error interno del servidor\"}");
        }
    }

    // 🚨 REGISTRO DE ADMINISTRADOR - CORRECCIÓN CRÍTICA DE AUTORIZACIÓN
    // 🛡️ Corregido a 'Administrador' para coincidir con la DB. Solo este rol puede
    // ejecutarlo.
    @PreAuthorize("hasRole('Administrador')")
    @PostMapping("/registrar-admin")
    public ResponseEntity<?> registrarAdmin(@RequestBody Cliente cliente) {
        // reuse existing registrar method on the service
        return clienteService.registrarAdmin(cliente);
    }
}