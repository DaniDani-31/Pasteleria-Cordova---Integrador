package com.pastelerias.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pastelerias.model.Cliente;
import com.pastelerias.repository.ClienteRepository;
import com.pastelerias.repository.CompraRepository;
import com.pastelerias.repository.ContactoRepository;
import com.pastelerias.repository.DetalleCompraRepository;
import com.pastelerias.repository.ProductoRepository;
import com.pastelerias.repository.RolRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ClienteController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
public class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClienteRepository clienteRepository;

    @MockBean
    private CompraRepository compraRepository;

    @MockBean
    private ContactoRepository contactoRepository;

    @MockBean
    private DetalleCompraRepository detalleCompraRepository;

    @MockBean
    private ProductoRepository productoRepository;

    @MockBean
    private RolRepository rolRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void registrarCliente_deberiaRetornarOk() throws Exception {
        Cliente cliente = new Cliente();
        cliente.setNombreCompleto("Juan Pérez");
        cliente.setCorreo("juan@example.com");
        cliente.setContrasena("password123");

        when(clienteRepository.findByCorreo(cliente.getCorreo())).thenReturn(Optional.empty());
        when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);

        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cliente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreCompleto").value("Juan Pérez"))
                .andExpect(jsonPath("$.correo").value("juan@example.com"));
    }

    @Test
    public void listarClientes_deberiaRetornarLista() throws Exception {
        Cliente cliente1 = new Cliente();
        cliente1.setIdCliente(1L);
        cliente1.setNombreCompleto("Juan Pérez");
        cliente1.setCorreo("juan@example.com");

        Cliente cliente2 = new Cliente();
        cliente2.setIdCliente(2L);
        cliente2.setNombreCompleto("María García");
        cliente2.setCorreo("maria@example.com");

        when(clienteRepository.findAll()).thenReturn(Arrays.asList(cliente1, cliente2));

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombreCompleto").value("Juan Pérez"))
                .andExpect(jsonPath("$[1].nombreCompleto").value("María García"));
    }

    @Test
    public void obtenerCliente_deberiaRetornarCliente() throws Exception {
        Cliente cliente = new Cliente();
        cliente.setIdCliente(1L);
        cliente.setNombreCompleto("Juan Pérez");
        cliente.setCorreo("juan@example.com");

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));

        mockMvc.perform(get("/api/clientes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreCompleto").value("Juan Pérez"));
    }

    @Test
    public void obtenerCliente_deberiaRetornarNotFound() throws Exception {
        when(clienteRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/clientes/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void actualizarCliente_deberiaRetornarClienteActualizado() throws Exception {
        Cliente clienteExistente = new Cliente();
        clienteExistente.setIdCliente(1L);
        clienteExistente.setNombreCompleto("Juan Pérez");
        clienteExistente.setCorreo("juan@example.com");

        Cliente clienteActualizado = new Cliente();
        clienteActualizado.setNombreCompleto("Juan Pérez Actualizado");
        clienteActualizado.setCorreo("juan.actualizado@example.com");

        Cliente clienteActualizadoGuardado = new Cliente();
        clienteActualizadoGuardado.setIdCliente(1L);
        clienteActualizadoGuardado.setNombreCompleto("Juan Pérez Actualizado");
        clienteActualizadoGuardado.setCorreo("juan.actualizado@example.com");

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(clienteExistente));
        when(clienteRepository.save(any(Cliente.class))).thenReturn(clienteActualizadoGuardado);

        mockMvc.perform(put("/api/clientes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(clienteActualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreCompleto").value("Juan Pérez Actualizado"));
    }

    @Test
    public void eliminarCliente_deberiaRetornarOk() throws Exception {
        Cliente cliente = new Cliente();
        cliente.setIdCliente(1L);
        cliente.setNombreCompleto("Juan Pérez");
        cliente.setCorreo("juan@example.com");

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));

        mockMvc.perform(delete("/api/clientes/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Cliente eliminado correctamente"));
    }

    @Test
    public void eliminarCliente_deberiaRetornarNotFound() throws Exception {
        when(clienteRepository.findById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/api/clientes/1"))
                .andExpect(status().isNotFound());
    }
}
