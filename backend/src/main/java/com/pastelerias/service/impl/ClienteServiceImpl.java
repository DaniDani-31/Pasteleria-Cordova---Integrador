package com.pastelerias.service.impl;

import com.pastelerias.dto.ClienteDTO;
import com.pastelerias.model.Cliente;
import com.pastelerias.model.Rol;
import com.pastelerias.repository.ClienteRepository;
import com.pastelerias.repository.RolRepository;
import com.pastelerias.service.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.owasp.html.PolicyFactory;
import org.owasp.html.HtmlPolicyBuilder;

@Service
public class ClienteServiceImpl implements ClienteService {

    private static final Logger logger = LoggerFactory.getLogger(ClienteServiceImpl.class);

    private final ClienteRepository clienteRepository;
    private final RolRepository rolRepository;
    // 🛡️ POLÍTICA DE SEGURIDAD: Solo permite texto plano (remueve todas las
    // etiquetas HTML)

    private static final PolicyFactory NO_HTML_POLICY = new HtmlPolicyBuilder().toFactory();

    public ClienteServiceImpl(ClienteRepository clienteRepository, RolRepository rolRepository) {
        this.clienteRepository = clienteRepository;
        this.rolRepository = rolRepository;
    }

    // 🔒 MÉTODO PRIVADO PARA SANITIZAR CUALQUIER CADENA DE ENTRADA
    private String sanitize(String input) {
        if (input == null || input.trim().isEmpty()) {
            return input;
        }
        // Aplica la política NO_HTML_POLICY para eliminar etiquetas HTML/scripts
        return NO_HTML_POLICY.sanitize(input);
    }

    @Override
    public List<Cliente> listarClientes() {
        return clienteRepository.findAll();
    }

    @Override
    public Cliente obtenerPorId(Long id) {
        return clienteRepository.findById(id).orElse(null);
    }

    @Override
    public Cliente guardar(Cliente cliente) {
        // Opcional: Sanitizar si se llama a guardar directamente
        cliente.setNombreCompleto(sanitize(cliente.getNombreCompleto()));
        return clienteRepository.save(cliente);
    }

    @Override
    public void eliminar(Long id) {
        clienteRepository.deleteById(id);
    }

    @Override
    public ResponseEntity<?> registrar(Cliente cliente) {
        if (clienteRepository.findByCorreo(cliente.getCorreo()).isPresent()) {
            return ResponseEntity.badRequest().body("{\"mensaje\": \"El correo ya está registrado\"}");
        }

        // 🛡️ APLICACIÓN DE SANITIZACIÓN EN REGISTRO DE CLIENTE
        cliente.setNombreCompleto(sanitize(cliente.getNombreCompleto()));

        Rol rolCliente = rolRepository.findById(2L)
                .orElseThrow(() -> new RuntimeException("No se encontró el rol de Cliente"));
        cliente.setRol(rolCliente);
        Cliente savedCliente = clienteRepository.save(cliente);

        ClienteDTO dto = new ClienteDTO(
                savedCliente.getIdCliente(),
                savedCliente.getNombreCompleto(),
                savedCliente.getCorreo(),
                savedCliente.getRol() != null ? savedCliente.getRol().getNombre_rol() : "Sin rol");

        return ResponseEntity.ok(dto);
    }

    @Override
    public ResponseEntity<?> login(String correo, String contrasena) {
        // ... (omito login y obtenerClienteDTO por brevedad, no requieren sanitización)
        // ...
        Cliente cliente = clienteRepository.findByCorreoAndContrasena(correo, contrasena);

        if (cliente != null) {
            ClienteDTO dto = new ClienteDTO(
                    cliente.getIdCliente(),
                    cliente.getNombreCompleto(),
                    cliente.getCorreo(),
                    cliente.getRol() != null ? cliente.getRol().getNombre_rol() : "Sin rol");
            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.status(401).body("{\"mensaje\": \"Credenciales incorrectas\"}");
        }
    }

    @Override
    public ClienteDTO obtenerClienteDTO(Long id) {
        try {
            Optional<Cliente> clienteOpt = clienteRepository.findById(id);
            if (clienteOpt.isPresent()) {
                Cliente cliente = clienteOpt.get();
                // El nombreCompleto ya está limpio en la DB, pero se puede sanitizar al leer si
                // se teme un ataque persistente
                String nombreRol = (cliente.getRol() != null) ? cliente.getRol().getNombre_rol() : "Sin rol";
                logger.info("Cliente encontrado: {} con rol {}", cliente.getNombreCompleto(), nombreRol);

                return new ClienteDTO(
                        cliente.getIdCliente(),
                        // Sanitizar al leer también es buena práctica de defensa profunda
                        sanitize(cliente.getNombreCompleto()),
                        cliente.getCorreo(),
                        nombreRol);
            } else {
                logger.warn("Cliente con ID {} no encontrado", id);
                return null;
            }
        } catch (Exception e) {
            logger.error("Error al obtener ClienteDTO con ID {}: {}", id, e.getMessage());
            return null;
        }
    }

    @Override
    public ResponseEntity<?> registrarAdmin(Cliente cliente) {

        if (clienteRepository.findByCorreo(cliente.getCorreo()).isPresent()) {
            return ResponseEntity.badRequest().body("{\"mensaje\": \"El correo ya está registrado\"}");
        }

        // 🛡️ APLICACIÓN DE SANITIZACIÓN EN REGISTRO DE ADMINISTRADOR
        cliente.setNombreCompleto(sanitize(cliente.getNombreCompleto()));

        Rol rolAdmin = rolRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("No se encontró el rol de Administrador"));

        cliente.setRol(rolAdmin);

        Cliente savedCliente = clienteRepository.save(cliente);

        ClienteDTO dto = new ClienteDTO(
                savedCliente.getIdCliente(),
                savedCliente.getNombreCompleto(),
                savedCliente.getCorreo(),
                savedCliente.getRol().getNombre_rol());

        return ResponseEntity.ok(dto);
    }

    // ... (El resto de métodos listados debajo) ...

    public List<ClienteDTO> listarClientesDTO() {
        return clienteRepository.findAll().stream()
                .map(cliente -> {
                    String nombreRol = (cliente.getRol() != null) ? cliente.getRol().getNombre_rol() : "Sin rol";
                    return new ClienteDTO(
                            cliente.getIdCliente(),
                            sanitize(cliente.getNombreCompleto()), // Sanitizar al listar
                            cliente.getCorreo(),
                            nombreRol);
                })
                .collect(Collectors.toList());
    }

}